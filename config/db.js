// ./config/db.js
const mongoose = require('mongoose');
const dbURI = 'mongodb://127.0.0.1:27017/Drips';  
const connectDB = async () => {
  try {
    await mongoose.connect(dbURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('MongoDB connected...');
  } catch (err) {
    console.error('Error connecting to MongoDB:', err);
    process.exit(1); // Exit the process if MongoDB connection fails
  }
};

module.exports = connectDB;

