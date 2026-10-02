const mongoose = require('mongoose');

const feedbackSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ['support', 'bug'],
      default: 'support',
      index: true
    },
    name: {
      type: String,
      required: true,
      trim: true
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true
    },
    category: {
      type: String,
      default: 'General Inquiry'
    },
    severity: {
      type: String,
      enum: ['Low', 'Medium', 'High / Critical'],
      default: 'Medium'
    },
    subject: {
      type: String,
      required: true,
      trim: true
    },
    message: {
      type: String,
      required: true
    },
    stepsToReproduce: {
      type: String,
      default: ''
    },
    pageUrl: {
      type: String,
      default: ''
    },
    userAgent: {
      type: String,
      default: ''
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      refPath: 'userModel',
      default: null
    },
    status: {
      type: String,
      enum: ['new', 'in_progress', 'resolved', 'closed'],
      default: 'new'
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Feedback', feedbackSchema);
