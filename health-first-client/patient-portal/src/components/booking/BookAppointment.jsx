import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Typography,
  Grid,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  Stepper,
  Step,
  StepLabel,
  Card,
  CardContent,
  Alert,
  Chip
} from '@mui/material';
import {
  CalendarToday,
  AccessTime,
  Person,
  MedicalServices,
  CheckCircle,
  Schedule
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { TimePicker } from '@mui/x-date-pickers/TimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { format, addDays } from 'date-fns';
import '../../styles/booking.css';

const BookAppointment = () => {
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    appointmentDate: null,
    appointmentTime: null,
    doctorId: '',
    department: '',
    reason: '',
    symptoms: '',
    notes: ''
  });

  const [doctors, setDoctors] = useState([]);
  const [departments, setDepartments] = useState([]);

  const steps = [
    'Select Department & Doctor',
    'Choose Date & Time',
    'Provide Details',
    'Confirm Booking'
  ];

  useEffect(() => {
    loadMockData();
  }, []);

  const loadMockData = () => {
    setDepartments([
      { id: 'cardiology', name: 'Cardiology', icon: '❤️' },
      { id: 'neurology', name: 'Neurology', icon: '🧠' },
      { id: 'orthopedics', name: 'Orthopedics', icon: '🦴' },
      { id: 'dermatology', name: 'Dermatology', icon: '🩺' },
      { id: 'pediatrics', name: 'Pediatrics', icon: '👶' },
      { id: 'general', name: 'General Medicine', icon: '🏥' }
    ]);

    setDoctors([
      { id: '1', name: 'Dr. Sarah Johnson', department: 'cardiology', experience: '15 years', rating: 4.8 },
      { id: '2', name: 'Dr. Michael Chen', department: 'neurology', experience: '12 years', rating: 4.7 },
      { id: '3', name: 'Dr. Emily Rodriguez', department: 'orthopedics', experience: '18 years', rating: 4.9 },
      { id: '4', name: 'Dr. David Kim', department: 'dermatology', experience: '10 years', rating: 4.6 },
      { id: '5', name: 'Dr. Lisa Thompson', department: 'pediatrics', experience: '20 years', rating: 4.9 },
      { id: '6', name: 'Dr. Robert Wilson', department: 'general', experience: '25 years', rating: 4.8 }
    ]);
  };

  const handleNext = () => {
    if (activeStep === steps.length - 1) {
      handleSubmit();
    } else {
      setActiveStep((prevStep) => prevStep + 1);
    }
  };

  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError('');

    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      console.log('Booking appointment:', formData);
      setSuccess(true);
      setLoading(false);
    } catch (err) {
      setError('Failed to book appointment. Please try again.');
      setLoading(false);
    }
  };

  const isStepValid = (step) => {
    switch (step) {
      case 0:
        return formData.department && formData.doctorId;
      case 1:
        return formData.appointmentDate && formData.appointmentTime;
      case 2:
        return formData.reason && formData.symptoms;
      default:
        return true;
    }
  };

  const canProceed = isStepValid(activeStep);

  if (success) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Paper elevation={3} sx={{ p: 4, textAlign: 'center' }}>
          <CheckCircle color="success" sx={{ fontSize: 64, mb: 2 }} />
          <Typography variant="h4" gutterBottom color="success.main">
            Appointment Booked Successfully!
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
            Your appointment has been confirmed. You will receive a confirmation email shortly.
          </Typography>
          <Button
            variant="contained"
            onClick={() => window.location.href = '/dashboard'}
            sx={{ mr: 2 }}
          >
            Go to Dashboard
          </Button>
          <Button
            variant="outlined"
            onClick={() => {
              setSuccess(false);
              setActiveStep(0);
              setFormData({
                appointmentDate: null,
                appointmentTime: null,
                doctorId: '',
                department: '',
                reason: '',
                symptoms: '',
                notes: ''
              });
            }}
          >
            Book Another Appointment
          </Button>
        </Paper>
      </Container>
    );
  }

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Paper elevation={3} sx={{ p: 4 }}>
          <Typography variant="h4" gutterBottom align="center" sx={{ mb: 4 }}>
            <Schedule sx={{ mr: 2, verticalAlign: 'middle' }} />
            Book Your Appointment
          </Typography>

          <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>

          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          <Box sx={{ minHeight: '400px' }}>
            {activeStep === 0 && (
              <Step1Content
                formData={formData}
                departments={departments}
                doctors={doctors}
                onInputChange={handleInputChange}
              />
            )}

            {activeStep === 1 && (
              <Step2Content
                formData={formData}
                onInputChange={handleInputChange}
              />
            )}

            {activeStep === 2 && (
              <Step3Content
                formData={formData}
                onInputChange={handleInputChange}
              />
            )}

            {activeStep === 3 && (
              <Step4Content
                formData={formData}
                doctors={doctors}
                departments={departments}
              />
            )}
          </Box>

          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
            <Button
              disabled={activeStep === 0}
              onClick={handleBack}
              variant="outlined"
            >
              Back
            </Button>
            
            <Button
              variant="contained"
              onClick={handleNext}
              disabled={!canProceed || loading}
            >
              {activeStep === steps.length - 1 ? 'Book Appointment' : 'Next'}
            </Button>
          </Box>
        </Paper>
      </Container>
    </LocalizationProvider>
  );
};

const Step1Content = ({ formData, departments, doctors, onInputChange }) => {
  const filteredDoctors = doctors.filter(doctor => 
    !formData.department || doctor.department === formData.department
  );

  return (
    <Grid container spacing={3}>
      <Grid item xs={12} md={6}>
        <Typography variant="h6" gutterBottom>
          <MedicalServices sx={{ mr: 1, verticalAlign: 'middle' }} />
          Select Department
        </Typography>
        <FormControl fullWidth>
          <InputLabel>Department</InputLabel>
          <Select
            value={formData.department}
            onChange={(e) => onInputChange('department', e.target.value)}
            label="Department"
          >
            {departments.map((dept) => (
              <MenuItem key={dept.id} value={dept.id}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <span style={{ marginRight: '8px' }}>{dept.icon}</span>
                  {dept.name}
                </Box>
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Grid>

      <Grid item xs={12} md={6}>
        <Typography variant="h6" gutterBottom>
          <Person sx={{ mr: 1, verticalAlign: 'middle' }} />
          Select Doctor
        </Typography>
        <FormControl fullWidth>
          <InputLabel>Doctor</InputLabel>
          <Select
            value={formData.doctorId}
            onChange={(e) => onInputChange('doctorId', e.target.value)}
            label="Doctor"
            disabled={!formData.department}
          >
            {filteredDoctors.map((doctor) => (
              <MenuItem key={doctor.id} value={doctor.id}>
                <Box>
                  <Typography variant="body1">{doctor.name}</Typography>
                  <Typography variant="caption" color="text.secondary">
                    {doctor.experience} • ⭐ {doctor.rating}
                  </Typography>
                </Box>
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Grid>
    </Grid>
  );
};

const Step2Content = ({ formData, onInputChange }) => {
  const minDate = addDays(new Date(), 1);

  return (
    <Grid container spacing={3}>
      <Grid item xs={12} md={6}>
        <Typography variant="h6" gutterBottom>
          <CalendarToday sx={{ mr: 1, verticalAlign: 'middle' }} />
          Select Date
        </Typography>
        <DatePicker
          label="Appointment Date"
          value={formData.appointmentDate}
          onChange={(date) => onInputChange('appointmentDate', date)}
          minDate={minDate}
          renderInput={(params) => <TextField {...params} fullWidth />}
        />
      </Grid>

      <Grid item xs={12} md={6}>
        <Typography variant="h6" gutterBottom>
          <AccessTime sx={{ mr: 1, verticalAlign: 'middle' }} />
          Select Time
        </Typography>
        <TimePicker
          label="Appointment Time"
          value={formData.appointmentTime}
          onChange={(time) => onInputChange('appointmentTime', time)}
          renderInput={(params) => <TextField {...params} fullWidth />}
        />
      </Grid>
    </Grid>
  );
};

const Step3Content = ({ formData, onInputChange }) => {
  return (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Typography variant="h6" gutterBottom>
          Appointment Details
        </Typography>
      </Grid>

      <Grid item xs={12}>
        <TextField
          fullWidth
          label="Reason for Visit"
          value={formData.reason}
          onChange={(e) => onInputChange('reason', e.target.value)}
          multiline
          rows={3}
          placeholder="Please describe the reason for your appointment..."
        />
      </Grid>

      <Grid item xs={12}>
        <TextField
          fullWidth
          label="Symptoms"
          value={formData.symptoms}
          onChange={(e) => onInputChange('symptoms', e.target.value)}
          multiline
          rows={3}
          placeholder="Please describe any symptoms you're experiencing..."
        />
      </Grid>

      <Grid item xs={12}>
        <TextField
          fullWidth
          label="Additional Notes"
          value={formData.notes}
          onChange={(e) => onInputChange('notes', e.target.value)}
          multiline
          rows={2}
          placeholder="Any additional information you'd like to share..."
        />
      </Grid>
    </Grid>
  );
};

const Step4Content = ({ formData, doctors, departments }) => {
  const selectedDoctor = doctors.find(d => d.id === formData.doctorId);
  const selectedDepartment = departments.find(d => d.id === formData.department);

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Confirm Your Appointment
      </Typography>
      
      <Card variant="outlined" sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle2" color="text.secondary">
                Department
              </Typography>
              <Typography variant="body1">
                {selectedDepartment?.icon} {selectedDepartment?.name}
              </Typography>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle2" color="text.secondary">
                Doctor
              </Typography>
              <Typography variant="body1">
                {selectedDoctor?.name}
              </Typography>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle2" color="text.secondary">
                Date
              </Typography>
              <Typography variant="body1">
                {formData.appointmentDate ? format(formData.appointmentDate, 'EEEE, MMMM do, yyyy') : 'Not selected'}
              </Typography>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle2" color="text.secondary">
                Time
              </Typography>
              <Typography variant="body1">
                {formData.appointmentTime ? format(formData.appointmentTime, 'h:mm a') : 'Not selected'}
              </Typography>
            </Grid>
            
            <Grid item xs={12}>
              <Typography variant="subtitle2" color="text.secondary">
                Reason
              </Typography>
              <Typography variant="body1">
                {formData.reason || 'Not provided'}
              </Typography>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      <Alert severity="info">
        <Typography variant="body2">
          Please review your appointment details above. Click "Book Appointment" to confirm your booking.
        </Typography>
      </Alert>
    </Box>
  );
};

export default BookAppointment; 