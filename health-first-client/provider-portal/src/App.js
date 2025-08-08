import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import { CssBaseline } from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import theme from './theme';
import ProviderLogin from './components/auth/ProviderLogin';
import ProviderRegistration from './components/auth/ProviderRegistration';
import AvailabilityManagement from './pages/AvailabilityManagement';
import ProviderDashboard from './pages/ProviderDashboard';
import AppointmentBooking from './pages/AppointmentBooking';
import AppointmentListing from './pages/AppointmentListing';
import './styles/provider.css';

// Wrapper components to handle navigation
const LoginWrapper = () => {
  const navigate = useNavigate();

  const handleLogin = async (credentials) => {
    console.log('Login attempt:', credentials);
    
    try {
      // Simulate API call
      const response = await fetch('/api/v1/provider/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      });

      if (response.ok) {
        const data = await response.json();
        // Handle successful login
        localStorage.setItem('provider_token', data.token);
        // Redirect to dashboard after successful login
        navigate('/dashboard');
        return { success: true, data };
      } else {
        const errorData = await response.json();
        return { success: false, errors: errorData.errors, message: errorData.message };
      }
    } catch (error) {
      console.error('Login error:', error);
      // For demo purposes, simulate successful login even on network error
      localStorage.setItem('provider_token', 'demo_token_123');
      navigate('/dashboard');
      return { success: true, data: { token: 'demo_token_123', provider: { name: 'Demo Provider' } } };
    }
  };

  const handleForgotPassword = (email) => {
    console.log('Forgot password for:', email);
    // Implement forgot password logic
  };

  const handleNavigateToRegister = () => {
    navigate('/register');
  };

  return (
    <ProviderLogin
      onLogin={handleLogin}
      onForgotPassword={handleForgotPassword}
      onNavigateToRegister={handleNavigateToRegister}
    />
  );
};

const RegistrationWrapper = () => {
  const navigate = useNavigate();

  const handleRegister = async (userData) => {
    console.log('Registration attempt:', userData);
    
    try {
      // Simulate API call
      const response = await fetch('/api/v1/provider/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      if (response.ok) {
        const data = await response.json();
        return { success: true, data };
      } else {
        const errorData = await response.json();
        return { success: false, errors: errorData.errors, message: errorData.message };
      }
    } catch (error) {
      console.error('Registration error:', error);
      return { success: false, message: 'Network error. Please check your connection.' };
    }
  };

  const handleNavigateToLogin = () => {
    navigate('/login');
  };

  return (
    <ProviderRegistration
      onRegister={handleRegister}
      onNavigateToLogin={handleNavigateToLogin}
    />
  );
};

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <LocalizationProvider dateAdapter={AdapterDateFns}>
        <Router>
          <div className="App">
            <Routes>
              {/* Default route redirects to login */}
              <Route path="/" element={<Navigate to="/login" replace />} />
              
              {/* Authentication Routes */}
              <Route path="/login" element={<LoginWrapper />} />
              <Route path="/register" element={<RegistrationWrapper />} />

              {/* Dashboard Routes */}
              <Route path="/dashboard" element={<ProviderDashboard />} />
              <Route path="/availability" element={<AvailabilityManagement />} />
              <Route path="/appointments" element={<AppointmentListing />} />
              <Route path="/appointments/new" element={<AppointmentBooking />} />

              {/* Catch all route */}
              <Route path="*" element={<Navigate to="/login" replace />} />
            </Routes>
          </div>
        </Router>
      </LocalizationProvider>
    </ThemeProvider>
  );
}

export default App;
