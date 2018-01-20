//Stuffs by Sambhav
const express = require('express');
const bodyParser = require('body-parser');
require('dotenv').load();

const app = express();
app.use(bodyParser.json())

/////Mongo////////
//Mongo Setup
const mongoose = require('mongoose');
const mongoURL = process.env.DB_URI;
mongoose.connect(mongoURL);
mongoose.Promise = global.Promise;
const db = mongoose.connection;
// db error handling
db.on('error', console.error.bind(console, 'MongoDB connection error:'));
//Mongo DB initialization
const imageSchema = new mongoose.Schema({
	awsKey: String,
	title: String,
	ownerId: String 
});
const userSchema = new mongoose.Schema({
	username: String
});
const imgColl = mongoose.model('ImageModel',imageSchema);
const userColl = mongoose.model('UserModel',userSchema);
/////////////////

app.post("/newuser",(req,res) => {
	let username = req.body.username;
	let newUser = new userColl({
		'username': username,
	});
	newUser.save();
        res.send('User ' + username + ' has been added.'); 
});
app.post("/newpic",(req,res,next)=>{
	let awsKey = req.body.awsKey;
	let title = req.body.title;
	let username = req.body.username;
	userColl.findOne({'username':username}).then(
	user => {
		let ownerId = user._id;
		console.log(ownerId);
		let newPic = new imgColl({
			'awsKey': awsKey,
			'title': title,
			'ownerId': ownerId
		});
		newPic.save();
		res.send("New picture, entitled '" + title + "' has been saved."); 
	},
	        error => {console.log(error);
                         });
});
app.get("/allpics",(req,res) => {
	let username = req.query.username;
	userColl.findOne({'username':username}).then(
		user => {
		let userId = user._id;
		imgColl.find({'ownerId':userId}).then(
			images => { 
				let imageKeys = [];
				images.forEach(image => imageKeys.push(image.awsKey));
				res.send(imageKeys);
			}, error => {console.log(error)});
		},
		error => {console.log(error)});
});


app.listen(process.env.PORT);
