const { verifyToken } = require('../utils/jwtUtils');
const Patient = require('../models/Patient');

/**
 * Authentication middleware to verify JWT token for patients
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

    // Check if patient still exists and is active
    const patient = await Patient.findById(decoded.patientId);
    if (!patient) {
      return res.status(401).json({
        success: false,
        message: 'Patient not found',
        error_code: 'PATIENT_NOT_FOUND',
        timestamp: new Date().toISOString(),
        request_id: req.headers['x-request-id'] || null
      });
    }

    if (!patient.is_active) {
      return res.status(401).json({
        success: false,
        message: 'Account has been suspended',
        error_code: 'ACCOUNT_SUSPENDED',
        timestamp: new Date().toISOString(),
        request_id: req.headers['x-request-id'] || null
      });
    }

    // Add patient info to request
    req.user = {
      patientId: patient._id,
      email: patient.email,
      first_name: patient.first_name,
      last_name: patient.last_name,
      verification_status: patient.verification_status,
      onboarding_status: patient.onboarding_status,
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
    const patient = await Patient.findById(decoded.patientId);
    
    if (patient && patient.is_active) {
      req.user = {
        patientId: patient._id,
        email: patient.email,
        first_name: patient.first_name,
        last_name: patient.last_name,
        verification_status: patient.verification_status,
        onboarding_status: patient.onboarding_status,
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
 * Verify that patient is verified
 */
const requireVerifiedPatient = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required',
      error_code: 'AUTHENTICATION_REQUIRED',
      timestamp: new Date().toISOString(),
      request_id: req.headers['x-request-id'] || null
    });
  }

  if (req.user.verification_status !== 'verified') {
    return res.status(403).json({
      success: false,
      message: 'Account must be verified to access this resource',
      error_code: 'VERIFICATION_REQUIRED',
      verification_status: req.user.verification_status,
      timestamp: new Date().toISOString(),
      request_id: req.headers['x-request-id'] || null
    });
  }

  next();
};

/**
 * Role-based authorization middleware
 */
const authorizeRole = (allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required',
        error_code: 'AUTHENTICATION_REQUIRED',
        timestamp: new Date().toISOString(),
        request_id: req.headers['x-request-id'] || null
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Insufficient permissions',
        error_code: 'INSUFFICIENT_PERMISSIONS',
        required_roles: allowedRoles,
        user_role: req.user.role,
        timestamp: new Date().toISOString(),
        request_id: req.headers['x-request-id'] || null
      });
    }

    next();
  };
};

module.exports = {
  authenticateToken,
  optionalAuth,
  requireVerifiedPatient,
  authorizeRole
}; 