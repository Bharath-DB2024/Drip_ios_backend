// controllers/userController.js
const { response } = require('express');
const User = require('../models/user');


const bcrypt = require('bcryptjs');








exports.registerUser = async (req, res) => {
  const { username, password, person, image } = req.body;
  //  console.log(image)
  try {
    const hashedPassword = password ? await bcrypt.hash(password, 10) : undefined;

    const newUser = new User({
      username,
      password: hashedPassword,
      person,
      image, // Store Base64 image data
    });

    await newUser.save();
    res.status(201).json({ message: 'User registered successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
    console.log(error);
  }
};


exports.registerUser1 = async (req, res) => {
  try {
    const newUser = new User1({
      img: {
        data: req.file.buffer,
        contentType: req.file.mimetype,
      },
    });

    await newUser.save();
    res.status(200).send('Image uploaded and user registered successfully!');
  } catch (error) {
    console.error('Error uploading image:', error);
    res.status(500).send('Error uploading image');
  }
};

  

// Login a user
exports.loginUser = async (req, res) => {
  const { username, password ,selected} = req.body;
  console.log(username, password ,selected)
  

  try {

    const user = await User.findOne({ username });
     console.log("user",user);
    // const person=  await User.findOne({ selected });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    if (user.person !== selected) {
        return res.status(403).json({ message: 'Unauthorized role' });
      }
 console.log(user.person);
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Optionally generate a token here
    res.status(200).json({ username});
   
   }
catch (error) {
    res.status(500).json({ error: error.message });
  }
};
