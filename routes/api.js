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
        //res.send('User ' + username + ' has been added.');
        req.session.userId = user._id;
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
    if (err) throw err;
    user.comparePassword(password, (err, correct) => {
      if (err) throw err;
      if (correct) {
        req.session.userId = user._id;
        res.redirect('/');
      } else {
        const error = new Error('Wrong username or password.');
        error.status = 401;
        res.send(error);
      }
    });
  });
});

//GET Request. Fields: username, password. For chrome extension.
router.get("/login/ext", (req, res) => {
  const username = req.query.username;
  const password = req.query.password;
  User.findOne({'username': username}, (err, user) => {
    if (err) throw err;
    user.comparePassword(password, (err, correct) => {
      if (err) throw err;
      if (correct) {
        res.send(user._id);
      } else {
        res.send(None);
      }
    });
  }); 
});


//POST Request. Fields: awsKey, title, username, tags
router.post("/newpic",(req,res) => {
  const awsKey = req.body.awsKey;
  const title = req.body.title;
  const tags = req.body.tags;
  const username = req.body.username;
  User.findOne({'username':username}).then(
    user => {
      const ownerId = user._id;
      const newPic = new Image({
        'awsKey': awsKey,
        'title': title,
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
      res.send("New picture, entitled '" + title + "' has been saved."); 
    },
    error => {console.log(error);}
  );
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
