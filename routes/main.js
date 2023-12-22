const util = require('util');

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
        const userID = req.cookies.userID;
        if (userID == null) {
            res.render('message.ejs', {message: "You are not signed in.", redirect:"/"});
            return;
        }
        let memberquery = "SELECT * FROM members WHERE topicID = ? AND userID = ?";
        db.query(memberquery, [topicID, userID], function (err, member) {
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
                db.query(addpost, [userID, topicID, req.body.postTitle, req.body.postContent], function (err, _) {
                    if (err) {
                        console.log(err);
                        res.redirect('/');
                        return;
                    } else {
                        res.render("message.ejs", {message: "Post created.", redirect:"/topics/" + topicID});
                    }
                });
            }
        });
    });

    app.post("/new-reply-submit", function (req, res) {
        const message = req.body;
        const postID = req.body.postID;
        const userID = req.cookies.userID;
        if (userID == null) {
            res.render("message.ejs", {message:"You are not signed in", redirect:"/posts/" + postID});
        }
        let sqlquery = "INSERT INTO replies (userID, postID, replycontent, dateposted) VALUES (?, ?, ?, CURRENT_TIMESTAMP)"
        db.query(sqlquery, [userID, postID, message.replycontent], function (err, result) {
            if (err) {
                console.log(err);
                res.redirect('/');
                return;
            }
            res.render("message.ejs", {message:"Reply to post created.", redirect:"/posts/" + postID});
        });
    });

    app.get('/topics/:topicID(\\d+)/join', function (req, res) {
        const topicID = req.params.topicID;
        const userID = req.cookies.userID;
        if (userID == null) {
            res.render("message.ejs", {message: "You are not signed in.", redirect:"/"});
            return;
        }
        let membersupdate = "INSERT INTO members (userID, topicID) VALUES (?, ?)";
        db.query(membersupdate, [userID, topicID], function (err, result) {
            if (err.code === "ER_DUP_ENTRY") {
                res.render("message.ejs", {message: "You are already a member of this topic.", redirect:"/topics/" + topicID});
                return;
            }
            if (err) {
                console.log(err);
                res.redirect('/');
                return;
            }
            res.render("message.ejs", {message: "Successfully joined to the topic.", redirect:"/topics/" + topicID});
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
                res.render("message.ejs", {message: "Topic does not exist.", redirect:"/"});
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

    app.get("/users/:userID(\\d+)", async function (req, res) {
        const dbQueryPromise = util.promisify(db.query).bind(db);
        const userID = req.params.userID;
        let userdata = null;
        let topicsdata = [];
        let postsdata = [];
        let repliesdata = [];

        let userquery = "SELECT * FROM users WHERE userID = ?";
        userdata = await dbQueryPromise(userquery, [userID]);

        let topicsquery = "SELECT * FROM members LEFT JOIN topics ON members.topicID = topics.topicID WHERE userID = ?";
        topicsdata = await dbQueryPromise(topicsquery, [userID]);

        let postsquery = "SELECT * FROM posts WHERE userID = ?";
        postsdata = await dbQueryPromise(postsquery, [userID]);

        let repliesquery = "SELECT * FROM replies WHERE userID = ?";
        repliesdata = await dbQueryPromise(repliesquery, [userID]);

        res.render("user.ejs", {user: userdata[0], topics: topicsdata, posts: postsdata, replies: repliesdata});
    });

    app.get('/posts/:postID(\\d+)', function (req, res) {
        const postID = req.params.postID;
        let sqlquery = "SELECT * FROM posts LEFT JOIN users ON posts.userID = users.userID  WHERE postID = ? "; // query database to get all the post
        // execute sql query
        db.query(sqlquery, [postID], (err, post) => {
            if (err) {
                console.log(err);
                res.redirect('/');
                return;
            }
            let repliesquery = "SELECT * FROM replies LEFT JOIN users ON replies.userID = users.userID WHERE postID = ?";
            db.query(repliesquery, [postID], function (err, replies) {
                if (err) {
                    console.log(err);
                    res.redirect('/');
                    return;
                }
                res.render('post.ejs', {post: post[0], replies:replies});
            });
        });
    });

    app.get("/posts/:postID(\\d+)/delete-post", function (req, res) {
        const postID = req.params.postID;
        const userID = req.cookies.userID;
        if (userID == null) {
            res.render("message.ejs", {message:"You are not logged in.", redirect:"/posts/" + postID});
        }
        let sqlquery = "SELECT users.userID, users.isadmin, posts.userID AS posterID, members.ismod, posts.topicID FROM " +
            "users INNER JOIN posts ON users.userID = ? AND posts.postID = ? " +
            "LEFT JOIN members ON users.userID = members.userID AND posts.topicID = members.topicID;";
        db.query(sqlquery, [userID, postID], function (err, result) {
            if (err) {
                console.log(err);
                res.redirect('/');
                return;
            }
            let deletequery = "DELETE FROM posts WHERE postID = ?";
            if (result[0].ismod || result[0].isadmin || result[0].userID === result[0].postID) {
                db.query(deletequery,[postID], function (err, _) {
                    if (err) {
                        console.log(err);
                        res.redirect('/');
                        return;
                    }
                    res.render("message.ejs", {message:"Successfully deleted the post.", redirect:"/topics/" + result[0].topicID});
                });
            }
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
                res.cookie("userID", result[0].userID, {maxAge: 90000000 * 12, httpOnly: true});
                res.render('message.ejs', {message: "You successfully signed in.", redirect:"/"});
            }
        });
    });

    app.get("/signup", function (req, res) {
       res.render("adduser.ejs");
    });

    app.post("/create-account", function (req, res) {
        const message = req.body;
        let sqlquery = "INSERT INTO users (username, password, email, userdescription) VALUES (?, ?, ?, ?)";
        db.query(sqlquery, [message.username, message.password, message.email, message.description], function (err, _) {
            if (err) {
                console.log(err);
                res.redirect("/");
                return;
            }
            res.render("message.ejs", {message:"Account successfully created", redirect:"/"});
        });
    });

    app.get('/logout', function (req, res) {
        res.clearCookie("userID");
        res.render('message.ejs', {message: "You have been logged out.", redirect:"/"});
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
                res.render("message.ejs", {message:"Couldn't find any posts.", redirect:"/"});
                return;
            }
            res.render("posts.ejs", {posts:result});
        });
    });

    app.get("/addtopic", function (req, res) {
        const userID = req.cookies.userID;
        if (userID == null) {
            res.render("message.ejs", {message:"You are not logged in.", redirect:"/"});
            return;
        }
        let adminquery = "SELECT isadmin FROM users WHERE userID = ?";
        db.query(adminquery, [userID], function (err, result) {
            if (err) {
                console.log(err);
                res.redirect('/');
                return;
            }
            if (result[0].isadmin) {
                res.render("addtopic.ejs");
            } else {
                res.render("message.ejs",{message:"You are not an admin. Only admins can create topics.", redirect:"/"});
            }
        });
    });

    app.post("/new-topic-submit", function (req, res) {
        const message = req.body;
        let sqlquery = "INSERT INTO topics (topicname, topicdescription) VALUES (?,?)";
        db.query(sqlquery, [message.topicname, message.topicdescription], function (err, result) {
            if (err) {
                console.log(err);
                res.redirect("/");
                return;
            }
            res.render("message.ejs", {message:"Topic successfully created.", redirect:"/"});
        });
    });
};

