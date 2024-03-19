const express = require('express')
const path = require('path');
const port = 3000;
const app = express()

const db = require('./db');
const loginRoutes = require('./login');
const registerRoutes = require('./register');
var bodyParser = require('body-parser')

// Middleware để parse body của request
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use(loginRoutes);
app.use(registerRoutes);

const filePath = path.join(__dirname, './register-login');
const homePath = path.join(__dirname, './homePage');
const personalPath = path.join(__dirname, './personal');
// Phục vụ các tệp tĩnh từ thư mục hiện tại
app.use(express.static(path.join(__dirname)));
app.use(express.static(path.join(filePath)));
app.use(express.static(path.join(homePath)));
app.use(express.static(path.join(personalPath)));

// tạo ra nhánh /data và show dữ liệu ra màn hình
/*app.get('/data', (req, res) => {
  db.all('SELECT * FROM user', (err, rows) => {
    if (err) {
      console.error('Error executing query:', err.message);
      res.status(500).send('Internal Server Error');
    } else {
      res.json(rows);
    }
  });
});

app.get('/form_data', (req, res) => {
  db.all('SELECT * FROM onlyPostAvatar', (err, rows) => {
    if (err) {
      console.error('Error executing query:', err.message);
      res.status(500).send('Internal Server Error');
    } else {
      res.json(rows);
    }
  });
});

app.get('/like_data', (req, res) => {
  db.all('SELECT * FROM user_like', (err, rows) => {
    if (err) {
      console.error('Error executing query:', err.message);
      res.status(500).send('Internal Server Error');
    } else {
      res.json(rows);
    }
  });
});*/


// Route cho các file CSS và JS (nếu cần)
app.get('*.css', (req, res) => {
  res.set('Content-Type', 'text/css');
  res.sendFile(path.join(__dirname, req.path));
});

app.get('*.js', (req, res) => {
  res.set('Content-Type', 'text/javascript');
  res.sendFile(path.join(__dirname, req.path));
});

app.get('/post_data', (req, res) => {
  db.all('SELECT * FROM post', (err, rows) => {
    if (err) {
      console.error('Error executing query:', err.message);
      res.status(500).send('Internal Server Error');
    } else {
      res.json(rows);
    }
  });
});

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});