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

  
  /*
  allpics.push({
    title: 'Cat',
    imgSrc: 'http://www.catster.com/wp-content/uploads/2017/08/A-fluffy-cat-looking-funny-surprised-or-concerned.jpg'
  });
  allpics.push({
    title: 'Dog',
    imgSrc: 'https://www.cesarsway.com/sites/newcesarsway/files/styles/large_article_preview/public/Common-dog-behaviors-explained.jpg?itok=FSzwbBoi'
  });
  */
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
