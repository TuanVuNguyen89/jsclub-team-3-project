const sqlite3 = require('sqlite3').verbose();

/* CONNECT DATABASE */
const db = new sqlite3.Database('./user.db', (err) => {
    if (err) {
    console.error('Error connecting to database:', err.message);
    } else {
    console.log('Connected to SQLite database.');
    }
  });

/* CREATE TABLE 
db.serialize(() => {
  db.run(`CREATE TABLE user (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,
    userName TEXT UNIQUE,
    password TEXT,
    studentID TEXT UNIQUE,
    phone TEXT,
    mail TEXT,
    facebook TEXT,
    avatar TEXT
  )`, (err) => {
    if (err) {
      console.error('Error creating table:', err.message);
    } else {
      console.log('Created your_table successfully.');
    }
  });
});*/

 /*db.serialize(() => {
    db.run(`CREATE TABLE post (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER,
      title TEXT,
      content TEXT,
      topic INTEGER,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(user_id) REFERENCES user(id)
    )`, (err) => {
      if (err) {
        console.error('Error creating table:', err.message);
      } else {
        console.log('Created your_table successfully.');
      }
    });
  });*/

/*
const sql = `ALTER TABLE post ADD COLUMN topic INTEGER`;
db.run(sql, function(err) {
  if (err) {
    console.error('Error adding column:', err.message);
  }
  else {
    console.log('Column added successfully');
  }

  db.close();
});
*/

// Chuỗi SQL DELETE
/*const sql = `DELETE FROM user WHERE id = ?`;

// Thực thi lệnh SQL DELETE
db.run(sql, [3], function(err) {
    if (err) {
        return console.error('Error deleting row:', err.message);
    }
    console.log(`Row with ID ${3} deleted successfully.`);
});*/

/*const sql = `DROP TABLE IF EXISTS ${post}`;

// Thực thi lệnh SQL DROP TABLE
db.run(sql, function(err) {
    if (err) {
        return console.error('Error deleting table:', err.message);
    }
    console.log(`Table "${post}" deleted successfully.`);
});*/

module.exports = db;