const Joi = require('joi');
const { SPECIALIZATIONS, US_STATES, SUPPORTED_LANGUAGES, ACCREDITED_MEDICAL_SCHOOLS, RECOGNIZED_BOARDS } = require('../utils/constants');

const passwordComplexity = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+{}\[\]|;:,.<>?]).{8,}$/;
const namePattern = /^[a-zA-Z\s'-]+$/;
const phonePattern = /^\+[1-9]\d{9,14}$/;
const licensePattern = /^[A-Z0-9]+$/;
const zipPattern = /^\d{5}(-\d{4})?$/;
const emailPattern = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;

const providerRegistrationSchema = Joi.object({
  first_name: Joi.string().trim().min(2).max(50).pattern(namePattern).required(),
  last_name: Joi.string().trim().min(2).max(50).pattern(namePattern).required(),
  email: Joi.string().trim().lowercase().max(254).pattern(emailPattern).required(),
  phone_number: Joi.string().trim().pattern(phonePattern).required(),
  password: Joi.string().min(8).pattern(passwordComplexity).required(),
  confirm_password: Joi.any().valid(Joi.ref('password')).required().messages({'any.only': 'Passwords do not match'}),
  specialization: Joi.string().trim().valid(...SPECIALIZATIONS).required(),
  license_number: Joi.string().trim().uppercase().min(6).max(20).pattern(licensePattern).required(),
  years_of_experience: Joi.number().integer().min(0).max(50).required(),
  clinic_address: Joi.object({
    street: Joi.string().trim().min(1).max(200).required(),
    city: Joi.string().trim().max(100).pattern(namePattern).required(),
    state: Joi.string().trim().uppercase().valid(...US_STATES).required(),
    zip: Joi.string().trim().pattern(zipPattern).required()
  }).required(),
  medical_school: Joi.string().trim().max(200).valid(...ACCREDITED_MEDICAL_SCHOOLS),
  board_certifications: Joi.array().items(Joi.string().trim().max(100).valid(...RECOGNIZED_BOARDS)),
  languages_spoken: Joi.array().items(Joi.string().trim().max(50).valid(...SUPPORTED_LANGUAGES))
});

function validateProviderRegistration(data) {
  return providerRegistrationSchema.validate(data, { abortEarly: false, stripUnknown: true });
}

module.exports = { validateProviderRegistration }; 