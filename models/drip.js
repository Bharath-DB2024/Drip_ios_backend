// ./models/Image.js
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
   room1: {
    type: String,
    required: false,
    unique: false,
  },
 ward: {
    type: String,
    required: false,
    unique: false,
  },
  
    bed:{
      type: String,
      required: false,
       unique: true,
    },
    drip:{
      type: String,
      required: false,
       unique:true,
    },
    floor:{
      type: String,
      required: false,
    unique: false,
    }
  });
  

const drip = mongoose.model('udrip', userSchema);
module.exports = drip;