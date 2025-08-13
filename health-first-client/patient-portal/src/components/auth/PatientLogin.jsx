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
  Divider,
  TextField
} from '@mui/material';
import {
  Login as LoginIcon,
  Email as EmailIcon,
  Lock as LockIcon,
  LocalHospital as HealthIcon,
  Security as SecurityIcon
} from '@mui/icons-material';
import LoadingSpinner from '../shared/LoadingSpinner';

const PatientLogin = ({
  onLogin,
  onNavigateToRegister,
  loading = false,
  error = null,
  sx = {},
  ...props
}) => {
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [formErrors, setFormErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Handle input changes
  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error when user starts typing
    if (formErrors[field]) {
      setFormErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  // Simple validation
  const validateForm = () => {
    const errors = {};
    
    if (!formData.email.trim()) {
      errors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'Please enter a valid email address';
    }
    
    if (!formData.password) {
      errors.password = 'Password is required';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle form submission
  const handleFormSubmit = async (event) => {
    event.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    
    try {
      const result = await onLogin(formData);
      
      if (result && result.success) {
        setShowSuccessMessage(true);
        // Redirect after a short delay
        setTimeout(() => {
          window.location.href = '/dashboard';
        }, 1500);
      } else if (result && result.errors) {
        setFormErrors(result.errors);
      }
    } catch (error) {
      console.error('Login error:', error);
    } finally {
      setIsSubmitting(false);
    }
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
            <Alert severity="success" sx={{ mb: 3 }}>
              Login successful! Redirecting to your dashboard...
            </Alert>
          )}

          {/* Global Error Message */}
          {error && (
            <Alert 
              severity="error" 
              sx={{ mb: 3 }}
              onClose={() => setFormErrors({})}
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
              
              <TextField
                fullWidth
                type="email"
                label="Email Address"
                placeholder="Enter your email address"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                error={!!formErrors.email}
                helperText={formErrors.email || ''}
                required
                autoComplete="email"
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
              
              <TextField
                fullWidth
                type="password"
                label="Password"
                placeholder="Enter your password"
                value={formData.password}
                onChange={(e) => handleInputChange('password', e.target.value)}
                error={!!formErrors.password}
                helperText={formErrors.password || ''}
                required
                autoComplete="current-password"
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
              disabled={isSubmitting || loading}
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