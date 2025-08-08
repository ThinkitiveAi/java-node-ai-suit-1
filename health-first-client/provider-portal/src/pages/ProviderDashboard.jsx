import React from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  Avatar,
  Chip,
  Divider,
  AppBar,
  Toolbar,
  IconButton
} from '@mui/material';
import {
  Schedule as ScheduleIcon,
  CalendarToday as CalendarIcon,
  People as PeopleIcon,
  Assessment as AssessmentIcon,
  Settings as SettingsIcon,
  Notifications as NotificationsIcon,
  ExitToApp as LogoutIcon,
  LocalHospital as HealthIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

const ProviderDashboard = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('provider_token');
    navigate('/login');
  };

  // Mock provider data
  const provider = {
    name: 'Dr. Sarah Johnson',
    specialization: 'Cardiology',
    avatar: null,
    stats: {
      todayAppointments: 8,
      weeklyAppointments: 32,
      availableSlots: 15,
      patientRating: 4.8
    }
  };

  const quickActions = [
    {
      title: 'Manage Availability',
      description: 'Set your available time slots and manage your calendar',
      icon: <ScheduleIcon fontSize="large" color="primary" />,
      action: () => navigate('/availability'),
      color: 'primary'
    },
    {
      title: 'View Appointments',
      description: 'Check all appointments and manage your schedule',
      icon: <CalendarIcon fontSize="large" color="secondary" />,
      action: () => navigate('/appointments'),
      color: 'secondary'
    },
    {
      title: 'Booking Requests',
      description: 'Review and approve new appointment requests',
      icon: <PeopleIcon fontSize="large" color="info" />,
      action: () => navigate('/appointments/new'),
      color: 'info'
    },
    {
      title: 'Reports & Analytics',
      description: 'View practice analytics and generate reports',
      icon: <AssessmentIcon fontSize="large" color="warning" />,
      action: () => console.log('Navigate to reports'),
      color: 'warning'
    }
  ];

  return (
    <Box sx={{ flexGrow: 1 }}>
      {/* App Bar */}
      <AppBar position="static">
        <Toolbar>
          <HealthIcon sx={{ mr: 2 }} />
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Provider Portal
          </Typography>
          
          <IconButton color="inherit" sx={{ mr: 1 }}>
            <NotificationsIcon />
          </IconButton>
          
          <IconButton color="inherit" sx={{ mr: 1 }}>
            <SettingsIcon />
          </IconButton>
          
          <IconButton color="inherit" onClick={handleLogout}>
            <LogoutIcon />
          </IconButton>
        </Toolbar>
      </AppBar>

      <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
        {/* Welcome Section */}
        <Box sx={{ mb: 4 }}>
          <Grid container spacing={3} alignItems="center">
            <Grid item>
              <Avatar
                sx={{ width: 80, height: 80, bgcolor: 'primary.main', fontSize: '2rem' }}
              >
                {provider.name.split(' ').map(n => n[0]).join('')}
              </Avatar>
            </Grid>
            <Grid item xs>
              <Typography variant="h4" gutterBottom>
                Welcome back, {provider.name}
              </Typography>
              <Typography variant="h6" color="text.secondary" gutterBottom>
                {provider.specialization}
              </Typography>
              <Chip
                label="Active"
                color="success"
                size="small"
              />
            </Grid>
          </Grid>
        </Box>

        {/* Stats Cards */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography color="text.secondary" gutterBottom>
                  Today's Appointments
                </Typography>
                <Typography variant="h4" component="div">
                  {provider.stats.todayAppointments}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography color="text.secondary" gutterBottom>
                  This Week
                </Typography>
                <Typography variant="h4" component="div">
                  {provider.stats.weeklyAppointments}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography color="text.secondary" gutterBottom>
                  Available Slots
                </Typography>
                <Typography variant="h4" component="div">
                  {provider.stats.availableSlots}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography color="text.secondary" gutterBottom>
                  Patient Rating
                </Typography>
                <Typography variant="h4" component="div">
                  {provider.stats.patientRating}
                  <Typography variant="body2" component="span" color="text.secondary">
                    /5.0
                  </Typography>
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Quick Actions */}
        <Typography variant="h5" gutterBottom>
          Quick Actions
        </Typography>
        
        <Grid container spacing={3}>
          {quickActions.map((action, index) => (
            <Grid item xs={12} md={6} key={index}>
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
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 2 }}>
                    <Box sx={{ mr: 2 }}>
                      {action.icon}
                    </Box>
                    <Box sx={{ flexGrow: 1 }}>
                      <Typography variant="h6" component="div" gutterBottom>
                        {action.title}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {action.description}
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
                <CardActions>
                  <Button 
                    size="small" 
                    color={action.color}
                    onClick={(e) => {
                      e.stopPropagation();
                      action.action();
                    }}
                  >
                    Go to {action.title}
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* Recent Activity */}
        <Box sx={{ mt: 4 }}>
          <Typography variant="h5" gutterBottom>
            Recent Activity
          </Typography>
          
          <Card>
            <CardContent>
              <Typography variant="body2" color="text.secondary">
                • New appointment booked for tomorrow at 2:00 PM
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                • Availability updated for next week
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                • Patient consultation completed - John Doe
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                • New review received (5 stars)
              </Typography>
            </CardContent>
          </Card>
        </Box>
      </Container>
    </Box>
  );
};

export default ProviderDashboard; 