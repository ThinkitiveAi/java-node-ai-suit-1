const mongoose = require('mongoose');
const { Schema } = mongoose;

const breakTimeSchema = new Schema({
  startTime: {
    type: String,
    required: true,
    match: /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/ // HH:MM format
  },
  endTime: {
    type: String,
    required: true,
    match: /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/ // HH:MM format
  }
}, { _id: false });

const availabilitySchema = new Schema({
  providerId: {
    type: Schema.Types.ObjectId,
    ref: 'Provider',
    required: true,
    index: true
  },
  dayOfWeek: {
    type: Number,
    required: true,
    min: 0, // Sunday
    max: 6, // Saturday
    validate: {
      validator: Number.isInteger,
      message: 'Day of week must be a whole number'
    }
  },
  startTime: {
    type: String,
    required: true,
    match: /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/ // HH:MM format
  },
  endTime: {
    type: String,
    required: true,
    match: /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/ // HH:MM format
  },
  isRecurring: {
    type: Boolean,
    default: true // true for weekly recurring schedule
  },
  specificDate: {
    type: Date,
    required: function() { return !this.isRecurring; }
  },
  slotDuration: {
    type: Number,
    default: 30, // 30 minutes default
    min: 15,
    max: 120,
    validate: {
      validator: function(v) { return v % 15 === 0; },
      message: 'Slot duration must be in 15-minute increments'
    }
  },
  breakTimes: [breakTimeSchema],
  isActive: {
    type: Boolean,
    default: true
  },
  timezone: {
    type: String,
    default: 'UTC',
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Compound index for provider and day
availabilitySchema.index({ providerId: 1, dayOfWeek: 1 }, { unique: true });

// Index for specific dates
availabilitySchema.index({ providerId: 1, specificDate: 1 });

// Pre-save middleware to update updatedAt
availabilitySchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

module.exports = mongoose.model('Availability', availabilitySchema); 