const isLoggedIn = require('../middlewares/isLoggedIn');
const upload = require('../config/multer.config');

const express = require('express');
const router = express.Router();

router.get('/blogs', (req, res) => {
    const q = 'SELECT * FROM blogs ORDER BY created_at DESC;';
    const q2 = 'SELECT COUNT(*) AS count FROM blogs;';
    const q3 = 'SELECT COUNT(*) AS count FROM users;';
    const q4 = 'SELECT COUNT(*) AS count FROM comments;';
    pool.query(q2 + q + q3 + q4, (err, blogs) => {
        if (err) throw err;
        res.render('index', { blogs: blogs[1], blogcount: blogs[0][0].count, usercount: blogs[2][0].count, commentcount: blogs[3][0].count });
    });
});

// NEW ROUTE - BLOGS
router.get('/blogs/new', isLoggedIn, (req, res) => {
    res.render('new');
});

// CREATE ROUTE - BLOGS
router.post('/blogs', isLoggedIn, (req, res) => {
    upload(req, res, (err) => {
        if (err) {
            res.render('new', {
                msg: err
            });
        } else {
            if (req.file === undefined) {
                res.render('new', {
                    msg: 'Error: No File Selected!'
                });
            } else {
                console.log('File Uploaded!');
                pool.query('INSERT INTO blogs(title,image_url,body,user_id) VALUES(?,?,?,?)', [req.body.blog.title, req.file.filename, req.body.blog.body, req.user.id], err => {
                    if (err) throw err;
                    res.redirect('/');
                });
            }
        }
    });
});

// SHOW ROUTE - BLOGS
router.get('/blogs/:id', (req, res) => {

    const q = 'SELECT users.id,blogs.id,title,username,blogs.user_id,image_url,body,blogs.created_at FROM users JOIN blogs ON users.id=blogs.user_id WHERE blogs.id = ' + req.params.id + ';';
    const q2 = 'SELECT comments.user_id,blogs.id,username,comments.id,comment_text,blog_id,comments.created_at FROM comments JOIN users ON users.id = comments.user_id JOIN blogs ON blogs.id = comments.blog_id WHERE blog_id =' + req.params.id + ';';
    pool.query(q + q2, (err, blog) => {
        if (err) throw err;
        res.render('show', { blog: blog[0][0], comment: blog[1] });
    });
});

// EDIT ROUTE - BLOGS
router.get('/blogs/:id/edit', isLoggedIn, (req, res) => {
    const q = 'SELECT * FROM blogs WHERE id = ' + req.params.id;

    pool.query(q, (err, blog) => {
        if (err) throw err;
        res.render('edit', { blog: blog[0] });
    });
});

// UPDATE ROUTE - BLOGS
router.put('/blogs/:id', isLoggedIn, (req, res) => {
    const requestBody = req.sanitize(req.body.blog.body);

    pool.query('UPDATE blogs SET title = ? , body = ? WHERE id = ? ', [req.body.blog.title, requestBody, req.params.id], err => {
        if (err) throw err;
        res.redirect('/blogs/' + req.params.id);
    });
});

// DELETE ROUTE - BLOGS
router.delete('/blogs/:id', isLoggedIn, (req, res) => {
    pool.query('DELETE FROM comments WHERE blog_id = ' + req.params.id + ';DELETE FROM blogs WHERE id = ' + req.params.id + ';', error => {
        if (error) throw error;
        res.redirect('/blogs');
    });
});

module.exports = router;