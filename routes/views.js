const express = require('express');
const router = express.Router();

const User = require('../models/user');
const Image = require('../models/image');

router.get('/', (req, res) => {
  const userId = req.session.userId;
  console.log(userId);

  Image.find({'ownerId': userId}).then((images) => {
    console.log(images);
    
    let loggedIn = false;
    if (req.session.userId) {
      loggedIn = true;
    }
    
    res.render('index', {images: images, loggedIn: loggedIn});
  });
});

router.get('/signup', (req, res) => {
  res.render('signup');
});

router.get('/login', (req, res) => {
  res.render('login');
});

router.get('/logout', function (req, res) {
  console.log('logging out');
  req.session.userId = '';
  res.redirect('/');
});

module.exports = router;
