login = function (req) {
    const username = req.cookies.username;
    const password = req.cookies.password;
    const email = req.cookies.email;
    const admin = req.cookies.admin;
    if (username == null || password == null || email == null || admin == null) {
        return null;
    }
    return {username: username, password: password, email: email, admin: admin};
}

module.exports = function (app) {
    // Handle our routes

    // default route
    app.get('/', function (req, res) {
        res.render('index.ejs')
    });

    // about page
    app.get('/about', function (req, res) {
        res.render('about.ejs')
    });


    //lists posts route
    app.get('/posts', function (req, res) {
        let sqlquery = "SELECT * FROM posts"; // query database to get all the posts

        // execute sql query
        db.query(sqlquery, (err, result) => {
            if (err) {
                res.redirect('/');
            }
            res.render('posts.ejs', {posts: result});
        });
    });
    app.get('/topics', function (req, res) {
        let sqlquery = "SELECT * FROM topics"; // query database to get all the posts

        // execute sql query
        db.query(sqlquery, (err, result) => {
            if (err) {
                res.redirect('/');
            }
            res.render('topics.ejs', {topics: result});
        });
    });

    app.post('/new-post-submit', (req, res) => {
        const message = req.body.message;
        const topicID = req.body.topicID;
        console.log(topicID);
        cookies = login(req);
        if (cookies == null) {
            res.render('message.ejs', {message: "You are not signed in."});
            return;
        }
        let sqlquery = "SELECT * FROM users WHERE username = ? AND password = ? AND email = ?"
        db.query(sqlquery, [cookies.username, cookies.password, cookies.email], (err, user) => {
            if (err) {
                console.log(err);
                res.redirect('/');
                return;
            }
            if (user.length === 0) {
                res.send("user does not exist");
            } else {
                let memberquery = "SELECT * FROM members WHERE topicID = ? AND userId = ?";
                db.query(memberquery, [topicID, user[0].userID], function (err, member) {
                    if (err) {
                        console.log(err);
                        res.redirect('/');
                        return;
                    }
                    if (member.length === 0) {
                        res.render("message.ejs", {message: "User is not a member of the topic."});
                    } else {
                        let addpost = "INSERT INTO posts (userID, topicID, posttitle, postcontent, postdate)" +
                            "VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)";
                        db.query(addpost, [user[0].userID, topicID, req.body.postTitle, req.body.postContent], function (err, _) {
                            if (err) {
                                console.log(err);
                                res.redirect('/');
                                return;
                            } else {
                                res.render("message.ejs", {message: "Post created."});
                            }
                        });
                    }
                });
            }
        });
    });

    app.get('/topics/:topicID(\\d+)/join', function (req, res) {
        const topicID = req.params.topicID;
        let cookies = login(req);
        if (cookies == null) {
            res.render("message.ejs", {message: "You are not signed in."});
            return;
        }
        let usersquery = "SELECT * FROM users WHERE username = ? AND password = ? AND email = ?";
        db.query(usersquery, [cookies.username, cookies.password, cookies.email], function (err, users) {
            if (err) {
                console.log(err);
                res.redirect('/');
                return;
            }
            if (users.length === 0) {
                res.render("message.ejs", {message: "You are not signed in."});
                return;
            }
            let membersupdate = "INSERT INTO members (userID, topicID) VALUES (?, ?)";
            db.query(membersupdate, [users[0].userID, topicID], function (err, result) {
                if (err.code === "ER_DUP_ENTRY") {
                    res.render("message.ejs", {message: "You are already a member of this topic."});
                    return;
                }
                if (err) {
                    console.log(err);
                    res.redirect('/');
                    return;
                }
                res.render("message.ejs", {message: "Successfully added to the topic."});
            });
        });
    });

    app.get('/topics/:topicID(\\d+)/add-post', function (req, res) {
        const topicID = req.params.topicID;
        res.render("addpost.ejs", {postTitle: "", postContent: "", topicID: topicID});
    });

    app.get('/topics/:topicID(\\d+)', function (req, res) {
        const topicID = req.params.topicID;
        let topicquery = "SELECT * FROM topics WHERE topicID = ?";
        // execute sql query
        db.query(topicquery, [topicID], (err, topic) => {
            if (err) {
                console.log(err);
                res.redirect('/');
                return;
            }
            if (topic.length === 0) {
                res.render("message.ejs", {message: "Topic does not exist."});
                return;
            }
            let postsquery = "SELECT * FROM posts WHERE topicID = ?";
            db.query(postsquery, [topicID], (err, posts) => {
                if (err) {
                    console.log(err);
                    res.redirect('/');
                    return;
                }
                res.render('topic.ejs', {topic: topic[0], posts: posts});
            });
        });
    });

    app.get('/users', function (req, res) {
        let sqlquery = "SELECT * FROM users"; // query database to get all the posts

        // execute sql query
        db.query(sqlquery, (err, result) => {
            if (err) {
                res.redirect('/');
            }
            res.render('users.ejs', {users: result});
        });
    });

    app.get('/posts/:postID(\\d+)', function (req, res) {
        const postID = req.params.postID;
        let sqlquery = "SELECT * FROM posts WHERE postID = ?"; // query database to get all the post
        // execute sql query
        db.query(sqlquery, [postID], (err, result) => {
            if (err) {
                console.log(err);
                res.redirect('/');
                return;
            }
            res.render('post.ejs', {post: result[0]});
        });
    });


    app.get('/signin', function (req, res) {
        res.render('signin.ejs', {username: "", password: "", email: "", failed: false});
    });
    app.post('/login', (req, res) => {
        const message = req.body;
        let sqlquery = "SELECT * FROM users WHERE username = ? AND password = ? AND email = ?"

        db.query(sqlquery, [message.username, message.password, message.email], (err, result) => {
            if (err) {
                console.log(err);
                res.redirect('/');
                return;
            }
            if (result.length === 0) {
                // couldn't find user
                res.render('signin.ejs', {
                    username: message.username,
                    password: message.password,
                    email: message.email,
                    failed: true
                });
            } else {
                // found user
                res.cookie('username', message.username, {maxAge: 90000000 * 12, httpOnly: true});
                res.cookie('password', message.password, {maxAge: 90000000 * 12, httpOnly: true});
                res.cookie('email', message.email, {maxAge: 90000000 * 12, httpOnly: true});
                res.cookie('admin', result[0].isadmin, {maxAge: 90000000 * 12, httpOnly: true});
                res.render('message.ejs', {message: "You successfully signed in."});
            }
        });
    });

    app.get('/logout', function (req, res) {
        res.clearCookie("username");
        res.clearCookie("password");
        res.clearCookie("email");
        res.render('message.ejs', {message: "You have been logged out."});
    });

    app.get("/searchposts", function (req, res) {
        res.render("searchposts.ejs");
    });

    app.post("/search-existing-posts", function (req, res) {
        let sqlquery = "SELECT posttitle, postcontent, postdate FROM posts LEFT JOIN users ON posts.userID = users.userID " +
            "LEFT JOIN topics ON topics.topicID = posts.topicID " +
            "WHERE users.username LIKE ? AND posttitle LIKE ? AND topicname LIKE ?";
        db.query(sqlquery, [`%${req.body.username}%`, `%${req.body.postTitle}%`, `%${req.body.topic}%`], function (err, result) {
            if (err) {
                console.log(err);
                res.redirect('/');
                return;
            }
            if (result.length === 0) {
                res.render("message.ejs", {message:"Couldn't find any posts."});
                return;
            }
            res.render("posts.ejs", {posts:result});
        });
    });
};

