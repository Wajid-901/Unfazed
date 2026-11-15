const { verifyAccessToken } = require('../config/jwt');
const Chat = require('../models/Chat');
const { getConversationForUser } = require('../services/ConversationService');

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
    const authorizedConversations = new Set();
    console.log(`[Socket] User connected: ${userId} (${socket.user.role})`);

    socket.on('join_conversation', async (payload) => {
      try {
        const conversationId = payload?.conversationId;
        const conversation = await getConversationForUser(conversationId, socket.user);
        if (!conversation) return;

        authorizedConversations.add(conversationId);
        socket.join(conversationId);
      } catch (err) {
        console.error('[Socket] Failed to authorize conversation room:', err.message);
      }
    });

    socket.on('leave_conversation', (payload) => {
      const conversationId = payload?.conversationId;
      if (!authorizedConversations.delete(conversationId)) return;
      socket.leave(conversationId);
    });

    socket.on('send_message', async (payload, callback) => {
      try {
        const conversationId = payload?.conversationId;
        const receiverId = payload?.receiverId;
        const message = typeof payload?.message === 'string' ? payload.message.trim() : '';
        const conversation = await getConversationForUser(conversationId, socket.user);

        if (
          !conversation ||
          receiverId !== conversation.otherParticipantId ||
          !message ||
          message.length > 5000
        ) {
          if (typeof callback === 'function') callback({ success: false, error: 'Invalid conversation or message.' });
          return;
        }

        const chat = await Chat.create({
          conversationId,
          senderId: userId,
          senderRole: socket.user.role,
          receiverId: conversation.otherParticipantId,
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
        console.error('[Socket] send_message error:', err.message);
        if (typeof callback === 'function') callback({ success: false, error: 'Message could not be sent.' });
      }
    });

    socket.on('typing_start', (payload) => {
      const conversationId = payload?.conversationId;
      if (!authorizedConversations.has(conversationId)) return;
      socket.to(conversationId).emit('user_typing', { userId, isTyping: true });
    });

    socket.on('typing_stop', (payload) => {
      const conversationId = payload?.conversationId;
      if (!authorizedConversations.has(conversationId)) return;
      socket.to(conversationId).emit('user_typing', { userId, isTyping: false });
    });

    socket.on('mark_read', async (payload) => {
      try {
        const conversationId = payload?.conversationId;
        if (!authorizedConversations.has(conversationId)) return;

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
