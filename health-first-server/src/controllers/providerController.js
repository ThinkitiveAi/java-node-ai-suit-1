const Provider = require('../models/Provider');
const bcrypt = require('bcryptjs');
const nodemailer = require('nodemailer');
const { SPECIALIZATIONS } = require('../utils/constants');
const { v4: uuidv4 } = require('uuid');
const commonPasswords = require('../utils/commonPasswords.json'); // Assume this file exists for password blacklist
const sanitize = require('mongo-sanitize');
require('dotenv').config();

// Email service setup
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD
  }
});

// Store verification tokens (in production, use Redis or database)
const verificationTokens = new Map();

const registerProvider = async (req, res, next) => {
  const request_id = uuidv4();
  try {
    // 1. Sanitize input
    let data = sanitize(req.body);
    Object.keys(data).forEach(k => {
      if (typeof data[k] === 'string') data[k] = data[k].trim();
    });
    data.email = data.email.toLowerCase();
    data.license_number = data.license_number.toUpperCase();
    data.clinic_address.state = data.clinic_address.state.toUpperCase();

    // 2. Check for duplicates
    const [emailExists, phoneExists, licenseExists] = await Promise.all([
      Provider.findOne({ email: data.email }),
      Provider.findOne({ phone_number: data.phone_number }),
      Provider.findOne({ license_number: data.license_number })
    ]);
    if (emailExists) {
      if (req._trackEmailAttempt) req._trackEmailAttempt();
      return res.status(409).json({
        success: false,
        message: 'Provider with this email already exists',
        error_code: 'DUPLICATE_EMAIL',
        timestamp: new Date().toISOString(),
        request_id
      });
    }
    if (phoneExists) {
      return res.status(409).json({
        success: false,
        message: 'Provider with this phone number already exists',
        error_code: 'DUPLICATE_PHONE',
        timestamp: new Date().toISOString(),
        request_id
      });
    }
    if (licenseExists) {
      return res.status(409).json({
        success: false,
        message: 'Provider with this license number already exists',
        error_code: 'DUPLICATE_LICENSE',
        timestamp: new Date().toISOString(),
        request_id
      });
    }

    // 3. Password security
    if (commonPasswords.includes(data.password)) {
      if (req._trackEmailAttempt) req._trackEmailAttempt();
      return res.status(422).json({
        success: false,
        message: 'Validation failed',
        errors: [{ field: 'password', message: 'Password is too common', value: null }],
        timestamp: new Date().toISOString(),
        request_id
      });
    }
    const nameParts = (data.first_name + ' ' + data.last_name).toLowerCase().split(/\s+/);
    if (nameParts.some(part => data.password.toLowerCase().includes(part)) || data.password.toLowerCase().includes(data.email)) {
      if (req._trackEmailAttempt) req._trackEmailAttempt();
      return res.status(422).json({
        success: false,
        message: 'Validation failed',
        errors: [{ field: 'password', message: 'Password must not contain your name or email', value: null }],
        timestamp: new Date().toISOString(),
        request_id
      });
    }
    const saltRounds = parseInt(process.env.BCRYPT_SALT_ROUNDS) || 12;
    const password_hash = await bcrypt.hash(data.password, saltRounds);

    // 4. Save provider (atomic)
    const provider = new Provider({
      ...data,
      password_hash,
      verification_status: 'pending',
      is_active: true,
      created_at: new Date(),
      updated_at: new Date()
    });
    await provider.save();

    // 5. Generate and store verification token
    const verificationToken = uuidv4();
    verificationTokens.set(verificationToken, {
      providerId: provider._id,
      email: provider.email,
      createdAt: Date.now()
    });

    // 6. Send verification email (mocked in tests)
    const verificationLink = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/verify?token=${verificationToken}&email=${encodeURIComponent(data.email)}`;
    await transporter.sendMail({
      from: process.env.SMTP_USER || 'no-reply@test.local',
      to: data.email,
      subject: 'Complete Your Provider Registration',
      html: `<p>Verify your email: <a href="${verificationLink}">${verificationLink}</a></p>`
    });

    // 7. Success response
    return res.status(201).json({
      success: true,
      message: 'Provider registered successfully. Verification email sent.',
      data: {
        provider_id: provider._id,
        email: provider.email,
        first_name: provider.first_name,
        last_name: provider.last_name,
        specialization: provider.specialization,
        verification_status: provider.verification_status,
        created_at: provider.created_at
      }
    });
  } catch (err) {
    if (req._trackEmailAttempt) req._trackEmailAttempt();
    // 7. Error response
    return res.status(500).json({
      success: false,
      message: 'Internal server error during registration',
      error_id: 'ERR_REG_001',
      timestamp: new Date().toISOString(),
      request_id
    });
  }
};

/**
 * Verify email address
 */
const verifyEmail = async (req, res, next) => {
  const request_id = uuidv4();
  
  try {
    const { token, email } = req.body;
    
    if (!token || !email) {
      return res.status(400).json({
        success: false,
        message: 'Token and email are required',
        error_code: 'MISSING_PARAMETERS',
        timestamp: new Date().toISOString(),
        request_id
      });
    }

    // Check if token exists and is valid
    const tokenData = verificationTokens.get(token);
    if (!tokenData) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired verification token',
        error_code: 'INVALID_TOKEN',
        timestamp: new Date().toISOString(),
        request_id
      });
    }

    // Check if token is expired (24 hours)
    const tokenAge = Date.now() - tokenData.createdAt;
    if (tokenAge > 24 * 60 * 60 * 1000) {
      verificationTokens.delete(token);
      return res.status(400).json({
        success: false,
        message: 'Verification token has expired',
        error_code: 'TOKEN_EXPIRED',
        timestamp: new Date().toISOString(),
        request_id
      });
    }

    // Check if email matches
    if (tokenData.email.toLowerCase() !== email.toLowerCase()) {
      return res.status(400).json({
        success: false,
        message: 'Email does not match verification token',
        error_code: 'EMAIL_MISMATCH',
        timestamp: new Date().toISOString(),
        request_id
      });
    }

    // Find and update provider
    const provider = await Provider.findById(tokenData.providerId);
    if (!provider) {
      return res.status(404).json({
        success: false,
        message: 'Provider not found',
        error_code: 'PROVIDER_NOT_FOUND',
        timestamp: new Date().toISOString(),
        request_id
      });
    }

    if (provider.verification_status === 'verified') {
      return res.status(400).json({
        success: false,
        message: 'Email is already verified',
        error_code: 'ALREADY_VERIFIED',
        timestamp: new Date().toISOString(),
        request_id
      });
    }

    // Update verification status
    provider.verification_status = 'verified';
    provider.email_verified_at = new Date();
    provider.updated_at = new Date();
    await provider.save();

    // Remove token from storage
    verificationTokens.delete(token);

    // Send welcome email (temporarily disabled for testing)
    // TODO: Uncomment when SMTP is configured
    /*
    await transporter.sendMail({
      from: process.env.SMTP_USER,
      to: provider.email,
      subject: 'Email Verified - Welcome to Healthcare Platform',
      html: `<p>Dear Dr. ${provider.first_name} ${provider.last_name},</p>
<p>Congratulations! Your email has been successfully verified.</p>
<p>Your account is now ready for the next steps:</p>
<p>1. Complete your profile information<br>2. Upload required documents (license, certifications)<br>3. Submit for admin approval<br>4. Start providing healthcare services</p>
<p>You can now log in to your account and complete the onboarding process.</p>
<p>Best regards,<br>Healthcare Platform Team</p>`
    });
    */
    console.log('Welcome email would be sent to:', provider.email);

    return res.status(200).json({
      success: true,
      message: 'Email verified successfully',
      data: {
        provider_id: provider._id,
        email: provider.email,
        verification_status: provider.verification_status,
        email_verified_at: provider.email_verified_at
      },
      timestamp: new Date().toISOString(),
      request_id
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Internal server error during email verification',
      error_id: 'ERR_VERIFY_001',
      timestamp: new Date().toISOString(),
      request_id
    });
  }
};

/**
 * Resend verification email
 */
const resendVerificationEmail = async (req, res, next) => {
  const request_id = uuidv4();
  
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email is required',
        error_code: 'MISSING_EMAIL',
        timestamp: new Date().toISOString(),
        request_id
      });
    }

    // Find provider
    const provider = await Provider.findOne({ email: email.toLowerCase() });
    if (!provider) {
      return res.status(404).json({
        success: false,
        message: 'Provider not found',
        error_code: 'PROVIDER_NOT_FOUND',
        timestamp: new Date().toISOString(),
        request_id
      });
    }

    if (provider.verification_status === 'verified') {
      return res.status(400).json({
        success: false,
        message: 'Email is already verified',
        error_code: 'ALREADY_VERIFIED',
        timestamp: new Date().toISOString(),
        request_id
      });
    }

    // Generate new verification token
    const verificationToken = uuidv4();
    verificationTokens.set(verificationToken, {
      providerId: provider._id,
      email: provider.email,
      createdAt: Date.now()
    });

    // Send verification email (temporarily disabled for testing)
    const verificationLink = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/verify?token=${verificationToken}&email=${encodeURIComponent(provider.email)}`;
    // TODO: Uncomment when SMTP is configured
    /*
    await transporter.sendMail({
      from: process.env.SMTP_USER,
      to: provider.email,
      subject: 'Verify Your Email - Healthcare Platform',
      html: `<p>Dear Dr. ${provider.first_name} ${provider.last_name},</p>
<p>You requested a new verification email.</p>
<p>Please verify your email address by clicking the link below:</p>
<p><a href="${verificationLink}">${verificationLink}</a></p>
<p>If you didn't request this email, please ignore it.</p>
<p>Best regards,<br>Healthcare Platform Team</p>`
    });
    */
    console.log('Resend verification email would be sent to:', provider.email);
    console.log('Verification link:', verificationLink);

    return res.status(200).json({
      success: true,
      message: 'Verification email sent successfully',
      timestamp: new Date().toISOString(),
      request_id
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Internal server error while sending verification email',
      error_id: 'ERR_RESEND_001',
      timestamp: new Date().toISOString(),
      request_id
    });
  }
};

/**
 * Get onboarding status for authenticated provider
 */
const getOnboardingStatus = async (req, res, next) => {
  const request_id = uuidv4();
  
  try {
    const providerId = req.provider.id;
    const provider = await Provider.findById(providerId);
    
    if (!provider) {
      return res.status(404).json({
        success: false,
        message: 'Provider not found',
        error_code: 'PROVIDER_NOT_FOUND',
        timestamp: new Date().toISOString(),
        request_id
      });
    }

    // Calculate onboarding progress
    const onboardingSteps = {
      email_verified: provider.verification_status === 'verified',
      profile_completed: !!(provider.first_name && provider.last_name && provider.specialization),
      documents_uploaded: provider.verification_documents && provider.verification_documents.length > 0,
      admin_approved: provider.verification_status === 'approved',
      is_active: provider.is_active
    };

    const completedSteps = Object.values(onboardingSteps).filter(Boolean).length;
    const totalSteps = Object.keys(onboardingSteps).length;
    const progressPercentage = Math.round((completedSteps / totalSteps) * 100);

    // Determine current step
    let currentStep = 'registration';
    if (onboardingSteps.email_verified) {
      currentStep = 'profile_completion';
    }
    if (onboardingSteps.profile_completed) {
      currentStep = 'document_upload';
    }
    if (onboardingSteps.documents_uploaded) {
      currentStep = 'admin_review';
    }
    if (onboardingSteps.admin_approved) {
      currentStep = 'completed';
    }

    return res.status(200).json({
      success: true,
      message: 'Onboarding status retrieved successfully',
      data: {
        provider_id: provider._id,
        email: provider.email,
        verification_status: provider.verification_status,
        onboarding_steps: onboardingSteps,
        progress_percentage: progressPercentage,
        current_step: currentStep,
        next_steps: getNextSteps(currentStep, onboardingSteps),
        created_at: provider.created_at,
        email_verified_at: provider.email_verified_at
      },
      timestamp: new Date().toISOString(),
      request_id
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Internal server error while retrieving onboarding status',
      error_id: 'ERR_ONBOARDING_001',
      timestamp: new Date().toISOString(),
      request_id
    });
  }
};

/**
 * Helper function to determine next steps
 */
function getNextSteps(currentStep, onboardingSteps) {
  const steps = [];
  
  if (currentStep === 'registration') {
    steps.push('Verify your email address');
  }
  
  if (currentStep === 'profile_completion' || currentStep === 'registration') {
    if (!onboardingSteps.profile_completed) {
      steps.push('Complete your profile information');
    }
  }
  
  if (currentStep === 'document_upload' || currentStep === 'profile_completion') {
    if (!onboardingSteps.documents_uploaded) {
      steps.push('Upload required documents (license, certifications)');
    }
  }
  
  if (currentStep === 'admin_review' || currentStep === 'document_upload') {
    if (!onboardingSteps.admin_approved) {
      steps.push('Wait for admin approval');
    }
  }
  
  if (currentStep === 'completed') {
    steps.push('Start providing healthcare services');
  }
  
  return steps;
}

/**
 * Get all providers (with filtering and pagination)
 */
const getProviders = async (req, res, next) => {
  const request_id = uuidv4();
  
  try {
    const { page = 1, limit = 10, specialization, verification_status, search } = req.query;
    const skip = (page - 1) * limit;
    
    // Build filter object
    const filter = { is_deleted: { $ne: true } };
    
    if (specialization) {
      filter.specialization = specialization;
    }
    
    if (verification_status) {
      filter.verification_status = verification_status;
    }
    
    if (search) {
      filter.$or = [
        { first_name: { $regex: search, $options: 'i' } },
        { last_name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { license_number: { $regex: search, $options: 'i' } }
      ];
    }
    
    // Get providers with pagination
    const providers = await Provider.find(filter)
      .select('-password_hash')
      .sort({ created_at: -1 })
      .skip(skip)
      .limit(parseInt(limit));
    
    const total = await Provider.countDocuments(filter);
    
    return res.status(200).json({
      success: true,
      message: 'Providers retrieved successfully',
      data: {
        providers,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      },
      timestamp: new Date().toISOString(),
      request_id
    });
    
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Internal server error while retrieving providers',
      error_id: 'ERR_GET_PROVIDERS_001',
      timestamp: new Date().toISOString(),
      request_id
    });
  }
};

/**
 * Get provider by ID
 */
const getProviderById = async (req, res, next) => {
  const request_id = uuidv4();
  
  try {
    const { id } = req.params;
    const provider = await Provider.findById(id).select('-password_hash');
    
    if (!provider) {
      return res.status(404).json({
        success: false,
        message: 'Provider not found',
        error_code: 'PROVIDER_NOT_FOUND',
        timestamp: new Date().toISOString(),
        request_id
      });
    }
    
    if (provider.is_deleted) {
      return res.status(404).json({
        success: false,
        message: 'Provider not found',
        error_code: 'PROVIDER_NOT_FOUND',
        timestamp: new Date().toISOString(),
        request_id
      });
    }
    
    return res.status(200).json({
      success: true,
      message: 'Provider retrieved successfully',
      data: { provider },
      timestamp: new Date().toISOString(),
      request_id
    });
    
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Internal server error while retrieving provider',
      error_id: 'ERR_GET_PROVIDER_001',
      timestamp: new Date().toISOString(),
      request_id
    });
  }
};

/**
 * Update provider
 */
const updateProvider = async (req, res, next) => {
  const request_id = uuidv4();
  
  try {
    const { id } = req.params;
    const updateData = sanitize(req.body);
    
    // Remove sensitive fields that shouldn't be updated
    delete updateData.password_hash;
    delete updateData.email;
    delete updateData.verification_status;
    delete updateData.is_active;
    delete updateData.is_deleted;
    delete updateData.created_at;
    
    // Add updated_at timestamp
    updateData.updated_at = new Date();
    
    const provider = await Provider.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    ).select('-password_hash');
    
    if (!provider) {
      return res.status(404).json({
        success: false,
        message: 'Provider not found',
        error_code: 'PROVIDER_NOT_FOUND',
        timestamp: new Date().toISOString(),
        request_id
      });
    }
    
    return res.status(200).json({
      success: true,
      message: 'Provider updated successfully',
      data: { provider },
      timestamp: new Date().toISOString(),
      request_id
    });
    
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Internal server error while updating provider',
      error_id: 'ERR_UPDATE_PROVIDER_001',
      timestamp: new Date().toISOString(),
      request_id
    });
  }
};

/**
 * Soft delete provider
 */
const softDeleteProvider = async (req, res, next) => {
  const request_id = uuidv4();
  
  try {
    const { id } = req.params;
    
    const provider = await Provider.findByIdAndUpdate(
      id,
      {
        is_deleted: true,
        is_active: false,
        deleted_at: new Date(),
        updated_at: new Date()
      },
      { new: true }
    ).select('-password_hash');
    
    if (!provider) {
      return res.status(404).json({
        success: false,
        message: 'Provider not found',
        error_code: 'PROVIDER_NOT_FOUND',
        timestamp: new Date().toISOString(),
        request_id
      });
    }
    
    return res.status(200).json({
      success: true,
      message: 'Provider deleted successfully',
      data: { provider },
      timestamp: new Date().toISOString(),
      request_id
    });
    
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Internal server error while deleting provider',
      error_id: 'ERR_DELETE_PROVIDER_001',
      timestamp: new Date().toISOString(),
      request_id
    });
  }
};

module.exports = {
  registerProvider,
  verifyEmail,
  resendVerificationEmail,
  getOnboardingStatus,
  getProviders,
  getProviderById,
  updateProvider,
  softDeleteProvider
}; 