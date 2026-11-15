const mongoose = require('mongoose');

const sessionNoteSchema = new mongoose.Schema(
  {
    sessionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Session',
      required: true,
      index: true
    },
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
    type: {
      type: String,
      enum: ['SOAP', 'DAP', 'GENERAL'],
      default: 'SOAP'
    },
    title: {
      type: String,
      default: 'Session Clinical Note'
    },
    soap: {
      subjective: { type: String, default: '' },
      objective: { type: String, default: '' },
      assessment: { type: String, default: '' },
      plan: { type: String, default: '' }
    },
    dap: {
      data: { type: String, default: '' },
      assessment: { type: String, default: '' },
      plan: { type: String, default: '' }
    },
    body: {
      type: String,
      default: ''
    },
    visibility: {
      type: String,
      enum: ['PRIVATE', 'SHARED'],
      default: 'PRIVATE',
      index: true
    }
  },
  {
    timestamps: true
  }
);

sessionNoteSchema.index({ clientId: 1, visibility: 1 });
sessionNoteSchema.index({ sessionId: 1, visibility: 1 });

module.exports = mongoose.model('SessionNote', sessionNoteSchema);
