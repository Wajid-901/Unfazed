const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const clientSchema = new mongoose.Schema(
  {
    therapistId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Therapist',
      required: true,
      index: true
    },
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      lowercase: true,
      trim: true
    },
    password: {
      type: String,
      minlength: 8,
      select: false
    },
    phone: {
      type: String,
      default: '',
      trim: true
    },
    dateOfBirth: {
      type: Date
    },
    gender: {
      type: String,
      enum: ['Male', 'Female', 'Non-Binary', 'Prefer not to say', 'Other'],
      default: 'Prefer not to say'
    },
    tags: {
      type: [String],
      default: ['New Client']
    },
    status: {
      type: String,
      enum: ['lead', 'active', 'inactive', 'archived'],
      default: 'active'
    },
    intakeSubmitted: {
      type: Boolean,
      default: false
    },
    intakeData: {
      medicalHistory: { type: String, default: '' },
      presentingConcerns: { type: String, default: '' },
      previousTherapy: { type: String, default: '' },
      emergencyContactName: { type: String, default: '' },
      emergencyContactPhone: { type: String, default: '' },
      emergencyContactRelation: { type: String, default: '' }
    },
    consentSignedAt: {
      type: Date,
      default: null
    },
    digitalSignature: {
      type: String,
      default: null
    }
  },
  {
    timestamps: true
  }
);

// Compound index so a client email is unique per therapist
clientSchema.index({ therapistId: 1, email: 1 }, { unique: true });

clientSchema.pre('save', async function (next) {
  if (!this.isModified('password') || !this.password) return next();
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

clientSchema.methods.comparePassword = async function (enteredPassword) {
  if (!this.password) return false;
  return await bcrypt.compare(enteredPassword, this.password);
};

clientSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  return obj;
};

module.exports = mongoose.model('Client', clientSchema);
