# Insert test data into the forum app database

USE moddingforum;

# Insert User
INSERT INTO users (userID, username, password, email, isAdmin) VALUES
(1, 'Battlemod', 'Battlemod123', 'Battlemod@gmail.com', 1);
INSERT INTO users (userID, username, password, email, isAdmin) VALUES
(2, 'Battle', 'Battle123', 'Battle@gmail.com', 0);

# Insert Topic
INSERT INTO topics (topicID, topicName) VALUES
(1, 'Starsector');

# Insert Member
INSERT INTO members (userID, topicID, isMod) VALUES
(1, 1, 1);

# Insert Post
INSERT INTO posts (postID, userID, topicID, postTitle, postContent, postDate, postFile) VALUES
(1, 1, 1, 'VIC', 'The VIC is a mod for the game Starsector that adds many interesting ships with interesting gameplay effects.', CURRENT_TIMESTAMP, NULL);

# Insert Reply
INSERT INTO replies (replyID, userID, postID, replyContent, datePosted, replyFile) VALUES
(1, 1, 1, 'This mod is great but I think that the faction needs a story!', CURRENT_TIMESTAMP, NULL);