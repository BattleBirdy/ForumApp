USE `moddingforum`;

DROP TABLE IF EXISTS `users`;

CREATE TABLE `users` (
  `userID` int NOT NULL AUTO_INCREMENT,
  `username` varchar(45) NOT NULL,
  `password` varchar(45) NOT NULL,
  `email` varchar(45) NOT NULL,
  `userdescription` varchar(350) DEFAULT 'This user has not changed their description.',
  `isadmin` tinyint DEFAULT '0',
  PRIMARY KEY (`userID`),
  UNIQUE KEY `Username_UNIQUE` (`username`)
);

LOCK TABLES `users` WRITE;
INSERT INTO `users` VALUES (1,'BattleMod','password123','BattleMod@gmail.com','This user is a mod!',1),(2,'Battle','password123','Battle@gmail.com','This user is NOT a mod!',0);
UNLOCK TABLES;

DROP TABLE IF EXISTS `topics`;

CREATE TABLE `topics` (
  `topicID` int NOT NULL AUTO_INCREMENT,
  `topicname` varchar(45) NOT NULL,
  `topicdescription` longtext NOT NULL,
  PRIMARY KEY (`topicID`),
  UNIQUE KEY `TopicName_UNIQUE` (`topicname`)
);

LOCK TABLES `topics` WRITE;
INSERT INTO `topics` VALUES (1,'StarSector','StarSector is an immersive top down space simulator game.');
UNLOCK TABLES;

DROP TABLE IF EXISTS `members`;

CREATE TABLE `members` (
  `userID` int NOT NULL,
  `topicID` int NOT NULL,
  `ismod` tinyint DEFAULT '0',
  PRIMARY KEY (`userID`,`topicID`),
  KEY `fk_topic_member_idx` (`topicID`),
  CONSTRAINT `fk_topic_member` FOREIGN KEY (`topicID`) REFERENCES `topics` (`topicID`),
  CONSTRAINT `fk_user_member` FOREIGN KEY (`userID`) REFERENCES `users` (`userID`)
);

LOCK TABLES `members` WRITE;
INSERT INTO `members` VALUES (1,1,1),(2,1,0);
UNLOCK TABLES;

DROP TABLE IF EXISTS `posts`;

CREATE TABLE `posts` (
  `postID` int NOT NULL AUTO_INCREMENT,
  `userID` int NOT NULL,
  `topicID` int NOT NULL,
  `posttitle` varchar(45) NOT NULL,
  `postcontent` longtext NOT NULL,
  `postdate` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `postfile` longblob,
  PRIMARY KEY (`postID`),
  UNIQUE KEY `idPost_UNIQUE` (`postID`),
  KEY `fk_members` (`userID`,`topicID`),
  CONSTRAINT `fk_members` FOREIGN KEY (`userID`, `topicID`) REFERENCES `members` (`userID`, `topicID`)
);

LOCK TABLES `posts` WRITE;
INSERT INTO `posts` VALUES (1,1,1,'VIC','Volkolov Industries is a StarSector mod that adds many interesting ships that have a variety of unique game play affects','2023-12-15 16:38:31',NULL),(2,2,1,'Industrial Evolution','This mod adds many interesting colony and exploration affects!','2023-12-20 13:48:44',NULL),(3,2,1,'Diable Avionics','This mod adds many "carrier" focused ships to the game!','2023-12-20 13:52:56',NULL);
UNLOCK TABLES;

DROP TABLE IF EXISTS `replies`;

CREATE TABLE `replies` (
  `replyID` int NOT NULL,
  `userID` int NOT NULL,
  `postID` int NOT NULL,
  `replycontent` longtext NOT NULL,
  `dateposted` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `replyfile` longblob,
  PRIMARY KEY (`replyID`),
  KEY `fk_userID_idx` (`userID`),
  KEY `fk_post_reply_idx` (`postID`),
  CONSTRAINT `fk_post_reply` FOREIGN KEY (`postID`) REFERENCES `posts` (`postID`),
  CONSTRAINT `fk_user_reply` FOREIGN KEY (`userID`) REFERENCES `users` (`userID`)
);

LOCK TABLES `replies` WRITE;
INSERT INTO `replies` VALUES (1,1,1,'I like this mod a lot!','2023-12-15 16:40:41',NULL);
UNLOCK TABLES;


