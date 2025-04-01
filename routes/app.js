const dgram = require('dgram');

// Define the IP and port to listen on
const UDP_IP = '0.0.0.0'; // Listen on all available interfaces
const UDP_PORT = 12345; // Port to listen on

// Create a socket to listen for incoming UDP packets
const server = dgram.createSocket('udp4');

// Bind the server to the UDP port
server.bind(UDP_PORT, UDP_IP, () => {
  console.log(`Listening for UDP packets on ${UDP_IP}:${UDP_PORT}`);
});

// Event listener for incoming messages
server.on('message', (msg, rinfo) => {
  console.log(`Received message: ${msg.toString()} from ${rinfo.address}:${rinfo.port}`);
});

// Event listener for error handling
server.on('error', (err) => {
  console.error(`Server error: ${err.stack}`);
  server.close();
});
