const express = require('express');

const User = require('../models/user');
const Image = require('../models/image');

const router = express.Router();

router.post("/newuser",(req,res) => {
  console.log("new user request received");
  console.log(req.body);
  const username = req.body.username;
  const password = req.body.password;
  const passwordConf = req.body.passwordConf;
  if (password !== passwordConf) {
    res.status(400).send("Passwords do not match");
  } else {
    const newUser = new User({
      'username': username,
      'password': password
    });
    newUser.save((err, user) => {
      if (err) {
        res.send(err);
      } else {
        res.send('User ' + username + ' has been added.'); 
      }
    });
  }
});

router.post("/newpic",(req,res,next)=>{
  let awsKey = req.body.awsKey;
  let title = req.body.title;
  let username = req.body.username;
  User.findOne({'username':username}).then(
    user => {
      let ownerId = user._id;
      console.log(ownerId);
      let newPic = new Image({
        'awsKey': awsKey,
        'title': title,
        'ownerId': ownerId
      });
      newPic.save();
      res.send("New picture, entitled '" + title + "' has been saved."); 
    },
    error => {console.log(error);}
  );
});

router.get("/allpics",(req,res) => {
  let username = req.query.username;
  User.findOne({'username':username}).then(
    user => {
      let userId = user._id;
      Image.find({'ownerId':userId}).then(
        images => { 
          let imageKeys = [];
          images.forEach(image => imageKeys.push(image.awsKey));
          res.send(imageKeys);
        }, error => {console.log(error)});
    },
    error => {console.log(error)});
});

module.exports = router;
