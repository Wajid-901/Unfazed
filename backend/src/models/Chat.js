const mongoose = require('mongoose');

const chatSchema = new mongoose.Schema(
  {
    conversationId: {
      type: String, // e.g. therapistId_clientId
      required: true,
      index: true
    },
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true
    },
    senderRole: {
      type: String,
      enum: ['THERAPIST', 'CLIENT'],
      required: true
    },
    receiverId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true
    },
    message: {
      type: String,
      required: true,
      trim: true,
      maxlength: 5000
    },
    status: {
      type: String,
      enum: ['sent', 'delivered', 'read'],
      default: 'sent'
    },
    readAt: {
      type: Date,
      default: null
    }
  },
  {
    timestamps: true
  }
);

chatSchema.index({ conversationId: 1, createdAt: -1 });

module.exports = mongoose.model('Chat', chatSchema);
