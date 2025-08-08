const rateLimit = require('express-rate-limit');

// Per-IP rate limit: 5 requests per hour
const registrationRateLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5,
  message: {
    success: false,
    message: 'Too many registration attempts. Please try again in 15 minutes.',
    retry_after: 900
  },
  standardHeaders: true,
  legacyHeaders: false
});

// Global rate limit: 1000 requests per hour
const globalRegistrationRateLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 1000,
  keyGenerator: () => 'global',
  message: {
    success: false,
    message: 'Too many registrations globally. Please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false
});

// Per-email rate limit: 3 failed attempts per day (simple in-memory store)
const emailAttempts = {};
const emailAttemptLimiter = (req, res, next) => {
  const email = req.body.email;
  if (!email) return next();
  const now = Date.now();
  if (!emailAttempts[email]) {
    emailAttempts[email] = [];
  }
  // Remove attempts older than 24h
  emailAttempts[email] = emailAttempts[email].filter(ts => now - ts < 24 * 60 * 60 * 1000);
  if (emailAttempts[email].length >= 3) {
    return res.status(429).json({
      success: false,
      message: 'Too many failed registration attempts for this email. Please try again tomorrow.',
      retry_after: 86400
    });
  }
  req._trackEmailAttempt = () => {
    emailAttempts[email].push(now);
  };
  next();
};

module.exports = {
  registrationRateLimiter,
  globalRegistrationRateLimiter,
  emailAttemptLimiter
}; 