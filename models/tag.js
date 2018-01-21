const mongoose = require('mongoose');

const tagSchema = new mongoose.Schema({
  tag: String,
  picIDs: [String] ,
  ownerId: String
});

module.exports = mongoose.model('Tag', tagSchema);
