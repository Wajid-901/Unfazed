const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema(
  {
    clientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Client',
      default: null,
      index: true
    },
    therapistId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Therapist',
      required: true,
      index: true
    },
    type: {
      type: String,
      enum: ['SESSION', 'SUBSCRIPTION', 'PACKAGE'],
      default: 'SESSION',
      index: true
    },
    planKey: {
      type: String,
      default: null
    },
    sessionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Session',
      default: null
    },
    packageId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Package',
      default: null
    },
    amount: {
      type: Number,
      required: true
    },
    currency: {
      type: String,
      default: 'INR'
    },
    gateway: {
      type: String,
      enum: ['Razorpay', 'Cash', 'BankTransfer', 'Manual'],
      default: 'Razorpay'
    },
    orderId: {
      type: String,
      index: true
    },
    paymentId: {
      type: String
    },
    signature: {
      type: String
    },
    status: {
      type: String,
      enum: ['created', 'captured', 'failed', 'refunded'],
      default: 'created',
      index: true
    },
    invoiceNumber: {
      type: String
    },
    invoiceUrl: {
      type: String,
      default: ''
    }
  },
  {
    timestamps: true
  }
);

paymentSchema.index({ invoiceNumber: 1 }, { unique: true, sparse: true });

module.exports = mongoose.model('Payment', paymentSchema);
