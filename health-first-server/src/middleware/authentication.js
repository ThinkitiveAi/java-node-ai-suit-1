const { verifyToken } = require('../utils/jwtUtils');
const Provider = require('../models/Provider');

/**
 * Authentication middleware to verify JWT token
 */
const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access token is required',
        error_code: 'MISSING_TOKEN',
        timestamp: new Date().toISOString(),
        request_id: req.headers['x-request-id'] || null
      });
    }

    // Verify token
    const decoded = verifyToken(token);
    
    // Check if token is access token
    if (decoded.type !== 'access') {
      return res.status(401).json({
        success: false,
        message: 'Invalid token type',
        error_code: 'INVALID_TOKEN_TYPE',
        timestamp: new Date().toISOString(),
        request_id: req.headers['x-request-id'] || null
      });
    }

    // Check if provider still exists and is active
    const provider = await Provider.findById(decoded.providerId);
    if (!provider) {
      return res.status(401).json({
        success: false,
        message: 'Provider not found',
        error_code: 'PROVIDER_NOT_FOUND',
        timestamp: new Date().toISOString(),
        request_id: req.headers['x-request-id'] || null
      });
    }

    if (!provider.is_active) {
      return res.status(401).json({
        success: false,
        message: 'Account has been suspended',
        error_code: 'ACCOUNT_SUSPENDED',
        timestamp: new Date().toISOString(),
        request_id: req.headers['x-request-id'] || null
      });
    }

    // Add provider info to request
    req.provider = {
      id: provider._id,
      email: provider.email,
      first_name: provider.first_name,
      last_name: provider.last_name,
      specialization: provider.specialization,
      verification_status: provider.verification_status,
      role: decoded.role
    };

    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Invalid or expired token',
      error_code: 'INVALID_TOKEN',
      timestamp: new Date().toISOString(),
      request_id: req.headers['x-request-id'] || null
    });
  }
};

/**
 * Optional authentication middleware (doesn't fail if no token)
 */
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return next(); // Continue without authentication
    }

    const decoded = verifyToken(token);
    const provider = await Provider.findById(decoded.providerId);
    
    if (provider && provider.is_active) {
      req.provider = {
        id: provider._id,
        email: provider.email,
        first_name: provider.first_name,
        last_name: provider.last_name,
        specialization: provider.specialization,
        verification_status: provider.verification_status,
        role: decoded.role
      };
    }

    next();
  } catch (error) {
    // Continue without authentication on token error
    next();
  }
};

/**
 * Verify that provider is verified
 */
const requireVerifiedProvider = (req, res, next) => {
  if (!req.provider) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required',
      error_code: 'AUTHENTICATION_REQUIRED',
      timestamp: new Date().toISOString(),
      request_id: req.headers['x-request-id'] || null
    });
  }

  if (req.provider.verification_status !== 'verified') {
    return res.status(403).json({
      success: false,
      message: 'Account must be verified to access this resource',
      error_code: 'VERIFICATION_REQUIRED',
      verification_status: req.provider.verification_status,
      timestamp: new Date().toISOString(),
      request_id: req.headers['x-request-id'] || null
    });
  }

  next();
};

module.exports = {
  authenticateToken,
  optionalAuth,
  requireVerifiedProvider
};
