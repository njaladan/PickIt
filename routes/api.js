///////Requirements & Configuration/////////
const express = require('express');

const User = require('../models/user');
const Image = require('../models/image');

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

//Routes
//POST Request. Fields: username, password, passwordConf
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

//POST Request. Fields: awsKey, title, username
router.post("/newpic",(req,res,next) => {
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

//GET Request. Fields: username
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

//POST Request. Fields: uniqueNumber, username, imgUrl
router.post("/s3upload",(req,res,next) => {
    function dataUrlToBucket(url, name){
        let filePath = base64Img.imgSync(url,'',name);
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
