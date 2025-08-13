const mongoose = require('mongoose');
const { Schema } = mongoose;

const timeSlotSchema = new Schema({
  providerId: {
    type: Schema.Types.ObjectId,
    ref: 'Provider',
    required: true,
    index: true
  },
  date: {
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
  isBooked: {
    type: Boolean,
    default: false,
    index: true
  },
  appointmentId: {
    type: Schema.Types.ObjectId,
    ref: 'Appointment',
    default: null
  },
  isBlocked: {
    type: Boolean,
    default: false,
    index: true
  },
  blockReason: {
    type: String,
    maxlength: 200,
    trim: true
  },
  isRecurring: {
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

// Compound indexes for efficient querying
timeSlotSchema.index({ providerId: 1, date: 1, startTime: 1 });
timeSlotSchema.index({ providerId: 1, date: 1, isBooked: 1 });
timeSlotSchema.index({ providerId: 1, date: 1, isBlocked: 1 });

// Pre-save middleware to update updatedAt
timeSlotSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// Virtual for slot duration in minutes
timeSlotSchema.virtual('durationMinutes').get(function() {
  const start = new Date(`2000-01-01T${this.startTime}:00`);
  const end = new Date(`2000-01-01T${this.endTime}:00`);
  return Math.round((end - start) / (1000 * 60));
});

// Virtual for slot status
timeSlotSchema.virtual('status').get(function() {
  if (this.isBlocked) return 'blocked';
  if (this.isBooked) return 'booked';
  return 'available';
});

// Static method to generate time slots for a date range
timeSlotSchema.statics.generateTimeSlots = async function(providerId, startDate, endDate, availability) {
  const slots = [];
  const currentDate = new Date(startDate);
  
  while (currentDate <= endDate) {
    const dayOfWeek = currentDate.getDay();
    const dayAvailability = availability.find(a => a.dayOfWeek === dayOfWeek);
    
    if (dayAvailability && dayAvailability.isActive) {
      const slotsForDay = this.generateSlotsForDay(
        providerId,
        currentDate,
        dayAvailability.startTime,
        dayAvailability.endTime,
        dayAvailability.slotDuration,
        dayAvailability.breakTimes,
        dayAvailability.timezone
      );
      slots.push(...slotsForDay);
    }
    
    currentDate.setDate(currentDate.getDate() + 1);
  }
  
  return slots;
};

// Static method to generate slots for a specific day
timeSlotSchema.statics.generateSlotsForDay = function(providerId, date, startTime, endTime, slotDuration, breakTimes, timezone) {
  const slots = [];
  const start = new Date(`2000-01-01T${startTime}:00`);
  const end = new Date(`2000-01-01T${endTime}:00`);
  const durationMs = slotDuration * 60 * 1000;
  
  let currentTime = new Date(start);
  
  while (currentTime < end) {
    const slotStart = currentTime.toTimeString().slice(0, 5);
    const slotEnd = new Date(currentTime.getTime() + durationMs).toTimeString().slice(0, 5);
    
    // Check if slot conflicts with break times
    const conflictsWithBreak = breakTimes.some(breakTime => {
      const breakStart = new Date(`2000-01-01T${breakTime.startTime}:00`);
      const breakEnd = new Date(`2000-01-01T${breakTime.endTime}:00`);
      const slotStartTime = new Date(`2000-01-01T${slotStart}:00`);
      const slotEndTime = new Date(`2000-01-01T${slotEnd}:00`);
      
      return slotStartTime < breakEnd && slotEndTime > breakStart;
    });
    
    if (!conflictsWithBreak) {
      slots.push({
        providerId,
        date: new Date(date),
        startTime: slotStart,
        endTime: slotEnd,
        isBooked: false,
        isBlocked: false,
        isRecurring: true,
        timezone
      });
    }
    
    currentTime = new Date(currentTime.getTime() + durationMs);
  }
  
  return slots;
};

module.exports = mongoose.model('TimeSlot', timeSlotSchema); 