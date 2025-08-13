const Joi = require('joi');

const appointmentSchema = Joi.object({
  patientId: Joi.string()
    .required()
    .messages({
      'any.required': 'Patient ID is required'
    }),
  providerId: Joi.string()
    .required()
    .messages({
      'any.required': 'Provider ID is required'
    }),
  appointmentDate: Joi.date()
    .min('now')
    .required()
    .messages({
      'date.base': 'Appointment date must be a valid date',
      'date.min': 'Appointment date cannot be in the past',
      'any.required': 'Appointment date is required'
    }),
  startTime: Joi.string()
    .pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .required()
    .messages({
      'string.pattern.base': 'Start time must be in HH:MM format',
      'any.required': 'Start time is required'
    }),
  endTime: Joi.string()
    .pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .required()
    .messages({
      'string.pattern.base': 'End time must be in HH:MM format',
      'any.required': 'End time is required'
    }),
  duration: Joi.number()
    .integer()
    .min(15)
    .max(480)
    .custom((value, helpers) => {
      if (value % 15 !== 0) {
        return helpers.error('any.invalid');
      }
      return value;
    })
    .messages({
      'number.base': 'Duration must be a number',
      'number.integer': 'Duration must be a whole number',
      'number.min': 'Duration must be at least 15 minutes',
      'number.max': 'Duration must be at most 480 minutes (8 hours)',
      'any.invalid': 'Duration must be in 15-minute increments'
    }),
  appointmentType: Joi.string()
    .valid('consultation', 'follow-up', 'emergency', 'routine', 'specialist')
    .required()
    .messages({
      'any.only': 'Appointment type must be one of: consultation, follow-up, emergency, routine, specialist',
      'any.required': 'Appointment type is required'
    }),
  appointmentMode: Joi.string()
    .valid('in-person', 'video-call', 'home')
    .default('in-person')
    .messages({
      'any.only': 'Appointment mode must be one of: in-person, video-call, home'
    }),
  notes: Joi.string()
    .max(1000)
    .optional()
    .messages({
      'string.max': 'Notes cannot exceed 1000 characters'
    }),
  reasonForVisit: Joi.string()
    .max(500)
    .required()
    .messages({
      'string.max': 'Reason for visit cannot exceed 500 characters',
      'any.required': 'Reason for visit is required'
    }),
  estimatedAmount: Joi.number()
    .min(0)
    .default(0)
    .messages({
      'number.base': 'Estimated amount must be a number',
      'number.min': 'Estimated amount cannot be negative'
    }),
  timezone: Joi.string()
    .default('UTC')
    .required()
});

const updateAppointmentSchema = Joi.object({
  appointmentDate: Joi.date()
    .min('now')
    .optional()
    .messages({
      'date.base': 'Appointment date must be a valid date',
      'date.min': 'Appointment date cannot be in the past'
    }),
  startTime: Joi.string()
    .pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .optional()
    .messages({
      'string.pattern.base': 'Start time must be in HH:MM format'
    }),
  endTime: Joi.string()
    .pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .optional()
    .messages({
      'string.pattern.base': 'End time must be in HH:MM format'
    }),
  duration: Joi.number()
    .integer()
    .min(15)
    .max(480)
    .custom((value, helpers) => {
      if (value % 15 !== 0) {
        return helpers.error('any.invalid');
      }
      return value;
    })
    .optional()
    .messages({
      'number.base': 'Duration must be a number',
      'number.integer': 'Duration must be a whole number',
      'number.min': 'Duration must be at least 15 minutes',
      'number.max': 'Duration must be at most 480 minutes (8 hours)',
      'any.invalid': 'Duration must be in 15-minute increments'
    }),
  status: Joi.string()
    .valid('scheduled', 'confirmed', 'checked-in', 'in-exam', 'completed', 'cancelled', 'no-show')
    .optional()
    .messages({
      'any.only': 'Status must be one of: scheduled, confirmed, checked-in, in-exam, completed, cancelled, no-show'
    }),
  appointmentType: Joi.string()
    .valid('consultation', 'follow-up', 'emergency', 'routine', 'specialist')
    .optional()
    .messages({
      'any.only': 'Appointment type must be one of: consultation, follow-up, emergency, routine, specialist'
    }),
  appointmentMode: Joi.string()
    .valid('in-person', 'video-call', 'home')
    .optional()
    .messages({
      'any.only': 'Appointment mode must be one of: in-person, video-call, home'
    }),
  notes: Joi.string()
    .max(1000)
    .optional()
    .messages({
      'string.max': 'Notes cannot exceed 1000 characters'
    }),
  providerNotes: Joi.string()
    .max(1000)
    .optional()
    .messages({
      'string.max': 'Provider notes cannot exceed 1000 characters'
    }),
  reasonForVisit: Joi.string()
    .max(500)
    .optional()
    .messages({
      'string.max': 'Reason for visit cannot exceed 500 characters'
    }),
  estimatedAmount: Joi.number()
    .min(0)
    .optional()
    .messages({
      'number.base': 'Estimated amount must be a number',
      'number.min': 'Estimated amount cannot be negative'
    })
});

const cancelAppointmentSchema = Joi.object({
  cancellationReason: Joi.string()
    .max(500)
    .required()
    .messages({
      'string.max': 'Cancellation reason cannot exceed 500 characters',
      'any.required': 'Cancellation reason is required'
    }),
  cancelledBy: Joi.string()
    .valid('patient', 'provider', 'system')
    .required()
    .messages({
      'any.only': 'Cancelled by must be one of: patient, provider, system',
      'any.required': 'Cancelled by is required'
    })
});

const getAppointmentsSchema = Joi.object({
  providerId: Joi.string()
    .optional(),
  patientId: Joi.string()
    .optional(),
  status: Joi.string()
    .valid('scheduled', 'confirmed', 'checked-in', 'in-exam', 'completed', 'cancelled', 'no-show')
    .optional(),
  startDate: Joi.date()
    .optional(),
  endDate: Joi.date()
    .optional(),
  appointmentType: Joi.string()
    .valid('consultation', 'follow-up', 'emergency', 'routine', 'specialist')
    .optional(),
  page: Joi.number()
    .integer()
    .min(1)
    .default(1),
  limit: Joi.number()
    .integer()
    .min(1)
    .max(100)
    .default(10),
  search: Joi.string()
    .max(100)
    .optional()
});

module.exports = {
  appointmentSchema,
  updateAppointmentSchema,
  cancelAppointmentSchema,
  getAppointmentsSchema
}; 