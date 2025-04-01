

const mongoose = require('mongoose');
const tokenSchema = new mongoose.Schema({
    token: { type: String, required: true, },
    floor: { type: String, required: false },
    room: { type: [String], required: false }, // Room is an array of strings
    ward: { type: String, required: false },
    Selected: { type: String, required: false },
    name1: { type: String, required: true },
    info:{ type: String, required: false}
  });
  
  const Token = mongoose.model('Token', tokenSchema);
  module.exports = Token;