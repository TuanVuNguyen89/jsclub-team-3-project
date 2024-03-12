const express = require('express');
const path = require('path');
const db = require('./db');
const router = express.Router();

const filePath = path.join(__dirname, './register-login');
// Phục vụ các tệp tĩnh từ thư mục hiện tại
router.use(express.static(path.join(__dirname)));
router.use(express.static(path.join(filePath)));

router.get('/register', (req, res) => {
  res.sendFile(path.join(filePath, './html/register.html'));
});

router.post('/register', (req, res) => {
  const {name, userName, password, mail, phone, facebook, avatar} = req.body;

  // Check if username already exists
  const checkUserSql = `SELECT * FROM user WHERE userName = ?`;
  db.get(checkUserSql, [userName], (err, row) => {
      if (err) {
          console.error('Error querying database for userName: ', err.message);
          res.status(500).json({error: 'Internal server error'});
          return;
      }

      if (row) {
          // If a row is found, it means the username already exists
          res.status(400).json({error: 'Username already exists'});
          return;
      }

          // If username do not exist, insert the new user
          const insertSql =  `INSERT INTO user (name, userName, password, mail, phone, facebook, avatar) VALUES (?, ?, ?, ?, ?, ?, ?)`;

          db.run(insertSql, [name, userName, password, mail, phone, facebook, avatar], function(err) {
              if (err) {
                  console.error('Error inserting data: ', err.message);
                  res.status(500).json({error: 'Failed to insert new user'});
                  return;
              }
              
              console.log(`A new row has been inserted with rowid ${this.lastID}`);
              res.json({name: name, userName: userName, mail: mail, phone: phone, facebook: facebook, avatar: avatar});
          });
  });
});

module.exports = router;