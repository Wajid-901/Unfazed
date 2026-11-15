require('dotenv').config();
const http = require('http');
const { Server } = require('socket.io');

const app = require('./app');
const connectDB = require('./config/db');
const getAllowedOrigins = require('./config/origins');
const initSocket = require('./sockets/socketHandler');

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  await connectDB();

  const server = http.createServer(app);

  const io = new Server(server, {
    cors: {
      origin: getAllowedOrigins(),
      credentials: true,
      methods: ['GET', 'POST']
    }
  });

  initSocket(io);

  server.listen(PORT, () => {
    console.log(`[Unfazed API] Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
  });
};

startServer().catch((error) => {
  console.error(`[Startup] Unable to start API: ${error.message}`);
  process.exitCode = 1;
});
