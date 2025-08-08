import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Typography,
  Button,
  FormControlLabel,
  Switch,
  Chip,
  Alert,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  InputAdornment,
  Divider
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  Schedule as ScheduleIcon,
  LocationOn as LocationIcon,
  AttachMoney as MoneyIcon,
  Repeat as RepeatIcon,
  LocalOffer as TagIcon,
  Notes as NotesIcon
} from '@mui/icons-material';
import { DatePicker, TimePicker } from '@mui/x-date-pickers';
import FormField from '../shared/FormField';
import LoadingSpinner from '../shared/LoadingSpinner';
import useFormValidation from '../../hooks/useFormValidation';
import { sanitizeInput } from '../../utils/providerValidation';

const SlotCreationForm = ({
  slot = null,
  onSubmit,
  onCancel,
  loading = false
}) => {
  const [isRecurring, setIsRecurring] = useState(slot?.isRecurring || false);
  const [selectedTags, setSelectedTags] = useState(slot?.tags || []);
  const [customTag, setCustomTag] = useState('');
  const [accordionExpanded, setAccordionExpanded] = useState({
    location: false,
    pricing: false,
    recurrence: false,
    notes: false
  });

  // Available options
  const timezones = [
    'America/New_York',
    'America/Chicago', 
    'America/Denver',
    'America/Los_Angeles',
    'America/Phoenix',
    'UTC'
  ];

  const appointmentTypes = [
    { value: 'consultation', label: 'Consultation' },
    { value: 'follow-up', label: 'Follow-up' },
    { value: 'emergency', label: 'Emergency' },
    { value: 'surgery', label: 'Surgery' },
    { value: 'therapy', label: 'Therapy' },
    { value: 'screening', label: 'Screening' }
  ];

  const locationTypes = [
    { value: 'clinic', label: 'In-Person (Clinic)' },
    { value: 'telemedicine', label: 'Telemedicine' },
    { value: 'home-visit', label: 'Home Visit' },
    { value: 'hospital', label: 'Hospital' }
  ];

  const recurrencePatterns = [
    { value: 'daily', label: 'Daily' },
    { value: 'weekly', label: 'Weekly' },
    { value: 'monthly', label: 'Monthly' }
  ];

  const currencies = [
    { value: 'USD', label: 'USD ($)' },
    { value: 'EUR', label: 'EUR (€)' },
    { value: 'GBP', label: 'GBP (£)' },
    { value: 'CAD', label: 'CAD (C$)' }
  ];

  const commonTags = [
    'new-patients', 'follow-up', 'emergency', 'consultation',
    'telemedicine', 'specialty', 'urgent', 'routine'
  ];

  const insuranceProviders = [
    'BlueCross', 'Aetna', 'Cigna', 'UnitedHealth', 
    'Medicare', 'Medicaid', 'Humana', 'Kaiser'
  ];

  // Initial form values
  const initialValues = {
    date: slot?.date ? new Date(slot.date) : new Date(),
    startTime: slot?.startTime ? new Date(`2024-01-01T${slot.startTime}:00`) : new Date(),
    endTime: slot?.endTime ? new Date(`2024-01-01T${slot.endTime}:00`) : new Date(),
    timezone: slot?.timezone || 'America/New_York',
    appointmentType: slot?.appointmentType || '',
    slotDuration: slot?.slotDuration || 60,
    breakDuration: slot?.breakDuration || 15,
    maxAppointments: slot?.maxAppointments || 1,
    
    // Location
    locationType: slot?.location?.type || '',
    locationAddress: slot?.location?.address || '',
    locationRoom: slot?.location?.room || '',
    
    // Pricing
    fee: slot?.pricing?.fee || '',
    currency: slot?.pricing?.currency || 'USD',
    insuranceAccepted: slot?.pricing?.insuranceAccepted || [],
    
    // Recurrence
    recurrencePattern: slot?.recurrence?.pattern || 'weekly',
    recurrenceEndDate: slot?.recurrence?.endDate ? new Date(slot.recurrence.endDate) : null,
    
    // Notes
    notes: slot?.notes || '',
    specialRequirements: slot?.specialRequirements || ''
  };

  // Validation rules
  const validationRules = {
    date: (value) => {
      if (!value) return 'Date is required';
      if (value < new Date().setHours(0, 0, 0, 0)) return 'Date cannot be in the past';
      return null;
    },
    startTime: (value) => {
      if (!value) return 'Start time is required';
      return null;
    },
    endTime: (value, allValues) => {
      if (!value) return 'End time is required';
      if (allValues.startTime && value <= allValues.startTime) {
        return 'End time must be after start time';
      }
      return null;
    },
    appointmentType: (value) => {
      if (!value) return 'Appointment type is required';
      return null;
    },
    slotDuration: (value) => {
      const duration = parseInt(value);
      if (!duration || duration < 15 || duration > 240) {
        return 'Slot duration must be between 15 and 240 minutes';
      }
      return null;
    },
    breakDuration: (value) => {
      const duration = parseInt(value);
      if (duration < 0 || duration > 60) {
        return 'Break duration must be between 0 and 60 minutes';
      }
      return null;
    },
    maxAppointments: (value) => {
      const max = parseInt(value);
      if (!max || max < 1 || max > 10) {
        return 'Maximum appointments must be between 1 and 10';
      }
      return null;
    },
    locationType: (value) => {
      if (!value) return 'Location type is required';
      return null;
    },
    locationAddress: (value, allValues) => {
      if (['clinic', 'hospital', 'home-visit'].includes(allValues.locationType) && !value?.trim()) {
        return 'Address is required for this location type';
      }
      return null;
    },
    fee: (value) => {
      if (value && (isNaN(value) || value < 0)) {
        return 'Fee must be a valid positive number';
      }
      return null;
    },
    recurrenceEndDate: (value, allValues) => {
      if (isRecurring && (!value || value <= allValues.date)) {
        return 'Recurrence end date must be after the slot date';
      }
      return null;
    }
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
    setValue,
    setFieldError
  } = useFormValidation(initialValues, validationRules, {
    validateOnBlur: true,
    validateOnChange: false,
    validateOnSubmit: true
  });

  // Handle form submission
  const onFormSubmit = async (formData) => {
    try {
      // Format the data
      const slotData = {
        ...formData,
        date: formData.date.toISOString().split('T')[0],
        startTime: formData.startTime.toTimeString().slice(0, 5),
        endTime: formData.endTime.toTimeString().slice(0, 5),
        location: {
          type: formData.locationType,
          address: formData.locationAddress,
          room: formData.locationRoom
        },
        pricing: {
          fee: parseFloat(formData.fee) || 0,
          currency: formData.currency,
          insuranceAccepted: formData.insuranceAccepted
        },
        tags: selectedTags,
        isRecurring,
        recurrence: isRecurring ? {
          pattern: formData.recurrencePattern,
          endDate: formData.recurrenceEndDate?.toISOString().split('T')[0]
        } : null,
        notes: sanitizeInput(formData.notes),
        specialRequirements: sanitizeInput(formData.specialRequirements)
      };

      await onSubmit(slotData);
    } catch (error) {
      console.error('Error submitting slot:', error);
    }
  };

  const handleFormSubmit = handleSubmit(onFormSubmit);

  // Handle tag management
  const handleAddTag = () => {
    if (customTag.trim() && !selectedTags.includes(customTag.trim())) {
      setSelectedTags(prev => [...prev, customTag.trim()]);
      setCustomTag('');
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    setSelectedTags(prev => prev.filter(tag => tag !== tagToRemove));
  };

  const handleCommonTagClick = (tag) => {
    if (!selectedTags.includes(tag)) {
      setSelectedTags(prev => [...prev, tag]);
    }
  };

  // Handle insurance selection
  const handleInsuranceChange = (event) => {
    const value = event.target.value;
    setValue('insuranceAccepted', typeof value === 'string' ? value.split(',') : value);
  };

  // Handle accordion expansion
  const handleAccordionChange = (panel) => (event, isExpanded) => {
    setAccordionExpanded(prev => ({
      ...prev,
      [panel]: isExpanded
    }));
  };

  return (
    <Box sx={{ py: 2 }}>
      <form onSubmit={handleFormSubmit}>
        {loading && (
          <LoadingSpinner overlay message="Saving slot..." />
        )}

        {/* Basic Information */}
        <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <ScheduleIcon color="primary" />
          Basic Information
        </Typography>
        
        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid item xs={12} md={4}>
            <DatePicker
              label="Date"
              value={values.date}
              onChange={(newValue) => setValue('date', newValue)}
              slotProps={{
                textField: {
                  required: true,
                  error: !!errors.date,
                  helperText: errors.date,
                  fullWidth: true
                }
              }}
            />
          </Grid>
          
          <Grid item xs={12} md={4}>
            <TimePicker
              label="Start Time"
              value={values.startTime}
              onChange={(newValue) => setValue('startTime', newValue)}
              slotProps={{
                textField: {
                  required: true,
                  error: !!errors.startTime,
                  helperText: errors.startTime,
                  fullWidth: true
                }
              }}
            />
          </Grid>
          
          <Grid item xs={12} md={4}>
            <TimePicker
              label="End Time"
              value={values.endTime}
              onChange={(newValue) => setValue('endTime', newValue)}
              slotProps={{
                textField: {
                  required: true,
                  error: !!errors.endTime,
                  helperText: errors.endTime,
                  fullWidth: true
                }
              }}
            />
          </Grid>
          
          <Grid item xs={12} md={6}>
            <FormField
              type="select"
              label="Timezone"
              required
              options={timezones.map(tz => ({ value: tz, label: tz }))}
              {...getFieldProps('timezone')}
              onChange={handleChange}
              onBlur={handleBlur}
            />
          </Grid>
          
          <Grid item xs={12} md={6}>
            <FormField
              type="select"
              label="Appointment Type"
              required
              options={appointmentTypes}
              {...getFieldProps('appointmentType')}
              onChange={handleChange}
              onBlur={handleBlur}
            />
          </Grid>
          
          <Grid item xs={12} md={4}>
            <FormField
              type="number"
              label="Slot Duration (minutes)"
              required
              inputProps={{ min: 15, max: 240, step: 15 }}
              {...getFieldProps('slotDuration')}
              onChange={handleChange}
              onBlur={handleBlur}
            />
          </Grid>
          
          <Grid item xs={12} md={4}>
            <FormField
              type="number"
              label="Break Duration (minutes)"
              inputProps={{ min: 0, max: 60, step: 5 }}
              {...getFieldProps('breakDuration')}
              onChange={handleChange}
              onBlur={handleBlur}
            />
          </Grid>
          
          <Grid item xs={12} md={4}>
            <FormField
              type="number"
              label="Max Appointments"
              required
              inputProps={{ min: 1, max: 10 }}
              {...getFieldProps('maxAppointments')}
              onChange={handleChange}
              onBlur={handleBlur}
            />
          </Grid>
        </Grid>

        <Divider sx={{ my: 3 }} />

        {/* Location Information */}
        <Accordion 
          expanded={accordionExpanded.location}
          onChange={handleAccordionChange('location')}
        >
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <LocationIcon color="primary" />
              Location Details
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <FormField
                  type="select"
                  label="Location Type"
                  required
                  options={locationTypes}
                  {...getFieldProps('locationType')}
                  onChange={handleChange}
                  onBlur={handleBlur}
                />
              </Grid>
              
              {['clinic', 'hospital', 'home-visit'].includes(values.locationType) && (
                <>
                  <Grid item xs={12} md={8}>
                    <FormField
                      type="text"
                      label="Address"
                      required
                      placeholder="Enter full address"
                      {...getFieldProps('locationAddress')}
                      onChange={handleChange}
                      onBlur={handleBlur}
                    />
                  </Grid>
                  
                  <Grid item xs={12} md={4}>
                    <FormField
                      type="text"
                      label="Room/Suite"
                      placeholder="Room 101"
                      {...getFieldProps('locationRoom')}
                      onChange={handleChange}
                      onBlur={handleBlur}
                    />
                  </Grid>
                </>
              )}
            </Grid>
          </AccordionDetails>
        </Accordion>

        {/* Pricing Information */}
        <Accordion 
          expanded={accordionExpanded.pricing}
          onChange={handleAccordionChange('pricing')}
        >
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <MoneyIcon color="primary" />
              Pricing & Insurance
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <FormField
                  type="number"
                  label="Consultation Fee"
                  inputProps={{ min: 0, step: 0.01 }}
                  InputProps={{
                    startAdornment: <InputAdornment position="start">$</InputAdornment>
                  }}
                  {...getFieldProps('fee')}
                  onChange={handleChange}
                  onBlur={handleBlur}
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <FormField
                  type="select"
                  label="Currency"
                  options={currencies}
                  {...getFieldProps('currency')}
                  onChange={handleChange}
                  onBlur={handleBlur}
                />
              </Grid>
              
              <Grid item xs={12}>
                <FormField
                  type="multiselect"
                  label="Insurance Accepted"
                  options={insuranceProviders.map(provider => ({ value: provider, label: provider }))}
                  value={values.insuranceAccepted}
                  onChange={handleInsuranceChange}
                />
              </Grid>
            </Grid>
          </AccordionDetails>
        </Accordion>

        {/* Recurrence Settings */}
        <Accordion 
          expanded={accordionExpanded.recurrence}
          onChange={handleAccordionChange('recurrence')}
        >
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <RepeatIcon color="primary" />
              Recurrence Settings
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Box sx={{ mb: 2 }}>
              <FormControlLabel
                control={
                  <Switch
                    checked={isRecurring}
                    onChange={(e) => setIsRecurring(e.target.checked)}
                  />
                }
                label="Make this a recurring slot"
              />
            </Box>
            
            {isRecurring && (
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <FormField
                    type="select"
                    label="Recurrence Pattern"
                    options={recurrencePatterns}
                    {...getFieldProps('recurrencePattern')}
                    onChange={handleChange}
                    onBlur={handleBlur}
                  />
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <DatePicker
                    label="End Date"
                    value={values.recurrenceEndDate}
                    onChange={(newValue) => setValue('recurrenceEndDate', newValue)}
                    slotProps={{
                      textField: {
                        required: isRecurring,
                        error: !!errors.recurrenceEndDate,
                        helperText: errors.recurrenceEndDate,
                        fullWidth: true
                      }
                    }}
                  />
                </Grid>
              </Grid>
            )}
          </AccordionDetails>
        </Accordion>

        {/* Tags and Notes */}
        <Accordion 
          expanded={accordionExpanded.notes}
          onChange={handleAccordionChange('notes')}
        >
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <TagIcon color="primary" />
              Tags & Notes
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Typography variant="subtitle2" gutterBottom>
                  Tags
                </Typography>
                <Box sx={{ mb: 2 }}>
                  {commonTags.map((tag) => (
                    <Chip
                      key={tag}
                      label={tag}
                      onClick={() => handleCommonTagClick(tag)}
                      color={selectedTags.includes(tag) ? 'primary' : 'default'}
                      variant={selectedTags.includes(tag) ? 'filled' : 'outlined'}
                      sx={{ mr: 1, mb: 1, cursor: 'pointer' }}
                    />
                  ))}
                </Box>
                
                <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                  <FormField
                    type="text"
                    label="Custom Tag"
                    value={customTag}
                    onChange={(e) => setCustomTag(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleAddTag()}
                    sx={{ flexGrow: 1 }}
                  />
                  <Button onClick={handleAddTag} variant="outlined">
                    Add
                  </Button>
                </Box>
                
                <Box>
                  {selectedTags.map((tag) => (
                    <Chip
                      key={tag}
                      label={tag}
                      onDelete={() => handleRemoveTag(tag)}
                      color="primary"
                      sx={{ mr: 1, mb: 1 }}
                    />
                  ))}
                </Box>
              </Grid>
              
              <Grid item xs={12}>
                <FormField
                  type="text"
                  label="Notes"
                  multiline
                  rows={3}
                  placeholder="Any additional notes about this slot..."
                  {...getFieldProps('notes')}
                  onChange={handleChange}
                  onBlur={handleBlur}
                />
              </Grid>
              
              <Grid item xs={12}>
                <FormField
                  type="text"
                  label="Special Requirements"
                  multiline
                  rows={2}
                  placeholder="Any special requirements or instructions..."
                  {...getFieldProps('specialRequirements')}
                  onChange={handleChange}
                  onBlur={handleBlur}
                />
              </Grid>
            </Grid>
          </AccordionDetails>
        </Accordion>

        {/* Action Buttons */}
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 4 }}>
          <Button
            onClick={onCancel}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={!isValid || isSubmitting}
          >
            {slot?.id ? 'Update Slot' : 'Create Slot'}
          </Button>
        </Box>
      </form>
    </Box>
  );
};

export default SlotCreationForm; 