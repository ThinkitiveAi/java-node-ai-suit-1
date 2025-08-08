const Patient = require('../models/Patient');
const authService = require('../services/authService');
const tokenService = require('../services/tokenService');
const sessionService = require('../services/sessionService');
const { generateRequestId } = require('../utils/securityUtils');
const { validatePatientRegistration, validatePatientUpdate, validatePatientLogin } = require('../validation/patientValidation');
const { sanitizeInput } = require('../utils/securityUtils');

// Patient Registration
const registerPatient = async (req, res) => {
  const requestId = generateRequestId();
  
  try {
    // Validate input
    const { error, value } = validatePatientRegistration(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        error: 'VALIDATION_ERROR',
        message: 'Invalid input data',
        details: error.details.map(detail => detail.message),
        requestId
      });
    }

    // Sanitize input
    const sanitizedData = sanitizeInput(value);

    // Check if patient already exists
    const existingPatient = await Patient.findOne({ 
      $or: [
        { email: sanitizedData.email },
        { phone_number: sanitizedData.phone_number }
      ]
    });

    if (existingPatient) {
      return res.status(409).json({
        success: false,
        error: 'PATIENT_EXISTS',
        message: 'Patient with this email or phone number already exists',
        requestId
      });
    }

    // Hash password
    const passwordHash = await authService.hashPassword(sanitizedData.password);

    // Create patient
    const patient = new Patient({
      ...sanitizedData,
      password_hash: passwordHash,
      onboarding_status: 'registration'
    });

    await patient.save();

    // Generate verification token
    const verificationToken = await authService.generateVerificationToken();

    // TODO: Send verification email
    // await emailService.sendVerificationEmail(patient.email, verificationToken);

    res.status(201).json({
      success: true,
      message: 'Patient registered successfully. Please check your email for verification.',
      data: {
        patient_id: patient._id,
        email: patient.email,
        onboarding_status: patient.onboarding_status
      },
      requestId
    });

  } catch (error) {
    console.error('Patient registration error:', error);
    res.status(500).json({
      success: false,
      error: 'REGISTRATION_FAILED',
      message: 'Failed to register patient',
      requestId
    });
  }
};

// Patient Login
const loginPatient = async (req, res) => {
  const requestId = generateRequestId();
  
  try {
    // Validate input
    const { error, value } = validatePatientLogin(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        error: 'VALIDATION_ERROR',
        message: 'Invalid input data',
        details: error.details.map(detail => detail.message),
        requestId
      });
    }

    const { email, password } = sanitizeInput(value);

    // Find patient
    const patient = await Patient.findOne({ email }).select('+password_hash');
    if (!patient) {
      return res.status(401).json({
        success: false,
        error: 'INVALID_CREDENTIALS',
        message: 'Invalid email or password',
        requestId
      });
    }

    // Check if patient is active
    if (!patient.is_active) {
      return res.status(401).json({
        success: false,
        error: 'ACCOUNT_DISABLED',
        message: 'Account is disabled',
        requestId
      });
    }

    // Verify password
    const isPasswordValid = await authService.verifyPassword(password, patient.password_hash);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        error: 'INVALID_CREDENTIALS',
        message: 'Invalid email or password',
        requestId
      });
    }

    // Generate tokens
    const accessToken = await tokenService.generateAccessToken({
      patientId: patient._id,
      email: patient.email,
      role: 'patient'
    });

    const refreshToken = await tokenService.generateRefreshToken({
      patientId: patient._id,
      email: patient.email,
      role: 'patient'
    });

    // Update last login
    patient.last_login = new Date();
    await patient.save();

    // Store session
    await sessionService.createSession(patient._id, refreshToken, 'patient');

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        access_token: accessToken,
        refresh_token: refreshToken,
        token_type: 'Bearer',
        expires_in: process.env.JWT_ACCESS_EXPIRES_IN || 86400,
        patient: {
          id: patient._id,
          email: patient.email,
          first_name: patient.first_name,
          last_name: patient.last_name,
          verification_status: patient.verification_status,
          onboarding_status: patient.onboarding_status,
          is_active: patient.is_active
        }
      },
      requestId
    });

  } catch (error) {
    console.error('Patient login error:', error);
    res.status(500).json({
      success: false,
      error: 'LOGIN_FAILED',
      message: 'Failed to login',
      requestId
    });
  }
};

// Get Patient by ID
const getPatientById = async (req, res) => {
  const requestId = generateRequestId();
  
  try {
    const { id } = req.params;
    const patient = await Patient.findById(id);

    if (!patient) {
      return res.status(404).json({
        success: false,
        error: 'PATIENT_NOT_FOUND',
        message: 'Patient not found',
        requestId
      });
    }

    res.json({
      success: true,
      data: patient,
      requestId
    });

  } catch (error) {
    console.error('Get patient error:', error);
    res.status(500).json({
      success: false,
      error: 'FETCH_FAILED',
      message: 'Failed to fetch patient',
      requestId
    });
  }
};

// Get All Patients
const getAllPatients = async (req, res) => {
  const requestId = generateRequestId();
  
  try {
    const {
      page = 1,
      limit = 10,
      search,
      verification_status,
      onboarding_status,
      state
    } = req.query;

    const query = { is_active: true };

    // Add filters
    if (search) {
      query.$or = [
        { first_name: { $regex: search, $options: 'i' } },
        { last_name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    if (verification_status) {
      query.verification_status = verification_status;
    }

    if (onboarding_status) {
      query.onboarding_status = onboarding_status;
    }

    if (state) {
      query['address.state'] = state;
    }

    const options = {
      page: parseInt(page),
      limit: parseInt(limit),
      sort: { created_at: -1 }
    };

    const patients = await Patient.paginate(query, options);

    res.json({
      success: true,
      data: {
        patients: patients.docs,
        pagination: {
          page: patients.page,
          limit: patients.limit,
          total: patients.totalDocs,
          pages: patients.totalPages
        }
      },
      requestId
    });

  } catch (error) {
    console.error('Get all patients error:', error);
    res.status(500).json({
      success: false,
      error: 'FETCH_FAILED',
      message: 'Failed to fetch patients',
      requestId
    });
  }
};

// Update Patient
const updatePatient = async (req, res) => {
  const requestId = generateRequestId();
  
  try {
    const { id } = req.params;
    const { error, value } = validatePatientUpdate(req.body);
    
    if (error) {
      return res.status(400).json({
        success: false,
        error: 'VALIDATION_ERROR',
        message: 'Invalid input data',
        details: error.details.map(detail => detail.message),
        requestId
      });
    }

    const sanitizedData = sanitizeInput(value);
    sanitizedData.updated_at = new Date();

    const patient = await Patient.findByIdAndUpdate(
      id,
      sanitizedData,
      { new: true, runValidators: true }
    );

    if (!patient) {
      return res.status(404).json({
        success: false,
        error: 'PATIENT_NOT_FOUND',
        message: 'Patient not found',
        requestId
      });
    }

    res.json({
      success: true,
      message: 'Patient updated successfully',
      data: patient,
      requestId
    });

  } catch (error) {
    console.error('Update patient error:', error);
    res.status(500).json({
      success: false,
      error: 'UPDATE_FAILED',
      message: 'Failed to update patient',
      requestId
    });
  }
};

// Delete Patient (Soft Delete)
const deletePatient = async (req, res) => {
  const requestId = generateRequestId();
  
  try {
    const { id } = req.params;
    const patient = await Patient.findByIdAndUpdate(
      id,
      { 
        is_active: false,
        updated_at: new Date()
      },
      { new: true }
    );

    if (!patient) {
      return res.status(404).json({
        success: false,
        error: 'PATIENT_NOT_FOUND',
        message: 'Patient not found',
        requestId
      });
    }

    res.json({
      success: true,
      message: 'Patient deleted successfully',
      requestId
    });

  } catch (error) {
    console.error('Delete patient error:', error);
    res.status(500).json({
      success: false,
      error: 'DELETE_FAILED',
      message: 'Failed to delete patient',
      requestId
    });
  }
};

// Get Onboarding Status
const getOnboardingStatus = async (req, res) => {
  const requestId = generateRequestId();
  
  try {
    const patientId = req.user.patientId;
    const patient = await Patient.findById(patientId);

    if (!patient) {
      return res.status(404).json({
        success: false,
        error: 'PATIENT_NOT_FOUND',
        message: 'Patient not found',
        requestId
      });
    }

    // Calculate onboarding progress
    const onboardingSteps = [
      'registration',
      'email_verified',
      'profile_completed',
      'medical_history_added',
      'insurance_added',
      'emergency_contacts_added',
      'completed'
    ];

    const currentStepIndex = onboardingSteps.indexOf(patient.onboarding_status);
    const progress = Math.round(((currentStepIndex + 1) / onboardingSteps.length) * 100);

    const nextSteps = [];
    if (patient.onboarding_status === 'registration') {
      nextSteps.push('Verify email address');
    }
    if (patient.onboarding_status === 'email_verified') {
      nextSteps.push('Complete profile information');
    }
    if (patient.onboarding_status === 'profile_completed') {
      nextSteps.push('Add medical history');
    }
    if (patient.onboarding_status === 'medical_history_added') {
      nextSteps.push('Add insurance information');
    }
    if (patient.onboarding_status === 'insurance_added') {
      nextSteps.push('Add emergency contacts');
    }
    if (patient.onboarding_status === 'emergency_contacts_added') {
      nextSteps.push('Complete onboarding');
    }

    res.json({
      success: true,
      data: {
        current_status: patient.onboarding_status,
        progress_percentage: progress,
        next_steps: nextSteps,
        is_email_verified: !!patient.email_verified_at,
        is_profile_completed: patient.onboarding_status !== 'registration' && patient.onboarding_status !== 'email_verified',
        is_medical_history_added: ['medical_history_added', 'insurance_added', 'emergency_contacts_added', 'completed'].includes(patient.onboarding_status),
        is_insurance_added: ['insurance_added', 'emergency_contacts_added', 'completed'].includes(patient.onboarding_status),
        is_emergency_contacts_added: ['emergency_contacts_added', 'completed'].includes(patient.onboarding_status),
        is_completed: patient.onboarding_status === 'completed'
      },
      requestId
    });

  } catch (error) {
    console.error('Get onboarding status error:', error);
    res.status(500).json({
      success: false,
      error: 'FETCH_FAILED',
      message: 'Failed to fetch onboarding status',
      requestId
    });
  }
};

// Verify Email
const verifyEmail = async (req, res) => {
  const requestId = generateRequestId();
  
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({
        success: false,
        error: 'MISSING_TOKEN',
        message: 'Verification token is required',
        requestId
      });
    }

    // TODO: Verify token and update patient
    // const patient = await authService.verifyEmailToken(token);
    
    // For now, simulate email verification
    const patient = await Patient.findById(req.user.patientId);
    if (!patient) {
      return res.status(404).json({
        success: false,
        error: 'PATIENT_NOT_FOUND',
        message: 'Patient not found',
        requestId
      });
    }

    patient.email_verified_at = new Date();
    patient.onboarding_status = 'email_verified';
    await patient.save();

    res.json({
      success: true,
      message: 'Email verified successfully',
      data: {
        onboarding_status: patient.onboarding_status
      },
      requestId
    });

  } catch (error) {
    console.error('Email verification error:', error);
    res.status(500).json({
      success: false,
      error: 'VERIFICATION_FAILED',
      message: 'Failed to verify email',
      requestId
    });
  }
};

// Resend Verification Email
const resendVerificationEmail = async (req, res) => {
  const requestId = generateRequestId();
  
  try {
    const { email } = req.body;

    const patient = await Patient.findOne({ email });
    if (!patient) {
      return res.status(404).json({
        success: false,
        error: 'PATIENT_NOT_FOUND',
        message: 'Patient not found',
        requestId
      });
    }

    // TODO: Generate new verification token and send email
    // const verificationToken = await authService.generateVerificationToken();
    // await emailService.sendVerificationEmail(patient.email, verificationToken);

    res.json({
      success: true,
      message: 'Verification email sent successfully',
      requestId
    });

  } catch (error) {
    console.error('Resend verification error:', error);
    res.status(500).json({
      success: false,
      error: 'EMAIL_FAILED',
      message: 'Failed to send verification email',
      requestId
    });
  }
};

// Patient Logout
const logoutPatient = async (req, res) => {
  const requestId = generateRequestId();
  
  try {
    const { refreshToken } = req.body;
    
    if (refreshToken) {
      await sessionService.deleteSession(refreshToken);
    }

    res.json({
      success: true,
      message: 'Logout successful',
      requestId
    });

  } catch (error) {
    console.error('Patient logout error:', error);
    res.status(500).json({
      success: false,
      error: 'LOGOUT_FAILED',
      message: 'Failed to logout',
      requestId
    });
  }
};

// Refresh Token
const refreshToken = async (req, res) => {
  const requestId = generateRequestId();
  
  try {
    const { refresh_token } = req.body;

    if (!refresh_token) {
      return res.status(400).json({
        success: false,
        error: 'MISSING_TOKEN',
        message: 'Refresh token is required',
        requestId
      });
    }

    // Verify refresh token
    const decoded = await tokenService.verifyRefreshToken(refresh_token);
    
    // Check if session exists
    const session = await sessionService.getSession(refresh_token);
    if (!session) {
      return res.status(401).json({
        success: false,
        error: 'INVALID_TOKEN',
        message: 'Invalid refresh token',
        requestId
      });
    }

    // Generate new tokens
    const newAccessToken = await tokenService.generateAccessToken({
      patientId: decoded.patientId,
      email: decoded.email,
      role: 'patient'
    });

    const newRefreshToken = await tokenService.generateRefreshToken({
      patientId: decoded.patientId,
      email: decoded.email,
      role: 'patient'
    });

    // Update session
    await sessionService.updateSession(refresh_token, newRefreshToken);

    res.json({
      success: true,
      message: 'Token refreshed successfully',
      data: {
        access_token: newAccessToken,
        refresh_token: newRefreshToken,
        token_type: 'Bearer',
        expires_in: process.env.JWT_ACCESS_EXPIRES_IN || 86400
      },
      requestId
    });

  } catch (error) {
    console.error('Token refresh error:', error);
    res.status(401).json({
      success: false,
      error: 'TOKEN_REFRESH_FAILED',
      message: 'Failed to refresh token',
      requestId
    });
  }
};

module.exports = {
  registerPatient,
  loginPatient,
  getPatientById,
  getAllPatients,
  updatePatient,
  deletePatient,
  getOnboardingStatus,
  verifyEmail,
  resendVerificationEmail,
  logoutPatient,
  refreshToken
}; 