
// CREATE ROUTE - COMMENTS
const addOne = (req, res) => {
    const query = 'INSERT INTO comments(comment_text,blog_id,user_id) VALUES(?,?,?);';
    const blogId = req.params.id;
    const params = [req.body.comment.comment_text, blogId, req.user.id];

    pool.query(query, params, err => {
        if (err) throw err;
        res.redirect('/blogs/' + blogId);
    });
};

// DELETE ROUTE - COMMENTS
const deleteOne = (req, res) => {
    const query = 'DELETE FROM comments WHERE id = ?;';
    const params = [req.params.comment_id];

    pool.query(query, params, err => {
        if (err) throw err;
        res.redirect('/blogs/' + req.params.id);
    });
};

module.exports = commentsController = {
    addOne,
    deleteOne
};