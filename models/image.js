const mongoose = require('mongoose');

const imageSchema = new mongoose.Schema({
  awsKey: String,
  title: String,
  ownerId: String 
});

module.exports = mongoose.model('Image', imageSchema);
