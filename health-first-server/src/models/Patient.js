const mongoose = require('mongoose');
const { Schema } = mongoose;
const {
  US_STATES,
  SUPPORTED_LANGUAGES,
  BLOOD_TYPES,
  GENDER_OPTIONS,
  INSURANCE_PROVIDERS
} = require('../utils/constants');

const addressSchema = new Schema({
  street: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  city: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100,
    match: /^[a-zA-Z\s'-]+$/
  },
  state: {
    type: String,
    required: true,
    trim: true,
    maxlength: 50,
    uppercase: true,
    enum: US_STATES
  },
  zip: {
    type: String,
    required: true,
    trim: true,
    match: /^\d{5}(-\d{4})?$/
  }
}, { _id: false });

const emergencyContactSchema = new Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    minlength: 2,
    maxlength: 100,
    match: /^[a-zA-Z\s'-]+$/
  },
  relationship: {
    type: String,
    required: true,
    trim: true,
    maxlength: 50
  },
  phone_number: {
    type: String,
    required: true,
    trim: true,
    match: /^\+?[1-9]\d{1,14}$/
  },
  email: {
    type: String,
    trim: true,
    lowercase: true,
    maxlength: 254,
    match: /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/
  }
}, { _id: false });

const insuranceSchema = new Schema({
  provider: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100,
    enum: INSURANCE_PROVIDERS
  },
  policy_number: {
    type: String,
    required: true,
    trim: true,
    maxlength: 50
  },
  group_number: {
    type: String,
    trim: true,
    maxlength: 50
  },
  is_primary: {
    type: Boolean,
    default: true
  }
}, { _id: false });

const medicalHistorySchema = new Schema({
  condition: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  diagnosis_date: Date,
  is_active: {
    type: Boolean,
    default: true
  },
  medications: [{
    name: {
      type: String,
      trim: true,
      maxlength: 100
    },
    dosage: {
      type: String,
      trim: true,
      maxlength: 50
    },
    frequency: {
      type: String,
      trim: true,
      maxlength: 50
    }
  }]
}, { _id: false });

const patientSchema = new Schema({
  first_name: {
    type: String,
    required: true,
    trim: true,
    minlength: 2,
    maxlength: 50,
    match: /^[a-zA-Z\s'-]+$/
  },
  last_name: {
    type: String,
    required: true,
    trim: true,
    minlength: 2,
    maxlength: 50,
    match: /^[a-zA-Z\s'-]+$/
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    maxlength: 254,
    match: /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/
  },
  phone_number: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    match: /^\+?[1-9]\d{1,14}$/
  },
  password_hash: {
    type: String,
    required: true,
    minlength: 8,
    select: false
  },
  date_of_birth: {
    type: Date,
    required: true,
    validate: {
      validator: function(dob) {
        const age = Math.floor((Date.now() - dob) / (365.25 * 24 * 60 * 60 * 1000));
        return age >= 0 && age <= 120;
      },
      message: 'Invalid date of birth'
    }
  },
  gender: {
    type: String,
    required: true,
    enum: GENDER_OPTIONS
  },
  blood_type: {
    type: String,
    enum: BLOOD_TYPES,
    required: false
  },
  height: {
    type: Number,
    min: 30,
    max: 300,
    validate: {
      validator: Number.isInteger,
      message: 'Height must be a whole number in centimeters'
    }
  },
  weight: {
    type: Number,
    min: 1,
    max: 500,
    validate: {
      validator: function(w) {
        return Number.isFinite(w) && w > 0;
      },
      message: 'Weight must be a positive number in kilograms'
    }
  },
  address: addressSchema,
  emergency_contacts: [emergencyContactSchema],
  insurance: [insuranceSchema],
  medical_history: [medicalHistorySchema],
  allergies: [{
    type: String,
    trim: true,
    maxlength: 200
  }],
  preferred_language: {
    type: String,
    enum: SUPPORTED_LANGUAGES,
    default: 'English'
  },
  verification_status: {
    type: String,
    enum: ['pending', 'verified', 'rejected'],
    default: 'pending'
  },
  is_active: {
    type: Boolean,
    default: true
  },
  onboarding_status: {
    type: String,
    enum: ['registration', 'email_verified', 'profile_completed', 'medical_history_added', 'insurance_added', 'emergency_contacts_added', 'completed'],
    default: 'registration'
  },
  created_at: {
    type: Date,
    default: Date.now
  },
  updated_at: {
    type: Date,
    default: Date.now
  },
  last_login: Date,
  verification_requested_at: Date,
  verification_completed_at: Date,
  email_verified_at: Date
});

// Indexes
patientSchema.index({ email: 1 }, { unique: true });
patientSchema.index({ phone_number: 1 }, { unique: true });
patientSchema.index({ verification_status: 1 });
patientSchema.index({ is_active: 1 });
patientSchema.index({ created_at: -1 });
patientSchema.index({ onboarding_status: 1 });
patientSchema.index({ 'address.state': 1 });
patientSchema.index({ date_of_birth: 1 });

// Virtual for age calculation
patientSchema.virtual('age').get(function() {
  if (!this.date_of_birth) return null;
  return Math.floor((Date.now() - this.date_of_birth) / (365.25 * 24 * 60 * 60 * 1000));
});

// Virtual for full name
patientSchema.virtual('full_name').get(function() {
  return `${this.first_name} ${this.last_name}`;
});

// Ensure virtuals are serialized
patientSchema.set('toJSON', { virtuals: true });
patientSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Patient', patientSchema); 