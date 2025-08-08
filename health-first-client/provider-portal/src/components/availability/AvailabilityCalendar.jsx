import React, { useState, useEffect, useRef } from 'react';
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
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Tooltip,
  Paper
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
  Person as PatientIcon,
  ViewDay as ViewDayIcon,
  List as ListIcon
} from '@mui/icons-material';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import listPlugin from '@fullcalendar/list';
import { format, parseISO } from 'date-fns';
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
  const calendarRef = useRef(null);
  const [currentView, setCurrentView] = useState('timeGridWeek');
  const [slots, setSlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [showSlotForm, setShowSlotForm] = useState(false);
  const [editingSlot, setEditingSlot] = useState(null);
  const [contextMenu, setContextMenu] = useState(null);
  const [deleteConfirmDialog, setDeleteConfirmDialog] = useState(false);
  const [slotToDelete, setSlotToDelete] = useState(null);
  const [calendarEvents, setCalendarEvents] = useState([]);

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
    loadSlots();
  }, [providerId]);

  useEffect(() => {
    // Convert slots to FullCalendar events
    const events = slots.map(slot => {
      const isBooked = slot.bookedAppointments >= slot.maxAppointments;
      const hasBookings = slot.bookedAppointments > 0;
      
      let backgroundColor = '#1976d2'; // primary
      let borderColor = '#1976d2';
      
      if (isBooked) {
        backgroundColor = '#d32f2f'; // error
        borderColor = '#d32f2f';
      } else if (hasBookings) {
        backgroundColor = '#ed6c02'; // warning
        borderColor = '#ed6c02';
      }

      return {
        id: slot.id,
        title: `${slot.appointmentType} (${slot.bookedAppointments}/${slot.maxAppointments})`,
        start: `${slot.date}T${slot.startTime}:00`,
        end: `${slot.date}T${slot.endTime}:00`,
        backgroundColor,
        borderColor,
        extendedProps: {
          slot: slot,
          isBooked,
          hasBookings
        }
      };
    });
    
    setCalendarEvents(events);
  }, [slots]);

  const loadSlots = async () => {
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));
      setSlots(mockSlots);
    } catch (error) {
      console.error('Error loading slots:', error);
    }
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

  // FullCalendar event handlers
  const handleEventClick = (clickInfo) => {
    const slot = clickInfo.event.extendedProps.slot;
    setSelectedSlot(slot);
    
    // Show context menu at click position
    setContextMenu({
      mouseX: clickInfo.jsEvent.clientX - 2,
      mouseY: clickInfo.jsEvent.clientY - 4,
    });
  };

  const handleDateSelect = (selectInfo) => {
    const selectedDate = format(selectInfo.start, 'yyyy-MM-dd');
    const selectedStartTime = format(selectInfo.start, 'HH:mm');
    const selectedEndTime = format(selectInfo.end, 'HH:mm');
    
    setEditingSlot({ 
      date: selectedDate,
      startTime: selectedStartTime,
      endTime: selectedEndTime
    });
    setShowSlotForm(true);
    
    // Clear the selection
    const calendarApi = calendarRef.current.getApi();
    calendarApi.unselect();
  };

  const handleDateClick = (dateClickInfo) => {
    const selectedDate = format(dateClickInfo.date, 'yyyy-MM-dd');
    setEditingSlot({ date: selectedDate });
    setShowSlotForm(true);
  };

  // Context menu handlers
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
      setSlotToDelete(selectedSlot);
      setDeleteConfirmDialog(true);
    } else {
      handleSlotDelete(selectedSlot.id, 'Cancelled by provider');
    }
    handleContextMenuClose();
  };

  // View change handlers
  const handleViewChange = (view) => {
    setCurrentView(view);
    const calendarApi = calendarRef.current.getApi();
    calendarApi.changeView(view);
  };

  const handlePrev = () => {
    const calendarApi = calendarRef.current.getApi();
    calendarApi.prev();
  };

  const handleNext = () => {
    const calendarApi = calendarRef.current.getApi();
    calendarApi.next();
  };

  const handleToday = () => {
    const calendarApi = calendarRef.current.getApi();
    calendarApi.today();
  };

  // Custom event content
  const renderEventContent = (eventInfo) => {
    const { slot, isBooked, hasBookings } = eventInfo.event.extendedProps;
    
    return (
      <Box sx={{ p: 0.5, overflow: 'hidden' }}>
        <Typography variant="caption" sx={{ 
          fontSize: '0.7rem', 
          fontWeight: 'bold',
          color: 'white',
          lineHeight: 1.2
        }}>
          {slot.appointmentType}
        </Typography>
        <Typography variant="caption" sx={{ 
          fontSize: '0.65rem', 
          color: 'rgba(255,255,255,0.9)',
          display: 'block'
        }}>
          {slot.bookedAppointments}/{slot.maxAppointments} booked
        </Typography>
        {slot.location?.room && (
          <Typography variant="caption" sx={{ 
            fontSize: '0.6rem', 
            color: 'rgba(255,255,255,0.8)',
            display: 'block'
          }}>
            {slot.location.room}
          </Typography>
        )}
      </Box>
    );
  };

  const viewButtons = [
    { view: 'dayGridMonth', label: 'Month', icon: <ViewModule /> },
    { view: 'timeGridWeek', label: 'Week', icon: <ViewWeek /> },
    { view: 'timeGridDay', label: 'Day', icon: <ViewDayIcon /> },
    { view: 'listWeek', label: 'List', icon: <ListIcon /> }
  ];

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
      <Paper elevation={1} sx={{ p: 2, mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
          {/* Navigation Controls */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <IconButton onClick={handlePrev} size="small">
              <ChevronLeft />
            </IconButton>
            
            <Button
              variant="outlined"
              onClick={handleToday}
              startIcon={<CalendarToday />}
              size="small"
            >
              Today
            </Button>
            
            <IconButton onClick={handleNext} size="small">
              <ChevronRight />
            </IconButton>
          </Box>

          {/* View Controls */}
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            {viewButtons.map((button) => (
              <Button
                key={button.view}
                variant={currentView === button.view ? 'contained' : 'outlined'}
                size="small"
                startIcon={button.icon}
                onClick={() => handleViewChange(button.view)}
                sx={{ minWidth: 'auto' }}
              >
                {button.label}
              </Button>
            ))}
          </Box>
        </Box>
      </Paper>

      {/* Legend */}
      <Box sx={{ mb: 2, display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
        <Typography variant="body2" color="text.secondary">
          Legend:
        </Typography>
        <Chip
          size="small"
          label="Available"
          sx={{ bgcolor: '#1976d2', color: 'white' }}
        />
        <Chip
          size="small"
          label="Partially Booked"
          sx={{ bgcolor: '#ed6c02', color: 'white' }}
        />
        <Chip
          size="small"
          label="Fully Booked"
          sx={{ bgcolor: '#d32f2f', color: 'white' }}
        />
      </Box>

      {/* Error Alert */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* FullCalendar */}
      {loading ? (
        <LoadingSpinner message="Loading availability..." />
      ) : (
        <Paper elevation={2} sx={{ p: 2 }}>
          <FullCalendar
            ref={calendarRef}
            plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin, listPlugin]}
            initialView={currentView}
            events={calendarEvents}
            selectable={true}
            selectMirror={true}
            dayMaxEvents={true}
            weekends={true}
            eventClick={handleEventClick}
            select={handleDateSelect}
            dateClick={handleDateClick}
            eventContent={renderEventContent}
            headerToolbar={false} // We're using custom header
            height="auto"
            slotMinTime="06:00:00"
            slotMaxTime="22:00:00"
            allDaySlot={false}
            eventDisplay="block"
            displayEventTime={true}
            eventTimeFormat={{
              hour: 'numeric',
              minute: '2-digit',
              meridiem: 'short'
            }}
            slotLabelFormat={{
              hour: 'numeric',
              minute: '2-digit',
              meridiem: 'short'
            }}
            businessHours={{
              daysOfWeek: [1, 2, 3, 4, 5], // Monday - Friday
              startTime: '08:00',
              endTime: '18:00'
            }}
            selectConstraint="businessHours"
            eventConstraint="businessHours"
            nowIndicator={true}
            scrollTime="08:00:00"
            slotDuration="00:30:00"
            slotLabelInterval="01:00:00"
          />
        </Paper>
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