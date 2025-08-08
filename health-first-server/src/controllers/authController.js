const { validateProviderLogin } = require('../validation/authValidation');
const { validateCredentials } = require('../services/authService');
const { generateAccessToken, generateRefreshToken } = require('../utils/jwtUtils');
const { v4: uuidv4 } = require('uuid');

const loginProvider = async (req, res, next) => {
  const request_id = uuidv4();
  
  try {
    // 1. Validate input (already done in middleware)
    const { email, password, remember_me, device_info } = req.body;

    // 2. Track login attempt for rate limiting
    if (req._trackLoginAttempt) {
      req._trackLoginAttempt();
    }

    // 3. Validate credentials
    const provider = await validateCredentials(email, password);

    // 4. Clear failed attempts on successful login
    if (req._clearFailedAttempts) {
      req._clearFailedAttempts();
    }

    // 5. Generate tokens
    const tokenPayload = {
      providerId: provider._id,
      email: provider.email,
      role: 'provider'
    };

    const accessToken = generateAccessToken(tokenPayload);
    const refreshToken = generateRefreshToken(tokenPayload);

    // 6. Update last login info
    provider.last_login_at = new Date();
    provider.last_login_ip = req.ip || req.connection.remoteAddress;
    if (device_info) {
      provider.last_device_info = device_info;
    }
    await provider.save();

    // 7. Success response
    const response = {
      success: true,
      message: 'Login successful',
      data: {
        access_token: accessToken,
        refresh_token: refreshToken,
        token_type: 'Bearer',
        expires_in: 24 * 60 * 60, // 24 hours in seconds
        provider: {
          id: provider._id,
          email: provider.email,
          first_name: provider.first_name,
          last_name: provider.last_name,
          specialization: provider.specialization,
          verification_status: provider.verification_status,
          is_active: provider.is_active
        }
      },
      timestamp: new Date().toISOString(),
      request_id
    };

    // 8. Set refresh token in HTTP-only cookie if remember_me is true
    if (remember_me) {
      res.cookie('refresh_token', refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
      });
    }

    return res.status(200).json(response);

  } catch (error) {
    // Track failed attempt
    if (req._trackFailedAttempt) {
      req._trackFailedAttempt();
    }

    // Handle specific error types
    switch (error.code) {
      case 'INVALID_CREDENTIALS':
        return res.status(401).json({
          success: false,
          message: 'Invalid email or password',
          error_code: 'INVALID_CREDENTIALS',
          timestamp: new Date().toISOString(),
          request_id
        });

      case 'ACCOUNT_SUSPENDED':
        return res.status(423).json({
          success: false,
          message: error.message,
          error_code: 'ACCOUNT_SUSPENDED',
          timestamp: new Date().toISOString(),
          request_id
        });

      case 'ACCOUNT_NOT_VERIFIED':
        return res.status(403).json({
          success: false,
          message: error.message,
          error_code: 'ACCOUNT_NOT_VERIFIED',
          data: error.data,
          timestamp: new Date().toISOString(),
          request_id
        });

      case 'ACCOUNT_LOCKED':
        return res.status(423).json({
          success: false,
          message: error.message,
          error_code: 'ACCOUNT_LOCKED',
          locked_until: error.locked_until,
          timestamp: new Date().toISOString(),
          request_id
        });

      default:
        return res.status(500).json({
          success: false,
          message: 'Internal server error during login',
          error_id: 'ERR_LOGIN_001',
          timestamp: new Date().toISOString(),
          request_id
        });
    }
  }
};

/**
 * Refresh access token using refresh token
 */
const refreshToken = async (req, res, next) => {
  const request_id = uuidv4();
  
  try {
    const { refresh_token } = req.body;
    const cookieRefreshToken = req.cookies?.refresh_token;

    const token = refresh_token || cookieRefreshToken;

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Refresh token is required',
        error_code: 'MISSING_REFRESH_TOKEN',
        timestamp: new Date().toISOString(),
        request_id
      });
    }

    // Verify refresh token
    const { verifyToken } = require('../utils/jwtUtils');
    const decoded = verifyToken(token);

    if (decoded.type !== 'refresh') {
      return res.status(401).json({
        success: false,
        message: 'Invalid token type',
        error_code: 'INVALID_TOKEN_TYPE',
        timestamp: new Date().toISOString(),
        request_id
      });
    }

    // Check if provider still exists and is active
    const Provider = require('../models/Provider');
    const provider = await Provider.findById(decoded.providerId);
    
    if (!provider || !provider.is_active) {
      return res.status(401).json({
        success: false,
        message: 'Provider not found or inactive',
        error_code: 'PROVIDER_NOT_FOUND',
        timestamp: new Date().toISOString(),
        request_id
      });
    }

    // Generate new tokens
    const tokenPayload = {
      providerId: provider._id,
      email: provider.email,
      role: 'provider'
    };

    const newAccessToken = generateAccessToken(tokenPayload);
    const newRefreshToken = generateRefreshToken(tokenPayload);

    // Update cookie if it was used
    if (cookieRefreshToken) {
      res.cookie('refresh_token', newRefreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Token refreshed successfully',
      data: {
        access_token: newAccessToken,
        refresh_token: newRefreshToken,
        token_type: 'Bearer',
        expires_in: 24 * 60 * 60 // 24 hours in seconds
      },
      timestamp: new Date().toISOString(),
      request_id
    });

  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Invalid or expired refresh token',
      error_code: 'INVALID_REFRESH_TOKEN',
      timestamp: new Date().toISOString(),
      request_id
    });
  }
};

/**
 * Logout provider
 */
const logoutProvider = async (req, res, next) => {
  const request_id = uuidv4();
  
  try {
    // Clear refresh token cookie
    res.clearCookie('refresh_token');
    
    return res.status(200).json({
      success: true,
      message: 'Logout successful',
      timestamp: new Date().toISOString(),
      request_id
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Internal server error during logout',
      error_id: 'ERR_LOGOUT_001',
      timestamp: new Date().toISOString(),
      request_id
    });
  }
};

module.exports = { 
  loginProvider, 
  refreshToken, 
  logoutProvider 
};
