const isLoggedIn = require('../middlewares/isLoggedIn');
const blogsController = require('../controllers/blogs');

const express = require('express');
const router = express.Router();

/** @route      GET /blogs
 *  @desc       blogs page
 */
router.get('/blogs', blogsController.retrieveAll);

/** @route      GET /blogs/new
 *  @desc       new blog page
 */
router.get('/blogs/new', isLoggedIn, blogsController.addPage);

/** @route      POST /blogs
 *  @desc       create blog
 */
router.post('/blogs', isLoggedIn, blogsController.addOne);

/** @route      GET /blogs/:id
 *  @desc       blog page
 */
router.get('/blogs/:id', blogsController.retrieveOne);

/** @route      GET /blogs/:id/edit
 *  @desc       edit page
 */
router.get('/blogs/:id/edit', isLoggedIn, blogsController.updatePage);

/** @route      PUT /blogs/:id
 *  @desc       update blog
 */
router.put('/blogs/:id', isLoggedIn, blogsController.updateOne);

/** @route      DELETE /blogs/:id
 *  @desc       delete blog
 */
router.delete('/blogs/:id', isLoggedIn, blogsController.deleteOne);

module.exports = router;