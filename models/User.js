const mongoose = require('mongoose');

const PhoneSchema = new mongoose.Schema({
  model: String,
  phoneId: String,
  status: String,
});

const UserSchema = new mongoose.Schema({
  name: String,
  email: String,
  password: {
    type: String,
    select: false,
  },
  pinCode: {
    type: String,
    select: false,
  },
  status: String,
  phones: [PhoneSchema],
});

mongoose.model('User', UserSchema);

module.exports = mongoose.model('User');