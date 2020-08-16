const router = require('express').Router();
const authController = require('../controllers/auth');

/** @route      GET /register
 *  @desc       register page
 */
router.get('/register', authController.registerPage);

/** @route      POST /register
 *  @desc       register user
 */
router.post('/register', authController.register);

/** @route      GET /register
 *  @desc       log-in page
 */
router.get('/login', authController.loginPage);

/** @route      POST /login
 *  @desc       log-in page
 */
router.post('/login', authController.login);

/** @route      GET /logout
 *  @desc       log-out user
 */
router.get('/logout', authController.logout);

module.exports = router;