import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Grid,
  IconButton,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  Tooltip,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Divider
} from '@mui/material';
import {
  ChevronLeft,
  ChevronRight,
  Add as AddIcon,
  CalendarToday,
  ViewWeek,
  ViewModule,
  Edit as EditIcon,
  Delete as DeleteIcon,
  ContentCopy as CopyIcon,
  Schedule as ScheduleIcon,
  LocationOn as LocationIcon,
  AttachMoney as MoneyIcon,
  Person as PatientIcon
} from '@mui/icons-material';
import { format, startOfWeek, endOfWeek, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addDays, subDays, addWeeks, subWeeks, addMonths, subMonths, parseISO, isWithinInterval } from 'date-fns';
import SlotCreationForm from './SlotCreationForm';
import LoadingSpinner from '../shared/LoadingSpinner';

const AvailabilityCalendar = ({
  providerId,
  onSlotCreate,
  onSlotUpdate,
  onSlotDelete,
  loading = false,
  error = null
}) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState('week'); // 'week' or 'month'
  const [slots, setSlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [showSlotForm, setShowSlotForm] = useState(false);
  const [editingSlot, setEditingSlot] = useState(null);
  const [contextMenu, setContextMenu] = useState(null);
  const [deleteConfirmDialog, setDeleteConfirmDialog] = useState(false);
  const [slotToDelete, setSlotToDelete] = useState(null);

  // Mock slot data - replace with actual API call
  const mockSlots = [
    {
      id: '1',
      providerId: providerId,
      date: '2024-01-15',
      startTime: '09:00',
      endTime: '10:00',
      appointmentType: 'consultation',
      maxAppointments: 1,
      bookedAppointments: 0,
      location: { type: 'clinic', address: '123 Medical Center', room: 'Room 101' },
      pricing: { fee: 150, currency: 'USD', insuranceAccepted: ['BlueCross', 'Aetna'] },
      timezone: 'America/New_York',
      notes: 'General consultation available',
      tags: ['general', 'new-patients'],
      isRecurring: false
    },
    {
      id: '2',
      providerId: providerId,
      date: '2024-01-15',
      startTime: '14:00',
      endTime: '15:30',
      appointmentType: 'follow-up',
      maxAppointments: 2,
      bookedAppointments: 1,
      location: { type: 'telemedicine' },
      pricing: { fee: 100, currency: 'USD', insuranceAccepted: ['Medicare'] },
      timezone: 'America/New_York',
      notes: 'Follow-up appointments only',
      tags: ['follow-up', 'telemedicine'],
      isRecurring: true,
      recurrence: { pattern: 'weekly', endDate: '2024-03-15' }
    },
    {
      id: '3',
      providerId: providerId,
      date: '2024-01-16',
      startTime: '10:00',
      endTime: '11:00',
      appointmentType: 'consultation',
      maxAppointments: 1,
      bookedAppointments: 1,
      location: { type: 'clinic', address: '123 Medical Center', room: 'Room 102' },
      pricing: { fee: 150, currency: 'USD', insuranceAccepted: ['BlueCross'] },
      timezone: 'America/New_York',
      notes: 'Specialty consultation',
      tags: ['specialty', 'booked'],
      isRecurring: false
    }
  ];

  useEffect(() => {
    // Load slots for current view period
    loadSlots();
  }, [currentDate, view, providerId]);

  const loadSlots = async () => {
    // Mock API call - replace with actual implementation
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));
      setSlots(mockSlots);
    } catch (error) {
      console.error('Error loading slots:', error);
    }
  };

  // Navigation functions
  const navigatePrevious = () => {
    if (view === 'week') {
      setCurrentDate(subWeeks(currentDate, 1));
    } else {
      setCurrentDate(subMonths(currentDate, 1));
    }
  };

  const navigateNext = () => {
    if (view === 'week') {
      setCurrentDate(addWeeks(currentDate, 1));
    } else {
      setCurrentDate(addMonths(currentDate, 1));
    }
  };

  const navigateToday = () => {
    setCurrentDate(new Date());
  };

  // Get days for current view
  const getDaysInView = () => {
    if (view === 'week') {
      const start = startOfWeek(currentDate);
      const end = endOfWeek(currentDate);
      return eachDayOfInterval({ start, end });
    } else {
      const start = startOfMonth(currentDate);
      const end = endOfMonth(currentDate);
      return eachDayOfInterval({ start, end });
    }
  };

  // Get slots for a specific day
  const getSlotsForDay = (day) => {
    const dayString = format(day, 'yyyy-MM-dd');
    return slots.filter(slot => slot.date === dayString);
  };

  // Handle slot actions
  const handleSlotCreate = async (slotData) => {
    try {
      const newSlot = await onSlotCreate(slotData);
      setSlots(prev => [...prev, newSlot]);
      setShowSlotForm(false);
    } catch (error) {
      console.error('Error creating slot:', error);
    }
  };

  const handleSlotUpdate = async (slotId, slotData) => {
    try {
      const updatedSlot = await onSlotUpdate(slotId, slotData);
      setSlots(prev => prev.map(slot => slot.id === slotId ? updatedSlot : slot));
      setEditingSlot(null);
      setShowSlotForm(false);
    } catch (error) {
      console.error('Error updating slot:', error);
    }
  };

  const handleSlotDelete = async (slotId, reason) => {
    try {
      await onSlotDelete(slotId, reason);
      setSlots(prev => prev.filter(slot => slot.id !== slotId));
      setDeleteConfirmDialog(false);
      setSlotToDelete(null);
    } catch (error) {
      console.error('Error deleting slot:', error);
    }
  };

  // Context menu handlers
  const handleSlotRightClick = (event, slot) => {
    event.preventDefault();
    setContextMenu({
      mouseX: event.clientX - 2,
      mouseY: event.clientY - 4,
    });
    setSelectedSlot(slot);
  };

  const handleContextMenuClose = () => {
    setContextMenu(null);
    setSelectedSlot(null);
  };

  const handleEditSlot = () => {
    setEditingSlot(selectedSlot);
    setShowSlotForm(true);
    handleContextMenuClose();
  };

  const handleCopySlot = () => {
    const copiedSlot = { ...selectedSlot };
    delete copiedSlot.id;
    setEditingSlot(copiedSlot);
    setShowSlotForm(true);
    handleContextMenuClose();
  };

  const handleDeleteSlot = () => {
    if (selectedSlot.bookedAppointments > 0) {
      // Show warning for booked slots
      setSlotToDelete(selectedSlot);
      setDeleteConfirmDialog(true);
    } else {
      handleSlotDelete(selectedSlot.id, 'Cancelled by provider');
    }
    handleContextMenuClose();
  };

  // Render slot chip
  const renderSlotChip = (slot) => {
    const isBooked = slot.bookedAppointments >= slot.maxAppointments;
    const hasBookings = slot.bookedAppointments > 0;
    
    return (
      <Chip
        key={slot.id}
        size="small"
        icon={<ScheduleIcon />}
        label={`${slot.startTime}-${slot.endTime}`}
        color={isBooked ? 'error' : hasBookings ? 'warning' : 'primary'}
        variant={hasBookings ? 'filled' : 'outlined'}
        onClick={() => setSelectedSlot(slot)}
        onContextMenu={(e) => handleSlotRightClick(e, slot)}
        sx={{
          mb: 0.5,
          cursor: 'pointer',
          '&:hover': {
            transform: 'scale(1.05)',
            transition: 'transform 0.2s'
          }
        }}
      />
    );
  };

  // Render day cell
  const renderDayCell = (day) => {
    const daySlots = getSlotsForDay(day);
    const isToday = isSameDay(day, new Date());
    const isCurrentMonth = view === 'month' ? isSameMonth(day, currentDate) : true;

    return (
      <Card
        key={day.toISOString()}
        sx={{
          minHeight: view === 'week' ? 200 : 120,
          bgcolor: isToday ? 'primary.50' : 'background.paper',
          opacity: isCurrentMonth ? 1 : 0.5,
          border: isToday ? 2 : 1,
          borderColor: isToday ? 'primary.main' : 'divider',
          cursor: 'pointer',
          '&:hover': {
            boxShadow: 2
          }
        }}
        onClick={() => {
          setEditingSlot({ date: format(day, 'yyyy-MM-dd') });
          setShowSlotForm(true);
        }}
      >
        <CardContent sx={{ p: 1, '&:last-child': { pb: 1 } }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
            <Typography variant="body2" fontWeight={isToday ? 'bold' : 'normal'}>
              {format(day, 'd')}
            </Typography>
            {daySlots.length > 0 && (
              <Chip
                size="small"
                label={daySlots.length}
                color="primary"
                variant="outlined"
              />
            )}
          </Box>
          
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
            {daySlots.slice(0, view === 'week' ? 6 : 3).map(renderSlotChip)}
            {daySlots.length > (view === 'week' ? 6 : 3) && (
              <Typography variant="caption" color="text.secondary">
                +{daySlots.length - (view === 'week' ? 6 : 3)} more
              </Typography>
            )}
          </Box>
        </CardContent>
      </Card>
    );
  };

  const days = getDaysInView();
  const currentPeriod = view === 'week' 
    ? `Week of ${format(startOfWeek(currentDate), 'MMM d, yyyy')}`
    : format(currentDate, 'MMMM yyyy');

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" gutterBottom>
            Availability Calendar
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Manage your appointment slots and availability
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setShowSlotForm(true)}
          >
            Add Slot
          </Button>
        </Box>
      </Box>

      {/* Navigation and View Controls */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <IconButton onClick={navigatePrevious}>
            <ChevronLeft />
          </IconButton>
          
          <Button
            variant="outlined"
            onClick={navigateToday}
            startIcon={<CalendarToday />}
          >
            Today
          </Button>
          
          <IconButton onClick={navigateNext}>
            <ChevronRight />
          </IconButton>
          
          <Typography variant="h6" sx={{ ml: 2 }}>
            {currentPeriod}
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            variant={view === 'week' ? 'contained' : 'outlined'}
            size="small"
            startIcon={<ViewWeek />}
            onClick={() => setView('week')}
          >
            Week
          </Button>
          <Button
            variant={view === 'month' ? 'contained' : 'outlined'}
            size="small"
            startIcon={<ViewModule />}
            onClick={() => setView('month')}
          >
            Month
          </Button>
        </Box>
      </Box>

      {/* Error Alert */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Calendar Grid */}
      {loading ? (
        <LoadingSpinner message="Loading availability..." />
      ) : (
        <Grid container spacing={1}>
          {view === 'week' && (
            <>
              {/* Week view - 7 columns */}
              {days.map((day) => (
                <Grid item xs={12} md={12/7} key={day.toISOString()}>
                  <Typography variant="subtitle2" align="center" sx={{ mb: 1 }}>
                    {format(day, 'EEE, MMM d')}
                  </Typography>
                  {renderDayCell(day)}
                </Grid>
              ))}
            </>
          )}
          
          {view === 'month' && (
            <>
              {/* Month view - 7x5 grid */}
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((dayName) => (
                <Grid item xs={12/7} key={dayName}>
                  <Typography variant="subtitle2" align="center" fontWeight="bold" sx={{ mb: 1 }}>
                    {dayName}
                  </Typography>
                </Grid>
              ))}
              {days.map((day) => (
                <Grid item xs={12/7} key={day.toISOString()}>
                  {renderDayCell(day)}
                </Grid>
              ))}
            </>
          )}
        </Grid>
      )}

      {/* Slot Creation/Edit Dialog */}
      <Dialog
        open={showSlotForm}
        onClose={() => {
          setShowSlotForm(false);
          setEditingSlot(null);
        }}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {editingSlot?.id ? 'Edit Availability Slot' : 'Create New Availability Slot'}
        </DialogTitle>
        <DialogContent>
          <SlotCreationForm
            slot={editingSlot}
            onSubmit={editingSlot?.id ? 
              (data) => handleSlotUpdate(editingSlot.id, data) : 
              handleSlotCreate
            }
            onCancel={() => {
              setShowSlotForm(false);
              setEditingSlot(null);
            }}
          />
        </DialogContent>
      </Dialog>

      {/* Context Menu */}
      <Menu
        open={contextMenu !== null}
        onClose={handleContextMenuClose}
        anchorReference="anchorPosition"
        anchorPosition={
          contextMenu !== null
            ? { top: contextMenu.mouseY, left: contextMenu.mouseX }
            : undefined
        }
      >
        <MenuItem onClick={handleEditSlot}>
          <ListItemIcon>
            <EditIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Edit Slot</ListItemText>
        </MenuItem>
        
        <MenuItem onClick={handleCopySlot}>
          <ListItemIcon>
            <CopyIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Copy Slot</ListItemText>
        </MenuItem>
        
        <Divider />
        
        <MenuItem onClick={handleDeleteSlot} sx={{ color: 'error.main' }}>
          <ListItemIcon>
            <DeleteIcon fontSize="small" color="error" />
          </ListItemIcon>
          <ListItemText>Delete Slot</ListItemText>
        </MenuItem>
      </Menu>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteConfirmDialog}
        onClose={() => setDeleteConfirmDialog(false)}
      >
        <DialogTitle>Confirm Slot Deletion</DialogTitle>
        <DialogContent>
          <Alert severity="warning" sx={{ mb: 2 }}>
            This slot has {slotToDelete?.bookedAppointments} booked appointment(s). 
            Deleting it will cancel these appointments.
          </Alert>
          <Typography>
            Are you sure you want to delete this availability slot? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteConfirmDialog(false)}>
            Cancel
          </Button>
          <Button 
            onClick={() => handleSlotDelete(slotToDelete?.id, 'Cancelled by provider - slot deleted')}
            color="error"
            variant="contained"
          >
            Delete Slot
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AvailabilityCalendar; 