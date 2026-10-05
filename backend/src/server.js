require('dotenv').config();
const http = require('http');
const { Server } = require('socket.io');

const app = require('./app');
const connectDB = require('./config/db');
const initSocket = require('./sockets/socketHandler');

const PORT = process.env.PORT || 5000;

// Connect to MongoDB
connectDB();

// Create HTTP server
const server = http.createServer(app);

// Attach Socket.io
const io = new Server(server, {
  cors: {
    origin: [
      process.env.CLIENT_URL || 'http://localhost:5173',
      'http://localhost:5174',
      'http://localhost:3000',
      'https://unfazed.in',
      'https://app.unfazed.in'
    ],
    credentials: true,
    methods: ['GET', 'POST']
  }
});

// Initialize Socket.io events
initSocket(io);

// Start listening
server.listen(PORT, () => {
  console.log(`[Unfazed API] Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});
