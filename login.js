// login.js
const express = require('express');
const path = require('path');
const fs = require('fs');
const cheerio = require('cheerio');
const session = require('express-session');
const multer = require('multer');
const router = express.Router();
const db = require('./db');

// Sử dụng middleware express-session
router.use(session({
  secret: 'secret_key', // Chuỗi bí mật để ký và mã hóa phiên
  resave: true, // Không lưu lại phiên nếu không có thay đổi
  saveUninitialized: true // Không tạo phiên cho người dùng mới mà không có dữ liệu
}));

const filePath = path.join(__dirname, './register-login');
const personalPath = path.join(__dirname, './personal');
const formPath = path.join(__dirname, './formteam3');
const phuPath = path.join(__dirname, './formteam3/trangphu');
// Phục vụ các tệp tĩnh từ thư mục hiện tại
router.use(express.static(path.join(__dirname)));
router.use(express.static(filePath));
router.use(express.static(personalPath));
router.use(express.static(formPath));
router.use(express.static(phuPath));

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
    //location.reload();
    if (!session.userID) {
      //alert('Login failed: Invalid credentials');
      res.status(401).json({ error: 'Unauthorized' });
      return;
   }

   const htmlTem = fs.readFileSync('./personal/html/Personal.html', 'utf8');
    //console.log(session.userID);
    const sql = 'SELECT name, avatar, facebook, phone, mail FROM user WHERE id = ?';
    db.get(sql, [session.userID], (err, row) => {
      if (err) {
        return res.status(500).send(err.message);
      }
      
      if (!row) {
        return res.status(404).send('Profile not found');
      }

      // Sử dụng cheerio để tìm và thay đổi các giá trị trong file HTML
      //console.log("changed");
      const $ = cheerio.load(htmlTem);
      $('.userName').text(row.name);
      $('.face').text(row.facebook);
      $('.face').attr('href', row.facebook);
      $('.phone').text(row.phone);
      $('.mmail').text(row.mail);
      if (!row.avatar) $('.linkAvatar').attr('src', "./personal/assets/img/avatar-trang.jpg");
      else $('.linkAvatar').attr('src', row.avatar);

      res.send($.html());
    });

    //res.sendFile(path.join(personalPath, './html/Personal.html'));
});
  


const upload = multer({ dest: 'uploads/' });
router.get('/update/profile', (req, res) => {
  if (!session.userID) {
    //alert('Login failed: Invalid credentials');
    res.status(401).json({ error: 'Unauthorized' });
    return;
 }

 const htmlTem = fs.readFileSync('./personal/html/updateProfile.html', 'utf8');
  //console.log(session.userID);
  const sql = 'SELECT name, avatar, facebook, phone, mail FROM user WHERE id = ?';
  db.get(sql, [session.userID], (err, row) => {
    if (err) {
      return res.status(500).send(err.message);
    }
    
    if (!row) {
      return res.status(404).send('Profile not found');
    }

    // Sử dụng cheerio để tìm và thay đổi các giá trị trong file HTML
    //console.log("changed");
    console.log(row);
    const $ = cheerio.load(htmlTem);
    $('.userName').text(row.name);
    $('.face').text(row.facebook);
    $('.face').attr('href', row.facebook);
    $('#updatePhone').text(row.phone);
    $('#updateEmail').text(row.mail);
    if (!row.avatar) $('#linkAvatar').attr('src', "../personal/assets/img/avatar-trang.jpg");
    else $('#linkAvatar').attr('src', `../${row.avatar}`);
    //$('#linkAvatar').attr('src', `../${row.avatar}`);

    res.send($.html());
  });
});

router.post('/update/profile', (req, res) => {
  if (!session.userID) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  // SQL query để lấy giá trị cột tempAvatar của hàng hiện tại
  const getTempAvatarSql = `SELECT tempAvatar FROM user WHERE id = ?`;

  db.get(getTempAvatarSql, [session.userID], (err, row) => {
    if (err) {
      console.error('Error fetching tempAvatar:', err.message);
      return res.status(500).send('Internal Server Error');
    }

    if (!row || !row.tempAvatar) {
      return res.status(404).send('Temporary avatar not found for the current user');
    }

    // Lấy đường dẫn avatar từ cột tempAvatar
    const avatar = row.tempAvatar;

    // Lấy dữ liệu từ form
    const { facebook, phone, mail } = req.body;

    // SQL query để cập nhật thông tin người dùng
    const updateProfileSql = `UPDATE user SET avatar = ?, facebook = ?, phone = ?, mail = ? WHERE id = ?`;

    db.run(updateProfileSql, [avatar, facebook, phone, mail, session.userID], function(err) {
      if (err) {
        console.error('Error updating profile:', err.message);
        return res.status(500).send('Internal Server Error');
      }

      res.status(200).send({ message: 'Profile updated successfully' });
    });
  });
});

router.post('/upload', upload.single('avatar'), (req, res) => {
  // Lưu đường dẫn của file ảnh vào cơ sở dữ liệu
  const avatarPath = req.file.path;
  db.run(`UPDATE user SET tempAvatar = ? WHERE id = ?`, [avatarPath, session.userID], (err) => {
      if (err) {
          console.error(err.message);
          res.status(500).json({ error: 'Internal Server Error' });
      } else {
          res.json({ message: 'Avatar uploaded successfully' });
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

  router.get('/form', (req, res) => {
    res.sendFile(path.join(formPath, "./index2.html"));
  });

  router.get('/backhome', (req, res) => {
    res.sendFile(path.join(phuPath, "./backhome.html"))
  });

  router.post('/form', (req, res) => {
    if (!session.userID) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
   }
    const {title, content, topic} = req.body; // Giả sử bạn gửi "title" và "content" trong body của POST request
   //console.log(topic);
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
