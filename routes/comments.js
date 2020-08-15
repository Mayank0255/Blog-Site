const isLoggedIn = require('../middlewares/isLoggedIn');
const commentsController = require('../controllers/comments');

const express = require('express');
const router = express.Router();

// CREATE ROUTE - COMMENTS
router.post('/blogs/:id', isLoggedIn, commentsController.addOne);

// DELETE ROUTE - COMMENTS
router.delete('/blogs/:id/:comment_id', isLoggedIn, commentsController.deleteOne);;

module.exports = router;