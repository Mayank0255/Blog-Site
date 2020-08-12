// Check if the user is logged in
const isLoggedIn = (req, res, next) => {
    if (req.isAuthenticated()) {
        return next();
    }
    res.redirect('/login');
}

module.exports = isLoggedIn;