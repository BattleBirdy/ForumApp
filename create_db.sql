# Create database script for the forum app

# Create the database
CREATE DATABASE IF NOT EXISTS moddingforum;
USE moddingforum;

# Create the tables

# Users Table
CREATE TABLE IF NOT EXISTS users (
    userID INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(45) NOT NULL,
    password VARCHAR(45) NOT NULL,
    email VARCHAR(45) NOT NULL,
    isAdmin TINYINT DEFAULT NULL
);

# Topics Table
CREATE TABLE IF NOT EXISTS topics (
    topicID INT AUTO_INCREMENT PRIMARY KEY,
    topicName VARCHAR(45) NOT NULL
);

# Members Table
CREATE TABLE IF NOT EXISTS members (
    userID INT,
    topicID INT,
    isMod TINYINT DEFAULT NULL,
    PRIMARY KEY (userID, topicID),
    FOREIGN KEY (userID) REFERENCES users(userID),
    FOREIGN KEY (topicID) REFERENCES topics(topicID)
);

# Posts Table
CREATE TABLE IF NOT EXISTS posts (
    postID INT AUTO_INCREMENT PRIMARY KEY,
    userID INT NOT NULL,
    topicID INT NOT NULL,
    postTitle VARCHAR(45) NOT NULL,
    postContent LONGTEXT NOT NULL,
    postDate DATETIME DEFAULT CURRENT_TIMESTAMP,
    postFile LONGBLOB DEFAULT NULL,
    FOREIGN KEY (userID) REFERENCES users(userID),
    FOREIGN KEY (topicID) REFERENCES topics(topicID)
);

# Replies Table
CREATE TABLE IF NOT EXISTS replies (
    replyID INT AUTO_INCREMENT PRIMARY KEY,
    userID INT NOT NULL,
    postID INT NOT NULL,
    replyContent LONGTEXT NOT NULL,
    datePosted DATETIME DEFAULT CURRENT_TIMESTAMP,
    replyFile LONGBLOB DEFAULT NULL,
    FOREIGN KEY (userID) REFERENCES users(userID),
    FOREIGN KEY (postID) REFERENCES posts(postID)
);

# Create the app user and give it access to the database
CREATE USER 'myforumappuser'@'localhost' IDENTIFIED BY 'app2027';
GRANT ALL PRIVILEGES ON moddingforum.* TO 'myforumappuser'@'localhost';