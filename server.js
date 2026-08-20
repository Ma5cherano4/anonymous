const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

let messages = [];

io.on('connection', (socket) => {
  const clientIp = socket.handshake.headers['x-forwarded-for'] || socket.handshake.address;
  const userAgent = socket.handshake.headers['user-agent'] || 'Unknown Device';

  socket.emit('load messages', messages);

  // Receive both email and message text from the client
  socket.on('send secret', (data) => {
    if (!data.text || data.text.trim() === '') return;

    const newMessage = {
      id: Date.now(),
      email: data.email ? data.email.trim() : 'Anonymous / Not provided',
      text: data.text.trim(),
      ip: clientIp,
      device: userAgent,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    messages.unshift(newMessage);
    io.emit('new secret', newMessage);
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Truth Box server running on port ${PORT}`);
});
