const Provider = require('../models/Provider');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

async function validateCredentials(email, password) {
  // 1. Find provider by email (case-insensitive)
  const provider = await Provider.findOne({ email: email.toLowerCase() }).select('+password_hash');
  if (!provider) {
    const error = new Error('Invalid email or password');
    error.code = 'INVALID_CREDENTIALS';
    throw error;
  }
  // 2. Check is_active
  if (!provider.is_active) {
    const error = new Error('Account has been suspended. Please contact support.');
    error.code = 'ACCOUNT_SUSPENDED';
    throw error;
  }
  // 3. Check verification_status
  if (provider.verification_status !== 'verified') {
    const error = new Error('Account is not verified. Please check your email for verification instructions.');
    error.code = 'ACCOUNT_NOT_VERIFIED';
    error.data = {
      verification_status: provider.verification_status,
      verification_email_sent: true // Assume always sent for now
    };
    throw error;
  }
  // 4. Check lock status
  if (provider.locked_until && provider.locked_until > Date.now()) {
    const error = new Error('Too many failed login attempts. Account temporarily locked.');
    error.code = 'ACCOUNT_LOCKED';
    error.locked_until = provider.locked_until;
    throw error;
  }
  // 5. Compare password
  const match = await bcrypt.compare(password, provider.password_hash);
  if (!match) {
    const error = new Error('Invalid email or password');
    error.code = 'INVALID_CREDENTIALS';
    throw error;
  }
  return provider;
}

/**
 * Hash password using bcrypt
 * @param {string} password - Plain text password
 * @returns {Promise<string>} Hashed password
 */
async function hashPassword(password) {
  const saltRounds = parseInt(process.env.BCRYPT_SALT_ROUNDS) || 12;
  return await bcrypt.hash(password, saltRounds);
}

/**
 * Generate verification token
 * @returns {Promise<string>} Verification token
 */
async function generateVerificationToken() {
  return uuidv4();
}

module.exports = { 
  validateCredentials,
  hashPassword,
  generateVerificationToken
};

