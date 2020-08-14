const isLoggedIn = require('../middlewares/isLoggedIn');

const express = require('express');
const router = express.Router();

// CREATE ROUTE - COMMENTS
router.post('/blogs/:id', isLoggedIn, (req, res) => {
    const query = 'INSERT INTO comments(comment_text,blog_id,user_id) VALUES(?,?,?);';
    const blogId = req.params.id;

    pool.query(query, [req.body.comment.comment_text, blogId, req.user.id], err => {
        if (err) throw err;
        res.redirect('/blogs/' + blogId);
    });
});

// DELETE ROUTE - COMMENTS
router.delete('/blogs/:id/:comment_id', isLoggedIn, (req, res) => {
    const query = 'DELETE FROM comments WHERE id = ?;';

    pool.query(query, [req.params.comment_id], err => {
        if (err) throw err;
        res.redirect('/blogs/' + req.params.id);
    });
});

module.exports = router;