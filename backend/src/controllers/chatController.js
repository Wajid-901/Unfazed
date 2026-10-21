const Chat = require('../models/Chat');
const Client = require('../models/Client');
const Therapist = require('../models/Therapist');

// Return conversation list for therapist (all clients) or client (their therapist)
const getConversations = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const userRole = req.user.role;

    if (userRole === 'THERAPIST') {
      // Get all clients associated with this therapist
      const clients = await Client.find({ therapistId: userId, status: { $ne: 'archived' } })
        .select('name email phone tags status createdAt')
        .sort({ updatedAt: -1 });

      // Fetch last message for each client conversation
      const conversationList = await Promise.all(
        clients.map(async (client) => {
          const conversationId = `${userId}_${client._id}`;
          const lastMessage = await Chat.findOne({ conversationId })
            .sort({ createdAt: -1 });
          const unreadCount = await Chat.countDocuments({
            conversationId,
            receiverId: userId,
            status: { $ne: 'read' }
          });

          return {
            conversationId,
            participant: {
              id: client._id,
              name: client.name,
              email: client.email,
              phone: client.phone,
              role: 'CLIENT'
            },
            lastMessage: lastMessage ? lastMessage.message : 'No messages yet',
            lastMessageTime: lastMessage ? lastMessage.createdAt : client.createdAt,
            unreadCount
          };
        })
      );

      res.status(200).json({
        success: true,
        conversations: conversationList
      });
    } else {
      // For Client: get their therapist
      const client = await Client.findById(userId).populate('therapistId', 'name title slug profileImageUrl');
      if (!client || !client.therapistId) {
        return res.status(404).json({ success: false, message: 'Assigned therapist not found' });
      }

      const conversationId = `${client.therapistId._id}_${client._id}`;
      const lastMessage = await Chat.findOne({ conversationId }).sort({ createdAt: -1 });
      const unreadCount = await Chat.countDocuments({
        conversationId,
        receiverId: userId,
        status: { $ne: 'read' }
      });

      res.status(200).json({
        success: true,
        conversations: [
          {
            conversationId,
            participant: {
              id: client.therapistId._id,
              name: client.therapistId.name,
              title: client.therapistId.title,
              role: 'THERAPIST'
            },
            lastMessage: lastMessage ? lastMessage.message : 'Start consultation chat',
            lastMessageTime: lastMessage ? lastMessage.createdAt : client.createdAt,
            unreadCount
          }
        ]
      });
    }
  } catch (error) {
    next(error);
  }
};

// Return message history for a conversation with cursor pagination, mark as read
const getMessages = async (req, res, next) => {
  try {
    const { conversationId } = req.params;
    const userId = req.user.id;

    // Verify user is a member of this conversation
    if (!conversationId.includes(userId)) {
      return res.status(403).json({ success: false, message: 'Unauthorized access to conversation' });
    }

    const limit = Math.min(parseInt(req.query.limit) || 50, 100);
    const query = { conversationId };
    if (req.query.before) {
      const beforeDate = new Date(req.query.before);
      if (!isNaN(beforeDate.getTime())) {
        query.createdAt = { $lt: beforeDate };
      }
    }

    const rawMessages = await Chat.find(query)
      .sort({ createdAt: -1 })
      .limit(limit + 1);

    const hasMore = rawMessages.length > limit;
    const messages = rawMessages.slice(0, limit).reverse();
    const nextCursor = hasMore && messages.length > 0 ? messages[0].createdAt : null;

    // Automatically mark unread messages as read
    await Chat.updateMany(
      { conversationId, receiverId: userId, status: { $ne: 'read' } },
      { status: 'read', readAt: new Date() }
    );

    res.status(200).json({
      success: true,
      messages,
      hasMore,
      nextCursor
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getConversations,
  getMessages
};
