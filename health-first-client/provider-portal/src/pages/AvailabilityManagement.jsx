import React, { useState } from 'react';
import {
  Box,
  Container,
  Alert,
  Snackbar
} from '@mui/material';
import AvailabilityCalendar from '../components/availability/AvailabilityCalendar';

const AvailabilityManagement = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  // Mock provider ID - in real app, get from auth context
  const providerId = 'provider_123';

  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleSnackbarClose = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  // Mock API handlers
  const handleSlotCreate = async (slotData) => {
    setLoading(true);
    setError(null);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock validation
      if (!slotData.date || !slotData.startTime || !slotData.endTime) {
        throw new Error('Required fields are missing');
      }

      // Create new slot with generated ID
      const newSlot = {
        id: Date.now().toString(),
        providerId,
        ...slotData,
        bookedAppointments: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      showSnackbar('Availability slot created successfully!');
      console.log('Created slot:', newSlot);
      return newSlot;

    } catch (error) {
      const errorMessage = error.message || 'Failed to create availability slot';
      setError(errorMessage);
      showSnackbar(errorMessage, 'error');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const handleSlotUpdate = async (slotId, slotData) => {
    setLoading(true);
    setError(null);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock validation
      if (!slotData.date || !slotData.startTime || !slotData.endTime) {
        throw new Error('Required fields are missing');
      }

      // Update slot
      const updatedSlot = {
        id: slotId,
        providerId,
        ...slotData,
        updatedAt: new Date().toISOString()
      };

      showSnackbar('Availability slot updated successfully!');
      console.log('Updated slot:', updatedSlot);
      return updatedSlot;

    } catch (error) {
      const errorMessage = error.message || 'Failed to update availability slot';
      setError(errorMessage);
      showSnackbar(errorMessage, 'error');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const handleSlotDelete = async (slotId, reason) => {
    setLoading(true);
    setError(null);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // In real implementation, you might want to:
      // 1. Cancel associated appointments
      // 2. Send notifications to patients
      // 3. Log the deletion reason
      
      showSnackbar(`Availability slot deleted. Reason: ${reason}`);
      console.log('Deleted slot:', slotId, 'Reason:', reason);
      
    } catch (error) {
      const errorMessage = error.message || 'Failed to delete availability slot';
      setError(errorMessage);
      showSnackbar(errorMessage, 'error');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      <AvailabilityCalendar
        providerId={providerId}
        onSlotCreate={handleSlotCreate}
        onSlotUpdate={handleSlotUpdate}
        onSlotDelete={handleSlotDelete}
        loading={loading}
        error={error}
      />

      {/* Success/Error Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          onClose={handleSnackbarClose}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default AvailabilityManagement; 