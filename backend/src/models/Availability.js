const mongoose = require('mongoose');

const slotSchema = new mongoose.Schema(
  {
    start: { type: String, required: true }, // e.g. "09:00"
    end: { type: String, required: true }    // e.g. "17:00"
  },
  { _id: false }
);

const dayScheduleSchema = new mongoose.Schema(
  {
    dayOfWeek: {
      type: Number,
      required: true,
      min: 0, // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
      max: 6
    },
    isActive: {
      type: Boolean,
      default: true
    },
    slots: [slotSchema]
  },
  { _id: false }
);

const blockedSlotSchema = new mongoose.Schema(
  {
    date: { type: String, required: true }, // YYYY-MM-DD
    start: { type: String, required: true }, // "10:00"
    end: { type: String, required: true },   // "11:00"
    reason: { type: String, default: 'Unavailable' }
  },
  { _id: true }
);

const availabilitySchema = new mongoose.Schema(
  {
    therapistId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Therapist',
      required: true,
      unique: true
    },
    timezone: {
      type: String,
      default: 'Asia/Kolkata'
    },
    slotDurationMinutes: {
      type: Number,
      default: 50
    },
    bufferMinutes: {
      type: Number,
      default: 10
    },
    weeklySchedule: {
      type: [dayScheduleSchema],
      default: [
        { dayOfWeek: 1, isActive: true, slots: [{ start: '09:00', end: '17:00' }] },
        { dayOfWeek: 2, isActive: true, slots: [{ start: '09:00', end: '17:00' }] },
        { dayOfWeek: 3, isActive: true, slots: [{ start: '09:00', end: '17:00' }] },
        { dayOfWeek: 4, isActive: true, slots: [{ start: '09:00', end: '17:00' }] },
        { dayOfWeek: 5, isActive: true, slots: [{ start: '09:00', end: '17:00' }] },
        { dayOfWeek: 6, isActive: false, slots: [] },
        { dayOfWeek: 0, isActive: false, slots: [] }
      ]
    },
    blockedSlots: {
      type: [blockedSlotSchema],
      default: []
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Availability', availabilitySchema);
