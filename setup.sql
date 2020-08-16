CREATE DATABASE blog_app

USE blog_app;

 CREATE TABLE users(
     id INT AUTO_INCREMENT PRIMARY KEY,
     username VARCHAR(255) UNIQUE NOT NULL,
     password VARCHAR(100),
     created_at TIMESTAMP DEFAULT NOW()
 );

CREATE TABLE blogs(
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    image_url TEXT NOT NULL,
    body MEDIUMTEXT NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    user_id INT NOT NULL,
    FOREIGN KEY(user_id) REFERENCES users(id)
);

CREATE TABLE comments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    comment_text VARCHAR(255) NOT NULL,
    blog_id INT NOT NULL,
    user_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    FOREIGN KEY(blog_id) REFERENCES blogs(id),
    FOREIGN KEY(user_id) REFERENCES users(id)
);