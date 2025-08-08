const mongoose = require('mongoose');
const { Schema } = mongoose;
const {
  SPECIALIZATIONS,
  US_STATES,
  SUPPORTED_LANGUAGES,
  ACCREDITED_MEDICAL_SCHOOLS,
  RECOGNIZED_BOARDS
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

const verificationDocumentSchema = new Schema({
  document_type: {
    type: String,
    enum: ['license', 'degree', 'certification', 'insurance']
  },
  document_url: String,
  verification_status: {
    type: String,
    enum: ['pending', 'verified', 'rejected'],
    default: 'pending'
  }
}, { _id: false });

const providerSchema = new Schema({
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
  specialization: {
    type: String,
    required: true,
    trim: true,
    minlength: 3,
    maxlength: 100,
    enum: SPECIALIZATIONS
  },
  license_number: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    uppercase: true,
    minlength: 6,
    maxlength: 20,
    match: /^[A-Z0-9]+$/
  },
  years_of_experience: {
    type: Number,
    required: true,
    min: 0,
    max: 50,
    validate: {
      validator: Number.isInteger,
      message: 'Years of experience must be a whole number'
    }
  },
  clinic_address: addressSchema,
  verification_status: {
    type: String,
    enum: ['pending', 'verified', 'rejected'],
    default: 'pending'
  },
  is_active: {
    type: Boolean,
    default: true
  },
  medical_school: {
    type: String,
    trim: true,
    maxlength: 200,
    enum: ACCREDITED_MEDICAL_SCHOOLS,
    required: false
  },
  board_certifications: [{
    type: String,
    trim: true,
    maxlength: 100,
    enum: RECOGNIZED_BOARDS
  }],
  languages_spoken: [{
    type: String,
    trim: true,
    maxlength: 50,
    enum: SUPPORTED_LANGUAGES
  }],
  verification_documents: [verificationDocumentSchema],
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
  verification_completed_at: Date
});

// Indexes
providerSchema.index({ email: 1 }, { unique: true });
providerSchema.index({ phone_number: 1 }, { unique: true });
providerSchema.index({ license_number: 1 }, { unique: true });
providerSchema.index({ verification_status: 1 });
providerSchema.index({ specialization: 1 });
providerSchema.index({ is_active: 1 });
providerSchema.index({ created_at: -1 });
providerSchema.index({ specialization: 1, verification_status: 1 });
providerSchema.index({ 'clinic_address.state': 1, specialization: 1 });

module.exports = mongoose.model('Provider', providerSchema); 