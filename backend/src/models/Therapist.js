const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const therapistSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      maxlength: 100
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email']
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: 8,
      select: false
    },
    slug: {
      type: String,
      required: [true, 'Slug is required'],
      unique: true,
      lowercase: true,
      trim: true
    },
    title: {
      type: String,
      default: 'Licensed Psychologist',
      trim: true
    },
    bio: {
      type: String,
      default: '',
      maxlength: 2000
    },
    phone: {
      type: String,
      default: '',
      trim: true
    },
    languages: {
      type: [String],
      default: ['English', 'Hindi']
    },
    specializations: {
      type: [String],
      default: ['Anxiety', 'Depression', 'Relationship Counseling']
    },
    hourlyRate: {
      type: Number,
      default: 1500,
      min: 0
    },
    currency: {
      type: String,
      default: 'INR'
    },
    experienceYears: {
      type: Number,
      default: 3
    },
    qualification: {
      type: String,
      default: 'M.Sc Clinical Psychology'
    },
    profileImageUrl: {
      type: String,
      default: ''
    },
    clinicAddress: {
      type: String,
      default: 'Online / Telehealth'
    },
    subscriptionPlan: {
      type: String,
      enum: ['FREE', 'STARTER', 'PRO', 'ENTERPRISE'],
      default: 'FREE'
    },
    subscriptionStatus: {
      type: String,
      enum: ['active', 'trial', 'past_due', 'cancelled'],
      default: 'active'
    },
    subscriptionExpiresAt: {
      type: Date,
      default: null
    }
  },
  {
    timestamps: true
  }
);

// Hash password before saving
therapistSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare password method
therapistSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Exclude password in JSON
therapistSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  return obj;
};

module.exports = mongoose.model('Therapist', therapistSchema);
