///////Requirements & Configuration/////////
const express = require('express');

const User = require('../models/user');
const Image = require('../models/image');
const Tag = require('../models/tag');

const router = express.Router();
require('dotenv').load();

//AWS Start
const bodyParser = require('body-parser')
const base64Img = require('base64-img');
const fs = require('fs');
const AWS = require('aws-sdk');
AWS.config.update({
  accessKeyId: process.env.AWS_KEY,
  secretAccessKey: process.env.AWS_SECRET_KEY
});
//AWS End
///////////////////////////////////////////

//API Endpoints
//POST Request. Fields: username, password, passwordConf
router.post("/newuser",(req,res) => {
  const username = req.body.username;
  const password = req.body.password;
  const passwordConf = req.body.passwordConf;
  if (password !== passwordConf) {
    req.session.error = "Passwords do not match.";
    res.redirect('/signup');
    //res.status(400).send("Passwords do not match.");
  } else {
    const newUser = new User({
      'username': username,
      'password': password
    });
    newUser.save((err, user) => {
      if (err) {
        req.session.error = "Username already taken.";
        res.redirect('/signup');
      } else {
        req.session.userId = user._id;
        req.session.error = "";
        res.redirect('/');
      }
    });
  }
});

//GET Request. Fields: username, password
router.get("/login", (req, res) => {
  const username = req.query.username;
  const password = req.query.password;
  User.findOne({'username': username}, (err, user) => {
    if (err) {
      req.session.error = "Wrong username or password";
      res.redirect('/login');
    }
    if (user) {
      user.comparePassword(password, (err, correct) => {
        if (err) throw err;
        if (correct) {
          req.session.userId = user._id;
          req.session.error = "";
          res.redirect('/');
        } else {
          req.session.error = "Wrong username or password";
          res.redirect('/login');
        }
      });
    } else {
      req.session.error = "Wrong username or password";
      res.redirect('/login');
    }
  });
});

//GET Request. Fields: username, password. For chrome extension.
router.get("/login/ext", (req, res) => {
  const username = req.query.username;
  const password = req.query.password;
  console.log(username + ' ' + password);
  User.findOne({'username': username}, (err, user) => {
    if (err) throw err;
    if (user) {
      console.log('user found');
      user.comparePassword(password, (err, correct) => {
        if (err) throw err;
        if (correct) {
          res.send(user._id);
        } else {
          res.send();
        }
      });
    } else {
      res.send();
    }
  });
});



//POST Request. Fields: awsKey, title, username, tags
router.post("/newpic",(req,res) => {
  const awsKey = req.body.awsKey;
  const tags = req.body.tags;
  const userId = req.body.userId;
  console.log(userId);
  User.findOne({'_id':userId}).then(
    user => {
      const ownerId = user._id;
      console.log(ownerId);
      const newPic = new Image({
        'awsKey': awsKey,
        'tags': tags,
        'ownerId': ownerId
      });
      newPic.save();
      newPic.tags.forEach(tag => {
        Tag.findOne({'ownerId':ownerId, 'tag':tag}).then(tagObj => {
          tagObj.picIDs.push(newPic._id);
          tagObj.save();
        });
      });
      res.send("New picture has been saved.");
    },
    error => {console.log(error);}
  );
});

// fields: imageId, tag
router.post("/addtag", (req, res) => {
  console.log('new tag');
  const tag = req.body.tag;
  const imageId = req.body.imageId;
  Image.findOne({'_id': imageId}).then(image => {
    let newTags = image.tags;
    if (!newTags.includes(tag)) {
      newTags.push(tag);
    }
    image.set({tags: newTags});
    image.save((err, newImage) => {
      if (err) console.log(err);
      res.send(newImage);
    });
  });
});

// fields: imageId
router.post("/deltags", (req, res) => {
  const imageId = req.body.imageId;
  Image.findOne({'_id': imageId}).then(image => {
    image.set({tags: []});
    image.save((err, newImage) => {
      if (err) console.log(err);
      res.send(newImage);
    });
  });
});

// fields: tag
router.post("/searchtag", (req, res) => {
  if (!req.session.tags) {
    req.session.tags = [];
  }
  req.session.tags.push(req.body.tag);
  res.send();
});

// fields: none
router.post("/cleartags", (req, res) => {
  console.log("clearing tags");
  req.session.tags = [];
  res.send();
});

//POST Request. Fields: username, tag
router.post("/newtag",(req,res) => {
  const tag = req.body.tag;
  const username = req.body.username;
  User.findOne({'username':username}).then(user=> {
    const userId = user._id;
    console.log(user);
    Tag.find({'tag':tag,'ownerId':userId}).then(tagList => {
      if(tagList.length === 0){
        const newTag = new Tag({
          "tag": tag,
          "pic_IDs": [],
          "ownerId": userId
        });
        newTag.save();
        res.send("New tag made");
      }
      else{
        res.send("Tag exists");
      }
    });
  });
});

//GET Request. Fields: username
router.get("/allpics",(req,res) => {
  const username = req.query.username;
  User.findOne({'username':username}).then(
    user => {
      const userId = user._id;
      Image.find({'ownerId':userId}).then(
        images => {
          const imageKeys = [];
          images.forEach(image => imageKeys.push(image.awsKey));
          res.send(imageKeys);
        }, error => {console.log(error)});
    },
    error => {console.log(error)});
});

//GET Request. Fields: username, tag
router.get("/taggedpics",(req,res) => {
  const tag = req.query.tag;
  const username = req.query.username;
  const taggedPicKeys = []
  User.findOne({'username': username}).then( user => {
    console.log(user._id,tag);
    Tag.findOne({'tag':tag, 'ownerId':user._id}).then(tagObj => {
      Image.find({_id: {$in: tagObj.picIDs}}).then(images => {
        images.forEach(image => {
          taggedPicKeys.push(image.awsKey);
          console.log(taggedPicKeys);
        });
      }).then(()=>{
        res.send(taggedPicKeys);
      });
    });
  });
});

//POST Request. Fields: uniqueNumber, username, imgUrl
router.post("/s3upload",(req,res) => {
  function base64_encode(file) {
    let bitmap = fs.readFileSync(file);
    return new Buffer(bitmap).toString('base64');
  }
  function dataUrlToBucket(url, name){
    console.log("A");
    console.log(url);
    const filePath = base64Img.imgSync(url,'',name);
    fs.readFile(filePath, (err, data) =>{
      //Put object in bucket
      let s3 = new AWS.S3();
      let params = {
        Bucket: 'pickitdata',
        Key: name,
        ContentType: 'image/jpeg',
        Body: data
      };
      s3.putObject(params, (err, res) => {
        if (err) {
          console.log("Error");
        } else {
          console.log("Success");
        }
      });
      fs.unlink(filePath, ()=>{console.log('Image removed from local.')})
    });
  };
  //Create file name
  let uniqueNumber = req.body.uniqueNumber;
  let username = req.body.username;
  let fileName = username+uniqueNumber;
  //Create image from dataUrl
  let imgUrl = req.body.imgUrl;
  if ('http' === imgUrl.substring(0,4)){
    base64Img.requestBase64(imgUrl,(err,res,body)=>
                            {
                              dataUrlToBucket(body, fileName);
                            });
  }
  else{
    dataUrlToBucket(imgUrl, fileName);
  }
  res.send("Completed")
});

module.exports = router;
