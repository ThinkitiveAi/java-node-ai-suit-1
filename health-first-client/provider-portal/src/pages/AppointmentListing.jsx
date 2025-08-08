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
  IconButton,
  Tooltip,
  AppBar,
  Toolbar,
  Menu,
  MenuItem,
  ListItemIcon,
  Badge,
  FormControl,
  Select,
  InputLabel,
  Paper,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  TablePagination
} from '@mui/material';
import {
  Schedule as ScheduleIcon,
  Person as PersonIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  LocationOn as LocationIcon,
  AttachMoney as MoneyIcon,
  CalendarToday as CalendarIcon,
  Search as SearchIcon,
  ArrowBack as ArrowBackIcon,
  LocalHospital as HealthIcon,
  Notifications as NotificationsIcon,
  Settings as SettingsIcon,
  ExitToApp as LogoutIcon,
  MoreVert as MoreVertIcon,
  Edit as EditIcon,
  Cancel as CancelIcon,
  CheckCircle as CompleteIcon,
  AccessTime as TimeIcon,
  FilterList as FilterIcon,
  Today as TodayIcon,
  Event as EventIcon,
  History as HistoryIcon,
  ViewList as ViewListIcon,
  ViewModule as ViewModuleIcon
} from '@mui/icons-material';
import { format, parseISO, isToday, isTomorrow, isPast, isThisWeek, startOfDay } from 'date-fns';
import { useNavigate } from 'react-router-dom';

const AppointmentListing = () => {
  const navigate = useNavigate();
  const [currentTab, setCurrentTab] = useState(0);
  const [appointments, setAppointments] = useState([]);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [actionDialog, setActionDialog] = useState({ open: false, type: '', appointment: null });
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [searchQuery, setSearchQuery] = useState('');
  const [filterDate, setFilterDate] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [loading, setLoading] = useState(false);
  const [viewMode, setViewMode] = useState('card'); // 'card' or 'table'
  const [anchorEl, setAnchorEl] = useState(null);
  const [contextMenuAppointment, setContextMenuAppointment] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Mock data for appointments
  const mockAppointments = [
    {
      id: 'apt_001',
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
        date: '2024-01-18',
        startTime: '09:00',
        endTime: '10:00',
        type: 'consultation',
        reason: 'Annual check-up and blood pressure monitoring',
        urgency: 'routine',
        location: 'Room 101, Main Clinic'
      },
      pricing: {
        fee: 150,
        currency: 'USD',
        paymentStatus: 'paid',
        paymentMethod: 'insurance',
        insuranceProvider: 'BlueCross BlueShield'
      },
      status: 'scheduled',
      bookedAt: '2024-01-15T10:30:00Z',
      notes: 'Patient prefers morning appointments due to work schedule',
      followUpRequired: true
    },
    {
      id: 'apt_002',
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
        date: '2024-01-19',
        startTime: '14:00',
        endTime: '15:00',
        type: 'follow-up',
        reason: 'Follow-up for chest pain evaluation',
        urgency: 'priority',
        location: 'Room 203, Cardiology Wing'
      },
      pricing: {
        fee: 120,
        currency: 'USD',
        paymentStatus: 'pending',
        paymentMethod: 'card',
        insuranceProvider: null
      },
      status: 'scheduled',
      bookedAt: '2024-01-15T14:20:00Z',
      notes: 'Patient experienced chest pain last week, needs follow-up ECG',
      followUpRequired: false
    },
    {
      id: 'apt_003',
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
        date: '2024-01-17',
        startTime: '09:00',
        endTime: '10:00',
        type: 'consultation',
        reason: 'Cardiac risk assessment and medication review',
        urgency: 'routine',
        location: 'Room 105, Main Clinic'
      },
      pricing: {
        fee: 200,
        currency: 'USD',
        paymentStatus: 'paid',
        paymentMethod: 'insurance',
        insuranceProvider: 'Aetna'
      },
      status: 'completed',
      bookedAt: '2024-01-14T09:15:00Z',
      notes: 'Regular patient, quarterly check-up',
      followUpRequired: true,
      completedAt: '2024-01-17T10:00:00Z'
    },
    {
      id: 'apt_004',
      patient: {
        id: 'pat_004',
        name: 'Emily Rodriguez',
        email: 'emily.rodriguez@email.com',
        phone: '+1-555-0126',
        avatar: null,
        age: 28,
        medicalHistory: 'Asthma'
      },
      appointmentDetails: {
        slotId: 'slot_004',
        date: '2024-01-16',
        startTime: '11:00',
        endTime: '12:00',
        type: 'consultation',
        reason: 'Acute shortness of breath',
        urgency: 'urgent',
        location: 'Emergency Consultation Room'
      },
      pricing: {
        fee: 180,
        currency: 'USD',
        paymentStatus: 'paid',
        paymentMethod: 'card',
        insuranceProvider: null
      },
      status: 'cancelled',
      bookedAt: '2024-01-15T08:45:00Z',
      notes: 'Patient requested cancellation due to feeling better',
      followUpRequired: false,
      cancelledAt: '2024-01-16T09:30:00Z',
      cancelReason: 'Patient no longer experiencing symptoms'
    }
  ];

  useEffect(() => {
    loadAppointments();
  }, []);

  const loadAppointments = async () => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      setAppointments(mockAppointments);
    } catch (error) {
      showSnackbar('Failed to load appointments', 'error');
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

  const handleAppointmentAction = async (appointmentId, action, reason = '') => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      let newStatus = action;
      let actionTime = new Date().toISOString();
      
      setAppointments(prev => 
        prev.map(apt => 
          apt.id === appointmentId 
            ? { 
                ...apt, 
                status: newStatus,
                actionReason: reason,
                [`${action}At`]: actionTime
              }
            : apt
        )
      );

      showSnackbar(
        `Appointment ${action}d successfully`,
        action === 'completed' ? 'success' : 'info'
      );

      setActionDialog({ open: false, type: '', appointment: null });
      setAnchorEl(null);
    } catch (error) {
      showSnackbar('Failed to process appointment', 'error');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'scheduled': return 'primary';
      case 'completed': return 'success';
      case 'cancelled': return 'error';
      case 'no-show': return 'warning';
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

  const getPaymentStatusColor = (status) => {
    switch (status) {
      case 'paid': return 'success';
      case 'pending': return 'warning';
      case 'failed': return 'error';
      default: return 'default';
    }
  };

  const getTimeStatus = (appointment) => {
    const appointmentDate = parseISO(`${appointment.appointmentDetails.date}T${appointment.appointmentDetails.startTime}`);
    if (isPast(appointmentDate) && appointment.status === 'scheduled') {
      return { label: 'Overdue', color: 'error' };
    } else if (isToday(appointmentDate)) {
      return { label: 'Today', color: 'warning' };
    } else if (isTomorrow(appointmentDate)) {
      return { label: 'Tomorrow', color: 'info' };
    }
    return null;
  };

  const filteredAppointments = appointments.filter(appointment => {
    const matchesSearch = !searchQuery || 
      appointment.patient.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      appointment.patient.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      appointment.appointmentDetails.reason.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = filterStatus === 'all' || appointment.status === filterStatus;
    
    let matchesDate = true;
    const appointmentDate = parseISO(appointment.appointmentDetails.date);
    
    switch (filterDate) {
      case 'today':
        matchesDate = isToday(appointmentDate);
        break;
      case 'week':
        matchesDate = isThisWeek(appointmentDate);
        break;
      case 'past':
        matchesDate = isPast(startOfDay(appointmentDate));
        break;
      case 'future':
        matchesDate = !isPast(startOfDay(appointmentDate));
        break;
      default:
        matchesDate = true;
    }
    
    return matchesSearch && matchesStatus && matchesDate;
  });

  const todayAppointments = appointments.filter(apt => isToday(parseISO(apt.appointmentDetails.date)));
  const scheduledAppointments = filteredAppointments.filter(apt => apt.status === 'scheduled');
  const completedAppointments = filteredAppointments.filter(apt => apt.status === 'completed');
  const cancelledAppointments = filteredAppointments.filter(apt => apt.status === 'cancelled');

  const handleMenuOpen = (event, appointment) => {
    setAnchorEl(event.currentTarget);
    setContextMenuAppointment(appointment);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setContextMenuAppointment(null);
  };

  const renderAppointmentCard = (appointment) => {
    const timeStatus = getTimeStatus(appointment);
    
    return (
      <Card key={appointment.id} sx={{ mb: 2 }}>
        <CardContent>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={8}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Avatar sx={{ mr: 2, bgcolor: 'primary.main' }}>
                  {appointment.patient.name.split(' ').map(n => n[0]).join('')}
                </Avatar>
                <Box sx={{ flexGrow: 1 }}>
                  <Typography variant="h6" component="div">
                    {appointment.patient.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Age: {appointment.patient.age} • {appointment.patient.medicalHistory}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                  {timeStatus && (
                    <Chip 
                      label={timeStatus.label}
                      color={timeStatus.color}
                      size="small"
                    />
                  )}
                  <Chip 
                    label={appointment.status}
                    color={getStatusColor(appointment.status)}
                    size="small"
                  />
                  <Chip 
                    label={appointment.appointmentDetails.urgency}
                    color={getUrgencyColor(appointment.appointmentDetails.urgency)}
                    size="small"
                  />
                  <IconButton size="small" onClick={(e) => handleMenuOpen(e, appointment)}>
                    <MoreVertIcon />
                  </IconButton>
                </Box>
              </Box>

              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <CalendarIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
                    <Typography variant="body2">
                      {format(parseISO(appointment.appointmentDetails.date), 'MMM dd, yyyy')} 
                      at {appointment.appointmentDetails.startTime} - {appointment.appointmentDetails.endTime}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <ScheduleIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
                    <Typography variant="body2">
                      {appointment.appointmentDetails.type}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <LocationIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
                    <Typography variant="body2">
                      {appointment.appointmentDetails.location}
                    </Typography>
                  </Box>
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <EmailIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
                    <Typography variant="body2">
                      {appointment.patient.email}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <PhoneIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
                    <Typography variant="body2">
                      {appointment.patient.phone}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <MoneyIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
                    <Typography variant="body2">
                      ${appointment.pricing.fee} - 
                      <Chip 
                        label={appointment.pricing.paymentStatus}
                        color={getPaymentStatusColor(appointment.pricing.paymentStatus)}
                        size="small"
                        sx={{ ml: 1 }}
                      />
                    </Typography>
                  </Box>
                </Grid>
              </Grid>

              <Typography variant="body2" sx={{ mt: 2, fontWeight: 'bold' }}>
                Reason: 
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {appointment.appointmentDetails.reason}
              </Typography>

              {appointment.notes && (
                <>
                  <Typography variant="body2" sx={{ mt: 1, fontWeight: 'bold' }}>
                    Notes:
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {appointment.notes}
                  </Typography>
                </>
              )}
            </Grid>
          </Grid>
        </CardContent>

        {appointment.status === 'scheduled' && (
          <CardActions>
            <Button
              startIcon={<CompleteIcon />}
              color="success"
              variant="contained"
              size="small"
              onClick={() => setActionDialog({ open: true, type: 'complete', appointment })}
            >
              Mark Complete
            </Button>
            <Button
              startIcon={<CancelIcon />}
              color="error"
              variant="outlined"
              size="small"
              onClick={() => setActionDialog({ open: true, type: 'cancel', appointment })}
            >
              Cancel
            </Button>
          </CardActions>
        )}
      </Card>
    );
  };

  const renderTableView = () => (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Patient</TableCell>
            <TableCell>Date & Time</TableCell>
            <TableCell>Type</TableCell>
            <TableCell>Status</TableCell>
            <TableCell>Payment</TableCell>
            <TableCell>Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {filteredAppointments
            .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
            .map((appointment) => (
              <TableRow key={appointment.id} hover>
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Avatar sx={{ mr: 2, width: 40, height: 40 }}>
                      {appointment.patient.name.split(' ').map(n => n[0]).join('')}
                    </Avatar>
                    <Box>
                      <Typography variant="body2" fontWeight="bold">
                        {appointment.patient.name}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {appointment.patient.phone}
                      </Typography>
                    </Box>
                  </Box>
                </TableCell>
                <TableCell>
                  <Typography variant="body2">
                    {format(parseISO(appointment.appointmentDetails.date), 'MMM dd, yyyy')}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {appointment.appointmentDetails.startTime} - {appointment.appointmentDetails.endTime}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="body2">
                    {appointment.appointmentDetails.type}
                  </Typography>
                  <Chip 
                    label={appointment.appointmentDetails.urgency}
                    color={getUrgencyColor(appointment.appointmentDetails.urgency)}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  <Chip 
                    label={appointment.status}
                    color={getStatusColor(appointment.status)}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  <Typography variant="body2">
                    ${appointment.pricing.fee}
                  </Typography>
                  <Chip 
                    label={appointment.pricing.paymentStatus}
                    color={getPaymentStatusColor(appointment.pricing.paymentStatus)}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  <IconButton size="small" onClick={(e) => handleMenuOpen(e, appointment)}>
                    <MoreVertIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
        </TableBody>
      </Table>
      <TablePagination
        component="div"
        count={filteredAppointments.length}
        page={page}
        onPageChange={(e, newPage) => setPage(newPage)}
        rowsPerPage={rowsPerPage}
        onRowsPerPageChange={(e) => {
          setRowsPerPage(parseInt(e.target.value, 10));
          setPage(0);
        }}
      />
    </TableContainer>
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
            Appointment Listing
          </Typography>
          
          <IconButton color="inherit" sx={{ mr: 1 }}>
            <Badge badgeContent={todayAppointments.length} color="error">
              <NotificationsIcon />
            </Badge>
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
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box>
              <Typography variant="h4" gutterBottom>
                All Appointments
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Manage and track all your appointments
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <IconButton 
                color={viewMode === 'card' ? 'primary' : 'default'}
                onClick={() => setViewMode('card')}
              >
                <ViewModuleIcon />
              </IconButton>
              <IconButton 
                color={viewMode === 'table' ? 'primary' : 'default'}
                onClick={() => setViewMode('table')}
              >
                <ViewListIcon />
              </IconButton>
            </Box>
          </Box>
        </Box>

        {/* Search and Filter Controls */}
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={4}>
            <TextField
              fullWidth
              placeholder="Search appointments..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              InputProps={{
                startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />
              }}
            />
          </Grid>
          <Grid item xs={12} sm={3}>
            <FormControl fullWidth>
              <InputLabel>Filter by Date</InputLabel>
              <Select
                value={filterDate}
                onChange={(e) => setFilterDate(e.target.value)}
                label="Filter by Date"
              >
                <MenuItem value="all">All Dates</MenuItem>
                <MenuItem value="today">Today</MenuItem>
                <MenuItem value="week">This Week</MenuItem>
                <MenuItem value="future">Future</MenuItem>
                <MenuItem value="past">Past</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={3}>
            <FormControl fullWidth>
              <InputLabel>Filter by Status</InputLabel>
              <Select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                label="Filter by Status"
              >
                <MenuItem value="all">All Status</MenuItem>
                <MenuItem value="scheduled">Scheduled</MenuItem>
                <MenuItem value="completed">Completed</MenuItem>
                <MenuItem value="cancelled">Cancelled</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>

        {/* Stats Cards */}
        <Grid container spacing={2} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <TodayIcon color="primary" sx={{ mr: 2 }} />
                  <Box>
                    <Typography color="primary" variant="h6">
                      {todayAppointments.length}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Today's Appointments
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <EventIcon color="success" sx={{ mr: 2 }} />
                  <Box>
                    <Typography color="success.main" variant="h6">
                      {scheduledAppointments.length}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Scheduled
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <CompleteIcon color="success" sx={{ mr: 2 }} />
                  <Box>
                    <Typography color="success.main" variant="h6">
                      {completedAppointments.length}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Completed
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <CancelIcon color="error" sx={{ mr: 2 }} />
                  <Box>
                    <Typography color="error.main" variant="h6">
                      {cancelledAppointments.length}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Cancelled
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Tabs */}
        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
          <Tabs value={currentTab} onChange={(e, newValue) => setCurrentTab(newValue)}>
            <Tab label={`All (${filteredAppointments.length})`} />
            <Tab label={`Today (${todayAppointments.length})`} />
            <Tab label={`Scheduled (${scheduledAppointments.length})`} />
            <Tab label={`Completed (${completedAppointments.length})`} />
          </Tabs>
        </Box>

        {/* Appointment Lists */}
        <Box>
          {filteredAppointments.length === 0 ? (
            <Alert severity="info">No appointments found matching your criteria</Alert>
          ) : (
            <>
              {viewMode === 'card' ? (
                <Box>
                  {currentTab === 0 && filteredAppointments.map(renderAppointmentCard)}
                  {currentTab === 1 && todayAppointments.map(renderAppointmentCard)}
                  {currentTab === 2 && scheduledAppointments.map(renderAppointmentCard)}
                  {currentTab === 3 && completedAppointments.map(renderAppointmentCard)}
                </Box>
              ) : (
                renderTableView()
              )}
            </>
          )}
        </Box>

        {/* Context Menu */}
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleMenuClose}
        >
          {contextMenuAppointment?.status === 'scheduled' && [
            <MenuItem key="complete" onClick={() => {
              setActionDialog({ open: true, type: 'complete', appointment: contextMenuAppointment });
              handleMenuClose();
            }}>
              <ListItemIcon>
                <CompleteIcon fontSize="small" />
              </ListItemIcon>
              Mark as Complete
            </MenuItem>,
            <MenuItem key="cancel" onClick={() => {
              setActionDialog({ open: true, type: 'cancel', appointment: contextMenuAppointment });
              handleMenuClose();
            }}>
              <ListItemIcon>
                <CancelIcon fontSize="small" />
              </ListItemIcon>
              Cancel Appointment
            </MenuItem>
          ]}
          <MenuItem onClick={() => {
            // Handle view details
            handleMenuClose();
          }}>
            <ListItemIcon>
              <PersonIcon fontSize="small" />
            </ListItemIcon>
            View Patient Details
          </MenuItem>
        </Menu>

        {/* Action Dialog */}
        <Dialog
          open={actionDialog.open}
          onClose={() => setActionDialog({ open: false, type: '', appointment: null })}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>
            {actionDialog.type === 'complete' ? 'Mark Appointment Complete' : 'Cancel Appointment'}
          </DialogTitle>
          <DialogContent>
            {actionDialog.appointment && (
              <>
                <Typography variant="body1" sx={{ mb: 2 }}>
                  Patient: <strong>{actionDialog.appointment.patient.name}</strong>
                </Typography>
                <Typography variant="body1" sx={{ mb: 2 }}>
                  Date: <strong>{format(parseISO(actionDialog.appointment.appointmentDetails.date), 'MMM dd, yyyy')}</strong>
                </Typography>
                <Typography variant="body1" sx={{ mb: 2 }}>
                  Time: <strong>{actionDialog.appointment.appointmentDetails.startTime} - {actionDialog.appointment.appointmentDetails.endTime}</strong>
                </Typography>
                
                <TextField
                  fullWidth
                  multiline
                  rows={3}
                  label={actionDialog.type === 'complete' ? 'Appointment notes (optional)' : 'Cancellation reason (optional)'}
                  placeholder={actionDialog.type === 'complete' ? 'Add notes about the appointment...' : 'Please provide a reason for cancellation...'}
                  sx={{ mt: 2 }}
                />
              </>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setActionDialog({ open: false, type: '', appointment: null })}>
              Cancel
            </Button>
            <Button
              onClick={() => handleAppointmentAction(actionDialog.appointment?.id, actionDialog.type)}
              color={actionDialog.type === 'complete' ? 'success' : 'error'}
              variant="contained"
            >
              {actionDialog.type === 'complete' ? 'Mark Complete' : 'Cancel Appointment'}
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

export default AppointmentListing; 