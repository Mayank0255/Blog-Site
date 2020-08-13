const isLoggedIn = require('../middlewares/isLoggedIn');

const express = require('express');
const router = express.Router();

// CREATE ROUTE - COMMENTS
router.post('/blogs/:id', isLoggedIn, (req, res) => {
    const blog_id = req.params.id;
    pool.query('INSERT INTO comments(comment_text,blog_id,user_id) VALUES(?,?,?);', [req.body.comment.comment_text, blog_id, req.user.id], error => {
        if (error) throw error;
        res.redirect('/blogs/' + blog_id);
    });
});

// DELETE ROUTE - COMMENTS
router.delete('/blogs/:id/:comment_id', isLoggedIn, (req, res) => {
    pool.query('DELETE FROM comments WHERE id = ' + req.params.comment_id + ';', error => {
        if (error) throw error;
        res.redirect('/blogs/' + req.params.id);
    });
});

module.exports = router;