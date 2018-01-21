const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const UserSchema = new mongoose.Schema({
  username: {
    type: String,
    unique: true,
    trim: true
  },
  password: {
    type: String
  }
});

//authenticate input against database
UserSchema.methods.comparePassword = function(candidatePassword, callback) {
    bcrypt.compare(candidatePassword, this.password, function(err, isMatch) {
        if (err) return callback(err);
        callback(null, isMatch);
    });
};

//hashing a password before saving it to the database
UserSchema.pre('save', function (next) {
  const user = this;
  bcrypt.hash(user.password, 10, function (err, hash) {
    if (err) {
      return next(err);
    }
    user.password = hash;
    next();
  });
});

const User =  mongoose.model('User', UserSchema);
module.exports = User;
