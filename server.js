const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

// Store incoming messages in memory
let messages = [];

io.on('connection', (socket) => {
  // Capture sender's technical metadata from socket handshake
  const clientIp = socket.handshake.headers['x-forwarded-for'] || socket.handshake.address;
  const userAgent = socket.handshake.headers['user-agent'] || 'Unknown Device';

  // Send existing messages if someone opens the owner view
  socket.emit('load messages', messages);

  // Handle incoming secret message
  socket.on('send secret', (text) => {
    if (!text || text.trim() === '') return;

    const newMessage = {
      id: Date.now(),
      text: text.trim(),
      ip: clientIp,
      device: userAgent,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    messages.unshift(newMessage); // Add to the top

    // Broadcast to you (the owner) in real-time
    io.emit('new secret', newMessage);
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Truth Box server running on port ${PORT}`);
});
