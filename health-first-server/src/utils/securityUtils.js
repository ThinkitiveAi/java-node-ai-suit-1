const { v4: uuidv4 } = require('uuid');
const sanitize = require('mongo-sanitize');

/**
 * Generate a unique request ID for tracking
 * @returns {string} Unique request ID
 */
const generateRequestId = () => {
  return uuidv4();
};

/**
 * Sanitize input data to prevent NoSQL injection
 * @param {Object} data - Input data to sanitize
 * @returns {Object} Sanitized data
 */
const sanitizeInput = (data) => {
  return sanitize(data);
};

/**
 * Generate a secure random string
 * @param {number} length - Length of the string
 * @returns {string} Random string
 */
const generateRandomString = (length = 32) => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

/**
 * Validate email format
 * @param {string} email - Email to validate
 * @returns {boolean} True if valid email
 */
const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validate phone number format
 * @param {string} phone - Phone number to validate
 * @returns {boolean} True if valid phone number
 */
const isValidPhone = (phone) => {
  const phoneRegex = /^\+?[1-9]\d{1,14}$/;
  return phoneRegex.test(phone);
};

/**
 * Mask sensitive data for logging
 * @param {string} data - Data to mask
 * @param {string} type - Type of data (email, phone, etc.)
 * @returns {string} Masked data
 */
const maskSensitiveData = (data, type = 'default') => {
  if (!data) return '';
  
  switch (type) {
    case 'email':
      const [local, domain] = data.split('@');
      return `${local.charAt(0)}***@${domain}`;
    case 'phone':
      return data.replace(/(\d{3})\d{3}(\d{4})/, '$1***$2');
    case 'ssn':
      return data.replace(/(\d{3})\d{2}(\d{4})/, '$1-**-$2');
    default:
      return data.length > 4 ? `${data.substring(0, 2)}***${data.substring(data.length - 2)}` : '***';
  }
};

module.exports = {
  generateRequestId,
  sanitizeInput,
  generateRandomString,
  isValidEmail,
  isValidPhone,
  maskSensitiveData
};
