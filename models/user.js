// models/User.js
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required:false,
    unique: true,
  },
  password: {
    type: String,
    required:false,
  },
  person: {
    type: String,
    required:false,
    unique: false,
  },
});

const User = mongoose.model('nurse', userSchema);

module.exports = User;
// models/User.js
// const mongoose = require('mongoose');

// const userSchema = new mongoose.Schema({
//   username: {
//     type: String,
//     required: false,
//     unique: true,
//   },
//   password: {
//     type: String,
//     required: false,
//   },
//   person: {
//     type: String,
//     required: false,
//     unique: true,
//   },
//   image: {
//    type: String, // Store image as Base64 string
//     required: false,
//   },
// });

// const User1 = mongoose.model('user1', userSchema);
// module.exports = User1;
