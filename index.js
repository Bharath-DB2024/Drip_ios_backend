
const express = require('express');
const connectDB = require('./config/db');
const userRoutes = require('./routes/userRoutes');
const bodyParser = require('body-parser');
const multer = require('multer');
const app = express();
const Image = require('./models/json');  // Import Image model
const drips = require('./models/new');
const Details=require('./models/details')
const dripdata = require('./models/drip');
const Token= require('./models/token');
const dgram = require('dgram');  // Import the dgram module
const WebSocket = require('ws');
const admin = require("firebase-admin");
const fs = require("fs");

// Middleware
app.use(express.json());
const cors = require('cors');
app.use(cors({
  origin: '*' // Replace with your frontend URL if different
}));

// Connect to MongoDB
connectDB();

// Set up multer for handling file uploads
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });



const serviceAccount = require("./serviceAccountKey.json"); // Replace with your service account key file
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});






// API to register FCM token

app.post("/register-token", async (req, res) => {
  const { token, floor, room, ward, Selected, name1 } = req.body;
  const info="0";

  if (!token || !name1) {
    return res.status(400).send({ message: "Invalid token or name." });
  }

  try {
    // Check if name1 already exists in the database
    let existingToken = await Token.findOne({ name1 });

    if (existingToken) {
      // If name1 exists, update the token and other fields
      existingToken.token = token;
      existingToken.Selected = Selected;
      existingToken.room = room;
      existingToken.floor = floor;
      existingToken.ward = ward;
      
      await existingToken.save(); // Save updated token to database

      console.log("Token updated for existing name:", existingToken);
      return res.status(200).send({ message: "Token updated successfully." });
    }

    // Check if token exists but belongs to a different name1
    existingToken = await Token.findOne({ token });

    if (existingToken) {
      // If token exists, update it with the new name1 and other fields
      existingToken.name1 = name1;
      existingToken.Selected = Selected;
      existingToken.room = room;
      existingToken.floor = floor;
      existingToken.ward = ward;

      await existingToken.save(); // Save updated token to database

      console.log("Token updated for new name:", existingToken);
      return res.status(200).send({ message: "Token reassigned to new name successfully." });
    }

    // If neither name1 nor token exist, add a new token object
    const newToken = new Token({ token, Selected, room, floor, ward, name1,info });
    await newToken.save(); // Save new token to database

    console.log("New token registered:", newToken);
    res.status(200).send({ message: "Token registered successfully." });

  } catch (error) {
    console.error("Error handling token registration:", error);
    res.status(500).send({ message: "Internal server error." });
  }
});


app.post("/register-token1", async (req, res) => {
  const { name1, info } = req.body;
 console.log(info)
  // Ensure `name1` and `info` are provided
  if (!name1 || !info) {
    return res.status(400).send({ message: "Invalid name or missing info." });
  }

  try {
    // Check if a document with the same name1 exists
    const existingToken = await Token.findOne({ name1 });

    if (existingToken) {
      // If name1 exists, update the `info` field
      existingToken.info = info;
      await existingToken.save(); // Save the updated document

      console.log("Info updated for existing name:", existingToken);
      return res.status(200).send({ message: "Info updated successfully." });
    } 
  } catch (error) {
    console.error("Error while updating or saving token:", error);
    return res.status(500).send({ message: "Internal server error." });
  }
});

// Function to send automatic notification


// Trigger the auto notification every 10 seconds (for testing purposes)
setInterval(() => {
  // sendAutoNotification();
  sendAutoNotification1();
  
}, 1*20 * 1000); // 10 seconds interval

setInterval(() => {
  // sendAutoNotification();

  sendAutoNotification12();
  
}, 10*60*1000); // 10 seconds interval


const checkDatabaseInfoField = async () => {
  try {
    console.log("Checking database for updates...");

    // Query the database for records where "info" is "1"
    const updatedRecords = await Token.find({ info: "1" });

    if (updatedRecords.length > 0) {
      console.log(`Found ${updatedRecords.length} records with info = 1:`, updatedRecords);

      // Process the updated records
      for (const record of updatedRecords) {


        // Update the `info` field to "0" after processing
        await Token.updateOne({ _id: record._id }, { $set: { info: "0" } });
        // console.log(`Updated record ${record._id} info field to 0.`);
      }
    } else {
      console.log("No records with info = 1 found.");
    }
  } catch (error) {
    console.error("Error checking database info field:", error);
  }
};

// Run the check every 5 minutes (300,000 milliseconds)
setInterval(
  checkDatabaseInfoField, 600000); // 5 minutes = 300,000 ms

// Run the function immediately on startup
checkDatabaseInfoField();



app.put('/api/users/register1/:main', upload.single('image'), async (req, res) => {
  try {
    const { main } = req.params;
    const { username, nurse, contact, date, join } = req.body;
    const image = req.file; // Get the file from the request

    console.log("The name:", main);

    // Convert the image to base64 if it exists
    let imageBase64 = undefined;
    if (image) {
      imageBase64 = image.buffer.toString('base64'); // Convert image buffer to base64
    }

    // Data to update or insert
    const updatedData = {
      main,     // Include the main field
      username,
      nurse,
      contact,
      date,
      join,
      ...(imageBase64 && { image: imageBase64 }) // Add the image only if it's available
    };

    // Use 'upsert' to update if the document exists or insert a new one
    const result = await Image.findOneAndUpdate(
      { main }, // Search for document with 'main'
      updatedData, // The updated data
      { new: true, upsert: true, setDefaultsOnInsert: true } // Create a new document if not found
    );

    // Response
    res.json({ message: 'Data updated or added successfully', data: result });
    console.log("Operation successful:", result);
  } catch (error) {
    console.error('Error updating or adding data:', error);
    res.status(500).json({ error: 'Error updating or adding data' });
  }
});


app.put('/api/user/register323',upload.none(), async (req, res) => {
  try {
    const { floor, room1, ward, bed, drip } = req.body;
    console.log("the", floor)


    // If there's a new image, convert it to base64

    // Find the document by 'main' and update it
    const updatedData = {
      floor, room1, ward, bed, drip 
    };

    // Only include the 'image' field if a new image was uploaded
    const updatedUser = await dripdata.findOneAndUpdate(
      {bed },  // Search for the document using 'main'
      updatedData, // The updated data to save
      { new: true } // Return the updated document
    );

    if (!updatedUser) {
      return res.status(404).json({ error: 'Document with specified main not found' });
    }

    res.json({ message: 'Data updated successfully', updatedUser });
    console.log("the great")
  } catch (error) {
    console.error('Error updating image:', error);
    res.status(500).json({ error: 'Error updating image' });
  }
});


app.post('/api/user/register32', async (req, res) => {
  try {
    const { floor, room1, ward2, bed, drip } = req.body;

    console.log('Received data:', { floor, room1, ward2, bed, drip });

    // Create and save the data in the database
    const newDrip = new dripdata({
      floor,
      room1,
      ward:ward2,
      bed,
      drip,
    });

    await newDrip.save();

    res.json({ message: 'Data saved successfully', floor, ward2, room1, bed, drip });
    console.log('Data saved successfully:', { floor, room1, ward2, bed, drip });
  } catch (error) {
    console.error('Error saving data:', error);
    res.status(500).json({ error: 'Failed to save data' });
  }
});
app.post('/api/users/register1', async (req, res) => {
  try {
    const { username } = req.body;
    console.log(username,"the name is")

    // Create a new document in the 'drips' collection
    const newDrip = new drips({
      username,
    });
     
    // Save the new document to the database
    await newDrip.save();

    res.status(201).json({ message: 'Data stored successfully', newDrip });
    console.log("Data saved successfully");
  } catch (error) {
    console.error('Error saving data:', error);
    res.status(500).json({ error: 'Error saving data' });
  }
});

app.get('/api/users/register1', async (req, res) => {
  try {
    // Create a new document in the 'drips' collection
    const dripData = await drips.findOne({});
   
    res.status(201).json({ "username": dripData.username });
  } catch (error) {
    console.error('Error saving data:', error);
    res.status(500).json({ error: 'Error saving data' });
  }
});

app.get('/api/user/:floor', async (req, res) => {
  const { floor } = req.params;
  console.log('Floor:', floor);
  try {
    // Fetch multiple documents that match the floor from MongoDB
    const users = await dripdata.find({ floor });

    if (!users || users.length === 0) {
      return res.status(404).json({ message: 'No data found for the given floor' });
    }

    // Respond with the array of user data
    res.json(users);
  } catch (error) {
    console.error('Error fetching data:', error);
    res.status(500).json({ error: 'Error fetching data' });
  }
});



app.get('/api/users/:main/image', async (req, res) => {
  const { main } = req.params;
  // console.log(main)
  try {
    // Fetch the image from MongoDB using the username
    const user = await Image.findOne({ main });

    if (user && user.image) {
      // Convert the image buffer to a Base64 string
      const base64Image = user.image.toString('base64');
      const username = user.username;
      const contact = user.contact;
      const nurse = user.nurse;
      const date = user.date;
      const join = user.join;
      // Prepend MIME type to base64 string
      const imageBase64 = `data:image/jpeg;base64,${base64Image}`;

      // Send the base64 string in the response
      res.json({ image: imageBase64, username: username, contact: contact, nurse: nurse, date: date, join: join });
    } else {
      res.status(404).json({ error: 'Image not found' });
    }
  } catch (error) {
    console.error('Error fetching image:', error);
    res.status(500).json({ error: 'Error fetching image' });
  }
});



app.use('/api/users', userRoutes);

let udpMessage = []; // Array to store and update JSON messages

// Set up UDP server
const UDP_IP = '0.0.0.0'; // Listen on all available interfaces
const UDP_PORT = 12345;   // Port to listen on

// Create a socket to listen for incoming UDP packets
const server = dgram.createSocket('udp4');

// Bind the server to the UDP port
server.bind(UDP_PORT, UDP_IP, () => {
  console.log(`Listening for UDP packets on ${UDP_IP}:${UDP_PORT}`);
});

// Function to add or update the array with new data
function addOrUpdateData(newData) {
  newData.forEach((newItem) => {
    const existingIndex = udpMessage.findIndex((item) => item.Board === newItem.Board);
    if (existingIndex !== -1) {
      // Update the existing data
      udpMessage[existingIndex] = newItem;
      // console.log("the message ",udpMessages)
    } else {
      // Add new data
      udpMessage.push(newItem);
    }
  });
}

// Event listener for incoming messages
server.on('message', (msg, rinfo) => {
  console.log("the data ",msg);
  
  try {
    const receivedData = JSON.parse(msg.toString()); // Parse incoming message as JSON
    if (Array.isArray(receivedData)) {
      addOrUpdateData(receivedData); // Add or update the array
    } else {
      console.error('Invalid data format: Expected an array of JSON objects.');
    }
    // console.log('Updated UDP Messages:', udpMessages); // Print the updated array
  } catch (error) {
    console.error('Invalid JSON received:', msg.toString());
  }
});

// Event listener for error handling
server.on('error', (err) => {
  console.error(`Server error: ${err.stack}`);
  server.close();
});



// Function to send notification to specific tokens
const sendNotificationToTokens = async (matchedTokens, message) => {
  try {
    // Use the correct field 'token' in each tokenDoc (renamed from Token to tokenDoc)
    console.log("the message ",matchedTokens)
    const promises = matchedTokens.map((tokenDoc) =>
   
      admin.messaging().send({
        token: tokenDoc.token, // Access the token field from tokenDoc
        notification: message,
      })
    );

    const responses = await Promise.all(promises);
    console.log("Notifications sent successfully:", responses);
  } catch (error) {
    console.error("Error sending notifications:", error.message);
  }
};





const sendAutoNotification1 = async () => {
  try {
    console.log("udpMessage:", udpMessage); // Debugging to check structure

    // If udpMessage contains boardData directly
    const boardData = udpMessage;

    // Validate boardData
    if (!Array.isArray(boardData) || boardData.length === 0) {
      console.error("Invalid or empty boardData:", boardData);
      return;
    }

    // Filter boards with liquid_detected equal to -1 or 0
    const alertBoards = boardData.filter(
      (board) => board.liquid_detected === -1 || board.liquid_detected === 0
    );

    if (alertBoards.length === 0) {
      console.log("No boards with alerts found.");
      return;
    }

    // Extract Board IDs
    const boardIDs = alertBoards.map((board) => board.Board);

    // Query the database to find matching boards
    const matchingBoards = await dripdata.find({
      drip: { $in: boardIDs },
    });

    if (matchingBoards.length === 0) {
      console.log("No matching boards found.");
      return;
    }

    // console.log("Matching boards:", matchingBoards);

    // Send a single notification for the first matching board
    for (const board of matchingBoards) {
      const { floor, ward, room1 } = board;

      // Query the database to get tokens that match the floor, ward, and room
      const matchedTokens = await Token.find({
        floor: floor,
        ward: ward,
        room: { $regex: new RegExp(`\\b${room1}\\b`) }, // Assuming room is an array of rooms
        info: '0', // Additional filter (if required)
        Selected: "nurse", // Matching condition for Selected field
      });
      console.log("the message ", matchedTokens)
      if (matchedTokens.length > 0) {
        console.log(`Sending notification for board: ${board.drip}`);

        const message = {
          image: "https://cdn0.iconfinder.com/data/icons/customicondesignoffice5/64/examples.png", // Large notification image
          title: `IntelliDrips : ${board.drip}`,
          body: `Something Wrong .`,
        };
        
        // Send the notification to the matching tokens
        await sendNotificationToTokens(matchedTokens, message);

        // Exit after sending the first notification
        // console.log("Notification sent. Exiting loop.");
        // return; // Ensure only one message is sent
      }
    }
  } catch (error) {
    console.error("Error in sendAutoNotification1:", error);
  }
};

const sendNotificationToTokens1 = async (matchedTokens, message) => {
  try {
    console.log("the message ",matchedTokens)
    const promises = matchedTokens.map((tokenDoc) =>
   
      admin.messaging().send({
        token: tokenDoc.token, // Access the token field from tokenDoc
        notification: message,
      })
    );
    const responses = await Promise.all(promises);
    console.log("Notifications sent successfully:", responses);
  } catch (error) {
    console.error("Error sending notifications:", error.message);
  }
};


const sendAutoNotification12 = async () => {
  try {
    console.log("udpMessage:", udpMessage); // Debugging to check structure

    // If udpMessage contains boardData directly
    const boardData = udpMessage;

    // Validate boardData
    if (!Array.isArray(boardData) || boardData.length === 0) {
      console.error("Invalid or empty boardData:", boardData);
      return;
    }

    // Filter boards with liquid_detected equal to -1 or 0
    const alertBoards = boardData.filter(
      (board) => board.liquid_detected === -1 || board.liquid_detected === 0
    );

    if (alertBoards.length === 0) {
      console.log("No boards with alerts found.");
      return;
    }

    // Extract Board IDs
    const boardIDs = alertBoards.map((board) => board.Board);

    // Query the database to find matching boards
    const matchingBoards = await dripdata.find({
      drip: { $in: boardIDs },
    });

    if (matchingBoards.length === 0) {
      console.log("No matching boards found.");
      return;
    }

    console.log("Matching boards:", matchingBoards);

    // Send a single notification for the first matching board
    for (const board of matchingBoards) {
      const { floor, ward, room1 } = board;

      // Query the database to find tokens that match floor, ward, and room
      const matchedTokens = await Token.find({
        floor: floor, // Match floor
          // Additional filter (if required)
        Selected: "floorInCharge", // Matching condition for the "Selected" field
        room: { $regex: new RegExp(`\\b${ward}\\b`) }, // Check if room1 exists in the array field "room"
      });

      if (matchedTokens.length > 0) {
        console.log(`Sending notification for board: ${board.drip}`);
       console.log("hellow ")
        const message = {
          title: `IntelliDrips`,
          body: "Some Thing Wrong.",
        };

        // Send the notification to the matching tokens
        await sendNotificationToTokens1(matchedTokens, message);

        // Exit after sending the first notification
        console.log("Notification sent. Exiting loop.");
        return; // Ensure only one message is sent
      }
    }
  } catch (error) {
    console.error("Error in sendAutoNotification12:", error);
  }
};

app.get('/api/udp-message', (req, res) => {
  try {
    // Respond with the updated UDP messages
    console.log(udpMessage)
    res.json(udpMessage);
  } catch (error) {
    console.error('Error retrieving UDP messages:', error);
    res.status(500).json({ error: 'Failed to retrieve UDP messages' });
  }
});
// Routes
app.use('/api/users', userRoutes);

var counts = {
      notConnected: 0, // liquid_detected = -1
      empty: 0,        // liquid_detected = 0
      inProgress: 0,   // liquid_detected = 1
    };

app.post('/api/boards/compare/:floor/:ward/:room', async (req, res) => {
  try {
    // Extract floor, ward, and room parameters from URL
    const { floor, ward, room } = req.params;
    const selectedRooms = room ? JSON.parse(room) : [];
    console.log('Requested rooms:', selectedRooms);

    // Extract boardData from request body
    const { boardData } = req.body;
    if (!boardData || boardData.length === 0) {
      return res.status(400).json({ error: 'No boards provided' });
    }

    // Extract Board IDs from the boardData array
    const boardIDs = boardData.map((board) => board.Board);

    // MongoDB query to find matching boards
    const matchingBoards = await dripdata.find({
      drip: { $in: boardIDs },
      floor: { $in: [floor] }, // Ensure floor is treated as an array or single value
      ward: { $in: [ward] },   // Ensure ward is treated as an array or single value
      room1: { $in: selectedRooms },
    });

    console.log('Matching boards:', matchingBoards);

    // Calculate counts based on liquid_detected values from boardData


    // Iterate through matching boards and match with boardData to get liquid_detected
    matchingBoards.forEach((matchedBoard) => {
      const board = boardData.find((b) => b.Board === matchedBoard.drip);
      if (board) {
        if (board.liquid_detected === -1) counts.notConnected += 1;
        else if (board.liquid_detected === 0) counts.empty += 1;
        else if (board.liquid_detected === 1) counts.inProgress += 1;
      }
    });

    // Send response with matched boards and counts
    console.log(counts);
    
    res.status(200).json({
      matchingBoards,
      counts,
    });
  } catch (error) {
    console.error('Error comparing boards:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});


app.post('/api/boards/compare1/:floor/:ward/:room', async (req, res) => {
  try {
    // Extract floor, ward, and room parameters from URL
    const { floor, ward, room } = req.params;
    const selectedRooms = room ? JSON.parse(room) : [];
    console.log("Requested rooms:", selectedRooms); // Debugging the room value

    // Extract `udpMessage` (boardData) from request body
    const boardData = udpMessage; // Expect udpMessage in the request body
    if (!boardData || boardData.length === 0) {
      return res.status(400).json({ error: 'No boards provided' });
    }

    // Extract Board IDs from the `udpMessage`
    const boardIDs = boardData.map(board => board.Board);

    // Query MongoDB to find matching boards
    const matchingBoards = await dripdata.find({
      drip: { $in: boardIDs },
      floor: { $in: floor },
      ward: { $in: ward },
      room1: { $in: selectedRooms },
    });

    // Merge `liquid_detected` and `Batterystatus` into the matching boards
    const enhancedBoards = matchingBoards.map(matchingBoard => {
      // Find the corresponding board in `udpMessage`
      const udpBoard = boardData.find(board => board.Board === matchingBoard.drip);

      // Add `liquid_detected` and `Batterystatus` fields to the matching board
      return {
        ...matchingBoard.toObject(), // Convert MongoDB document to plain object
        liquid_detected: udpBoard ? udpBoard.liquid_detected : null,
        Batterystatus: udpBoard ? udpBoard.Batterystatus : null,
      };
    });

    // Send the response with enhanced boards
    res.status(200).json(enhancedBoards);
  } catch (error) {
    console.error('Error comparing boards:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/admin/:floor/:ward', async (req, res) => {
  
  const { floor,ward } = req.params; // Extract the floor from request params
  const selectedward = ward ? JSON.parse(ward) : null;
  console.log("Requested rooms:",selectedward);  // Debugging the floor value
  try {
     
      const users = await Details.find({
        floor,
       ward: { $in: selectedward }  // Use $in operator for array matching
    });

    // If no users found for the given floor, return a 404
    if (!users || users.length === 0) {
      return res.status(404).json({ message: 'No data found for the given floor' });
    }

    // Extract all selectedRooms from users and count drips for each room
    const userDripCounts = await Promise.all(
       users.map(async (user) => {
        const selectedRooms = user.selectedRooms || []; // Default to an empty array if undefined
        const selected = user.ward || []; // Default to an empty array if undefined

        const drips = await dripdata
        .find({ room1: { $in: selectedRooms },ward:{$in:selected} })  // Match based on selectedRooms
        .select('drip -_id');   // Specify which fields to return

       console.log()
      let boardMatchCount = 0;  // Initialize boardMatchCount to 0
      let boardMatchCount1 = 0;

   // Iterate over the udpMessage array
   udpMessage.forEach((message) => {
     // Only process if liquid_detected is 0
     if (message.liquid_detected === 0 ||message.liquid_detected === -1 ) {
       // For each message with liquid_detected === 0, check against each drip
       drips.forEach((drip) => {
      
         // If there's a match, increment the boardMatchCount
         if (message.Board === drip.drip) {
           boardMatchCount++; // Increment the count on a match
         }
       });
     }
     else if(message.liquid_detected === 1){
      drips.forEach((drip) => {
        // Log the comparison for debugging

        // If there's a match, increment the boardMatchCount
        if (message.Board === drip.drip) {
          boardMatchCount1++; // Increment the count on a match
        }
      });
     }
   });
   
        // Count the drips for the selected rooms
        const dripCount =boardMatchCount;
        const dripCount1= boardMatchCount1;
      // console.log(dripCount1)
        return {
          dripCount,
        };
      })
    );

    // console.log(userDripCounts);

    const userDripCounts1 = await Promise.all(
      users.map(async (user) => {
       const selectedRooms = user.selectedRooms || []; // Default to an empty array if undefined

       const drips = await dripdata
       .find({ room1: { $in: selectedRooms } })  // Match based on selectedRooms
       .select('drip -_id');   // Specify which fields to return

      // console.log()
     let boardMatchCount1 = 0;

  // Iterate over the udpMessage array
  udpMessage.forEach((message) => {
    // Only process if liquid_detected is 0
   
   if(message.liquid_detected === 1){
     drips.forEach((drip) => {
       // Log the comparison for debugging

       // If there's a match, increment the boardMatchCount
       if (message.Board === drip.drip) {
         boardMatchCount1++; // Increment the count on a match
       }
     });
    }
  });

       const dripCount1= boardMatchCount1;
    //  console.log(dripCount1)
       return {
         dripCount1,
       };
     })
   );

  //  console.log(userDripCounts1);


    // Respond with the user data and drip counts
    return res.json({
      user: users,      // Sending the users' data
      count: userDripCounts,
      count2: userDripCounts1,  // Sending the drip counts
    });
  } catch (error) {
    console.error('Error fetching data:', error);
    return null;
  }
});


app.post('/api/users/rooms', async (req, res) => {
  const { roomName, ward, active1 } = req.body; // Assume `udpMessage` is sent in the request body
  // console.log("the",active1)

  let parsedUdpMessage;
  try {
    // Ensure udpMessage is parsed correctly
    parsedUdpMessage = typeof udpMessage === 'string' ? JSON.parse(udpMessage) : udpMessage;

    // Step 1: Find drips for the given room and ward
    const drips = await dripdata.find({ ward: ward }); // Remove room filter to consider all rooms in the ward

    // Step 2: Extract the Board IDs and their corresponding rooms from the drips
    const roomDripMap = drips.reduce((map, drip) => {
      map[drip.room1] = map[drip.room1] || [];
      map[drip.room1].push(drip.drip);
      return map;
    }, {});

    // Step 3: Compare the Board IDs with the provided board data and group by room
    const roomMatchedData = Object.keys(roomDripMap).reduce((result, room) => {
      const matchedBoards = Array.isArray(parsedUdpMessage)
        ? parsedUdpMessage.filter((board) => {
            const isBoardInRoom = roomDripMap[room].includes(board.Board);
    
            if (active1 === "inactive") {
              // Check for liquid_detected = 0 or -1
              return isBoardInRoom && (board.liquid_detected === 0 || board.liquid_detected === -1);
            } else if (active1 === "active") {
              // Check for liquid_detected = 1
              return isBoardInRoom && board.liquid_detected === 1;
            }
    
            return false; // Exclude if status doesn't match
          })
        : [];
    
      result[room] = matchedBoards.length; // Count of matched boards per room
      return result;
    }, {});
    

    res.json({
      message: 'Room data processed successfully',
      count: roomMatchedData,
    });
  } catch (error) {
    console.error('Error processing room data:', error);
    res.status(500).json({ message: 'Error processing room data' });
  }
});



app.post('/api/boards/comparehome/:floor/:ward/:room', async (req, res) => {
  try {
    // Extract floor parameter from URL
    const {  ward, room } = req.params;
    const selectedRooms = room ? JSON.parse(room) : [];
    console.log("Requested floor:", selectedRooms);  // Debugging the floor value

    // Extract boards from request body
    const { boardData } = req.body;
    if (! boardData || boardData === 0) {
      return res.status(400).json({ error: 'No boards provided' });
    }

    // Extract Board IDs from the boards array
    const boardIDs =  boardData.map(board => board.Board);
    // MongoDB query to find matching boards
    const matchingBoards = await dripdata.find({
      drip: { $in: boardIDs },
      floor:  { $in: floor },
      ward:  { $in: ward },
      room1: { $in:selectedRooms },
    });
    console.log("Requested floor:", matchingBoards); 
    // Send the response with the matching boards
    res.status(200).json(matchingBoards);
  } catch (error) {
    console.error('Error comparing boards:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/users/delete', async (req, res) => {
  try {
    const { drip, bed } = req.body;

    // Log drip and bed values for debugging
    console.log('Drip ID:', drip, 'Bed ID:', bed);

    // Find and delete the document
    const deletedRecord = await dripdata.findOneAndDelete({ drip, bed });

    if (deletedRecord) {
      // Successfully deleted
      res.status(200).json({
        message: 'Record deleted successfully',
        deletedRecord,

      });
      console.log("the delete")
    } else {
      // No matching record found
      res.status(404).json({
        message: 'Record not found',
      });
    }
  } catch (error) {
    console.error('Error deleting record:', error);
    res.status(500).json({
      message: 'An error occurred while deleting the record',
      error: error.message,
    });
  }


});
///userLogout
app.post('/api/users/deleteuser', async (req, res) => {
  try {
    const { name1} = req.body;
     
    // Log drip and bed values for debugging
    // console.log('Drip ID:', drip, 'Bed ID:', bed);

    // Find and delete the document
    const deletedRecord = await Details.findOneAndDelete({ name1 });
    const deletedRecord1 = await Token.findOneAndDelete({ name1 });

    if (deletedRecord && deletedRecord1) {
      // Successfully deleted
      res.status(200).json({
        message: 'Record deleted successfully',
        deletedRecord,

      });
      console.log("the delete")
    } else {
      // No matching record found
      res.status(404).json({
        message: 'Record not found',
      });
    }
  } catch (error) {
    console.error('Error deleting record:', error);
    res.status(500).json({
      message: 'An error occurred while deleting the record',
      error: error.message,
    });
  }


});
app.put('/api/user/details', upload.none(), async (req, res) => {
  try {
    const { floor, room1, ward, name1 } = req.body;
    const selectedRooms = room1 ? JSON.parse(room1) : [];
    console.log("Input Data:", floor, selectedRooms, ward, name1);

    // Data to update or insert
    const updatedData = {
      floor,
      selectedRooms,
      ward,
      name1
    };

    // Use `findOneAndUpdate` with the `upsert` option
    const updatedUser = await Details.findOneAndUpdate(
      { name1 },            // Search by `name1`
      { $set: updatedData }, // Data to update
      { new: true, upsert: true } // `new: true` to return the updated document, `upsert: true` to insert if not found
    );

    res.json({
      message: updatedUser.wasNew
        ? 'New document created successfully'
        : 'Data updated successfully',
      updatedUser,
    });

    console.log("Operation successful:", updatedUser);
  } catch (error) {
    console.error('Error updating or adding data:', error);
    res.status(500).json({ error: 'Error updating or adding data' });
  }
});

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
