import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Container,
  Paper,
  Link,
  Alert,
  Divider
} from '@mui/material';
import {
  Login as LoginIcon,
  Email as EmailIcon,
  Lock as LockIcon,
  LocalHospital as HealthIcon,
  Security as SecurityIcon
} from '@mui/icons-material';
import FormField from '../shared/FormField';
import LoadingSpinner from '../shared/LoadingSpinner';
import ValidationMessage from '../shared/ValidationMessage';
import useFormValidation from '../../hooks/useFormValidation';
import {
  validateEmail,
  validatePassword,
  sanitizeInput
} from '../../utils/patientValidation';

const PatientLogin = ({
  onLogin,
  onNavigateToRegister,
  loading = false,
  error = null,
  sx = {},
  ...props
}) => {
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);

  // Initial form values
  const initialValues = {
    email: '',
    password: ''
  };

  // Validation rules
  const validationRules = {
    email: (value) => validateEmail(sanitizeInput(value)),
    password: (value) => {
      if (!value) return 'Password is required';
      return null;
    }
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
    clearErrors
  } = useFormValidation(initialValues, validationRules, validationOptions);

  // Handle form submission
  const onSubmit = async (formData) => {
    try {
      // Sanitize inputs
      const sanitizedData = {
        email: sanitizeInput(formData.email).toLowerCase().trim(),
        password: formData.password // Don't sanitize password to preserve special characters
      };

      const result = await onLogin(sanitizedData);
      
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
        return { success: false, error: result?.message || 'Login failed' };
      }
    } catch (error) {
      console.error('Login error:', error);
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

  // Handle register navigation
  const handleRegisterClick = (event) => {
    event.preventDefault();
    if (onNavigateToRegister) {
      onNavigateToRegister();
    }
  };

  return (
    <Container
      maxWidth="sm"
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
          maxWidth: 480,
          borderRadius: 3,
          overflow: 'hidden'
        }}
      >
        {/* Header Section */}
        <Box
          sx={{
            bgcolor: 'primary.main',
            color: 'primary.contrastText',
            p: 4,
            textAlign: 'center'
          }}
        >
          <HealthIcon sx={{ fontSize: 48, mb: 1 }} />
          <Typography variant="h4" component="h1" gutterBottom>
            Patient Login
          </Typography>
          <Typography variant="body1" sx={{ opacity: 0.9 }}>
            Access your healthcare portal
          </Typography>
        </Box>

        <CardContent sx={{ p: 4 }}>
          {/* Success Message */}
          {showSuccessMessage && (
            <ValidationMessage
              type="success"
              message="Login successful! Redirecting to your dashboard..."
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
                message="Signing you in..."
                size="medium"
              />
            )}

            {/* Email Field */}
            <Box sx={{ mb: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                <EmailIcon color="primary" />
                <Typography variant="h6">Email Address</Typography>
              </Box>
              
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
                data-testid="patient-login-email"
              />
            </Box>

            {/* Password Field */}
            <Box sx={{ mb: 4 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                <LockIcon color="primary" />
                <Typography variant="h6">Password</Typography>
              </Box>
              
              <FormField
                type="password"
                label="Password"
                placeholder="Enter your password"
                required
                autoComplete="current-password"
                {...getFieldProps('password')}
                onChange={handleFieldChange}
                onBlur={handleBlur}
                disabled={isSubmitting || loading}
                data-testid="patient-login-password"
              />
            </Box>

            {/* Submit Button */}
            <Button
              type="submit"
              fullWidth
              variant="contained"
              size="large"
              disabled={!isValid || isSubmitting || loading}
              startIcon={
                isSubmitting || loading ? null : <LoginIcon />
              }
              sx={{
                py: 1.5,
                fontSize: '1.1rem',
                textTransform: 'none',
                mb: 3
              }}
              data-testid="patient-login-submit"
            >
              {isSubmitting || loading ? (
                <LoadingSpinner size="small" color="inherit" />
              ) : (
                'Sign In'
              )}
            </Button>

            {/* Forgot Password Link */}
            <Box sx={{ textAlign: 'center', mb: 3 }}>
              <Link
                href="#"
                variant="body2"
                sx={{ 
                  fontWeight: 'medium',
                  textDecoration: 'none',
                  '&:hover': {
                    textDecoration: 'underline'
                  }
                }}
              >
                Forgot your password?
              </Link>
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
                mb: 3
              }}
            >
              <SecurityIcon color="action" fontSize="small" />
              <Typography variant="body2" color="text.secondary">
                Your login is protected with industry-standard encryption
              </Typography>
            </Box>

            <Divider sx={{ mb: 3 }} />

            {/* Register Link */}
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="body2" color="text.secondary">
                Don't have an account?{' '}
                <Link
                  href="#"
                  onClick={handleRegisterClick}
                  variant="body2"
                  sx={{ 
                    fontWeight: 'medium',
                    textDecoration: 'none',
                    '&:hover': {
                      textDecoration: 'underline'
                    }
                  }}
                >
                  Create Account
                </Link>
              </Typography>
            </Box>
          </Box>
        </CardContent>
      </Paper>
    </Container>
  );
};

export default PatientLogin; 