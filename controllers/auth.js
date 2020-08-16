const passport = require('passport');
const bcrypt = require('bcrypt-nodejs');
const LocalStrategy = require('passport-local');

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
                    const params = [newUserMysql.username, newUserMysql.password];

                    pool.query(insertQuery, params,
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

// register user
const registerPage = (req, res) => {
    res.render('register', {
        active: 'register'
    });
};

 const register = (req, res) => {
    passport.authenticate('local-signup', {
        successRedirect: '/',
        failureRedirect: '/register',
        failureFlash: true
    })(req, res);
};

// log-in user
const loginPage = (req, res) => {
    res.render('login', {
        active: 'login'
    });
};

const login = (req, res) => {
    passport.authenticate('local-login', {
        successRedirect: '/',
        failureRedirect: '/login',
        failureFlash: true
    })(req, res);
};

const logout = (req, res) => {
    req.logout();
    res.redirect('/');
};

module.exports = authController = {
    registerPage,
    register,
    loginPage,
    login,
    logout
};