import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Grid,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Divider,
  Container,
  Paper,
  LinearProgress,
  Link,
  Alert,
  Chip
} from '@mui/material';
import {
  PersonAdd as RegisterIcon,
  Person as PersonIcon,
  LocationOn as LocationIcon,
  ContactPhone as ContactIcon,
  Security as SecurityIcon,
  LocalHospital as HealthIcon,
  ExpandMore as ExpandMoreIcon,
  MedicalServices as MedicalIcon,
  AccountBalance as InsuranceIcon
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers';
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
  validateDateOfBirth,
  validateGender,
  validateAddress,
  validateZipCode,
  validateOptionalName,
  validateOptionalPhoneNumber,
  validateRelationship,
  validateInsuranceProvider,
  validatePolicyNumber,
  validateMedicalHistory,
  getPasswordStrength,
  calculateAge,
  sanitizeInput
} from '../../utils/patientValidation';

const PatientRegistration = ({
  onRegister,
  onNavigateToLogin,
  loading = false,
  error = null,
  sx = {},
  ...props
}) => {
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [expandedSections, setExpandedSections] = useState({
    emergency: false,
    insurance: false,
    medical: false
  });

  // Gender options
  const genderOptions = [
    { value: 'male', label: 'Male' },
    { value: 'female', label: 'Female' },
    { value: 'other', label: 'Other' },
    { value: 'prefer_not_to_say', label: 'Prefer not to say' }
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
    date_of_birth: null,
    gender: '',
    
    // Address Information
    street: '',
    city: '',
    state: '',
    zip: '',
    
    // Emergency Contact (Optional)
    emergency_contact_name: '',
    emergency_contact_phone: '',
    emergency_contact_relationship: '',
    
    // Insurance Information (Optional)
    insurance_provider: '',
    policy_number: '',
    
    // Medical History (Optional)
    medical_history: ''
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
    date_of_birth: (value) => validateDateOfBirth(value),
    gender: (value) => validateGender(value),
    
    // Address Information
    street: (value) => validateAddress(sanitizeInput(value), 'Street'),
    city: (value) => validateAddress(sanitizeInput(value), 'City'),
    state: (value) => validateAddress(sanitizeInput(value), 'State'),
    zip: (value) => validateZipCode(sanitizeInput(value)),
    
    // Emergency Contact (Optional)
    emergency_contact_name: (value) => validateOptionalName(sanitizeInput(value), 'Emergency contact name'),
    emergency_contact_phone: (value) => validateOptionalPhoneNumber(value),
    emergency_contact_relationship: (value) => validateRelationship(sanitizeInput(value)),
    
    // Insurance Information (Optional)
    insurance_provider: (value) => validateInsuranceProvider(sanitizeInput(value)),
    policy_number: (value) => validatePolicyNumber(sanitizeInput(value)),
    
    // Medical History (Optional)
    medical_history: (value) => validateMedicalHistory(sanitizeInput(value))
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
    setValue
  } = useFormValidation(initialValues, validationRules, validationOptions);

  // Password strength
  const passwordStrength = getPasswordStrength(values.password);

  // Calculate patient age
  const patientAge = calculateAge(values.date_of_birth);

  // Calculate form completion percentage
  const getCompletionPercentage = () => {
    // Required fields only
    const requiredFields = [
      'first_name', 'last_name', 'email', 'phone_number', 'password', 'confirm_password',
      'date_of_birth', 'gender', 'street', 'city', 'state', 'zip'
    ];
    const filledFields = requiredFields.filter(field => {
      const value = values[field];
      return value && value.toString().trim();
    }).length;
    return Math.round((filledFields / requiredFields.length) * 100);
  };

  // Handle accordion expansion
  const handleAccordionChange = (section) => (event, isExpanded) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: isExpanded
    }));
  };

  // Handle date of birth change
  const handleDateOfBirthChange = (newValue) => {
    setValue('date_of_birth', newValue, true);
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
        street: sanitizeInput(formData.street).trim(),
        city: sanitizeInput(formData.city).trim(),
        state: sanitizeInput(formData.state).trim(),
        zip: sanitizeInput(formData.zip).trim(),
        emergency_contact_name: sanitizeInput(formData.emergency_contact_name || '').trim(),
        emergency_contact_relationship: sanitizeInput(formData.emergency_contact_relationship || '').trim(),
        insurance_provider: sanitizeInput(formData.insurance_provider || '').trim(),
        policy_number: sanitizeInput(formData.policy_number || '').trim(),
        medical_history: sanitizeInput(formData.medical_history || '').trim()
      };

      // Remove confirm_password before submission
      delete sanitizedData.confirm_password;

      // Remove empty optional fields
      Object.keys(sanitizedData).forEach(key => {
        if (sanitizedData[key] === '' || sanitizedData[key] === null) {
          delete sanitizedData[key];
        }
      });

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
            Patient Registration
          </Typography>
          <Typography variant="body1" sx={{ opacity: 0.9 }}>
            Create your account to access healthcare services
          </Typography>
        </Box>

        {/* Progress Indicator */}
        <Box sx={{ p: 3, pb: 0 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
            <Typography variant="body2" color="text.secondary">
              Required fields completion:
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
            onSubmit={handleFormSubmit}
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

            {/* Personal Information Section */}
            <Box sx={{ mb: 4 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                <PersonIcon color="primary" />
                <Typography variant="h6">Personal Information</Typography>
                <Chip label="Required" size="small" color="primary" />
              </Box>
              <Divider sx={{ mb: 3 }} />
              
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
                    data-testid="patient-first-name"
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
                    data-testid="patient-last-name"
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
                    data-testid="patient-email"
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
                    data-testid="patient-phone"
                  />
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <DatePicker
                    label="Date of Birth"
                    value={values.date_of_birth}
                    onChange={handleDateOfBirthChange}
                    disabled={isSubmitting || loading}
                    maxDate={new Date()}
                    slotProps={{
                      textField: {
                        required: true,
                        error: !!errors.date_of_birth,
                        helperText: errors.date_of_birth || (patientAge ? `Age: ${patientAge} years` : ''),
                        fullWidth: true,
                        'data-testid': 'patient-dob'
                      }
                    }}
                  />
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <FormField
                    type="select"
                    label="Gender"
                    required
                    options={genderOptions}
                    {...getFieldProps('gender')}
                    onChange={handleFieldChange}
                    onBlur={handleBlur}
                    disabled={isSubmitting || loading}
                    data-testid="patient-gender"
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
                    data-testid="patient-password"
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
                    data-testid="patient-confirm-password"
                  />
                </Grid>
              </Grid>
            </Box>

            {/* Address Information Section */}
            <Box sx={{ mb: 4 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                <LocationIcon color="primary" />
                <Typography variant="h6">Address Information</Typography>
                <Chip label="Required" size="small" color="primary" />
              </Box>
              <Divider sx={{ mb: 3 }} />
              
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <FormField
                    type="text"
                    label="Street Address"
                    placeholder="Enter your street address"
                    required
                    {...getFieldProps('street')}
                    onChange={handleFieldChange}
                    onBlur={handleBlur}
                    disabled={isSubmitting || loading}
                    maxLength={200}
                    data-testid="patient-street"
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
                    data-testid="patient-city"
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
                    data-testid="patient-state"
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
                    data-testid="patient-zip"
                  />
                </Grid>
              </Grid>
            </Box>

            {/* Emergency Contact Section (Optional) */}
            <Accordion 
              expanded={expandedSections.emergency}
              onChange={handleAccordionChange('emergency')}
              sx={{ mb: 2 }}
            >
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <ContactIcon color="action" />
                  <Typography variant="h6">Emergency Contact</Typography>
                  <Chip label="Optional" size="small" variant="outlined" />
                </Box>
              </AccordionSummary>
              <AccordionDetails>
                <Grid container spacing={3}>
                  <Grid item xs={12} sm={6}>
                    <FormField
                      type="text"
                      label="Contact Name"
                      placeholder="Enter emergency contact name"
                      {...getFieldProps('emergency_contact_name')}
                      onChange={handleFieldChange}
                      onBlur={handleBlur}
                      disabled={isSubmitting || loading}
                      maxLength={100}
                      data-testid="patient-emergency-name"
                    />
                  </Grid>
                  
                  <Grid item xs={12} sm={6}>
                    <FormField
                      type="phone"
                      label="Contact Phone"
                      placeholder="Enter emergency contact phone"
                      {...getFieldProps('emergency_contact_phone')}
                      onChange={handleFieldChange}
                      onBlur={handleBlur}
                      disabled={isSubmitting || loading}
                      data-testid="patient-emergency-phone"
                    />
                  </Grid>
                  
                  <Grid item xs={12}>
                    <FormField
                      type="text"
                      label="Relationship"
                      placeholder="e.g., Spouse, Parent, Sibling"
                      {...getFieldProps('emergency_contact_relationship')}
                      onChange={handleFieldChange}
                      onBlur={handleBlur}
                      disabled={isSubmitting || loading}
                      maxLength={50}
                      data-testid="patient-emergency-relationship"
                    />
                  </Grid>
                </Grid>
              </AccordionDetails>
            </Accordion>

            {/* Insurance Information Section (Optional) */}
            <Accordion 
              expanded={expandedSections.insurance}
              onChange={handleAccordionChange('insurance')}
              sx={{ mb: 2 }}
            >
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <InsuranceIcon color="action" />
                  <Typography variant="h6">Insurance Information</Typography>
                  <Chip label="Optional" size="small" variant="outlined" />
                </Box>
              </AccordionSummary>
              <AccordionDetails>
                <Grid container spacing={3}>
                  <Grid item xs={12} sm={6}>
                    <FormField
                      type="text"
                      label="Insurance Provider"
                      placeholder="Enter insurance company name"
                      {...getFieldProps('insurance_provider')}
                      onChange={handleFieldChange}
                      onBlur={handleBlur}
                      disabled={isSubmitting || loading}
                      maxLength={100}
                      data-testid="patient-insurance-provider"
                    />
                  </Grid>
                  
                  <Grid item xs={12} sm={6}>
                    <FormField
                      type="text"
                      label="Policy Number"
                      placeholder="Enter policy number"
                      {...getFieldProps('policy_number')}
                      onChange={handleFieldChange}
                      onBlur={handleBlur}
                      disabled={isSubmitting || loading}
                      maxLength={50}
                      data-testid="patient-policy-number"
                    />
                  </Grid>
                </Grid>
              </AccordionDetails>
            </Accordion>

            {/* Medical History Section (Optional) */}
            <Accordion 
              expanded={expandedSections.medical}
              onChange={handleAccordionChange('medical')}
              sx={{ mb: 4 }}
            >
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <MedicalIcon color="action" />
                  <Typography variant="h6">Medical History</Typography>
                  <Chip label="Optional" size="small" variant="outlined" />
                </Box>
              </AccordionSummary>
              <AccordionDetails>
                <FormField
                  type="text"
                  label="Medical History"
                  placeholder="Please describe any relevant medical conditions, allergies, or medications"
                  multiline
                  rows={4}
                  {...getFieldProps('medical_history')}
                  onChange={handleFieldChange}
                  onBlur={handleBlur}
                  disabled={isSubmitting || loading}
                  maxLength={1000}
                  data-testid="patient-medical-history"
                />
              </AccordionDetails>
            </Accordion>

            {/* Submit Button */}
            <Button
              type="submit"
              fullWidth
              variant="contained"
              size="large"
              disabled={!isValid || isSubmitting || loading}
              startIcon={
                isSubmitting || loading ? null : <RegisterIcon />
              }
              sx={{
                py: 1.5,
                fontSize: '1.1rem',
                textTransform: 'none',
                mb: 3
              }}
              data-testid="patient-register-submit"
            >
              {isSubmitting || loading ? (
                <LoadingSpinner size="small" color="inherit" />
              ) : (
                'Create Account'
              )}
            </Button>

            {/* Security Notice */}
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                p: 2,
                bgcolor: 'grey.50',
                borderRadius: 1,
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

export default PatientRegistration; 