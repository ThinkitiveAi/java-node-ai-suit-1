import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  Chip,
  Avatar,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  Snackbar,
  Tab,
  Tabs,
  Divider,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  ListItemSecondary,
  IconButton,
  Tooltip,
  AppBar,
  Toolbar
} from '@mui/material';
import {
  Check as CheckIcon,
  Close as CloseIcon,
  Schedule as ScheduleIcon,
  Person as PersonIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  LocationOn as LocationIcon,
  AttachMoney as MoneyIcon,
  CalendarToday as CalendarIcon,
  FilterList as FilterIcon,
  Search as SearchIcon,
  ArrowBack as ArrowBackIcon,
  LocalHospital as HealthIcon,
  Notifications as NotificationsIcon,
  Settings as SettingsIcon,
  ExitToApp as LogoutIcon
} from '@mui/icons-material';
import { format, parseISO } from 'date-fns';
import { useNavigate } from 'react-router-dom';

const AppointmentBooking = () => {
  const navigate = useNavigate();
  const [currentTab, setCurrentTab] = useState(0);
  const [bookingRequests, setBookingRequests] = useState([]);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [actionDialog, setActionDialog] = useState({ open: false, type: '', request: null });
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [loading, setLoading] = useState(false);

  // Mock data for booking requests
  const mockRequests = [
    {
      id: 'req_001',
      patient: {
        id: 'pat_001',
        name: 'John Smith',
        email: 'john.smith@email.com',
        phone: '+1-555-0123',
        avatar: null,
        age: 45,
        medicalHistory: 'Hypertension, Diabetes Type 2'
      },
      appointmentDetails: {
        slotId: 'slot_001',
        date: '2024-01-20',
        startTime: '10:00',
        endTime: '11:00',
        type: 'consultation',
        reason: 'Annual check-up and blood pressure monitoring',
        urgency: 'routine',
        preferredLocation: 'clinic'
      },
      pricing: {
        fee: 150,
        currency: 'USD',
        paymentMethod: 'insurance',
        insuranceProvider: 'BlueCross BlueShield'
      },
      status: 'pending',
      requestedAt: '2024-01-15T10:30:00Z',
      notes: 'Patient prefers morning appointments due to work schedule'
    },
    {
      id: 'req_002',
      patient: {
        id: 'pat_002',
        name: 'Sarah Johnson',
        email: 'sarah.johnson@email.com',
        phone: '+1-555-0124',
        avatar: null,
        age: 32,
        medicalHistory: 'No significant history'
      },
      appointmentDetails: {
        slotId: 'slot_002',
        date: '2024-01-21',
        startTime: '14:00',
        endTime: '15:00',
        type: 'follow-up',
        reason: 'Follow-up for chest pain evaluation',
        urgency: 'urgent',
        preferredLocation: 'clinic'
      },
      pricing: {
        fee: 120,
        currency: 'USD',
        paymentMethod: 'card',
        insuranceProvider: null
      },
      status: 'pending',
      requestedAt: '2024-01-15T14:20:00Z',
      notes: 'Patient experienced chest pain last week, needs follow-up ECG'
    },
    {
      id: 'req_003',
      patient: {
        id: 'pat_003',
        name: 'Michael Davis',
        email: 'michael.davis@email.com',
        phone: '+1-555-0125',
        avatar: null,
        age: 58,
        medicalHistory: 'Coronary artery disease, Previous MI'
      },
      appointmentDetails: {
        slotId: 'slot_003',
        date: '2024-01-22',
        startTime: '09:00',
        endTime: '10:00',
        type: 'consultation',
        reason: 'Cardiac risk assessment and medication review',
        urgency: 'routine',
        preferredLocation: 'clinic'
      },
      pricing: {
        fee: 200,
        currency: 'USD',
        paymentMethod: 'insurance',
        insuranceProvider: 'Aetna'
      },
      status: 'confirmed',
      requestedAt: '2024-01-14T09:15:00Z',
      notes: 'Regular patient, quarterly check-up'
    }
  ];

  useEffect(() => {
    loadBookingRequests();
  }, []);

  const loadBookingRequests = async () => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      setBookingRequests(mockRequests);
    } catch (error) {
      showSnackbar('Failed to load booking requests', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('provider_token');
    navigate('/login');
  };

  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleSnackbarClose = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  const handleRequestAction = async (requestId, action, reason = '') => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setBookingRequests(prev => 
        prev.map(req => 
          req.id === requestId 
            ? { ...req, status: action === 'approve' ? 'confirmed' : 'rejected', actionReason: reason }
            : req
        )
      );

      showSnackbar(
        `Appointment ${action === 'approve' ? 'confirmed' : 'rejected'} successfully`,
        action === 'approve' ? 'success' : 'info'
      );

      setActionDialog({ open: false, type: '', request: null });
    } catch (error) {
      showSnackbar('Failed to process request', 'error');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'warning';
      case 'confirmed': return 'success';
      case 'rejected': return 'error';
      default: return 'default';
    }
  };

  const getUrgencyColor = (urgency) => {
    switch (urgency) {
      case 'urgent': return 'error';
      case 'priority': return 'warning';
      case 'routine': return 'success';
      default: return 'default';
    }
  };

  const filteredRequests = bookingRequests.filter(request => {
    const matchesSearch = !searchQuery || 
      request.patient.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      request.patient.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      request.appointmentDetails.reason.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesFilter = filterStatus === 'all' || request.status === filterStatus;
    
    return matchesSearch && matchesFilter;
  });

  const pendingRequests = filteredRequests.filter(req => req.status === 'pending');
  const confirmedRequests = filteredRequests.filter(req => req.status === 'confirmed');
  const rejectedRequests = filteredRequests.filter(req => req.status === 'rejected');

  const renderRequestCard = (request) => (
    <Card key={request.id} sx={{ mb: 2 }}>
      <CardContent>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={8}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Avatar sx={{ mr: 2, bgcolor: 'primary.main' }}>
                {request.patient.name.split(' ').map(n => n[0]).join('')}
              </Avatar>
              <Box sx={{ flexGrow: 1 }}>
                <Typography variant="h6" component="div">
                  {request.patient.name}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Age: {request.patient.age} • {request.patient.medicalHistory}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Chip 
                  label={request.status}
                  color={getStatusColor(request.status)}
                  size="small"
                />
                <Chip 
                  label={request.appointmentDetails.urgency}
                  color={getUrgencyColor(request.appointmentDetails.urgency)}
                  size="small"
                />
              </Box>
            </Box>

            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <CalendarIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
                  <Typography variant="body2">
                    {format(parseISO(request.appointmentDetails.date), 'MMM dd, yyyy')} 
                    at {request.appointmentDetails.startTime} - {request.appointmentDetails.endTime}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <ScheduleIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
                  <Typography variant="body2">
                    {request.appointmentDetails.type}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <LocationIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
                  <Typography variant="body2">
                    {request.appointmentDetails.preferredLocation}
                  </Typography>
                </Box>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <EmailIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
                  <Typography variant="body2">
                    {request.patient.email}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <PhoneIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
                  <Typography variant="body2">
                    {request.patient.phone}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <MoneyIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
                  <Typography variant="body2">
                    ${request.pricing.fee} ({request.pricing.paymentMethod})
                  </Typography>
                </Box>
              </Grid>
            </Grid>

            <Typography variant="body2" sx={{ mt: 2, fontWeight: 'bold' }}>
              Reason: 
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {request.appointmentDetails.reason}
            </Typography>

            {request.notes && (
              <>
                <Typography variant="body2" sx={{ mt: 1, fontWeight: 'bold' }}>
                  Notes:
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {request.notes}
                </Typography>
              </>
            )}
          </Grid>
        </Grid>
      </CardContent>

      {request.status === 'pending' && (
        <CardActions>
          <Button
            startIcon={<CheckIcon />}
            color="success"
            variant="contained"
            onClick={() => setActionDialog({ open: true, type: 'approve', request })}
          >
            Approve
          </Button>
          <Button
            startIcon={<CloseIcon />}
            color="error"
            variant="outlined"
            onClick={() => setActionDialog({ open: true, type: 'reject', request })}
          >
            Reject
          </Button>
        </CardActions>
      )}
    </Card>
  );

  return (
    <Box sx={{ flexGrow: 1 }}>
      {/* App Bar */}
      <AppBar position="static">
        <Toolbar>
          <IconButton 
            edge="start" 
            color="inherit" 
            onClick={() => navigate('/dashboard')}
            sx={{ mr: 2 }}
          >
            <ArrowBackIcon />
          </IconButton>
          <HealthIcon sx={{ mr: 2 }} />
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Appointment Booking
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
        {/* Header Section */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" gutterBottom>
            Appointment Booking Management
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Review and manage appointment booking requests from patients
          </Typography>
        </Box>

        {/* Search and Filter Controls */}
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              placeholder="Search by patient name, email, or reason..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              InputProps={{
                startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />
              }}
            />
          </Grid>
          <Grid item xs={12} sm={3}>
            <TextField
              select
              fullWidth
              label="Filter by Status"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              SelectProps={{ native: true }}
            >
              <option value="all">All Requests</option>
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="rejected">Rejected</option>
            </TextField>
          </Grid>
        </Grid>

        {/* Stats Cards */}
        <Grid container spacing={2} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={4}>
            <Card>
              <CardContent>
                <Typography color="warning.main" gutterBottom>
                  Pending Requests
                </Typography>
                <Typography variant="h4" component="div">
                  {pendingRequests.length}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Card>
              <CardContent>
                <Typography color="success.main" gutterBottom>
                  Confirmed Today
                </Typography>
                <Typography variant="h4" component="div">
                  {confirmedRequests.length}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Card>
              <CardContent>
                <Typography color="text.secondary" gutterBottom>
                  Total Requests
                </Typography>
                <Typography variant="h4" component="div">
                  {bookingRequests.length}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Tabs */}
        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
          <Tabs value={currentTab} onChange={(e, newValue) => setCurrentTab(newValue)}>
            <Tab label={`Pending (${pendingRequests.length})`} />
            <Tab label={`Confirmed (${confirmedRequests.length})`} />
            <Tab label={`Rejected (${rejectedRequests.length})`} />
          </Tabs>
        </Box>

        {/* Request Lists */}
        <Box>
          {currentTab === 0 && (
            <Box>
              {pendingRequests.length === 0 ? (
                <Alert severity="info">No pending booking requests</Alert>
              ) : (
                pendingRequests.map(renderRequestCard)
              )}
            </Box>
          )}

          {currentTab === 1 && (
            <Box>
              {confirmedRequests.length === 0 ? (
                <Alert severity="info">No confirmed appointments</Alert>
              ) : (
                confirmedRequests.map(renderRequestCard)
              )}
            </Box>
          )}

          {currentTab === 2 && (
            <Box>
              {rejectedRequests.length === 0 ? (
                <Alert severity="info">No rejected requests</Alert>
              ) : (
                rejectedRequests.map(renderRequestCard)
              )}
            </Box>
          )}
        </Box>

        {/* Action Dialog */}
        <Dialog
          open={actionDialog.open}
          onClose={() => setActionDialog({ open: false, type: '', request: null })}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>
            {actionDialog.type === 'approve' ? 'Confirm Appointment' : 'Reject Appointment'}
          </DialogTitle>
          <DialogContent>
            {actionDialog.request && (
              <>
                <Typography variant="body1" sx={{ mb: 2 }}>
                  Patient: <strong>{actionDialog.request.patient.name}</strong>
                </Typography>
                <Typography variant="body1" sx={{ mb: 2 }}>
                  Date: <strong>{format(parseISO(actionDialog.request.appointmentDetails.date), 'MMM dd, yyyy')}</strong>
                </Typography>
                <Typography variant="body1" sx={{ mb: 2 }}>
                  Time: <strong>{actionDialog.request.appointmentDetails.startTime} - {actionDialog.request.appointmentDetails.endTime}</strong>
                </Typography>
                
                {actionDialog.type === 'reject' && (
                  <TextField
                    fullWidth
                    multiline
                    rows={3}
                    label="Reason for rejection (optional)"
                    placeholder="Please provide a reason for rejecting this appointment..."
                    sx={{ mt: 2 }}
                  />
                )}
              </>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setActionDialog({ open: false, type: '', request: null })}>
              Cancel
            </Button>
            <Button
              onClick={() => handleRequestAction(actionDialog.request?.id, actionDialog.type)}
              color={actionDialog.type === 'approve' ? 'success' : 'error'}
              variant="contained"
            >
              {actionDialog.type === 'approve' ? 'Confirm Appointment' : 'Reject Request'}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Snackbar */}
        <Snackbar
          open={snackbar.open}
          autoHideDuration={6000}
          onClose={handleSnackbarClose}
        >
          <Alert onClose={handleSnackbarClose} severity={snackbar.severity} sx={{ width: '100%' }}>
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Container>
    </Box>
  );
};

export default AppointmentBooking; 