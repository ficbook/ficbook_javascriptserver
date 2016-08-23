CREATE DATABASE `fbchat_develop`;
CREATE USER 'fbuser_develop'@'localhost' IDENTIFIED BY 'a2gxF4Gt';
GRANT ALL PRIVILEGES ON `fbchat_develop`.*  TO 'fbuser_develop'@'localhost';

npm run db_init
