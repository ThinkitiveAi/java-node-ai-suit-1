const express = require('express');
const router = express.Router();
const patientController = require('../controllers/patientController');
const { authenticateToken, authorizeRole } = require('../middleware/patientAuthentication');
const { registrationRateLimiter, globalRegistrationRateLimiter, emailAttemptLimiter } = require('../middleware/rateLimiter');
const { bruteForceProtection, loginRateLimiter } = require('../middleware/patientBruteForce');
const { validatePatientRegistration, validatePatientLogin, validatePatientUpdate } = require('../validation/patientValidation');

// Patient Registration
router.post('/register', 
  globalRegistrationRateLimiter, 
  registrationRateLimiter, 
  emailAttemptLimiter,
  (req, res, next) => {
    const { error, value } = validatePatientRegistration(req.body);
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
  },
  patientController.registerPatient
);

// Patient Login
router.post('/login',
  loginRateLimiter,
  bruteForceProtection,
  (req, res, next) => {
    const { error, value } = validatePatientLogin(req.body);
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
  },
  patientController.loginPatient
);

// Patient Logout (requires authentication)
router.post('/logout',
  authenticateToken,
  authorizeRole(['patient', 'admin']),
  patientController.logoutPatient
);

// Refresh Token
router.post('/refresh-token',
  patientController.refreshToken
);

// Email Verification
router.post('/verify-email',
  authenticateToken,
  authorizeRole(['patient']),
  patientController.verifyEmail
);

// Resend Verification Email
router.post('/resend-verification',
  patientController.resendVerificationEmail
);

// Get Onboarding Status (requires authentication)
router.get('/onboarding/status',
  authenticateToken,
  authorizeRole(['patient']),
  patientController.getOnboardingStatus
);

// Get Patient by ID (requires authentication)
router.get('/:id',
  authenticateToken,
  authorizeRole(['patient', 'admin']),
  patientController.getPatientById
);

// Update Patient (requires authentication)
router.put('/:id',
  authenticateToken,
  authorizeRole(['patient', 'admin']),
  (req, res, next) => {
    const { error, value } = validatePatientUpdate(req.body);
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
  },
  patientController.updatePatient
);

// Delete Patient (soft delete, requires authentication)
router.delete('/:id',
  authenticateToken,
  authorizeRole(['admin']),
  patientController.deletePatient
);

// Get All Patients (admin only)
router.get('/',
  authenticateToken,
  authorizeRole(['admin']),
  patientController.getAllPatients
);

module.exports = router; 