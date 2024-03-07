// login.js
const express = require('express');
const path = require('path');
const session = require('express-session');
const router = express.Router();
const db = require('./db');

// Sử dụng middleware express-session
router.use(session({
  secret: 'secret_key', // Chuỗi bí mật để ký và mã hóa phiên
  resave: true, // Không lưu lại phiên nếu không có thay đổi
  saveUninitialized: true // Không tạo phiên cho người dùng mới mà không có dữ liệu
}));

const filePath = path.join(__dirname, './register-login');
// Phục vụ các tệp tĩnh từ thư mục hiện tại
router.use(express.static(path.join(__dirname)));
router.use(express.static(path.join(filePath)));

// Xử lý yêu cầu đăng nhập
/* CHECK AUTHENTICATION */
router.get('/login', (req, res) => {
  res.sendFile(path.join(filePath, './html/signin.html'));
});

router.post('/login', (req, res) => {
    const body = req.body;
    const { userName, password } = body;
  
    /* Construct the SQL query to check if the data exist */ 
    const sql =  `SELECT id, COUNT(*) AS count FROM user WHERE 
      userName = ? AND password = ?`;
    
    // Execute the SQL query
    db.get(sql, [userName, password], function(err, row) {
      if (err) {
        console.error('Error checking data:', err.message);
        return;
      }
  
      // check if row is undefined or if count is not defined
      if (!row || typeof row.count === 'undefined') {
        console.log('No data found in the column.');
        return;
      }
  
      // check the count returned by the query
      if (row.count > 0) {
        console.log('Data exists in the column.');
        session.userID = row.id;
        console.log('User ID:', session.userID);
        res.json({userName});
      } else {
        console.log('No data found in the column.');
        res.status(401).json({ error: 'Invalid username or password.' }); // Handle invalid credentials
      }
    });
  });

  router.get('/profile', (req, res) => {

    if (!session.userID) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
   }

    //console.log(session.userID);
    db.all('SELECT name, avatar FROM user WHERE id = ?', [session.userID], (err, rows) => {
      if (err) {
        console.error('Error executing query:', err.message);
        res.status(500).send('Internal Server Error');
      } else {
        res.json(rows);
      }
    });
  });
  
  function getPostByUser(userID, callback) 
  {

    if (!session.userID) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
   }

    const sql = 
      `SELECT user.name, user.avatar, post.title, post.content, post.topic
      FROM user
      JOIN post ON user.id = post.user_id
      WHERE user.id = ?;`

    db.all(sql, [session.userID], (err, rows) => {
      if (err) {
        return callback(err, null);
      }
      callback(null, rows);
    });
  }
  // tao route de vao function
  router.get('/myposts', (req, res) => {
    if (!session.userID) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
   }

    getPostByUser(session.userID, (err, data) => {
      if (err) {
        console.error('Error fetching user posts:', err.message);
        res.status(500).send('Internal Server Error');
        return;
      }
      
      res.json(data);
    });
  });
  router.post('/form', (req, res) => {
    if (!session.userID) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
   }
    const {title, content, topic} = req.body; // Giả sử bạn gửi "title" và "content" trong body của POST request

    // SQL query để thêm bài đăng mới vào database
    const sql = `INSERT INTO post (user_id, title, content, topic) VALUES (?, ?, ?, ?)`;
    db.run(sql, [session.userID, title, content, topic], function(err) {
      if (err) {
        console.error('Error inserting post:', err.message);
        res.status(500).send('Internal Server Error');
        return;
      }
      res.status(201).send({id: this.lastID, message: 'Post added successfully'});
    });

    //res.json({userID, title, content, topic});
  });

  function deleteUserPost(userID, callback) {
    if (!session.userID) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
   }

    const sql = `DELETE FROM post WHERE user_id = ?`;
  
    db.run(sql, [session.userID], function(err) {
      if (err) {
        return callback(err);
      }
      callback(null, {message: 'User posts deleted successfully'});
    });
  }
  function deleteAccount(userID, callback) { 
    if (!session.userID) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
   }

    // Đầu tiên, xóa tất cả bài đăng của người dùng
    deleteUserPost(userID, (err, result) => {
      if (err) {
        return callback(err);
      }
      // Sau khi bài đăng đã được xóa, tiếp tục xóa tài khoản người dùng
      const sql = `DELETE FROM user WHERE id = ?`;
      db.run(sql, [userID], function(err) {
        if (err) {
          return callback(err);
        }
        if (this.changes === 0) {
          return callback(new Error('User not found or already deleted.'));
        }
        callback(null, {message: 'User deleted successfully'});
      });
    });
  }
  router.delete('/delete/account', (req, res) => {
    if (!session.userID) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
   }

    deleteAccount(session.userID, (err, result) => {
      if (err) {
        console.error(err.message);
        res.status(500).send(err.message);
        return;
      }
      res.json(result);
    });
  });

  router.delete('/delete/post', (req, res) => {
    if (!session.userID) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
   }

    deleteUserPost(session.userID, (err, result) => {
      if (err) {
        console.error(err.message);
        res.status(500).send(err.message);
        return;
      }
      res.json(result);
    });
  });

// Đăng xuất - Xóa phiên
router.post('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error('Error logging out:', err.message);
      res.status(500).send('Internal Server Error');
      return;
    }
    session.userID = null;
    console.log('User logged out successfully.');
    res.status(200).send('Logged out successfully');
  });
});

// update post
router.put('/update/posts', (req, res) => {
  const {postID, topic, title, content } = req.body; // Giả sử bạn gửi "topic", "title" và "content" trong body của request cập nhật
  console.log(session.userID);
  console.log(postID);
  // Kiểm tra xem bài viết có thuộc về người dùng này không
  const checkPostOwnerSql = `SELECT * FROM post WHERE id = ? AND user_id = ?`;
  db.get(checkPostOwnerSql, [postID, session.userID], (err, row) => {
    if (err) {
      console.error('Error fetching post:', err.message);
      res.status(500).send('Internal Server Error');
      return;
    }
    if (!row) {
      res.status(404).send('Post not found or you do not have permission to update this post');
      return;
    }

    // SQL query để cập nhật bài viết trong database
    const sql = `UPDATE post SET topic = ?, title = ?, content = ? WHERE id = ? AND user_id = ?`;
    db.run(sql, [topic, title, content, postID, session.userID], function(err) {
      if (err) {
        console.error('Error updating post:', err.message);
        res.status(500).send('Internal Server Error');
        return;
      }
      if (this.changes === 0) {
        res.status(404).send('Post not found or no changes were made.');
        return;
      }
      res.status(200).send({ message: 'Post updated successfully' });
    });
  });
});

module.exports = router;
