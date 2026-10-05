const mongoose = require('mongoose');

const sessionSchema = new mongoose.Schema(
  {
    therapistId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Therapist',
      required: true,
      index: true
    },
    clientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Client',
      required: true,
      index: true
    },
    date: {
      type: String, // YYYY-MM-DD
      required: true,
      index: true
    },
    startTime: {
      type: String, // "10:00"
      required: true
    },
    endTime: {
      type: String, // "10:50"
      required: true
    },
    duration: {
      type: Number,
      default: 50 // in minutes
    },
    status: {
      type: String,
      enum: ['scheduled', 'in_progress', 'completed', 'cancelled', 'no_show'],
      default: 'scheduled',
      index: true
    },
    paymentStatus: {
      type: String,
      enum: ['pending', 'paid', 'waived', 'refunded'],
      default: 'pending',
      index: true
    },
    amount: {
      type: Number,
      required: true,
      default: 1500
    },
    currency: {
      type: String,
      default: 'INR'
    },
    meetingLink: {
      type: String,
      default: ''
    },
    cancellationReason: {
      type: String,
      default: ''
    },
    cancelledBy: {
      type: String,
      enum: ['therapist', 'client', 'system', null],
      default: null
    }
  },
  {
    timestamps: true
  }
);

// Prevent double booking for active/scheduled sessions at the same slot
sessionSchema.index(
  { therapistId: 1, date: 1, startTime: 1 },
  {
    unique: true,
    partialFilterExpression: { status: { $in: ['scheduled', 'in_progress'] } }
  }
);

module.exports = mongoose.model('Session', sessionSchema);
