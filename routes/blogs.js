const isLoggedIn = require('../middlewares/isLoggedIn');
const upload = require('../config/multer.config');

const express = require('express');
const router = express.Router();

router.get('/blogs', (req, res) => {
    const blogsQuery = 'SELECT * FROM blogs ORDER BY created_at DESC;';
    const blogCount = 'SELECT COUNT(*) AS count FROM blogs;';
    const userCount = 'SELECT COUNT(*) AS count FROM users;';
    const commentCount = 'SELECT COUNT(*) AS count FROM comments;';

    pool.query(blogsQuery + blogCount + userCount + commentCount, (err, blogs) => {
        if (err) throw err;
        res.render(
            'index',
            {
                blogs: blogs[0],
                blogCount: blogs[1][0].count,
                userCount: blogs[2][0].count,
                commentCount: blogs[3][0].count
            });
    });
});

// NEW ROUTE - BLOGS
router.get('/blogs/new', isLoggedIn, (req, res) => {
    res.render('new');
});

// CREATE ROUTE - BLOGS
router.post('/blogs', isLoggedIn, (req, res) => {
    let insertQuery = 'INSERT INTO blogs(title,image_url,body,user_id) VALUES(?,?,?,?);';

    upload(req, res, err => {
        if (err) res.render('new', { msg: err });

        if (req.file === undefined) {
            res.render('new', {
                msg: 'Error: No File Selected!'
            });
        }

        pool.query(insertQuery, [req.body.blog.title, req.file.filename, req.body.blog.body, req.user.id], err => {
            if (err) throw err;
            res.redirect('/');
        });
    });
});

// SHOW ROUTE - BLOGS
router.get('/blogs/:id', (req, res) => {
    const blogQuery = 'SELECT users.id,blogs.id,title,username,blogs.user_id,image_url,body,blogs.created_at FROM users JOIN blogs ON users.id=blogs.user_id WHERE blogs.id = ?;';
    const commentsQuery = 'SELECT comments.user_id,blogs.id,username,comments.id,comment_text,blog_id,comments.created_at FROM comments JOIN users ON users.id = comments.user_id JOIN blogs ON blogs.id = comments.blog_id WHERE blog_id = ?;';

    pool.query(blogQuery + commentsQuery, [req.params.id, req.params.id], (err, blog) => {
        if (err) throw err;
        res.render(
            'show',
            {
                blog: blog[0][0],
                comment: blog[1]
            });
    });
});

// EDIT ROUTE - BLOGS
router.get('/blogs/:id/edit', isLoggedIn, (req, res) => {
    const query = 'SELECT * FROM blogs WHERE id = ?;';

    pool.query(query, [req.params.id], (err, blog) => {
        if (err) throw err;
        res.render('edit', { blog: blog[0] });
    });
});

// UPDATE ROUTE - BLOGS
router.put('/blogs/:id', isLoggedIn, (req, res) => {
    const query = 'UPDATE blogs SET title = ?, body = ? WHERE id = ?;';
    const requestBody = req.sanitize(req.body.blog.body);

    pool.query(query, [req.body.blog.title, requestBody, req.params.id], err => {
        if (err) throw err;
        res.redirect('/blogs/' + req.params.id);
    });
});

// DELETE ROUTE - BLOGS
router.delete('/blogs/:id', isLoggedIn, (req, res) => {
    const query = 'DELETE FROM comments WHERE blog_id = ?;DELETE FROM blogs WHERE id = ?;';

    pool.query(query, [req.params.id, req.params.id], err => {
        if (err) throw err;
        res.redirect('/blogs');
    });
});

module.exports = router;