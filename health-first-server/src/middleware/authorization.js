const authorizeRole = (allowedRoles = []) => {
  return (req, res, next) => {
    // Ensure authentication has occurred
    if (!req.provider) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required',
        error_code: 'AUTHENTICATION_REQUIRED',
        timestamp: new Date().toISOString(),
        request_id: req.headers['x-request-id'] || null
      });
    }

    const userRole = req.provider.role || 'provider';

    // Admin bypasses role checks
    if (userRole === 'admin') {
      return next();
    }

    if (!Array.isArray(allowedRoles) || allowedRoles.length === 0) {
      return next();
    }

    if (!allowedRoles.includes(userRole)) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to perform this action',
        error_code: 'ACCESS_DENIED',
        required_roles: allowedRoles,
        timestamp: new Date().toISOString(),
        request_id: req.headers['x-request-id'] || null
      });
    }

    next();
  };
};

module.exports = { authorizeRole };
