const sqlite3 = require('sqlite3').verbose();

/* CONNECT DATABASE */
const db = new sqlite3.Database('./user.db', (err) => {
    if (err) {
    console.error('Error connecting to database:', err.message);
    } else {
    //console.log('Connected to SQLite database.');
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

/*db.serialize(() => {
  // 1. Tạo bảng mới với cấu trúc mới
  db.run(`CREATE TABLE user_new (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,
    userName TEXT UNIQUE,
    password TEXT,
    phone TEXT,
    mail TEXT,
    facebook TEXT,
    avatar BLOB
  )`, (err) => {
    if (err) {
      console.error('Error creating new table:', err.message);
    } else {
      console.log('Created new table successfully.');
      
      // 2. Sao chép dữ liệu từ bảng cũ sang bảng mới
      db.run(`INSERT INTO user_new (id, name, userName, password, phone, mail, facebook, avatar) SELECT id, name, userName, password, phone, mail, facebook, avatar FROM user`, (err) => {
        if (err) {
          console.error('Error copying data:', err.message);
        } else {
          console.log('Data copied successfully.');
          
          // 3. Xóa bảng cũ
          db.run(`DROP TABLE user`, (err) => {
            if (err) {
              console.error('Error dropping old table:', err.message);
            } else {
              console.log('Old table dropped successfully.');
              
              // Đổi tên bảng mới thành tên của bảng cũ
              db.run(`ALTER TABLE user_new RENAME TO user`, (err) => {
                if (err) {
                  console.error('Error renaming table:', err.message);
                } else {
                  console.log('Table renamed successfully.');
                }
              });
            }
          });
        }
      });
    }
  });
});*/

/*
const sql = `ALTER TABLE user ADD COLUMN tempAvatar BLOB`;
db.run(sql, function(err) {
  if (err) {
    console.error('Error adding column:', err.message);
  }
  else {
    console.log('Column added successfully');
  }

  db.close();
});*/

/*const sql = `ALTER TABLE post ADD COLUMN avatar BLOB`;
db.run(sql, function(err) {
  if (err) {
    console.error('Error adding column:', err.message);
  }
  else {
    console.log('Column added successfully');
  }

  db.close();
});*/

/*const sql = `ALTER TABLE post ADD COLUMN like_count INTEGER DEFAULT(0)`;
db.run(sql, function(err) {
  if (err) {
    console.error('Error adding column:', err.message);
  }
  else {
    console.log('Column added successfully');
  }

  db.close();
});*/

/*db.serialize(() => {
  db.run(`CREATE TABLE onlyPostAvatar (
    avatar BLOB
  )`, (err) => {
    if (err) {
      console.error('Error creating table:', err.message);
    } else {
      console.log('Created your_table successfully.');
    }
  });
});*/

/*db.serialize(() => {
  db.run(`CREATE TABLE user_like (
    id       INTEGER   PRIMARY KEY AUTOINCREMENT,
    user_id  INTEGER,
    post_id  INTEGER,
    liked_at TIMESTAMP DEFAULT (CURRENT_TIMESTAMP) 
  )`, (err) => {
    if (err) {
      console.error('Error creating table:', err.message);
    } else {
      console.log('Created your_table successfully.');
    }
  });
});*/

/*db.serialize(() => {
  // 1. Tạo bảng mới với cấu trúc mới
  db.run(`CREATE TABLE onlyPostAvatar_new (
    id TEXT PRIMARY KEY,
    avatar BLOB
  )`, (err) => {
    if (err) {
      console.error('Error creating new table:', err.message);
    } else {
      console.log('Created new table successfully.');
      
      // 2. Sao chép dữ liệu từ bảng cũ sang bảng mới
      db.run(`INSERT INTO onlyPostAvatar_new (avatar) SELECT avatar FROM onlyPostAvatar`, (err) => {
        if (err) {
          console.error('Error copying data:', err.message);
        } else {
          console.log('Data copied successfully.');
          
          // 3. Xóa bảng cũ
          db.run(`DROP TABLE onlyPostAvatar`, (err) => {
            if (err) {
              console.error('Error dropping old table:', err.message);
            } else {
              console.log('Old table dropped successfully.');
              
              // Đổi tên bảng mới thành tên của bảng cũ
              db.run(`ALTER TABLE onlyPostAvatar_new RENAME TO onlyPostAvatar`, (err) => {
                if (err) {
                  console.error('Error renaming table:', err.message);
                } else {
                  console.log('Table renamed successfully.');
                }
              });
            }
          });
        }
      });
    }
  });
});*/

/*db.serialize(() => {
  // 1. Tạo bảng mới với cấu trúc mới
  db.run(`CREATE TABLE user_like_new (
    id       TEXT   PRIMARY KEY,
    user_id  TEXT,
    post_id  TEXT,
    liked_at TIMESTAMP DEFAULT (CURRENT_TIMESTAMP) 
  )`, (err) => {
    if (err) {
      console.error('Error creating new table:', err.message);
    } else {
      console.log('Created new table successfully.');
      
      // 2. Sao chép dữ liệu từ bảng cũ sang bảng mới
      db.run(`INSERT INTO user_like_new (user_id, post_id, liked_at) SELECT user_id, post_id, liked_at FROM user_like`, (err) => {
        if (err) {
          console.error('Error copying data:', err.message);
        } else {
          console.log('Data copied successfully.');
          
          // 3. Xóa bảng cũ
          db.run(`DROP TABLE user_like`, (err) => {
            if (err) {
              console.error('Error dropping old table:', err.message);
            } else {
              console.log('Old table dropped successfully.');
              
              // Đổi tên bảng mới thành tên của bảng cũ
              db.run(`ALTER TABLE user_like_new RENAME TO user_like`, (err) => {
                if (err) {
                  console.error('Error renaming table:', err.message);
                } else {
                  console.log('Table renamed successfully.');
                }
              });
            }
          });
        }
      });
    }
  });
});*/

/*db.serialize(() => {
  // 1. Tạo bảng mới với cấu trúc mới
  db.run(`CREATE TABLE post_new (
    id TEXT PRIMARY KEY,
    user_id TEXT,
    title TEXT,
    content TEXT,
    topic INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    like_count INTEGER DEFAULT 0,
    avatar BLOB,
    FOREIGN KEY(user_id) REFERENCES user(id)
  )`, (err) => {
    if (err) {
      console.error('Error creating new table:', err.message);
    } else {
      console.log('Created new table successfully.');
      
      // 2. Sao chép dữ liệu từ bảng cũ sang bảng mới
      db.run(`INSERT INTO post_new (user_id, title, content, topic, created_at, avatar) SELECT user_id, title, content, topic, created_at, avatar FROM post`, (err) => {
        if (err) {
          console.error('Error copying data:', err.message);
        } else {
          console.log('Data copied successfully.');
          
          // 3. Xóa bảng cũ
          db.run(`DROP TABLE post`, (err) => {
            if (err) {
              console.error('Error dropping old table:', err.message);
            } else {
              console.log('Old table dropped successfully.');
              
              // Đổi tên bảng mới thành tên của bảng cũ
              db.run(`ALTER TABLE post_new RENAME TO post`, (err) => {
                if (err) {
                  console.error('Error renaming table:', err.message);
                } else {
                  console.log('Table renamed successfully.');
                }
              });
            }
          });
        }
      });
    }
  });
});*/

db.run(`DELETE FROM user`, function(err) {
  if (err) {
    console.error(err.message);
    return;
  }
  console.log(`Dữ liệu đã được xóa khỏi bảng post`);
});


db.run(`DELETE FROM post`, function(err) {
  if (err) {
    console.error(err.message);
    return;
  }
  console.log(`Dữ liệu đã được xóa khỏi bảng post`);
});

db.run(`DELETE FROM user`, function(err) {
  if (err) {
    console.error(err.message);
    return;
  }
  console.log(`Dữ liệu đã được xóa khỏi bảng post`);
});

db.run(`DELETE FROM onlyPostAvatar`, function(err) {
  if (err) {
    console.error(err.message);
    return;
  }
  console.log(`Dữ liệu đã được xóa khỏi bảng post`);
});

db.run(`DELETE FROM user_like`, function(err) {
  if (err) {
    console.error(err.message);
    return;
  }
  console.log(`Dữ liệu đã được xóa khỏi bảng post`);
});


/*db.serialize(() => {
  // 1. Tạo bảng mới với cấu trúc mới
  db.run(`CREATE TABLE user_new (
    id TEXT PRIMARY KEY,
    name TEXT,
    userName TEXT UNIQUE,
    password TEXT,
    phone TEXT,
    mail TEXT,
    facebook TEXT,
    avatar BLOB,
    tempAvatar BLOB
  )`, (err) => {
    if (err) {
      console.error('Error creating new table:', err.message);
    } else {
      console.log('Created new table successfully.');
      
      // 2. Sao chép dữ liệu từ bảng cũ sang bảng mới
      db.run(`INSERT INTO user_new (id, name, userName, password, phone, mail, facebook, avatar) SELECT id, name, userName, password, phone, mail, facebook, avatar FROM user`, (err) => {
        if (err) {
          console.error('Error copying data:', err.message);
        } else {
          console.log('Data copied successfully.');
          
          // 3. Xóa bảng cũ
          db.run(`DROP TABLE user`, (err) => {
            if (err) {
              console.error('Error dropping old table:', err.message);
            } else {
              console.log('Old table dropped successfully.');
              
              // Đổi tên bảng mới thành tên của bảng cũ
              db.run(`ALTER TABLE user_new RENAME TO user`, (err) => {
                if (err) {
                  console.error('Error renaming table:', err.message);
                } else {
                  console.log('Table renamed successfully.');
                }
              });
            }
          });
        }
      });
    }
  });
});*/

module.exports = db;