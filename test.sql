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

 INSERT INTO users(username,password)
 VALUES(
     "shadow",
     "$2y$10$.DGDxDCIbcpjUqcXeC5qPe8vfNQimvDp64W8FiBjvwfyGQEHjgpVa"
 );


 INSERT INTO blogs(title,image_url,body,user_id)
 VALUES (
     "Documenting the Obama Presidency through Oral History",
     "https://www.obama.org/wp-content/uploads/20894933442_6226989550_b.jpg",
     "For decades, historians, journalists, filmmakers, and scholars have produced oral history archives to document our shared past. Major archives have invested in collecting the testimonies of holocaust survivors,the stories of American veterans, and memories of the Civil Rights movements, so future
     generations can learn what it felt like to live through a historic moment.\r\nThese firsthand accounts of history can create powerful, human-centered connections between past, present, and future. Rooted in oral traditions that predate recording technology and endure today in communities across the world, oral history has become an important way to preserve and share the individual stories that tie us together.\r\nThere is a long tradition of presidential foundations partnering with other organizations to produce oral histories that document presidents and their time in office. In thinking about how oral history could help document the Obama Administration, we consulted a range of presidential historians, scholars, documentarians, and journalists with experience bringing the past to life. In keeping with the spirit of President and Mrs. Obama’s White House, we wanted to ensure that any oral history project include government officials who worked directly with the president as well as those from all walks of life who were affected by the Obama presidency.\r\nThat diversity of voices—many of which are often lost to history—is crucial for understanding campaigns that brought new voters and organizers into the political process, a president who read ten constituent letters every night, and a White House that found new ways to engage directly with the American people at the dawn of the digital era.\r\nThat’s why we’re so excited Columbia University, in partnership with the University of Chicago and University of Hawaiʻi, will produce the official oral history of the Obama presidency. Columbia has one of the largest and oldest oral history programs, and archives, in the world and is home to the nation’s only graduate level training program in the field of oral history. Founded by Allan Nevins in 1948, Columbia’s Center for Oral History Research has consistently focused
     on the history of our democracy by conducting biographies of policy leaders, and projects on the law, civil society and political administrations at all levels. In addition to hosting the Eisenhower Administration oral history, Columbia’s recent major works include a project documenting how New Yorkers experienced
     September 11, an examination of Guantanamo and civil rights law in the 21st Century, and a history of the Council on Foreign Relations.",
     1
 );

 INSERT INTO comments(comment_text,blog_id,user_id)
 VALUES(
     "Well Written",
     1,
     1
 );

