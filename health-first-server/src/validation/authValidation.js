const Joi = require('joi');

const deviceInfoSchema = Joi.object({
  device_name: Joi.string().max(100),
  device_type: Joi.string().valid('mobile', 'tablet', 'desktop'),
  browser: Joi.string().max(100),
  os: Joi.string().max(100)
});

const providerLoginSchema = Joi.object({
  email: Joi.string().trim().lowercase().max(254).email().required(),
  password: Joi.string().min(1).max(128).required(),
  remember_me: Joi.boolean().default(false),
  device_info: deviceInfoSchema.optional()
});

function validateProviderLogin(data) {
  return providerLoginSchema.validate(data, { abortEarly: false, stripUnknown: true });
}

module.exports = { validateProviderLogin };
