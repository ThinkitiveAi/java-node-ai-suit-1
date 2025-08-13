const { validateProviderRegistration } = require('../validation/providerValidation');

const validateProviderRegistrationMiddleware = (req, res, next) => {
  const { error, value } = validateProviderRegistration(req.body);
  if (error) {
    return res.status(422).json({
      success: false,
      message: 'Validation failed',
      errors: error.details.map(e => ({
        field: e.path.join('.'),
        message: e.message,
        value: e.context.value
      })),
      timestamp: new Date().toISOString(),
      request_id: req.headers['x-request-id'] || null
    });
  }
  req.body = value;
  next();
};

// Generic validation middleware
const validateRequest = (schema, source = 'body') => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req[source]);
    if (error) {
      return res.status(422).json({
        success: false,
        message: 'Validation failed',
        errors: error.details.map(e => ({
          field: e.path.join('.'),
          message: e.message,
          value: e.context.value
        })),
        timestamp: new Date().toISOString(),
        request_id: req.headers['x-request-id'] || null
      });
    }
    req[source] = value;
    next();
  };
};

module.exports = { 
  validateProviderRegistrationMiddleware,
  validateRequest
}; 