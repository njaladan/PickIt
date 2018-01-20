//Stuffs by Sambhav

const express = require("express");
const bodyParser = require('body-parser')
const app = express();
app.use(bodyParser.json())

/////Mongo////////
//Mongo Setup
const mongoose = require('mongoose')
const mongoURL = 'mongodb://dadmin:blueisfour@ds263707.mlab.com:63707/pickit';

mongoose.connect(mongoURL)
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
	username: String,
	imageIDs: [String]
})
let imgColl = mongoose.model('ImageModel',imageSchema);
let userColl = mongoose.model('UserModel',userSchema);
/////////////////




app.post("/newuser",(req,res) => {
	let username = req.body.username;
	let newUser = new userColl({
		'username': username,
		'imageIDs': []
	});
	newUser.save();
	res.send('User ' + username + ' has been added.')
});

app.post("/newpic",(req,res,next)=>{
	let awsKey = req.body.awsKey;
	let title = req.body.title;
	let username = req.body.username;
	userColl.findOne({'username':username}).then(
	user => {
		console.log(user)
		let ownerId = user.username;
		console.log("OWNERID")
		console.log(ownerId)
		let newPic = new imgColl({
			'awsKey': awsKey,
			'title': title,
			'ownerId': ownerId
		});
		newPic.save();
		user.imageIDs.push(newPic._id);
		user.save();
		res.send("New picture, entitled '" + title + "' has been saved.");
	},
	error => {console.log(error);})	
});



app.listen(3040);