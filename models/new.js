// models/User.js
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: {
    type: [Object],
    required:false,
}
});

const drips = mongoose.model('drips1', userSchema);

module.exports = drips;