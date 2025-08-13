import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import { CssBaseline } from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import theme from './theme';
import PatientRegistration from './components/auth/PatientRegistration';
import PatientLogin from './components/auth/PatientLogin';
import BookAppointment from './components/booking/BookAppointment';
import PatientDashboard from './components/dashboard/PatientDashboard';
import './styles/patient.css';

// Wrapper components to handle navigation
const RegistrationWrapper = () => {
  const navigate = useNavigate();

  const handleRegister = async (userData) => {
    console.log('Patient registration attempt:', userData);
    
    try {
      // Simulate API call
      const response = await fetch('/api/v1/patient/register', {
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
    <PatientRegistration
      onRegister={handleRegister}
      onNavigateToLogin={handleNavigateToLogin}
    />
  );
};

const LoginWrapper = () => {
  const navigate = useNavigate();

  const handleLogin = async (credentials) => {
    console.log('Patient login attempt:', credentials);
    
    try {
      // For demo purposes, accept any email/password combination
      // In a real app, this would be an API call
      if (credentials.email && credentials.password) {
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Create a dummy token
        const dummyToken = 'dummy_patient_token_' + Date.now();
        localStorage.setItem('patient_token', dummyToken);
        
        // Redirect to dashboard after successful login
        navigate('/dashboard');
        return { success: true, data: { token: dummyToken } };
      } else {
        return { success: false, message: 'Email and password are required' };
      }
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, message: 'An unexpected error occurred. Please try again.' };
    }
  };

  const handleNavigateToRegister = () => {
    navigate('/register');
  };

  return (
    <PatientLogin
      onLogin={handleLogin}
      onNavigateToRegister={handleNavigateToRegister}
    />
  );
};

// Simple auth check component
const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('patient_token');
  
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  
  return children;
};

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <LocalizationProvider dateAdapter={AdapterDateFns}>
        <Router>
          <div className="App">
            <Routes>
              {/* Default route redirects to registration */}
              <Route path="/" element={<Navigate to="/register" replace />} />
              
              {/* Authentication Routes */}
              <Route path="/register" element={<RegistrationWrapper />} />
              <Route path="/login" element={<LoginWrapper />} />

              {/* Protected Dashboard Routes */}
              <Route path="/dashboard" element={
                <ProtectedRoute>
                  <PatientDashboard />
                </ProtectedRoute>
              } />
              <Route path="/book-appointment" element={
                <ProtectedRoute>
                  <BookAppointment />
                </ProtectedRoute>
              } />
              <Route path="/appointments" element={
                <ProtectedRoute>
                  <div>My Appointments (Coming Soon)</div>
                </ProtectedRoute>
              } />

              {/* Catch all route */}
              <Route path="*" element={<Navigate to="/register" replace />} />
            </Routes>
          </div>
        </Router>
      </LocalizationProvider>
    </ThemeProvider>
  );
}

export default App;
