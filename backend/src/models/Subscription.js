const mongoose = require('mongoose');

const subscriptionSchema = new mongoose.Schema(
  {
    planKey: {
      type: String,
      enum: ['FREE', 'STARTER', 'PRO', 'ENTERPRISE'],
      required: true,
      unique: true
    },
    name: {
      type: String,
      required: true
    },
    monthlyPrice: {
      type: Number,
      required: true
    },
    annualPrice: {
      type: Number,
      required: true
    },
    features: {
      type: [String],
      default: []
    },
    limits: {
      maxClients: { type: Number, default: 5 },
      maxStorageMB: { type: Number, default: 100 },
      analyticsLevel: { type: String, default: 'BASIC' }
    },
    isActive: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Subscription', subscriptionSchema);
