const Joi = require('joi');

const breakTimeSchema = Joi.object({
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
    })
});

const availabilitySchema = Joi.object({
  providerId: Joi.string()
    .required()
    .messages({
      'any.required': 'Provider ID is required'
    }),
  dayOfWeek: Joi.number()
    .integer()
    .min(0)
    .max(6)
    .required()
    .messages({
      'number.base': 'Day of week must be a number',
      'number.integer': 'Day of week must be a whole number',
      'number.min': 'Day of week must be between 0 and 6',
      'number.max': 'Day of week must be between 0 and 6',
      'any.required': 'Day of week is required'
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
  isRecurring: Joi.boolean()
    .default(true),
  specificDate: Joi.date()
    .when('isRecurring', {
      is: false,
      then: Joi.required(),
      otherwise: Joi.forbidden()
    }),
  slotDuration: Joi.number()
    .integer()
    .min(15)
    .max(120)
    .default(30)
    .custom((value, helpers) => {
      if (value % 15 !== 0) {
        return helpers.error('any.invalid');
      }
      return value;
    })
    .messages({
      'number.base': 'Slot duration must be a number',
      'number.integer': 'Slot duration must be a whole number',
      'number.min': 'Slot duration must be at least 15 minutes',
      'number.max': 'Slot duration must be at most 120 minutes',
      'any.invalid': 'Slot duration must be in 15-minute increments'
    }),
  breakTimes: Joi.array()
    .items(breakTimeSchema)
    .default([]),
  isActive: Joi.boolean()
    .default(true),
  timezone: Joi.string()
    .default('UTC')
    .required()
});

const bulkAvailabilitySchema = Joi.object({
  providerId: Joi.string()
    .required()
    .messages({
      'any.required': 'Provider ID is required'
    }),
  availabilities: Joi.array()
    .items(availabilitySchema)
    .min(1)
    .max(7)
    .required()
    .messages({
      'array.min': 'At least one availability must be provided',
      'array.max': 'Maximum 7 availabilities allowed (one per day)',
      'any.required': 'Availabilities array is required'
    }),
  timezone: Joi.string()
    .default('UTC')
});

const blockDaySchema = Joi.object({
  providerId: Joi.string()
    .required()
    .messages({
      'any.required': 'Provider ID is required'
    }),
  date: Joi.date()
    .required()
    .messages({
      'any.required': 'Date is required'
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
  reason: Joi.string()
    .max(200)
    .optional()
});

const getAvailableSlotsSchema = Joi.object({
  providerId: Joi.string()
    .required()
    .messages({
      'any.required': 'Provider ID is required'
    }),
  date: Joi.date()
    .required()
    .messages({
      'any.required': 'Date is required'
    }),
  timezone: Joi.string()
    .default('UTC')
});

module.exports = {
  availabilitySchema,
  bulkAvailabilitySchema,
  blockDaySchema,
  getAvailableSlotsSchema
}; 