const mongoose = require('mongoose');
require('dotenv').load();

const mongoURL = process.env.DB_URI;
mongoose.connect(mongoURL);
mongoose.Promise = global.Promise;
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));

module.exports = db;
