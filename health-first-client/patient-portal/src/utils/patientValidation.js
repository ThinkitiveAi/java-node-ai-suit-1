// Patient-specific validation utilities
export const validateEmail = (email) => {
  if (!email || !email.trim()) {
    return { isValid: false, message: 'Email is required' };
  }
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email.trim())) {
    return { isValid: false, message: 'Please enter a valid email address' };
  }
  
  return { isValid: true, message: '' };
};

export const validatePassword = (password) => {
  if (!password) {
    return { isValid: false, message: 'Password is required' };
  }
  
  if (password.length < 8) {
    return { isValid: false, message: 'Password must be at least 8 characters long' };
  }
  
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumbers = /\d/.test(password);
  const hasNonalphas = /\W/.test(password);
  
  if (!hasUpperCase) {
    return { isValid: false, message: 'Password must contain at least one uppercase letter' };
  }
  
  if (!hasLowerCase) {
    return { isValid: false, message: 'Password must contain at least one lowercase letter' };
  }
  
  if (!hasNumbers) {
    return { isValid: false, message: 'Password must contain at least one number' };
  }
  
  if (!hasNonalphas) {
    return { isValid: false, message: 'Password must contain at least one special character' };
  }
  
  return { isValid: true, message: '' };
};

export const validatePasswordMatch = (password, confirmPassword) => {
  if (!confirmPassword) {
    return { isValid: false, message: 'Please confirm your password' };
  }
  
  if (password !== confirmPassword) {
    return { isValid: false, message: 'Passwords do not match' };
  }
  
  return { isValid: true, message: '' };
};

export const validateName = (name, fieldName = 'Name') => {
  if (!name || !name.trim()) {
    return { isValid: false, message: `${fieldName} is required` };
  }
  
  const trimmedName = name.trim();
  if (trimmedName.length < 2) {
    return { isValid: false, message: `${fieldName} must be at least 2 characters long` };
  }
  
  if (trimmedName.length > 50) {
    return { isValid: false, message: `${fieldName} must be less than 50 characters long` };
  }
  
  const nameRegex = /^[a-zA-Z\s'-]+$/;
  if (!nameRegex.test(trimmedName)) {
    return { isValid: false, message: `${fieldName} can only contain letters, spaces, hyphens, and apostrophes` };
  }
  
  return { isValid: true, message: '' };
};

export const validatePhoneNumber = (phoneNumber) => {
  if (!phoneNumber || !phoneNumber.trim()) {
    return { isValid: false, message: 'Phone number is required' };
  }
  
  // Remove all non-digit characters for validation
  const digitsOnly = phoneNumber.replace(/\D/g, '');
  
  if (digitsOnly.length < 10) {
    return { isValid: false, message: 'Phone number must be at least 10 digits' };
  }
  
  if (digitsOnly.length > 15) {
    return { isValid: false, message: 'Phone number must be less than 15 digits' };
  }
  
  return { isValid: true, message: '' };
};

export const validateDateOfBirth = (dateOfBirth) => {
  if (!dateOfBirth) {
    return { isValid: false, message: 'Date of birth is required' };
  }
  
  const birthDate = new Date(dateOfBirth);
  const today = new Date();
  
  // Check if date is valid
  if (isNaN(birthDate.getTime())) {
    return { isValid: false, message: 'Please enter a valid date of birth' };
  }
  
  // Check if date is in the future
  if (birthDate > today) {
    return { isValid: false, message: 'Date of birth cannot be in the future' };
  }
  
  // Calculate age
  const age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  const dayDiff = today.getDate() - birthDate.getDate();
  
  const actualAge = age - (monthDiff < 0 || (monthDiff === 0 && dayDiff < 0) ? 1 : 0);
  
  // Check minimum age requirement (13 years)
  if (actualAge < 13) {
    return { isValid: false, message: 'You must be at least 13 years old to register' };
  }
  
  // Check maximum reasonable age (150 years)
  if (actualAge > 150) {
    return { isValid: false, message: 'Please enter a valid date of birth' };
  }
  
  return { isValid: true, message: '' };
};

export const validateGender = (gender) => {
  const validGenders = ['male', 'female', 'other', 'prefer_not_to_say'];
  
  if (!gender) {
    return { isValid: false, message: 'Gender selection is required' };
  }
  
  if (!validGenders.includes(gender)) {
    return { isValid: false, message: 'Please select a valid gender option' };
  }
  
  return { isValid: true, message: '' };
};

export const validateAddress = (address, fieldName = 'Address') => {
  if (!address || !address.trim()) {
    return { isValid: false, message: `${fieldName} is required` };
  }
  
  const trimmed = address.trim();
  if (trimmed.length < 3) {
    return { isValid: false, message: `${fieldName} must be at least 3 characters long` };
  }
  
  const maxLengths = {
    'Street': 200,
    'City': 100,
    'State': 50,
    'ZIP': 10
  };
  
  const maxLength = maxLengths[fieldName] || 200;
  if (trimmed.length > maxLength) {
    return { isValid: false, message: `${fieldName} must be less than ${maxLength} characters long` };
  }
  
  return { isValid: true, message: '' };
};

export const validateZipCode = (zipCode) => {
  if (!zipCode || !zipCode.trim()) {
    return { isValid: false, message: 'ZIP code is required' };
  }
  
  const trimmed = zipCode.trim();
  // Support US ZIP codes (5 digits or 5+4 format)
  const zipRegex = /^\d{5}(-\d{4})?$/;
  
  if (!zipRegex.test(trimmed)) {
    return { isValid: false, message: 'Please enter a valid ZIP code (e.g., 12345 or 12345-6789)' };
  }
  
  return { isValid: true, message: '' };
};

// Optional field validations (for emergency contact and insurance)
export const validateOptionalName = (name, fieldName = 'Name') => {
  if (!name || !name.trim()) {
    return { isValid: true, message: '' }; // Optional field
  }
  
  return validateName(name, fieldName);
};

export const validateOptionalPhoneNumber = (phoneNumber) => {
  if (!phoneNumber || !phoneNumber.trim()) {
    return { isValid: true, message: '' }; // Optional field
  }
  
  return validatePhoneNumber(phoneNumber);
};

export const validateOptionalText = (text, fieldName = 'Field', maxLength = 100) => {
  if (!text || !text.trim()) {
    return { isValid: true, message: '' }; // Optional field
  }
  
  const trimmed = text.trim();
  if (trimmed.length > maxLength) {
    return { isValid: false, message: `${fieldName} must be less than ${maxLength} characters long` };
  }
  
  return { isValid: true, message: '' };
};

export const validateRelationship = (relationship) => {
  return validateOptionalText(relationship, 'Relationship', 50);
};

export const validateInsuranceProvider = (provider) => {
  return validateOptionalText(provider, 'Insurance provider', 100);
};

export const validatePolicyNumber = (policyNumber) => {
  if (!policyNumber || !policyNumber.trim()) {
    return { isValid: true, message: '' }; // Optional field
  }
  
  const trimmed = policyNumber.trim();
  const alphanumericRegex = /^[a-zA-Z0-9-]+$/;
  
  if (!alphanumericRegex.test(trimmed)) {
    return { isValid: false, message: 'Policy number can only contain letters, numbers, and hyphens' };
  }
  
  if (trimmed.length > 50) {
    return { isValid: false, message: 'Policy number must be less than 50 characters long' };
  }
  
  return { isValid: true, message: '' };
};

export const validateMedicalHistory = (medicalHistory) => {
  if (!medicalHistory || !medicalHistory.trim()) {
    return { isValid: true, message: '' }; // Optional field
  }
  
  const trimmed = medicalHistory.trim();
  if (trimmed.length > 1000) {
    return { isValid: false, message: 'Medical history must be less than 1000 characters long' };
  }
  
  return { isValid: true, message: '' };
};

// Password strength indicator
export const getPasswordStrength = (password) => {
  if (!password) return { score: 0, label: '', color: 'grey' };
  
  let score = 0;
  const checks = {
    length: password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    numbers: /\d/.test(password),
    special: /\W/.test(password),
    longLength: password.length >= 12
  };
  
  Object.values(checks).forEach(check => {
    if (check) score++;
  });
  
  if (score <= 2) return { score, label: 'Weak', color: 'error' };
  if (score <= 4) return { score, label: 'Medium', color: 'warning' };
  return { score, label: 'Strong', color: 'success' };
};

// Format phone number for display
export const formatPhoneNumber = (phoneNumber) => {
  if (!phoneNumber) return '';
  
  const digitsOnly = phoneNumber.replace(/\D/g, '');
  
  if (digitsOnly.length === 10) {
    return `(${digitsOnly.slice(0, 3)}) ${digitsOnly.slice(3, 6)}-${digitsOnly.slice(6)}`;
  }
  
  if (digitsOnly.length === 11 && digitsOnly.startsWith('1')) {
    return `+1 (${digitsOnly.slice(1, 4)}) ${digitsOnly.slice(4, 7)}-${digitsOnly.slice(7)}`;
  }
  
  return phoneNumber;
};

// Calculate age from date of birth
export const calculateAge = (dateOfBirth) => {
  if (!dateOfBirth) return null;
  
  const birthDate = new Date(dateOfBirth);
  const today = new Date();
  
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  
  return age;
};

// Sanitize input
export const sanitizeInput = (input) => {
  if (typeof input !== 'string') return '';
  return input.trim().replace(/[<>]/g, '');
}; 