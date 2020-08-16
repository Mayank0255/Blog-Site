const isLoggedIn = require('../middlewares/isLoggedIn');
const commentsController = require('../controllers/comments');

const express = require('express');
const router = express.Router();

/** @route      POST /blogs/:id
 *  @desc       leave a comment
 */
router.post('/blogs/:id', isLoggedIn, commentsController.addOne);

/** @route      DELETE /blogs/:id/:comment_id
 *  @desc       delete comment
 */
router.delete('/blogs/:id/:comment_id', isLoggedIn, commentsController.deleteOne);;

module.exports = router;