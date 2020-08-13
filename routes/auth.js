const passport = require('passport');

const express = require('express');
const router = express.Router();

// register user
router.get('/register', (req, res) => {
    res.render('register');
});

router.post('/register', (req, res) => {
    passport.authenticate('local-signup', {
        successRedirect: '/',
        failureRedirect: '/register',
        failureFlash: true
    })(req, res);
});

// log-in user
router.get('/login', (req, res) => {
    res.render('login');
});

router.post('/login', (req, res) => {
    passport.authenticate('local-login', {
        successRedirect: '/',
        failureRedirect: '/login',
        failureFlash: true
    })(req, res);
});

router.get('/logout', (req, res) => {
    req.logout();
    res.redirect('/');
});

module.exports = router;