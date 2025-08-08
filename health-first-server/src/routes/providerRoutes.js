const express = require('express');
const router = express.Router();
const {
  registerProvider,
  getProviders,
  getProviderById,
  updateProvider,
  softDeleteProvider,
  verifyEmail,
  resendVerificationEmail,
  getOnboardingStatus
} = require('../controllers/providerController');
const { loginProvider, refreshToken, logoutProvider } = require('../controllers/authController');
const { validateProviderRegistrationMiddleware } = require('../middleware/validation');
const { validateProviderLogin } = require('../validation/authValidation');
const { registrationRateLimiter, globalRegistrationRateLimiter, emailAttemptLimiter } = require('../middleware/rateLimiter');
const { bruteForceProtection, loginRateLimiter } = require('../middleware/bruteForce');
const { authenticateToken, requireVerifiedProvider } = require('../middleware/authentication');

// Registration and verification routes
router.post('/register', globalRegistrationRateLimiter, registrationRateLimiter, emailAttemptLimiter, validateProviderRegistrationMiddleware, registerProvider);
router.post('/verify-email', verifyEmail);
router.post('/resend-verification', resendVerificationEmail);

// Authentication routes
router.post('/login', loginRateLimiter, bruteForceProtection, (req, res, next) => {
  const { error, value } = validateProviderLogin(req.body);
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
}, loginProvider);

router.post('/refresh-token', refreshToken);
router.post('/logout', authenticateToken, logoutProvider);

// Onboarding routes
router.get('/onboarding/status', authenticateToken, getOnboardingStatus);

// Protected provider management routes
router.get('/', authenticateToken, requireVerifiedProvider, getProviders);
router.get('/:id', authenticateToken, requireVerifiedProvider, getProviderById);
router.put('/:id', authenticateToken, requireVerifiedProvider, updateProvider);
router.delete('/:id', authenticateToken, requireVerifiedProvider, softDeleteProvider);

module.exports = router; 