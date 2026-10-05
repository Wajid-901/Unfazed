const { verifyAccessToken } = require('../config/jwt');
const Chat = require('../models/Chat');

let ioInstance = null;

const initSocket = (io) => {
  ioInstance = io;

  // Authentication middleware for Socket.io
  io.use((socket, next) => {
    try {
      const token = socket.handshake.auth?.token || socket.handshake.query?.token;
      if (!token) {
        return next(new Error('Authentication error: Token required'));
      }
      const decoded = verifyAccessToken(token);
      socket.user = decoded;
      next();
    } catch (err) {
      next(new Error('Authentication error: Invalid or expired token'));
    }
  });

  io.on('connection', (socket) => {
    const userId = socket.user.id;
    socket.join(userId);
    console.log(`[Socket] User connected: ${userId} (${socket.user.role})`);

    // Join room for specific conversation
    socket.on('join_conversation', ({ conversationId }) => {
      socket.join(conversationId);
      console.log(`[Socket] User ${userId} joined room: ${conversationId}`);
    });

    // Leave room
    socket.on('leave_conversation', ({ conversationId }) => {
      socket.leave(conversationId);
    });

    // Send real-time chat message
    socket.on('send_message', async ({ conversationId, receiverId, message }, callback) => {
      try {
        const chat = await Chat.create({
          conversationId,
          senderId: userId,
          senderRole: socket.user.role,
          receiverId,
          message,
          status: 'sent'
        });

        // Broadcast to everyone in conversation room
        io.to(conversationId).emit('receive_message', chat);

        // Also notify receiver personal room in case they are outside this conversation
        io.to(receiverId).emit('new_message_notification', {
          conversationId,
          senderId: userId,
          senderName: socket.user.name,
          message: chat.message
        });

        if (typeof callback === 'function') callback({ success: true, chat });
      } catch (err) {
        console.error('[Socket] send_message error:', err);
        if (typeof callback === 'function') callback({ success: false, error: err.message });
      }
    });

    // Typing indicators
    socket.on('typing_start', ({ conversationId }) => {
      socket.to(conversationId).emit('user_typing', { userId, isTyping: true });
    });

    socket.on('typing_stop', ({ conversationId }) => {
      socket.to(conversationId).emit('user_typing', { userId, isTyping: false });
    });

    // Read receipts
    socket.on('mark_read', async ({ conversationId, messageIds }) => {
      try {
        await Chat.updateMany(
          { conversationId, receiverId: userId, status: { $ne: 'read' } },
          { status: 'read', readAt: new Date() }
        );
        socket.to(conversationId).emit('messages_read', { conversationId, readBy: userId });
      } catch (err) {
        console.error('[Socket] mark_read error:', err);
      }
    });

    socket.on('disconnect', () => {
      console.log(`[Socket] User disconnected: ${userId}`);
    });
  });
};

const sendSocketNotification = (recipientId, notification) => {
  if (ioInstance && recipientId) {
    ioInstance.to(recipientId.toString()).emit('new_notification', notification);
  }
};

module.exports = initSocket;
module.exports.initSocket = initSocket;
module.exports.sendSocketNotification = sendSocketNotification;
