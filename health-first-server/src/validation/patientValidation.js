const Joi = require('joi');
const { US_STATES, BLOOD_TYPES, GENDER_OPTIONS, INSURANCE_PROVIDERS } = require('../utils/constants');

// Patient Registration Validation
const validatePatientRegistration = (data) => {
  const schema = Joi.object({
    first_name: Joi.string()
      .min(2)
      .max(50)
      .pattern(/^[a-zA-Z\s'-]+$/)
      .required()
      .messages({
        'string.pattern.base': 'First name can only contain letters, spaces, hyphens, and apostrophes',
        'string.min': 'First name must be at least 2 characters long',
        'string.max': 'First name cannot exceed 50 characters',
        'any.required': 'First name is required'
      }),

    last_name: Joi.string()
      .min(2)
      .max(50)
      .pattern(/^[a-zA-Z\s'-]+$/)
      .required()
      .messages({
        'string.pattern.base': 'Last name can only contain letters, spaces, hyphens, and apostrophes',
        'string.min': 'Last name must be at least 2 characters long',
        'string.max': 'Last name cannot exceed 50 characters',
        'any.required': 'Last name is required'
      }),

    email: Joi.string()
      .email()
      .max(254)
      .required()
      .messages({
        'string.email': 'Please provide a valid email address',
        'string.max': 'Email cannot exceed 254 characters',
        'any.required': 'Email is required'
      }),

    phone_number: Joi.string()
      .pattern(/^\+?[1-9]\d{1,14}$/)
      .required()
      .messages({
        'string.pattern.base': 'Please provide a valid phone number',
        'any.required': 'Phone number is required'
      }),

    password: Joi.string()
      .min(8)
      .max(128)
      .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
      .required()
      .messages({
        'string.pattern.base': 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character',
        'string.min': 'Password must be at least 8 characters long',
        'string.max': 'Password cannot exceed 128 characters',
        'any.required': 'Password is required'
      }),

    date_of_birth: Joi.date()
      .max('now')
      .required()
      .messages({
        'date.max': 'Date of birth cannot be in the future',
        'any.required': 'Date of birth is required'
      }),

    gender: Joi.string()
      .valid(...GENDER_OPTIONS)
      .required()
      .messages({
        'any.only': 'Please select a valid gender option',
        'any.required': 'Gender is required'
      }),

    blood_type: Joi.string()
      .valid(...BLOOD_TYPES)
      .optional()
      .messages({
        'any.only': 'Please select a valid blood type'
      }),

    height: Joi.number()
      .integer()
      .min(30)
      .max(300)
      .optional()
      .messages({
        'number.base': 'Height must be a number',
        'number.integer': 'Height must be a whole number',
        'number.min': 'Height must be at least 30 cm',
        'number.max': 'Height cannot exceed 300 cm'
      }),

    weight: Joi.number()
      .positive()
      .max(500)
      .optional()
      .messages({
        'number.base': 'Weight must be a number',
        'number.positive': 'Weight must be a positive number',
        'number.max': 'Weight cannot exceed 500 kg'
      }),

    address: Joi.object({
      street: Joi.string()
        .max(200)
        .required()
        .messages({
          'string.max': 'Street address cannot exceed 200 characters',
          'any.required': 'Street address is required'
        }),

      city: Joi.string()
        .max(100)
        .pattern(/^[a-zA-Z\s'-]+$/)
        .required()
        .messages({
          'string.pattern.base': 'City name can only contain letters, spaces, hyphens, and apostrophes',
          'string.max': 'City name cannot exceed 100 characters',
          'any.required': 'City is required'
        }),

      state: Joi.string()
        .valid(...US_STATES)
        .required()
        .messages({
          'any.only': 'Please select a valid US state',
          'any.required': 'State is required'
        }),

      zip: Joi.string()
        .pattern(/^\d{5}(-\d{4})?$/)
        .required()
        .messages({
          'string.pattern.base': 'Please provide a valid ZIP code',
          'any.required': 'ZIP code is required'
        })
    }).required(),

    preferred_language: Joi.string()
      .valid('English', 'Spanish', 'French', 'Mandarin', 'Hindi', 'Arabic', 'Russian', 'Portuguese', 'Bengali', 'German')
      .default('English')
      .optional()
      .messages({
        'any.only': 'Please select a supported language'
      })
  });

  return schema.validate(data, { abortEarly: false });
};

// Patient Login Validation
const validatePatientLogin = (data) => {
  const schema = Joi.object({
    email: Joi.string()
      .email()
      .required()
      .messages({
        'string.email': 'Please provide a valid email address',
        'any.required': 'Email is required'
      }),

    password: Joi.string()
      .required()
      .messages({
        'any.required': 'Password is required'
      })
  });

  return schema.validate(data, { abortEarly: false });
};

// Patient Update Validation
const validatePatientUpdate = (data) => {
  const schema = Joi.object({
    first_name: Joi.string()
      .min(2)
      .max(50)
      .pattern(/^[a-zA-Z\s'-]+$/)
      .optional()
      .messages({
        'string.pattern.base': 'First name can only contain letters, spaces, hyphens, and apostrophes',
        'string.min': 'First name must be at least 2 characters long',
        'string.max': 'First name cannot exceed 50 characters'
      }),

    last_name: Joi.string()
      .min(2)
      .max(50)
      .pattern(/^[a-zA-Z\s'-]+$/)
      .optional()
      .messages({
        'string.pattern.base': 'Last name can only contain letters, spaces, hyphens, and apostrophes',
        'string.min': 'Last name must be at least 2 characters long',
        'string.max': 'Last name cannot exceed 50 characters'
      }),

    phone_number: Joi.string()
      .pattern(/^\+?[1-9]\d{1,14}$/)
      .optional()
      .messages({
        'string.pattern.base': 'Please provide a valid phone number'
      }),

    date_of_birth: Joi.date()
      .max('now')
      .optional()
      .messages({
        'date.max': 'Date of birth cannot be in the future'
      }),

    gender: Joi.string()
      .valid(...GENDER_OPTIONS)
      .optional()
      .messages({
        'any.only': 'Please select a valid gender option'
      }),

    blood_type: Joi.string()
      .valid(...BLOOD_TYPES)
      .optional()
      .messages({
        'any.only': 'Please select a valid blood type'
      }),

    height: Joi.number()
      .integer()
      .min(30)
      .max(300)
      .optional()
      .messages({
        'number.base': 'Height must be a number',
        'number.integer': 'Height must be a whole number',
        'number.min': 'Height must be at least 30 cm',
        'number.max': 'Height cannot exceed 300 cm'
      }),

    weight: Joi.number()
      .positive()
      .max(500)
      .optional()
      .messages({
        'number.base': 'Weight must be a number',
        'number.positive': 'Weight must be a positive number',
        'number.max': 'Weight cannot exceed 500 kg'
      }),

    address: Joi.object({
      street: Joi.string()
        .max(200)
        .optional()
        .messages({
          'string.max': 'Street address cannot exceed 200 characters'
        }),

      city: Joi.string()
        .max(100)
        .pattern(/^[a-zA-Z\s'-]+$/)
        .optional()
        .messages({
          'string.pattern.base': 'City name can only contain letters, spaces, hyphens, and apostrophes',
          'string.max': 'City name cannot exceed 100 characters'
        }),

      state: Joi.string()
        .valid(...US_STATES)
        .optional()
        .messages({
          'any.only': 'Please select a valid US state'
        }),

      zip: Joi.string()
        .pattern(/^\d{5}(-\d{4})?$/)
        .optional()
        .messages({
          'string.pattern.base': 'Please provide a valid ZIP code'
        })
    }).optional(),

    emergency_contacts: Joi.array().items(
      Joi.object({
        name: Joi.string()
          .min(2)
          .max(100)
          .pattern(/^[a-zA-Z\s'-]+$/)
          .required()
          .messages({
            'string.pattern.base': 'Contact name can only contain letters, spaces, hyphens, and apostrophes',
            'string.min': 'Contact name must be at least 2 characters long',
            'string.max': 'Contact name cannot exceed 100 characters',
            'any.required': 'Contact name is required'
          }),

        relationship: Joi.string()
          .max(50)
          .required()
          .messages({
            'string.max': 'Relationship cannot exceed 50 characters',
            'any.required': 'Relationship is required'
          }),

        phone_number: Joi.string()
          .pattern(/^\+?[1-9]\d{1,14}$/)
          .required()
          .messages({
            'string.pattern.base': 'Please provide a valid phone number',
            'any.required': 'Phone number is required'
          }),

        email: Joi.string()
          .email()
          .max(254)
          .optional()
          .messages({
            'string.email': 'Please provide a valid email address',
            'string.max': 'Email cannot exceed 254 characters'
          })
      })
    ).optional(),

    insurance: Joi.array().items(
      Joi.object({
        provider: Joi.string()
          .valid(...INSURANCE_PROVIDERS)
          .required()
          .messages({
            'any.only': 'Please select a valid insurance provider',
            'any.required': 'Insurance provider is required'
          }),

        policy_number: Joi.string()
          .max(50)
          .required()
          .messages({
            'string.max': 'Policy number cannot exceed 50 characters',
            'any.required': 'Policy number is required'
          }),

        group_number: Joi.string()
          .max(50)
          .optional()
          .messages({
            'string.max': 'Group number cannot exceed 50 characters'
          }),

        is_primary: Joi.boolean()
          .default(true)
          .optional()
      })
    ).optional(),

    medical_history: Joi.array().items(
      Joi.object({
        condition: Joi.string()
          .max(200)
          .required()
          .messages({
            'string.max': 'Medical condition cannot exceed 200 characters',
            'any.required': 'Medical condition is required'
          }),

        diagnosis_date: Joi.date()
          .max('now')
          .optional()
          .messages({
            'date.max': 'Diagnosis date cannot be in the future'
          }),

        is_active: Joi.boolean()
          .default(true)
          .optional(),

        medications: Joi.array().items(
          Joi.object({
            name: Joi.string()
              .max(100)
              .required()
              .messages({
                'string.max': 'Medication name cannot exceed 100 characters',
                'any.required': 'Medication name is required'
              }),

            dosage: Joi.string()
              .max(50)
              .optional()
              .messages({
                'string.max': 'Dosage cannot exceed 50 characters'
              }),

            frequency: Joi.string()
              .max(50)
              .optional()
              .messages({
                'string.max': 'Frequency cannot exceed 50 characters'
              })
          })
        ).optional()
      })
    ).optional(),

    allergies: Joi.array()
      .items(Joi.string().max(200))
      .optional()
      .messages({
        'array.base': 'Allergies must be an array',
        'string.max': 'Allergy description cannot exceed 200 characters'
      }),

    preferred_language: Joi.string()
      .valid('English', 'Spanish', 'French', 'Mandarin', 'Hindi', 'Arabic', 'Russian', 'Portuguese', 'Bengali', 'German')
      .optional()
      .messages({
        'any.only': 'Please select a supported language'
      })
  });

  return schema.validate(data, { abortEarly: false });
};

module.exports = {
  validatePatientRegistration,
  validatePatientLogin,
  validatePatientUpdate
}; 