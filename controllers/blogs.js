const upload = require('../config/multer.config');

const retrieveAll = (req, res) => {
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
                commentCount: blogs[3][0].count,
                active: 'index'
            });
    });
};

// NEW ROUTE - BLOGS
const addPage = (req, res) => {
    res.render('new', {
        active: 'new'
    });
};

// CREATE ROUTE - BLOGS
const addOne = (req, res) => {
    let insertQuery = 'INSERT INTO blogs(title,image_url,body,user_id) VALUES(?,?,?,?);';
    let params = [req.body.blog.title, req.file.filename, req.body.blog.body, req.user.id];

    upload(req, res, err => {
        if (err) res.render('new', { msg: err });

        if (req.file === undefined) {
            res.render('new', {
                msg: 'Error: No File Selected!'
            });
        }

        pool.query(insertQuery, params, err => {
            if (err) throw err;
            res.redirect('/');
        });
    });
};

// SHOW ROUTE - BLOGS
const retrieveOne = (req, res) => {
    const blogQuery = 'SELECT users.id,blogs.id,title,username,blogs.user_id,image_url,body,blogs.created_at FROM users JOIN blogs ON users.id=blogs.user_id WHERE blogs.id = ?;';
    const commentsQuery = 'SELECT comments.user_id,blogs.id,username,comments.id,comment_text,blog_id,comments.created_at FROM comments JOIN users ON users.id = comments.user_id JOIN blogs ON blogs.id = comments.blog_id WHERE blog_id = ?;';
    const params = [req.params.id, req.params.id];

    pool.query(blogQuery + commentsQuery, params, (err, blog) => {
        if (err) throw err;
        res.render(
            'show',
            {
                blog: blog[0][0],
                comment: blog[1],
                active: 'show'
            });
    });
};

// EDIT ROUTE - BLOGS
const updatePage = (req, res) => {
    const query = 'SELECT * FROM blogs WHERE id = ?;';
    const params = [req.params.id];

    pool.query(query, params, (err, blog) => {
        if (err) throw err;
        res.render('edit', {
            blog: blog[0],
            active: 'edit'
        });
    });
};

// UPDATE ROUTE - BLOGS
const updateOne = (req, res) => {
    const query = 'UPDATE blogs SET title = ?, body = ? WHERE id = ?;';
    const requestBody = req.sanitize(req.body.blog.body);
    const params  = [req.body.blog.title, requestBody, req.params.id];

    pool.query(query, params, err => {
        if (err) throw err;
        res.redirect('/blogs/' + req.params.id);
    });
};

// DELETE ROUTE - BLOGS
const deleteOne = (req, res) => {
    const query = 'DELETE FROM comments WHERE blog_id = ?;DELETE FROM blogs WHERE id = ?;';
    const params = [req.params.id, req.params.id];

    pool.query(query, params, err => {
        if (err) throw err;
        res.redirect('/blogs');
    });
};

module.exports = blogsController = {
    retrieveAll,
    retrieveOne,
    addPage,
    updatePage,
    addOne,
    updateOne,
    deleteOne
};