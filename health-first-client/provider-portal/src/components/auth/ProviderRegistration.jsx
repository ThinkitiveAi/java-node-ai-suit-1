import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Grid,
  Stepper,
  Step,
  StepLabel,
  Divider,
  Container,
  Paper,
  LinearProgress,
  Link,
  Alert
} from '@mui/material';
import {
  PersonAdd as RegisterIcon,
  Person as PersonIcon,
  Work as WorkIcon,
  LocationOn as LocationIcon,
  Security as SecurityIcon,
  LocalHospital as HealthIcon
} from '@mui/icons-material';
import FormField from '../shared/FormField';
import LoadingSpinner from '../shared/LoadingSpinner';
import ValidationMessage from '../shared/ValidationMessage';
import useFormValidation from '../../hooks/useFormValidation';
import {
  validateEmail,
  validatePassword,
  validatePasswordMatch,
  validateName,
  validatePhoneNumber,
  validateSpecialization,
  validateLicenseNumber,
  validateYearsOfExperience,
  validateAddress,
  validateZipCode,
  getPasswordStrength,
  sanitizeInput
} from '../../utils/providerValidation';

const ProviderRegistration = ({
  onRegister,
  onNavigateToLogin,
  loading = false,
  error = null,
  sx = {},
  ...props
}) => {
  const [activeStep, setActiveStep] = useState(0);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);

  // Form steps
  const steps = [
    { label: 'Personal Information', icon: PersonIcon },
    { label: 'Professional Details', icon: WorkIcon },
    { label: 'Clinic Address', icon: LocationIcon }
  ];

  // Initial form values
  const initialValues = {
    // Personal Information
    first_name: '',
    last_name: '',
    email: '',
    phone_number: '',
    password: '',
    confirm_password: '',
    
    // Professional Information
    specialization: '',
    license_number: '',
    years_of_experience: '',
    
    // Clinic Address
    street: '',
    city: '',
    state: '',
    zip: ''
  };

  // Validation rules
  const validationRules = {
    // Personal Information
    first_name: (value) => validateName(sanitizeInput(value), 'First name'),
    last_name: (value) => validateName(sanitizeInput(value), 'Last name'),
    email: (value) => validateEmail(sanitizeInput(value)),
    phone_number: (value) => validatePhoneNumber(value),
    password: (value) => validatePassword(value),
    confirm_password: (value, allValues) => validatePasswordMatch(allValues.password, value),
    
    // Professional Information
    specialization: (value) => validateSpecialization(sanitizeInput(value)),
    license_number: (value) => validateLicenseNumber(sanitizeInput(value)),
    years_of_experience: (value) => validateYearsOfExperience(value),
    
    // Clinic Address
    street: (value) => validateAddress(sanitizeInput(value), 'Street'),
    city: (value) => validateAddress(sanitizeInput(value), 'City'),
    state: (value) => validateAddress(sanitizeInput(value), 'State'),
    zip: (value) => validateZipCode(sanitizeInput(value))
  };

  // Validation options
  const validationOptions = {
    validateOnBlur: true,
    validateOnChange: false,
    validateOnSubmit: true,
    debounceMs: 300
  };

  const {
    values,
    errors,
    touched,
    isSubmitting,
    isValid,
    handleChange,
    handleBlur,
    handleSubmit,
    getFieldProps,
    setFieldError,
    clearErrors,
    validateForm
  } = useFormValidation(initialValues, validationRules, validationOptions);

  // Password strength
  const passwordStrength = getPasswordStrength(values.password);

  // Get fields for current step
  const getStepFields = (step) => {
    switch (step) {
      case 0:
        return ['first_name', 'last_name', 'email', 'phone_number', 'password', 'confirm_password'];
      case 1:
        return ['specialization', 'license_number', 'years_of_experience'];
      case 2:
        return ['street', 'city', 'state', 'zip'];
      default:
        return [];
    }
  };

  // Validate current step
  const validateCurrentStep = () => {
    const stepFields = getStepFields(activeStep);
    const validation = validateForm();
    
    // Check if current step fields have errors
    const stepHasErrors = stepFields.some(field => validation.errors[field]);
    return !stepHasErrors;
  };

  // Handle next step
  const handleNext = () => {
    if (validateCurrentStep()) {
      setActiveStep((prev) => Math.min(prev + 1, steps.length - 1));
    }
  };

  // Handle previous step
  const handleBack = () => {
    setActiveStep((prev) => Math.max(prev - 1, 0));
  };

  // Calculate form completion percentage
  const getCompletionPercentage = () => {
    const totalFields = Object.keys(initialValues).length;
    const filledFields = Object.values(values).filter(value => value && value.toString().trim()).length;
    return Math.round((filledFields / totalFields) * 100);
  };

  // Handle form submission
  const onSubmit = async (formData) => {
    try {
      // Sanitize all text inputs
      const sanitizedData = {
        ...formData,
        first_name: sanitizeInput(formData.first_name).trim(),
        last_name: sanitizeInput(formData.last_name).trim(),
        email: sanitizeInput(formData.email).toLowerCase().trim(),
        specialization: sanitizeInput(formData.specialization).trim(),
        license_number: sanitizeInput(formData.license_number).trim(),
        street: sanitizeInput(formData.street).trim(),
        city: sanitizeInput(formData.city).trim(),
        state: sanitizeInput(formData.state).trim(),
        zip: sanitizeInput(formData.zip).trim(),
        years_of_experience: parseInt(formData.years_of_experience, 10)
      };

      // Remove confirm_password before submission
      delete sanitizedData.confirm_password;

      const result = await onRegister(sanitizedData);
      
      if (result && result.success) {
        setShowSuccessMessage(true);
        return { success: true };
      } else if (result && result.errors) {
        // Handle server-side validation errors
        Object.keys(result.errors).forEach(field => {
          setFieldError(field, result.errors[field]);
        });
        return { success: false, errors: result.errors };
      } else {
        return { success: false, error: result?.message || 'Registration failed' };
      }
    } catch (error) {
      console.error('Registration error:', error);
      return { success: false, error: 'An unexpected error occurred. Please try again.' };
    }
  };

  const handleFormSubmit = handleSubmit(onSubmit);

  // Handle field change with error clearing
  const handleFieldChange = (event) => {
    if (error) {
      clearErrors();
    }
    handleChange(event);
  };

  // Handle login navigation
  const handleLoginClick = (event) => {
    event.preventDefault();
    if (onNavigateToLogin) {
      onNavigateToLogin();
    }
  };

  // Render Personal Information Step
  const renderPersonalInformation = () => (
    <Grid container spacing={3}>
      <Grid item xs={12} sm={6}>
        <FormField
          type="text"
          label="First Name"
          placeholder="Enter your first name"
          required
          {...getFieldProps('first_name')}
          onChange={handleFieldChange}
          onBlur={handleBlur}
          disabled={isSubmitting || loading}
          data-testid="provider-first-name"
        />
      </Grid>
      
      <Grid item xs={12} sm={6}>
        <FormField
          type="text"
          label="Last Name"
          placeholder="Enter your last name"
          required
          {...getFieldProps('last_name')}
          onChange={handleFieldChange}
          onBlur={handleBlur}
          disabled={isSubmitting || loading}
          data-testid="provider-last-name"
        />
      </Grid>
      
      <Grid item xs={12}>
        <FormField
          type="email"
          label="Email Address"
          placeholder="Enter your email address"
          required
          autoComplete="email"
          {...getFieldProps('email')}
          onChange={handleFieldChange}
          onBlur={handleBlur}
          disabled={isSubmitting || loading}
          data-testid="provider-email"
        />
      </Grid>
      
      <Grid item xs={12}>
        <FormField
          type="phone"
          label="Phone Number"
          placeholder="Enter your phone number"
          required
          {...getFieldProps('phone_number')}
          onChange={handleFieldChange}
          onBlur={handleBlur}
          disabled={isSubmitting || loading}
          data-testid="provider-phone"
        />
      </Grid>
      
      <Grid item xs={12}>
        <FormField
          type="password"
          label="Password"
          placeholder="Create a strong password"
          required
          autoComplete="new-password"
          {...getFieldProps('password')}
          onChange={handleFieldChange}
          onBlur={handleBlur}
          disabled={isSubmitting || loading}
          data-testid="provider-password"
        />
        
        {/* Password Strength Indicator */}
        {values.password && (
          <Box sx={{ mt: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
              <Typography variant="caption" color="text.secondary">
                Password strength:
              </Typography>
              <Typography 
                variant="caption" 
                color={`${passwordStrength.color}.main`}
                sx={{ fontWeight: 'medium' }}
              >
                {passwordStrength.label}
              </Typography>
            </Box>
            <LinearProgress
              variant="determinate"
              value={(passwordStrength.score / 6) * 100}
              color={passwordStrength.color}
              sx={{ height: 4, borderRadius: 2 }}
            />
          </Box>
        )}
      </Grid>
      
      <Grid item xs={12}>
        <FormField
          type="password"
          label="Confirm Password"
          placeholder="Confirm your password"
          required
          autoComplete="new-password"
          {...getFieldProps('confirm_password')}
          onChange={handleFieldChange}
          onBlur={handleBlur}
          disabled={isSubmitting || loading}
          data-testid="provider-confirm-password"
        />
      </Grid>
    </Grid>
  );

  // Render Professional Information Step
  const renderProfessionalInformation = () => (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <FormField
          type="text"
          label="Specialization"
          placeholder="e.g., Cardiology, Pediatrics, General Practice"
          required
          {...getFieldProps('specialization')}
          onChange={handleFieldChange}
          onBlur={handleBlur}
          disabled={isSubmitting || loading}
          maxLength={100}
          data-testid="provider-specialization"
        />
      </Grid>
      
      <Grid item xs={12} sm={8}>
        <FormField
          type="text"
          label="License Number"
          placeholder="Enter your medical license number"
          required
          {...getFieldProps('license_number')}
          onChange={handleFieldChange}
          onBlur={handleBlur}
          disabled={isSubmitting || loading}
          maxLength={20}
          data-testid="provider-license"
        />
      </Grid>
      
      <Grid item xs={12} sm={4}>
        <FormField
          type="number"
          label="Years of Experience"
          placeholder="0"
          required
          {...getFieldProps('years_of_experience')}
          onChange={handleFieldChange}
          onBlur={handleBlur}
          disabled={isSubmitting || loading}
          inputProps={{ min: 0, max: 50 }}
          data-testid="provider-experience"
        />
      </Grid>
    </Grid>
  );

  // Render Clinic Address Step
  const renderClinicAddress = () => (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <FormField
          type="text"
          label="Street Address"
          placeholder="Enter clinic street address"
          required
          {...getFieldProps('street')}
          onChange={handleFieldChange}
          onBlur={handleBlur}
          disabled={isSubmitting || loading}
          maxLength={200}
          data-testid="provider-street"
        />
      </Grid>
      
      <Grid item xs={12} sm={6}>
        <FormField
          type="text"
          label="City"
          placeholder="Enter city"
          required
          {...getFieldProps('city')}
          onChange={handleFieldChange}
          onBlur={handleBlur}
          disabled={isSubmitting || loading}
          maxLength={100}
          data-testid="provider-city"
        />
      </Grid>
      
      <Grid item xs={12} sm={3}>
        <FormField
          type="text"
          label="State"
          placeholder="State"
          required
          {...getFieldProps('state')}
          onChange={handleFieldChange}
          onBlur={handleBlur}
          disabled={isSubmitting || loading}
          maxLength={50}
          data-testid="provider-state"
        />
      </Grid>
      
      <Grid item xs={12} sm={3}>
        <FormField
          type="text"
          label="ZIP Code"
          placeholder="12345"
          required
          {...getFieldProps('zip')}
          onChange={handleFieldChange}
          onBlur={handleBlur}
          disabled={isSubmitting || loading}
          data-testid="provider-zip"
        />
      </Grid>
    </Grid>
  );

  // Render current step content
  const renderStepContent = (step) => {
    switch (step) {
      case 0:
        return renderPersonalInformation();
      case 1:
        return renderProfessionalInformation();
      case 2:
        return renderClinicAddress();
      default:
        return null;
    }
  };

  return (
    <Container
      maxWidth="md"
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        py: 3,
        ...sx
      }}
      {...props}
    >
      <Paper
        elevation={3}
        sx={{
          width: '100%',
          maxWidth: 800,
          borderRadius: 3,
          overflow: 'hidden'
        }}
      >
        {/* Header Section */}
        <Box
          sx={{
            bgcolor: 'primary.main',
            color: 'primary.contrastText',
            p: 3,
            textAlign: 'center'
          }}
        >
          <HealthIcon sx={{ fontSize: 48, mb: 1 }} />
          <Typography variant="h4" component="h1" gutterBottom>
            Provider Registration
          </Typography>
          <Typography variant="body1" sx={{ opacity: 0.9 }}>
            Join our healthcare platform and start helping patients
          </Typography>
        </Box>

        {/* Progress Indicator */}
        <Box sx={{ p: 3, pb: 0 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
            <Typography variant="body2" color="text.secondary">
              Form completion:
            </Typography>
            <Typography variant="body2" fontWeight="medium">
              {getCompletionPercentage()}%
            </Typography>
          </Box>
          <LinearProgress
            variant="determinate"
            value={getCompletionPercentage()}
            sx={{ mb: 3, height: 6, borderRadius: 3 }}
          />
        </Box>

        {/* Stepper */}
        <Box sx={{ px: 3 }}>
          <Stepper activeStep={activeStep} alternativeLabel>
            {steps.map((step, index) => (
              <Step key={step.label}>
                <StepLabel
                  icon={React.createElement(step.icon, { 
                    color: index <= activeStep ? 'primary' : 'disabled' 
                  })}
                >
                  {step.label}
                </StepLabel>
              </Step>
            ))}
          </Stepper>
        </Box>

        <CardContent sx={{ p: 4 }}>
          {/* Success Message */}
          {showSuccessMessage && (
            <ValidationMessage
              type="success"
              message="Registration successful! Please check your email for verification instructions."
              variant="alert"
              sx={{ mb: 3 }}
            />
          )}

          {/* Global Error Message */}
          {error && (
            <Alert 
              severity="error" 
              sx={{ mb: 3 }}
              onClose={() => clearErrors()}
            >
              {error}
            </Alert>
          )}

          {/* Form */}
          <Box
            component="form"
            onSubmit={activeStep === steps.length - 1 ? handleFormSubmit : undefined}
            noValidate
            sx={{ position: 'relative' }}
          >
            {/* Loading Overlay */}
            {(isSubmitting || loading) && (
              <LoadingSpinner
                overlay
                message="Creating your account..."
                size="medium"
              />
            )}

            {/* Step Content */}
            <Box sx={{ mb: 4 }}>
              <Typography variant="h6" gutterBottom>
                {steps[activeStep].label}
              </Typography>
              <Divider sx={{ mb: 3 }} />
              {renderStepContent(activeStep)}
            </Box>

            {/* Navigation Buttons */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
              <Button
                onClick={handleBack}
                disabled={activeStep === 0 || isSubmitting || loading}
                sx={{ mr: 1 }}
              >
                Back
              </Button>
              
              <Box sx={{ display: 'flex', gap: 2 }}>
                {activeStep < steps.length - 1 ? (
                  <Button
                    variant="contained"
                    onClick={handleNext}
                    disabled={!validateCurrentStep() || isSubmitting || loading}
                  >
                    Next
                  </Button>
                ) : (
                  <Button
                    type="submit"
                    variant="contained"
                    size="large"
                    disabled={!isValid || isSubmitting || loading}
                    startIcon={
                      isSubmitting || loading ? null : <RegisterIcon />
                    }
                    sx={{
                      py: 1.5,
                      px: 4,
                      fontSize: '1.1rem',
                      textTransform: 'none'
                    }}
                    data-testid="provider-register-submit"
                  >
                    {isSubmitting || loading ? (
                      <LoadingSpinner size="small" color="inherit" />
                    ) : (
                      'Create Account'
                    )}
                  </Button>
                )}
              </Box>
            </Box>

            {/* Security Notice */}
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                p: 2,
                bgcolor: 'grey.50',
                borderRadius: 1,
                mt: 3,
                mb: 3
              }}
            >
              <SecurityIcon color="action" fontSize="small" />
              <Typography variant="body2" color="text.secondary">
                Your information is encrypted and stored securely in compliance with HIPAA regulations
              </Typography>
            </Box>

            <Divider sx={{ mb: 3 }} />

            {/* Login Link */}
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="body2" color="text.secondary">
                Already have an account?{' '}
                <Link
                  href="#"
                  onClick={handleLoginClick}
                  variant="body2"
                  sx={{ 
                    fontWeight: 'medium',
                    textDecoration: 'none',
                    '&:hover': {
                      textDecoration: 'underline'
                    }
                  }}
                >
                  Sign In
                </Link>
              </Typography>
            </Box>
          </Box>
        </CardContent>
      </Paper>
    </Container>
  );
};

export default ProviderRegistration; 