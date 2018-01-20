const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
  let allpics = [];
  allpics.push({
    title: 'Cat',
    imgSrc: 'http://www.catster.com/wp-content/uploads/2017/08/A-fluffy-cat-looking-funny-surprised-or-concerned.jpg'
  });
  allpics.push({
    title: 'Dog',
    imgSrc: 'https://www.cesarsway.com/sites/newcesarsway/files/styles/large_article_preview/public/Common-dog-behaviors-explained.jpg?itok=FSzwbBoi'
  });
  res.render('index', {images: allpics});
});

module.exports = router;
