const mongoose = require('mongoose');
const { Schema } = mongoose;

const appointmentSchema = new Schema({
  appointmentId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  patientId: {
    type: Schema.Types.ObjectId,
    ref: 'Patient',
    required: true,
    index: true
  },
  providerId: {
    type: Schema.Types.ObjectId,
    ref: 'Provider',
    required: true,
    index: true
  },
  appointmentDate: {
    type: Date,
    required: true,
    index: true
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
  duration: {
    type: Number,
    required: true,
    min: 15,
    max: 480, // 8 hours max
    validate: {
      validator: function(v) { return v % 15 === 0; },
      message: 'Duration must be in 15-minute increments'
    }
  },
  status: {
    type: String,
    enum: ['scheduled', 'confirmed', 'checked-in', 'in-exam', 'completed', 'cancelled', 'no-show'],
    default: 'scheduled',
    index: true
  },
  appointmentType: {
    type: String,
    enum: ['consultation', 'follow-up', 'emergency', 'routine', 'specialist'],
    required: true
  },
  appointmentMode: {
    type: String,
    enum: ['in-person', 'video-call', 'home'],
    default: 'in-person'
  },
  notes: {
    type: String,
    maxlength: 1000,
    trim: true
  },
  providerNotes: {
    type: String,
    maxlength: 1000,
    trim: true
  },
  reasonForVisit: {
    type: String,
    required: true,
    maxlength: 500,
    trim: true
  },
  estimatedAmount: {
    type: Number,
    min: 0,
    default: 0
  },
  cancellationReason: {
    type: String,
    maxlength: 500,
    trim: true
  },
  cancelledBy: {
    type: String,
    enum: ['patient', 'provider', 'system'],
    default: null
  },
  cancelledAt: {
    type: Date,
    default: null
  },
  reminderSent: {
    type: Boolean,
    default: false
  },
  reminderSentAt: {
    type: Date,
    default: null
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

// Compound indexes for efficient querying
appointmentSchema.index({ providerId: 1, appointmentDate: 1 });
appointmentSchema.index({ patientId: 1, appointmentDate: 1 });
appointmentSchema.index({ status: 1, appointmentDate: 1 });

// Pre-save middleware to update updatedAt and generate appointmentId
appointmentSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  
  // Generate appointmentId if not exists
  if (!this.appointmentId) {
    const timestamp = Date.now().toString();
    const random = Math.random().toString(36).substr(2, 5);
    this.appointmentId = `APT-${timestamp}-${random}`.toUpperCase();
  }
  
  next();
});

// Virtual for full appointment time
appointmentSchema.virtual('appointmentDateTime').get(function() {
  return new Date(`${this.appointmentDate.toISOString().split('T')[0]}T${this.startTime}:00`);
});

// Virtual for appointment duration in minutes
appointmentSchema.virtual('durationMinutes').get(function() {
  const start = new Date(`2000-01-01T${this.startTime}:00`);
  const end = new Date(`2000-01-01T${this.endTime}:00`);
  return Math.round((end - start) / (1000 * 60));
});

module.exports = mongoose.model('Appointment', appointmentSchema); 