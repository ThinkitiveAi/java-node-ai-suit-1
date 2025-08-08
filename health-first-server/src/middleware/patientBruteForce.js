const Patient = require('../models/Patient');
const NodeCache = require('node-cache');

// Cache for storing failed login attempts
const failedAttemptsCache = new NodeCache({ stdTTL: 3600 }); // 1 hour TTL
const MAX_FAILED_ATTEMPTS = 5;
const LOCKOUT_DURATION = 15 * 60 * 1000; // 15 minutes in milliseconds

/**
 * Brute force protection middleware for patient login attempts
 */
const bruteForceProtection = async (req, res, next) => {
  const { email } = req.body;
  const clientIP = req.ip || req.connection.remoteAddress;
  const cacheKey = `patient_login_attempts_${email}_${clientIP}`;
  
  try {
    // Check if account is locked
    const patient = await Patient.findOne({ email: email.toLowerCase() });
    if (patient && patient.locked_until && patient.locked_until > Date.now()) {
      const remainingTime = Math.ceil((patient.locked_until - Date.now()) / 1000 / 60);
      return res.status(423).json({
        success: false,
        message: `Account is temporarily locked due to too many failed attempts. Please try again in ${remainingTime} minutes.`,
        error_code: 'ACCOUNT_LOCKED',
        locked_until: patient.locked_until,
        timestamp: new Date().toISOString(),
        request_id: req.headers['x-request-id'] || null
      });
    }

    // Check failed attempts from cache
    const failedAttempts = failedAttemptsCache.get(cacheKey) || 0;
    
    if (failedAttempts >= MAX_FAILED_ATTEMPTS) {
      // Lock the account in database
      if (patient) {
        patient.locked_until = new Date(Date.now() + LOCKOUT_DURATION);
        await patient.save();
      }
      
      return res.status(423).json({
        success: false,
        message: 'Too many failed login attempts. Account locked for 15 minutes.',
        error_code: 'ACCOUNT_LOCKED',
        locked_until: new Date(Date.now() + LOCKOUT_DURATION),
        timestamp: new Date().toISOString(),
        request_id: req.headers['x-request-id'] || null
      });
    }

    // Add tracking function to response
    req._trackFailedAttempt = () => {
      const currentAttempts = failedAttemptsCache.get(cacheKey) || 0;
      failedAttemptsCache.set(cacheKey, currentAttempts + 1);
    };

    req._clearFailedAttempts = () => {
      failedAttemptsCache.del(cacheKey);
    };

    next();
  } catch (error) {
    console.error('Patient brute force protection error:', error);
    next();
  }
};

/**
 * Rate limiting middleware for patient login attempts
 */
const loginRateLimiter = (req, res, next) => {
  const clientIP = req.ip || req.connection.remoteAddress;
  const cacheKey = `patient_login_rate_${clientIP}`;
  
  const attempts = failedAttemptsCache.get(cacheKey) || 0;
  
  if (attempts >= 10) { // Max 10 login attempts per hour per IP
    return res.status(429).json({
      success: false,
      message: 'Too many login attempts from this IP. Please try again later.',
      error_code: 'RATE_LIMIT_EXCEEDED',
      timestamp: new Date().toISOString(),
      request_id: req.headers['x-request-id'] || null
    });
  }
  
  req._trackLoginAttempt = () => {
    const currentAttempts = failedAttemptsCache.get(cacheKey) || 0;
    failedAttemptsCache.set(cacheKey, currentAttempts + 1, 3600); // 1 hour TTL
  };
  
  next();
};

module.exports = {
  bruteForceProtection,
  loginRateLimiter
}; 