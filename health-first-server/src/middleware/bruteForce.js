const Provider = require('../models/Provider');
const NodeCache = require('node-cache');

// Cache for storing failed login attempts
const failedAttemptsCache = new NodeCache({ stdTTL: 3600 }); // 1 hour TTL
const MAX_FAILED_ATTEMPTS = 5;
const LOCKOUT_DURATION = 15 * 60 * 1000; // 15 minutes in milliseconds

/**
 * Brute force protection middleware for login attempts
 */
const bruteForceProtection = async (req, res, next) => {
  const { email } = req.body;
  const clientIP = req.ip || req.connection.remoteAddress;
  const cacheKey = `login_attempts_${email}_${clientIP}`;
  
  try {
    // Check if account is locked
    const provider = await Provider.findOne({ email: email.toLowerCase() });
    if (provider && provider.locked_until && provider.locked_until > Date.now()) {
      const remainingTime = Math.ceil((provider.locked_until - Date.now()) / 1000 / 60);
      return res.status(423).json({
        success: false,
        message: `Account is temporarily locked due to too many failed attempts. Please try again in ${remainingTime} minutes.`,
        error_code: 'ACCOUNT_LOCKED',
        locked_until: provider.locked_until,
        timestamp: new Date().toISOString(),
        request_id: req.headers['x-request-id'] || null
      });
    }

    // Check failed attempts from cache
    const failedAttempts = failedAttemptsCache.get(cacheKey) || 0;
    
    if (failedAttempts >= MAX_FAILED_ATTEMPTS) {
      // Lock the account in database
      if (provider) {
        provider.locked_until = new Date(Date.now() + LOCKOUT_DURATION);
        await provider.save();
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
    console.error('Brute force protection error:', error);
    next();
  }
};

/**
 * Rate limiting middleware for login attempts
 */
const loginRateLimiter = (req, res, next) => {
  const clientIP = req.ip || req.connection.remoteAddress;
  const cacheKey = `login_rate_${clientIP}`;
  
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
