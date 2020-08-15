const isLoggedIn = require('../middlewares/isLoggedIn');
const blogsController = require('../controllers/blogs');

const express = require('express');
const router = express.Router();

router.get('/blogs', blogsController.retrieveAll);

// NEW ROUTE - BLOGS
router.get('/blogs/new', isLoggedIn, blogsController.addPage);

// CREATE ROUTE - BLOGS
router.post('/blogs', isLoggedIn, blogsController.addOne);

// SHOW ROUTE - BLOGS
router.get('/blogs/:id', blogsController.retrieveOne);

// EDIT ROUTE - BLOGS
router.get('/blogs/:id/edit', isLoggedIn, blogsController.updatePage);

// UPDATE ROUTE - BLOGS
router.put('/blogs/:id', isLoggedIn, blogsController.updateOne);

// DELETE ROUTE - BLOGS
router.delete('/blogs/:id', isLoggedIn, blogsController.deleteOne);

module.exports = router;