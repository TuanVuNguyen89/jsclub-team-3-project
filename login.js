// login.js
const express = require('express');
const path = require('path');
const fs = require('fs');
const cheerio = require('cheerio');
const session = require('express-session');
const multer = require('multer');
const router = express.Router();
const db = require('./db');
const { v4: uuidv4 } = require('uuid');

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
const postPath = path.join(__dirname, './post');
// Phục vụ các tệp tĩnh từ thư mục hiện tại
router.use(express.static(path.join(__dirname)));
router.use(express.static(filePath));
router.use(express.static(personalPath));
router.use(express.static(formPath));
router.use(express.static(phuPath));
router.use(express.static(postPath));

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
        //console.log(row);
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
    const $ = cheerio.load(htmlTem);

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
      $('.userName').text(row.name);
      $('.face').text(row.facebook);
      $('.face').attr('href', row.facebook);
      $('.phone').text(row.phone);
      $('.mmail').text(row.mail);
      if (!row.avatar) $('.linkAvatar').attr('src', "./personal/assets/img/avatar-trang.jpg");
      else $('.linkAvatar').attr('src', row.avatar);
    });

    $('.allPost').empty(); // Xóa bất kỳ dữ liệu cũ nào trước khi thêm dữ liệu mới

    db.all(`SELECT *, strftime('%Y-%m-%d %H:%M', datetime(created_at, '+7 hours')) AS formatted_created_at FROM post WHERE user_id = ? ORDER BY created_at DESC`, [session.userID], (err, rows) => {
        if (err) {
            console.log(err.message);
            res.status(500).json({ error: 'Internal Server Error' });
            return;
        }

        let promises = [];
        rows.forEach(row => {
            let promise = new Promise((resolve, reject) => {
                db.get(`SELECT facebook, avatar, name FROM user WHERE id = ?`, [row.user_id], (err, row2) => {
                    if (err) {
                        console.error(err.message);
                        reject(err);
                    }

                    var iconTopic, typeTopic;
                    if (row.topic == "Trade items") iconTopic = "cash", typeTopic = "nameTopic";
                    else if (row.topic == "Exchange class") iconTopic = "book", typeTopic = "nameTopicbook";
                    else if (row.topic == "Story / Blog") iconTopic = "newspaper", typeTopic = "nameTopicBlog";
                    else if (row.topic == "Find lover") iconTopic = "heart-circle", typeTopic = "nameTopiclove";
                    
                    var avatar = row2.avatar;
                    if (!avatar) avatar = "./personal/assets/img/avatar-trang.jpg";
                    //console.log(row2.facebook);
                    let content = row.content;
                  let formattedContent = content.replace(/\n/g, '<br/>');
                    const dataDiv = `
                        <div class="post">
                            <div class="post__top"><a href="/user/profile?id=${row.user_id}">
                                    <img class="avatar1 post__avatar" src="../${avatar}" alt="" />
                                    <div class="post__topInfo">
                                        <h3>${row2.name}</h3>
                                        <p>${row.formatted_created_at}</p>
                                    </div>
                                </a>
                                <div class="${typeTopic} rounded-3">
                                    <ion-icon name="${iconTopic}"></ion-icon>
                                    ${row.topic}
                                </div>
                            </div>
                            <div class="post__bottom">
                                <div class="title">
                                    <h4>${row.title}</h4>
                                </div>
                                <p>${formattedContent}</p>
                            </div>
                            <div class="post__image">
                                <img class="rounded-2" src="../${row.avatar}" alt="" />
                            </div>
                            <div class="post__options">
                            <div class="heart">
                              <button class="heartBtn" data-post-id="${row.id}"> <!-- Thêm thuộc tính data-post-id vào đây -->
                              <svg class="heartIcon" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
                                  <path fill="currentColor" d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                              </svg>
                          </button>
                          <p class="numberHeart" id="likeCount_${row.id}">${row.like_count}</p> 
                          </div>
                            </div>
                        </div>
                    `;
                    $('.allPost').append(dataDiv);
                    resolve();
                });
            });
            promises.push(promise);
        });

        Promise.all(promises)
            .then(() => {
                // Sau khi thêm tất cả dữ liệu mới, ghi lại tệp HTML và gửi lại cho người dùng
                const updatedHtml = $.html();
                fs.writeFileSync('./personal/html/Personal.html', updatedHtml);
                res.send(updatedHtml);
            })
            .catch(error => {
                console.error(error.message);
                res.status(500).json({ error: 'Internal Server Error' });
            });
    });
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
    //console.log(row);
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

    if (!row) {
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

router.post('/uploadForm', upload.single('avatar'), (req, res) => {
  // Lưu đường dẫn của file ảnh vào cơ sở dữ liệu
  const avatarPath = req.file.path;
  const onlyPostAvatarID = uuidv4();
  db.run(`INSERT INTO onlyPostAvatar (id, avatar) VALUES (?, ?)`, [onlyPostAvatarID, avatarPath], function(err, row) {
    if (err) {
      console.error(err.message);
      res.status(500).json({ error: 'Internal Server Error' });
    } else {
        res.json({ message: 'Avatar uploaded successfully' });
    }
  });

    /* Construct the SQL query to check if the data exist */ 
    const sql =  `SELECT id, COUNT(*) AS count FROM onlyPostAvatar WHERE 
      avatar = ?`;
    
    // Execute the SQL query
    db.get(sql, [avatarPath], function(err, row) {
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
        session.curUploadFormID = row.id;
        //console.log('curUploadFormID:', session.curUploadFormID);
        //res.json({avatarPath});
      } else {
        console.log('No data found in the column.');
        res.status(401).json({ error: 'Invalid username or password.' }); // Handle invalid credentials
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

  /*router.get('/update/profile', (req, res) => {
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
  });*/

  router.get('/user/profile', (req, res) => {
    const userID = req.query.id; // Lấy ID của user từ tham số id trong URL
    // Xử lý hiển thị profile của user có ID là userId

    if (userID == session.userID) {
      res.redirect('/profile');
      return;
    }

    //console.log(userID);
    const htmlTem = fs.readFileSync('./personal/html/_Personal.html', 'utf8');
    //console.log(session.userID);
    const $ = cheerio.load(htmlTem);

    const sql = 'SELECT name, avatar, facebook, phone, mail FROM user WHERE id = ?';
    db.get(sql, [userID], (err, row) => {
      if (err) {
        return res.status(500).send(err.message);
      }
      
      if (!row) {
        return res.status(404).send('Profile not found');
      }

      // Sử dụng cheerio để tìm và thay đổi các giá trị trong file HTML
      //console.log("changed");
      $('.userName').text(row.name);
      $('.face').text(row.facebook);
      $('.face').attr('href', row.facebook);
      $('.phone').text(row.phone);
      $('.mmail').text(row.mail);
      if (!row.avatar) $('.linkAvatar').attr('src', "../personal/assets/img/avatar-trang.jpg");
      else $('.linkAvatar').attr('src', `../${row.avatar}`);
    });

    $('.allPost').empty(); // Xóa bất kỳ dữ liệu cũ nào trước khi thêm dữ liệu mới

    db.all(`SELECT *, strftime('%Y-%m-%d %H:%M', datetime(created_at, '+7 hours')) AS formatted_created_at FROM post WHERE user_id = ? ORDER BY created_at DESC`, [userID], (err, rows) => {
        if (err) {
            console.log(err.message);
            res.status(500).json({ error: 'Internal Server Error' });
            return;
        }

        let promises = [];
        rows.forEach(row => {
            let promise = new Promise((resolve, reject) => {
                db.get(`SELECT facebook, avatar, name FROM user WHERE id = ?`, [row.user_id], (err, row2) => {
                    if (err) {
                        console.error(err.message);
                        reject(err);
                    }

                    var iconTopic, typeTopic;
                    if (row.topic == "Trade items") iconTopic = "cash", typeTopic = "nameTopic";
                    else if (row.topic == "Exchange class") iconTopic = "book", typeTopic = "nameTopicbook";
                    else if (row.topic == "Story / Blog") iconTopic = "newspaper", typeTopic = "nameTopicBlog";
                    else if (row.topic == "Find lover") iconTopic = "heart-circle", typeTopic = "nameTopiclove";
                    
                    var avatar = row2.avatar;
                    if (!avatar) avatar = "./personal/assets/img/avatar-trang.jpg";
                    //console.log(row2.facebook);
                    let content = row.content;
                    let formattedContent = content.replace(/\n/g, '<br/>');
                    const dataDiv = `
                        <div class="post">
                            <div class="post__top"><a href="/user/profile?id=${row.user_id}">
                                    <img class="avatar1 post__avatar" src="../${avatar}" alt="" />
                                    <div class="post__topInfo">
                                        <h3>${row2.name}</h3>
                                        <p>${row.formatted_created_at}</p>
                                    </div>
                                </a>
                                <div class="${typeTopic} rounded-3">
                                    <ion-icon name="${iconTopic}"></ion-icon>
                                    ${row.topic}
                                </div>
                            </div>
                            <div class="post__bottom">
                                <div class="title">
                                    <h4>${row.title}</h4>
                                </div>
                                <p>${formattedContent}</p>
                            </div>
                            <div class="post__image">
                                <img class="rounded-2" src="../${row.avatar}" alt="" />
                            </div>
                            <div class="post__options">
                                <div class="heart">
                                  <button class="heartBtn" data-post-id="${row.id}"> <!-- Thêm thuộc tính data-post-id vào đây -->
                                  <svg class="heartIcon" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
                                      <path fill="currentColor" d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                                  </svg>
                              </button>
                              <p class="numberHeart" id="likeCount_${row.id}">${row.like_count}</p> 
                              </div>
                                </div>
                        </div>
                    `;
                    $('.allPost').append(dataDiv);
                    resolve();
                });
            });
            promises.push(promise);
        });

        Promise.all(promises)
            .then(() => {
                // Sau khi thêm tất cả dữ liệu mới, ghi lại tệp HTML và gửi lại cho người dùng
                const updatedHtml = $.html();
                fs.writeFileSync('./personal/html/_Personal.html', updatedHtml);
                res.send(updatedHtml);
            })
            .catch(error => {
                console.error(error.message);
                res.status(500).json({ error: 'Internal Server Error' });
            });
    });
  });


  router.get('/post/main', (req, res) => {
    if (!session.userID) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
    }

    const existingHtml = fs.readFileSync('./post/post.html', 'utf8');
    const $ = cheerio.load(existingHtml);

    db.get('SELECT name, avatar FROM user WHERE id = ?', [session.userID], (err, row) => {
      if (err) {
        console.error(err.message);
        res.status(500).json({ error: 'Internal Server Error' });
        return;
      }

      $('._name').text(row.name);
      var avatar = row.avatar;
      if (!avatar) avatar = "./personal/assets/img/avatar-trang.jpg";
      $('.avatar1').attr('src', `../${avatar}`);
    });

    $('.feed').empty(); // Xóa bất kỳ dữ liệu cũ nào trước khi thêm dữ liệu mới

    db.all(`SELECT *, strftime('%Y-%m-%d %H:%M', datetime(created_at, '+7 hours')) AS formatted_created_at FROM post ORDER BY created_at DESC`, (err, rows) => {
      if (err) {
          console.log(err.message);
          res.status(500).json({ error: 'Internal Server Error' });
          return;
      }
  
      let promises = [];
      rows.forEach(row => {
          let promise = new Promise((resolve, reject) => {
              db.get(`SELECT facebook, avatar, name FROM user WHERE id = ?`, [row.user_id], (err, row2) => {
                  if (err) {
                      console.error(err.message);
                      reject(err);
                  }
  
                  var iconTopic, typeTopic;
                  if (row.topic == "Trade items") iconTopic = "cash", typeTopic = "nameTopic";
                  else if (row.topic == "Exchange class") iconTopic = "book", typeTopic = "nameTopicbook";
                  else if (row.topic == "Story / Blog") iconTopic = "newspaper", typeTopic = "nameTopicBlog";
                  else if (row.topic == "Find lover") iconTopic = "heart-circle", typeTopic = "nameTopiclove";
                  
                  var avatar = row2.avatar;
                  if (!avatar) avatar = "./personal/assets/img/avatar-trang.jpg";
                  //console.log(row2.facebook);
                  let content = row.content;
                  let formattedContent = content.replace(/\n/g, '<br/>');
                  //console.log(formattedContent);
                  const dataDiv = `
                      <div class="post">
                          <div class="post__top"><a href="/user/profile?id=${row.user_id}">
                                  <img class="avatar1 post__avatar" src="../${avatar}" alt="" />
                                  <div class="post__topInfo">
                                      <h3>${row2.name}</h3>
                                      <p>${row.formatted_created_at}</p>
                                  </div>
                              </a>
                              <div class="${typeTopic} rounded-3">
                                  <ion-icon name="${iconTopic}"></ion-icon>
                                  ${row.topic}
                              </div>
                          </div>
                          <div class="post__bottom">
                              <div class="title">
                                  <h4>${row.title}</h4>
                              </div>
                              <p>${formattedContent}</p>
                          </div>
                          <div class="post__image">
                              <img class="rounded-2" src="../${row.avatar}" alt="" />
                          </div>
                          <div class="post__options">
                              <div class="heart">
                                <button class="heartBtn" data-post-id="${row.id}"> <!-- Thêm thuộc tính data-post-id vào đây -->
                                <svg class="heartIcon" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
                                    <path fill="currentColor" d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                                </svg>
                            </button>
                            <p class="numberHeart" id="likeCount_${row.id}">${row.like_count}</p> 
                            </div>
                              </div>
                          </div>
                      </div>
                  `;
                  $('.feed').append(dataDiv);
                  resolve();
              });
          });
          promises.push(promise);
      });
  
      Promise.all(promises)
          .then(() => {
              // Sau khi thêm tất cả dữ liệu mới, ghi lại tệp HTML và gửi lại cho người dùng
              const updatedHtml = $.html();
              fs.writeFileSync('./post/post.html', updatedHtml);
              res.send(updatedHtml);
          })
          .catch(error => {
              console.error(error.message);
              res.status(500).json({ error: 'Internal Server Error' });
          });
  });
  
});


router.post("/like/:postId", async (req, res) => {
  const userId = session.userID;
  const postId = req.params.postId;
  const timestamp = new Date().toISOString();
  //console.log(userId, postId, timestamp);
  if (!userId) {
      return res.status(401).send("Unauthorized");
  }

  try {
      db.get("SELECT COUNT(*) AS count FROM user_like WHERE user_id = ? AND post_id = ?", [userId, postId], (err, row) => {
          if (err) {
              console.error('Error executing query:', err);
              return;
          }
          //console.log('Number of likes:', row.count);
          if (row.count > 0) {
              // Nếu đã like, thực hiện hủy like
              db.run("DELETE FROM user_like WHERE user_id = ? AND post_id = ?", [userId, postId], (err) => {
                  if (err) {
                      console.error('Error deleting like:', err);
                      return res.status(500).json({ error: "An error occurred while deleting the like." });
                  }

                  // Cập nhật like count
                  const result = db.run("UPDATE post SET like_count = like_count - 1 WHERE id = ?", [postId]);
                  if (result.changes === 0) {
                      console.error("Error updating like count: Post not found");
                      return res.status(404).json({ error: "Post not found." });
                  }

                  db.get("SELECT like_count FROM post WHERE id = ?", [postId], (err, row) => {
                      if (err) {
                          console.error('Error executing query:', err);
                          return;
                      }

                      if (row) {
                          //console.log(row);
                          res.json({ success: true, like_count: row.like_count });
                      } else {
                          console.error("Error fetching like count: Post not found");
                          res.status(404).json({ error: "Post not found" });
                      }
                  });
              });
          } else {
              // Nếu chưa like, thực hiện like
              const user_likeID = uuidv4();
              db.run("INSERT INTO user_like (id, user_id, post_id, liked_at) VALUES (?, ?, ?, ?)", [user_likeID, userId, postId, timestamp], (err) => {
                  if (err) {
                      console.error('Error inserting like:', err);
                      return res.status(500).json({ error: "An error occurred while liking the post." });
                  }

                  // Cập nhật like count
                  const result = db.run("UPDATE post SET like_count = like_count + 1 WHERE id = ?", [postId]);
                  if (result.changes === 0) {
                      console.error("Error updating like count: Post not found");
                      return res.status(404).json({ error: "Post not found." });
                  }

                  db.get("SELECT like_count FROM post WHERE id = ?", [postId], (err, row) => {
                      if (err) {
                          console.error('Error executing query:', err);
                          return;
                      }

                      if (row) {
                          //console.log(row);
                          res.json({ success: true, like_count: row.like_count });
                      } else {
                          console.error("Error fetching like count: Post not found");
                          res.status(404).json({ error: "Post not found" });
                      }
                  });
              });
          }
      });

  } catch (error) {
      console.error("Error liking post:", error);
      res.status(500).json({ error: "An error occurred while liking the post." });
  }
});



router.get('/post/topic', (req, res) => {
  if (!session.userID) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
  }

  const topic = req.query.topic;
  const existingHtml = fs.readFileSync('./post/post.html', 'utf8');
  const $ = cheerio.load(existingHtml);

  db.get('SELECT name, avatar FROM user WHERE id = ?', [session.userID], (err, row) => {
    if (err) {
      console.error(err.message);
      res.status(500).json({ error: 'Internal Server Error' });
      return;
    }

    $('._name').text(row.name);
    var avatar = row.avatar;
    if (!avatar) avatar = "./personal/assets/img/avatar-trang.jpg";
    $('.avatar1').attr('src', `../${avatar}`);
  });

  $('.feed').empty(); // Xóa bất kỳ dữ liệu cũ nào trước khi thêm dữ liệu mới

  db.all(`SELECT *, strftime('%Y-%m-%d %H:%M', datetime(created_at, '+7 hours')) AS formatted_created_at FROM post WHERE topic = ? ORDER BY created_at DESC`, [topic], (err, rows) => {
      if (err) {
          console.log(err.message);
          res.status(500).json({ error: 'Internal Server Error' });
          return;
      }

      let promises = [];
      rows.forEach(row => {
          let promise = new Promise((resolve, reject) => {
              db.get(`SELECT facebook, avatar, name FROM user WHERE id = ?`, [row.user_id], (err, row2) => {
                  if (err) {
                      console.error(err.message);
                      reject(err);
                  }

                  var iconTopic, typeTopic;
                  if (row.topic == "Trade items") iconTopic = "cash", typeTopic = "nameTopic";
                  else if (row.topic == "Exchange class") iconTopic = "book", typeTopic = "nameTopicbook";
                  else if (row.topic == "Story / Blog") iconTopic = "newspaper", typeTopic = "nameTopicBlog";
                  else if (row.topic == "Find lover") iconTopic = "heart-circle", typeTopic = "nameTopiclove";
                  
                  var avatar = row2.avatar;
                  if (!avatar) avatar = "./personal/assets/img/avatar-trang.jpg";
                  let content = row.content;
                  let formattedContent = content.replace(/\n/g, '<br/>');
                  //console.log(row2.facebook);
                  const dataDiv = `
                      <div class="post">
                          <div class="post__top"><a href="/user/profile?id=${row.user_id}">
                                  <img class="avatar1 post__avatar" src="../${avatar}" alt="" />
                                  <div class="post__topInfo">
                                      <h3>${row2.name}</h3>
                                      <p>${row.formatted_created_at}</p>
                                  </div>
                              </a>
                              <div class="${typeTopic} rounded-3">
                                  <ion-icon name="${iconTopic}"></ion-icon>
                                  ${row.topic}
                              </div>
                          </div>
                          <div class="post__bottom">
                              <div class="title">
                                  <h4>${row.title}</h4>
                              </div>
                              <p>${formattedContent}</p>
                          </div>
                          <div class="post__image">
                              <img class="rounded-2" src="../${row.avatar}" alt="" />
                          </div>
                          <div class="post__options">
                                <div class="heart">
                                  <button class="heartBtn" data-post-id="${row.id}"> <!-- Thêm thuộc tính data-post-id vào đây -->
                                  <svg class="heartIcon" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
                                      <path fill="currentColor" d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                                  </svg>
                              </button>
                              <p class="numberHeart" id="likeCount_${row.id}">${row.like_count}</p> 
                              </div>
                                </div>
                      </div>
                  `;
                  $('.feed').append(dataDiv);
                  resolve();
              });
          });
          promises.push(promise);
      });

      Promise.all(promises)
          .then(() => {
              // Sau khi thêm tất cả dữ liệu mới, ghi lại tệp HTML và gửi lại cho người dùng
              const updatedHtml = $.html();
              fs.writeFileSync('./post/post.html', updatedHtml);
              res.send(updatedHtml);
          })
          .catch(error => {
              console.error(error.message);
              res.status(500).json({ error: 'Internal Server Error' });
          });
  });
});

  router.get('/form', (req, res) => {
    if (!session.userID) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
   }
   
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

    if (!session.userID) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
    }

    const { title, content, topic} = req.body;

    // Lấy dữ liệu từ bảng onlyPostAvatar
    const formSql = `SELECT * FROM onlyPostAvatar WHERE id = ?`;
    db.get(formSql, [session.curUploadFormID], (err, row) => {
        if (err) {
            console.error('Error fetching data from onlyFormAvatar:', err.message);
            res.status(500).send('Internal Server Error');
            return;
        }

        if (!row || !row.avatar) {
            console.error('Avatar data not found in onlyPostAvatar');
            res.status(404).send('Avatar data not found');
            return;
        }
        
        const postID = uuidv4();
        const postSql = `INSERT INTO post (id, user_id, title, content, topic, avatar) VALUES (?, ?, ?, ?, ?, ?)`;
        db.run(postSql, [postID, session.userID, title, content, topic, row.avatar], function(err) {
            if (err) {
                console.error('Error inserting post:', err.message);
                res.status(500).send('Internal Server Error');
                return;
            }

            res.status(201).send({ id: this.lastID, message: 'Post added successfully' });
        });
    });
});


function deleteUserPost(userID, callback) {
  const sql = `DELETE FROM post WHERE user_id = ?`;

  db.run(sql, [userID], function(err) {
      if (err) {
          return callback(err);
      }
      callback(null, { message: 'User posts deleted successfully' });
  });
}

function deleteAccount(userID, callback) {
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
          callback(null, { message: 'User deleted successfully' });
      });
  });
}

router.post('/delete/account', (req, res) => {
  if (!session.userID) {
      return res.status(401).json({ error: 'Unauthorized' });
  }

  deleteAccount(session.userID, (err, result) => {
      if (err) {
          console.error(err.message);
          return res.status(500).send(err.message);
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
  //console.log(session.userID);
  //console.log(postID);
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
