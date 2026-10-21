const mongoose = require('mongoose');

const therapistReviewSchema = new mongoose.Schema(
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
      required: true
    },
    sessionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Session',
      default: null
    },
    rating: {
      type: Number,
      required: [true, 'Rating is required'],
      min: 1,
      max: 5
    },
    title: {
      type: String,
      trim: true,
      maxlength: 150,
      default: ''
    },
    comment: {
      type: String,
      trim: true,
      maxlength: 1000,
      default: ''
    },
    isVerified: {
      type: Boolean,
      default: false
    },
    isAnonymous: {
      type: Boolean,
      default: false
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'approved'
    },
    therapistResponse: {
      type: String,
      trim: true,
      maxlength: 500,
      default: ''
    }
  },
  {
    timestamps: true
  }
);

// Prevent duplicate reviews per client-therapist pair
therapistReviewSchema.index({ therapistId: 1, clientId: 1 }, { unique: true });

module.exports = mongoose.model('TherapistReview', therapistReviewSchema);
