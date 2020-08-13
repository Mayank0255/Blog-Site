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
    multer = require('multer'),
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

// Set The Storage Engine
const storage = multer.diskStorage({
    destination: './public/images/uploaded',
    filename: (req, file, cb) => {
        cb(null,file.fieldname + '-' + Date.now() + path.extname(file.originalname));
    }
});

// Check File Type
const checkFileType = (file, cb) => {
    // Allowed ext
    const filetypes = /jpeg|jpg|png|gif/;
    // Check ext
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    // Check mime
    const mimetype = filetypes.test(file.mimetype);

    if (mimetype && extname) {
        return cb(null,true);
    } else {
        cb('Error: Images Only!');
    }
}

// Init Upload
const upload = multer({
    storage: storage,
    limits:{fileSize: 2000000},
    fileFilter: (req, file, cb) => {
        checkFileType(file, cb);
    }
}).single('image');

// ROUTES
app.get('/', (req, res) => {
    res.redirect('/blogs');
});

app.get('/blogs', (req, res) => {
    const q = 'SELECT * FROM blogs ORDER BY created_at DESC;';
    const q2 = 'SELECT COUNT(*) AS count FROM blogs;';
    const q3 = 'SELECT COUNT(*) AS count FROM users;';
    const q4 = 'SELECT COUNT(*) AS count FROM comments;';
    pool.query(q2 + q + q3 + q4, (err, blogs) => {
        if (err) throw err;
        res.render('index', { blogs: blogs[1], blogcount: blogs[0][0].count, usercount: blogs[2][0].count, commentcount: blogs[3][0].count });
    });
});

// NEW ROUTE - BLOGS
app.get('/blogs/new', isLoggedIn, (req, res) => {
    res.render('new');
});

// CREATE ROUTE - BLOGS
app.post('/blogs', isLoggedIn, (req, res) => {
    upload(req, res, (err) => {
        if (err) {
            res.render('new', {
                msg: err
            });
        } else {
            if (req.file === undefined) {
                res.render('new', {
                    msg: 'Error: No File Selected!'
                });
            } else {
                console.log('File Uploaded!');
                pool.query('INSERT INTO blogs(title,image_url,body,user_id) VALUES(?,?,?,?)', [req.body.blog.title, req.file.filename, req.body.blog.body, req.user.id], err => {
                    if (err) throw err;
                    res.redirect('/');
                });
            }
        }
    });
});

// SHOW ROUTE - BLOGS
app.get('/blogs/:id', (req, res) => {

    const q = 'SELECT users.id,blogs.id,title,username,blogs.user_id,image_url,body,blogs.created_at FROM users JOIN blogs ON users.id=blogs.user_id WHERE blogs.id = ' + req.params.id + ';';
    const q2 = 'SELECT comments.user_id,blogs.id,username,comments.id,comment_text,blog_id,comments.created_at FROM comments JOIN users ON users.id = comments.user_id JOIN blogs ON blogs.id = comments.blog_id WHERE blog_id =' + req.params.id + ';';
    pool.query(q + q2, (err, blog) => {
        if (err) throw err;
        res.render('show', { blog: blog[0][0], comment: blog[1] });
    });
});

// EDIT ROUTE - BLOGS

app.get('/blogs/:id/edit', isLoggedIn, (req, res) => {
    const q = 'SELECT * FROM blogs WHERE id = ' + req.params.id;

    pool.query(q, (err, blog) => {
        if (err) throw err;
        res.render('edit', { blog: blog[0] });
    });
});

// UPDATE ROUTE - BLOGS

app.put('/blogs/:id', isLoggedIn, (req, res) => {
    const requestBody = req.sanitize(req.body.blog.body);

    pool.query('UPDATE blogs SET title = ? , body = ? WHERE id = ? ', [req.body.blog.title, requestBody, req.params.id], err => {
        if (err) throw err;
        res.redirect('/blogs/' + req.params.id);
    });
});

// DELETE ROUTE - BLOGS

app.delete('/blogs/:id', isLoggedIn, (req, res) => {
    pool.query('DELETE FROM comments WHERE blog_id = ' + req.params.id + ';DELETE FROM blogs WHERE id = ' + req.params.id + ';', error => {
        if (error) throw error;
        res.redirect('/blogs');
    });
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
