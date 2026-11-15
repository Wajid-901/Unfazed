const Client = require('../models/Client');

const isObjectId = (value) => /^[a-f\d]{24}$/i.test(value);

const getConversationForUser = async (conversationId, user) => {
  if (typeof conversationId !== 'string' || !user?.id) return null;

  const participants = conversationId.split('_');
  if (participants.length !== 2 || !participants.every(isObjectId)) return null;

  const [therapistId, clientId] = participants;
  const userId = String(user.id);

  if (user.role === 'THERAPIST' && therapistId === userId) {
    const client = await Client.findOne({ _id: clientId, therapistId }).select('_id');
    if (!client) return null;
    return { conversationId, therapistId, clientId, otherParticipantId: client._id.toString() };
  }

  if (user.role === 'CLIENT' && clientId === userId) {
    const client = await Client.findOne({ _id: clientId, therapistId }).select('therapistId');
    if (!client) return null;
    return {
      conversationId,
      therapistId: client.therapistId.toString(),
      clientId,
      otherParticipantId: client.therapistId.toString()
    };
  }

  return null;
};

module.exports = { getConversationForUser };
