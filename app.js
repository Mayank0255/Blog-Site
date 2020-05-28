const dotenv = require('dotenv');
dotenv.config();

const express = require("express"),
    app = express(),
    session = require('express-session'),
    bodyParser = require("body-parser"),
    expressSanitizer = require("express-sanitizer"),
    methodOverride = require("method-override"),
    mysql = require("mysql"),
    bcrypt = require('bcrypt-nodejs'),
    passport = require("passport"),
    flash = require("connect-flash"),
    LocalStrategy = require("passport-local");


// APP CONFIG
app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(expressSanitizer());
app.use(methodOverride("_method"));

// PASSPORT CONFIG
app.use(session({
    secret: "System Breached",
    resave: false,
    saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());
app.use(flash());

app.use(function(req, res, next) {
    res.locals.currentUser = req.user;
    next();
});



// DATABASE CONFIG

// const connection = mysql.createConnection({
//     host: 'localhost',
//     user: 'root',
//     password: 'Mayank15$',
//     database: 'blog_app',
//     multipleStatements: true
// });

const connection = mysql.createConnection({
    host: process.env.HOST,
    user: process.env.USER,
    password: process.env.PASSWORD,
    database: process.env.DATABASE,
    multipleStatements: true
});

passport.serializeUser((user, done) => done(null, user.id));
passport.deserializeUser(function(id, done) {
    connection.query("SELECT * FROM users WHERE id = ? ", [id],
        function(err, rows) {
            done(err, rows[0]);

        });
});

// passport sign-up

passport.use(
    'local-signup',
    new LocalStrategy({
            usernameField: 'username',
            passwordField: 'password',
            passReqToCallback: true
        },
        function(req, username, password, done) {
            connection.query("SELECT * FROM users WHERE username = ? ", [username], function(err, rows) {
                if (err)
                    return done(err);
                if (rows.length) {
                    return done(null, false, req.flash('signupMessage', 'That is already taken'));
                } else {
                    const newUserMysql = {
                        username: username,
                        password: bcrypt.hashSync(password, null, null)
                    };

                    const insertQuery = "INSERT INTO users (username, password) values (?, ?)";

                    connection.query(insertQuery, [newUserMysql.username, newUserMysql.password],
                        function(err, rows) {
                            newUserMysql.id = rows.insertId;

                            return done(null, newUserMysql);
                        });
                }
            });
        })
);


// passport login

passport.use(
    'local-login',
    new LocalStrategy({
            usernameField: 'username',
            passwordField: 'password',
            passReqToCallback: true
        },
        function(req, username, password, done) {
            connection.query("SELECT * FROM users WHERE username = ? ", [username],
                function(err, rows) {
                    if (err)
                        return done(err);
                    if (!rows.length) {
                        return done(null, false, req.flash('loginMessage', 'No User Found'));
                    }
                    if (!bcrypt.compareSync(password, rows[0].password))
                        return done(null, false, req.flash('loginMessage', 'Wrong Password'));

                    return done(null, rows[0]);
                });
        })
);

connection.query('USE blog_app');

// ROUTES
app.get("/", function(req, res) {
    res.redirect("/blogs");
});

app.get("/blogs", function(req, res) {
    const q = "SELECT * FROM blogs ORDER BY created_at DESC;";
    const q2 = "SELECT COUNT(*) AS count FROM blogs;";
    const q3 = "SELECT COUNT(*) AS count FROM users;";
    const q4 = "SELECT COUNT(*) AS count FROM comments;";
    connection.query(q2 + q + q3 + q4, function(err, blogs, fields) {
        if (err) throw err;
        res.render("index", { blogs: blogs[1], blogcount: blogs[0][0].count, usercount: blogs[2][0].count, commentcount: blogs[3][0].count });
    });
});

// NEW ROUTE - BLOGS
app.get("/blogs/new", isLoggedIn, function(req, res) {
    res.render("new");
});

// CREATE ROUTE - BLOGS
app.post("/blogs", isLoggedIn, function(req, res) {
    connection.query('INSERT INTO blogs(title,image_url,body,user_id) VALUES(?,?,?,?)', [req.body.blog.title, req.body.blog.image_url, req.body.blog.body, req.user.id], function(err, result) {
        if (err) throw err;
        res.redirect("/");
    });
});

// SHOW ROUTE - BLOGS
app.get("/blogs/:id", function(req, res) {

    const q = "SELECT users.id,blogs.id,title,username,blogs.user_id,image_url,body,blogs.created_at FROM users JOIN blogs ON users.id=blogs.user_id WHERE blogs.id = " + req.params.id + ";";
    const q2 = "SELECT comments.user_id,blogs.id,username,comments.id,comment_text,blog_id,comments.created_at FROM comments JOIN users ON users.id = comments.user_id JOIN blogs ON blogs.id = comments.blog_id WHERE blog_id =" + req.params.id + ";";
    connection.query(q + q2, function(err, blog) {
        if (err) throw err;
        res.render("show", { blog: blog[0][0], comment: blog[1] });
    });
});

// EDIT ROUTE - BLOGS

app.get("/blogs/:id/edit", isLoggedIn, function(req, res) {
    const q = "SELECT * FROM blogs WHERE id = " + req.params.id;

    connection.query(q, function(err, blog) {
        if (err) throw err;
        res.render("edit", { blog: blog[0] });
    });
});

// UPDATE ROUTE - BLOGS

app.put("/blogs/:id", isLoggedIn, function(req, res) {

    req.body.blog.body = req.sanitize(req.body.blog);

    connection.query("UPDATE blogs SET title = ? , image_url = ? WHERE id = ? ", [req.body.blog.title, req.body.blog.image_url, req.params.id], function(err, blog, fields) {
        if (err) throw err;
        res.redirect("/blogs/" + req.params.id);
    });
});

// DELETE ROUTE - BLOGS

app.delete("/blogs/:id", isLoggedIn, function(req, res) {

    connection.query("DELETE FROM comments WHERE blog_id = " + req.params.id + ";DELETE FROM blogs WHERE id = " + req.params.id + ";", function(error, blog, fields) {
        if (error) throw error;
        res.redirect("/blogs");
    });
});


// CREATE ROUTE - COMMENTS

app.post("/blogs/:id", isLoggedIn, function(req, res) {
    const blog_id = req.params.id;
    connection.query("INSERT INTO comments(comment_text,blog_id,user_id) VALUES(?,?,?);", [req.body.comment.comment_text, blog_id, req.user.id], function(error, comment, fields) {
        if (error) throw error;
        res.redirect("/blogs/" + blog_id);
    });
});

// DELETE ROUTE - COMMENTS

app.delete("/blogs/:id/:comment_id", isLoggedIn, function(req, res) {
    connection.query("DELETE FROM comments WHERE id = " + req.params.comment_id + ";", function(error, comment, fields) {
        if (error) throw error;
        res.redirect("/blogs/" + req.params.id);
    });
});




// AUTH ROUTES

app.get("/register", function(req, res) {
    res.render("register");
});

app.post("/register", function(req, res, next) {
    passport.authenticate("local-signup", {
        successRedirect: "/",
        failureRedirect: "/register",
        failureFlash: true
    })(req, res);
});

app.get("/login", function(req, res) {
    res.render("login");
});

app.post("/login", function(req, res, next) {
    passport.authenticate("local-login", {
        successRedirect: "/",
        failureRedirect: "/login",
        failureFlash: true
    })(req, res);
});

app.get('/logout', function(req, res) {
    req.logout();
    res.redirect('/');
})


// MIDDLEWARES

function isLoggedIn(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    res.redirect("/login");
}


const port = process.env.PORT || 3000;

app.listen(port, function() {
    console.log("Start Blogging");
});
