const express = require('express');
const router = express.Router();

const User = require('../models/user');
const Image = require('../models/image');

router.get('/', (req, res) => {
  const userId = req.session.userId;
  const tags = req.session.tags;
  let username = '';

  User.findOne({'_id': userId}).then(user => {
    if (user) username = user.username;
  });

  if (!tags || tags.length == 0) {
    Image.find({'ownerId': userId}).then(images => {
      
      let loggedIn = false;
      if (req.session.userId) {
        loggedIn = true;
      }
      
      res.render('index', {images: images, loggedIn: loggedIn, username: username});
    });
  } else {
    Image.find({'ownerId': userId}).then(images => {
      const matchingImages = images.filter(image => tags.some( tag => image.tags.includes(tag)));
      
      let loggedIn = false;
      if (req.session.userId) {
        loggedIn = true;
      }
      res.render('index', {images: matchingImages, loggedIn: loggedIn, username: username, tags: tags});
    });
  }
});

router.get('/signup', (req, res) => {
  let errorMsg = "";
  if (req.session.error && req.session.error.length > 0) {
    errorMsg = req.session.error;
  }
  res.render('signup', {errorMsg: errorMsg});
});

router.get('/login', (req, res) => {
  let errorMsg = "";
  if (req.session.error && req.session.error.length > 0) {
    errorMsg = req.session.error;
  }
  res.render('login', {errorMsg: errorMsg});
});

router.get('/logout', function (req, res) {
  req.session.userId = '';
  req.session.tags = [];
  res.redirect('/');
});

module.exports = router;
