// ./models/Image.js
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    selectedRooms: {
    type:Array,
    required: false,
    unique: false,
  },
 ward: {
    type: String,
    required: false,
    unique: false,
  },
 name1:{
      type: String,
      required: false,
       unique:false,
    },
    floor:{
      type: String,
      required: false,
    unique: false,
    }
  });
  

const drip = mongoose.model('details', userSchema);
module.exports = drip;