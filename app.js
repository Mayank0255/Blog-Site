require('dotenv').config();

const express = require('express'),
    app = express(),
    session = require('express-session'),
    bodyParser = require('body-parser'),
    expressSanitizer = require('express-sanitizer'),
    methodOverride = require('method-override'),
    bcrypt = require('bcrypt-nodejs'),
    passport = require('passport'),
    flash = require('connect-flash'),
    path = require('path'),
    isLoggedIn = require('./middlewares/isLoggedIn'),
    pool = require('./config/db.config'),
    LocalStrategy = require('passport-local');

const port = process.env.PORT || 3000;

// APP CONFIG
app.set('view engine', 'ejs');
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(expressSanitizer());
app.use(methodOverride('_method'));

// PASSPORT CONFIG
app.use(session({
    secret: 'System Breached',
    resave: false,
    saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());
app.use(flash());

app.use((req, res, next) => {
    res.locals.currentUser = req.user;
    next();
});

pool.query('USE blog_app');
global.pool = pool;

passport.serializeUser((user, done) => done(null, user.id));
passport.deserializeUser((id, done) => {
    pool.query('SELECT * FROM users WHERE id = ? ', [id],
        (err, rows) => {
            done(err, rows[0]);
        });
});

// passport sign-up
passport.use(
    'local-signup',
    new LocalStrategy({
            usernameField: 'username',
            passwordField: 'password',
            passReqToCallback: true
        },
        (req, username, password, done) => {
            pool.query('SELECT * FROM users WHERE username = ? ', [username], (err, rows) => {
                if (err)
                    return done(err);
                if (rows.length) {
                    return done(null, false, req.flash('signupMessage', 'That is already taken'));
                } else {
                    const newUserMysql = {
                        username: username,
                        password: bcrypt.hashSync(password, null, null)
                    };

                    const insertQuery = 'INSERT INTO users (username, password) values (?, ?)';

                    pool.query(insertQuery, [newUserMysql.username, newUserMysql.password],
                        (err, rows) => {
                            newUserMysql.id = rows.insertId;

                            return done(null, newUserMysql);
                        });
                }
            });
        })
);

// passport login
passport.use(
    'local-login',
    new LocalStrategy({
            usernameField: 'username',
            passwordField: 'password',
            passReqToCallback: true
        },
        (req, username, password, done) => {
            pool.query('SELECT * FROM users WHERE username = ? ', [username],
                (err, rows) => {
                    if (err)
                        return done(err);
                    if (!rows.length) {
                        return done(null, false, req.flash('loginMessage', 'No User Found'));
                    }
                    if (!bcrypt.compareSync(password, rows[0].password))
                        return done(null, false, req.flash('loginMessage', 'Wrong Password'));

                    return done(null, rows[0]);
                });
        })
);

app.use(require('./routes/blogs'));

// ROUTES
app.get('/', (req, res) => {
    res.redirect('/blogs');
});

// CREATE ROUTE - COMMENTS

app.post('/blogs/:id', isLoggedIn, (req, res) => {
    const blog_id = req.params.id;
    pool.query('INSERT INTO comments(comment_text,blog_id,user_id) VALUES(?,?,?);', [req.body.comment.comment_text, blog_id, req.user.id], error => {
        if (error) throw error;
        res.redirect('/blogs/' + blog_id);
    });
});

// DELETE ROUTE - COMMENTS

app.delete('/blogs/:id/:comment_id', isLoggedIn, (req, res) => {
    pool.query('DELETE FROM comments WHERE id = ' + req.params.comment_id + ';', error => {
        if (error) throw error;
        res.redirect('/blogs/' + req.params.id);
    });
});

// AUTH ROUTES

app.get('/register', (req, res) => {
    res.render('register');
});

app.post('/register', (req, res) => {
    passport.authenticate('local-signup', {
        successRedirect: '/',
        failureRedirect: '/register',
        failureFlash: true
    })(req, res);
});

app.get('/login', (req, res) => {
    res.render('login');
});

app.post('/login', (req, res) => {
    passport.authenticate('local-login', {
        successRedirect: '/',
        failureRedirect: '/login',
        failureFlash: true
    })(req, res);
});

app.get('/logout', (req, res) => {
    req.logout();
    res.redirect('/');
})

app.listen(port, () => console.log('Start Blogging'));