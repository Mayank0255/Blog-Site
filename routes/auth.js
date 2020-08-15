const router = require('express').Router();
const authController = require('../controllers/auth');

// register user
router.get('/register', authController.registerPage);

router.post('/register', authController.register);

// log-in user
router.get('/login', authController.loginPage);

router.post('/login', authController.login);

router.get('/logout', authController.logout);

module.exports = router;