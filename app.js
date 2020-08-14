require('dotenv').config();

const express = require('express'),
    app = express(),
    session = require('express-session'),
    bodyParser = require('body-parser'),
    expressSanitizer = require('express-sanitizer'),
    methodOverride = require('method-override'),
    passport = require('passport'),
    flash = require('connect-flash'),
    path = require('path'),
    pool = require('./config/db.config');

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

app.use(require('./routes/blogs'));
app.use(require('./routes/comments'));
app.use(require('./routes/auth'));

// ROUTES
app.get('/', (req, res) => {
    res.redirect('/blogs');
});

app.listen(port, () => console.log('Start Blogging'));