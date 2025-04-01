// ./models/Image.js
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  main: {
    type: String,
    required: false,
    unique: false,
  },
  username: {
    type: String,
    required: false,
    unique: false,
  },
 nurse: {
    type: String,
    required: false,
    unique: true,
  },
    image: {
      type: String,  // Store the image as a base64-encoded string
      required: true,
    },
    contentType: {
      type: String,  // Store the MIME type (e.g., image/jpeg)
    },
    contact:{
      type: String,
      required: false,
    unique: true,
    },
    date:{
      type: String,
      required: false,
    unique: false,
    },
    join:{
      type: String,
      required: false,
    unique: false,
    }
  });
  

const Image = mongoose.model('users', userSchema);
module.exports = Image;