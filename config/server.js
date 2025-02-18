/*const http = require('http');
const socketIo = require('socket.io');
const app = require('../app'); 
const cors = require('cors');
// ملف Express الأساسي

// إعداد السيرفر مع WebSocket
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

// حفظ اتصالات المستخدمين
let clients = [];

// عند الاتصال
io.on('connection', (socket) => {
  console.log('New client connected:', socket.id);
  clients.push(socket);

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
    clients = clients.filter(client => client.id !== socket.id);
  });
});

// إرسال إشعار لكل المستخدمين
const sendNotification = (message) => {
  clients.forEach(client => {
    client.emit('notification', { message });
  });
};

module.exports = { server, io, sendNotification };*/
