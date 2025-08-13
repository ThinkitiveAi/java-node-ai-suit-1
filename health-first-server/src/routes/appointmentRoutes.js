const express = require('express');
const router = express.Router();
const appointmentController = require('../controllers/appointmentController');
const { authenticateToken } = require('../middleware/authentication');
const { authorizeRole } = require('../middleware/authorization');
const { validateRequest } = require('../middleware/validation');
const { appointmentSchema, updateAppointmentSchema, cancelAppointmentSchema, getAppointmentsSchema } = require('../validation/appointmentValidation');

// Apply authentication middleware to all routes
router.use(authenticateToken);

// Appointment Booking & Management Routes
// POST /api/v1/appointments - Book new appointment
router.post('/appointments',
  authorizeRole(['patient', 'provider', 'admin']),
  validateRequest(appointmentSchema),
  appointmentController.bookAppointment
);

// GET /api/v1/appointments/:id - Get appointment by ID
router.get('/appointments/:id',
  authorizeRole(['patient', 'provider', 'admin']),
  appointmentController.getAppointment
);

// PUT /api/v1/appointments/:id - Update appointment
router.put('/appointments/:id',
  authorizeRole(['patient', 'provider', 'admin']),
  validateRequest(updateAppointmentSchema),
  appointmentController.updateAppointment
);

// DELETE /api/v1/appointments/:id - Cancel appointment
router.delete('/appointments/:id',
  authorizeRole(['patient', 'provider', 'admin']),
  validateRequest(cancelAppointmentSchema),
  appointmentController.cancelAppointment
);

// GET /api/v1/appointments - Get appointments with filters
router.get('/appointments',
  authorizeRole(['patient', 'provider', 'admin']),
  validateRequest(getAppointmentsSchema, 'query'),
  appointmentController.getAppointments
);

// POST /api/v1/appointments/:id/start - Start appointment
router.post('/appointments/:id/start',
  authorizeRole(['provider', 'admin']),
  appointmentController.startAppointment
);

// POST /api/v1/appointments/:id/complete - Complete appointment
router.post('/appointments/:id/complete',
  authorizeRole(['provider', 'admin']),
  appointmentController.completeAppointment
);

module.exports = router; 