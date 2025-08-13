import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  Box,
  Avatar,
  Chip,
  Divider
} from '@mui/material';
import {
  Schedule,
  CalendarToday,
  MedicalServices,
  Person,
  Notifications,
  History,
  Settings
} from '@mui/icons-material';

const PatientDashboard = () => {
  const navigate = useNavigate();

  // Mock patient data - in real app, this would come from context/API
  const patientData = {
    name: 'John Doe',
    email: 'john.doe@example.com',
    phone: '+1 (555) 123-4567',
    dateOfBirth: '1990-05-15',
    bloodType: 'O+',
    emergencyContact: 'Jane Doe (Spouse) - +1 (555) 987-6543'
  };

  const upcomingAppointments = [
    {
      id: 1,
      date: '2024-01-15',
      time: '10:00 AM',
      doctor: 'Dr. Sarah Johnson',
      department: 'Cardiology',
      status: 'Confirmed'
    }
  ];

  const quickActions = [
    {
      title: 'Book Appointment',
      description: 'Schedule a new appointment with a doctor',
      icon: <Schedule color="primary" sx={{ fontSize: 40 }} />,
      action: () => navigate('/book-appointment'),
      color: 'primary'
    },
    {
      title: 'View Appointments',
      description: 'Check your upcoming and past appointments',
      icon: <CalendarToday color="secondary" sx={{ fontSize: 40 }} />,
      action: () => navigate('/appointments'),
      color: 'secondary'
    },
    {
      title: 'Medical Records',
      description: 'Access your medical history and reports',
      icon: <MedicalServices color="success" sx={{ fontSize: 40 }} />,
      action: () => navigate('/medical-records'),
      color: 'success'
    },
    {
      title: 'Profile Settings',
      description: 'Update your personal information',
      icon: <Person color="info" sx={{ fontSize: 40 }} />,
      action: () => navigate('/profile'),
      color: 'info'
    }
  ];

  const handleLogout = () => {
    localStorage.removeItem('patient_token');
    navigate('/login');
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header */}
      <Paper elevation={2} sx={{ p: 3, mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box>
            <Typography variant="h4" gutterBottom>
              Welcome back, {patientData.name}! 👋
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Here's what's happening with your health today
            </Typography>
          </Box>
          <Button
            variant="outlined"
            color="error"
            onClick={handleLogout}
            startIcon={<Settings />}
          >
            Logout
          </Button>
        </Box>
      </Paper>

      {/* Quick Actions */}
      <Typography variant="h5" gutterBottom sx={{ mb: 3 }}>
        Quick Actions
      </Typography>
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {quickActions.map((action, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <Card 
              sx={{ 
                height: '100%', 
                cursor: 'pointer',
                transition: 'transform 0.2s, box-shadow 0.2s',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: 4
                }
              }}
              onClick={action.action}
            >
              <CardContent sx={{ textAlign: 'center', p: 3 }}>
                <Box sx={{ mb: 2 }}>
                  {action.icon}
                </Box>
                <Typography variant="h6" gutterBottom>
                  {action.title}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {action.description}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Patient Info and Upcoming Appointments */}
      <Grid container spacing={4}>
        {/* Patient Information */}
        <Grid item xs={12} md={6}>
          <Paper elevation={2} sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
              <Person sx={{ mr: 1 }} />
              Personal Information
            </Typography>
            <Divider sx={{ mb: 2 }} />
            
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <Typography variant="body2" color="text.secondary">Full Name</Typography>
                <Typography variant="body1">{patientData.name}</Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="body2" color="text.secondary">Email</Typography>
                <Typography variant="body1">{patientData.email}</Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="body2" color="text.secondary">Phone</Typography>
                <Typography variant="body1">{patientData.phone}</Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="body2" color="text.secondary">Blood Type</Typography>
                <Typography variant="body1">{patientData.bloodType}</Typography>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="body2" color="text.secondary">Emergency Contact</Typography>
                <Typography variant="body1">{patientData.emergencyContact}</Typography>
              </Grid>
            </Grid>
          </Paper>
        </Grid>

        {/* Upcoming Appointments */}
        <Grid item xs={12} md={6}>
          <Paper elevation={2} sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
              <CalendarToday sx={{ mr: 1 }} />
              Upcoming Appointments
            </Typography>
            <Divider sx={{ mb: 2 }} />
            
            {upcomingAppointments.length > 0 ? (
              upcomingAppointments.map((appointment) => (
                <Card key={appointment.id} variant="outlined" sx={{ mb: 2 }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <Box>
                        <Typography variant="h6">{appointment.doctor}</Typography>
                        <Typography variant="body2" color="text.secondary">
                          {appointment.department}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {appointment.date} at {appointment.time}
                        </Typography>
                      </Box>
                      <Chip 
                        label={appointment.status} 
                        color="success" 
                        size="small"
                      />
                    </Box>
                  </CardContent>
                </Card>
              ))
            ) : (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <CalendarToday sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
                <Typography variant="body1" color="text.secondary" gutterBottom>
                  No upcoming appointments
                </Typography>
                <Button
                  variant="contained"
                  onClick={() => navigate('/book-appointment')}
                  startIcon={<Schedule />}
                >
                  Book Appointment
                </Button>
              </Box>
            )}
          </Paper>
        </Grid>
      </Grid>

      {/* Recent Activity */}
      <Paper elevation={2} sx={{ p: 3, mt: 4 }}>
        <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
          <History sx={{ mr: 1 }} />
          Recent Activity
        </Typography>
        <Divider sx={{ mb: 2 }} />
        
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <Notifications sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
          <Typography variant="body1" color="text.secondary">
            No recent activity to display
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Your recent appointments and medical activities will appear here
          </Typography>
        </Box>
      </Paper>
    </Container>
  );
};

export default PatientDashboard; 