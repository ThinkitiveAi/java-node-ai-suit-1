const express = require('express');
const router = express.Router();
const availabilityController = require('../controllers/availabilityController');
const { authenticateToken } = require('../middleware/authentication');
const { authorizeRole } = require('../middleware/authorization');
const { validateRequest } = require('../middleware/validation');
const { availabilitySchema, bulkAvailabilitySchema, blockDaySchema, getAvailableSlotsSchema } = require('../validation/availabilityValidation');

// Apply authentication middleware to all routes
router.use(authenticateToken);

// Provider Availability Management Routes
// POST /api/v1/providers/availability - Create availability
router.post('/providers/availability', 
  authorizeRole(['provider', 'admin']),
  validateRequest(availabilitySchema),
  availabilityController.createAvailability
);

// GET /api/v1/providers/:providerId/availability - Get provider availability
router.get('/providers/:providerId/availability',
  authorizeRole(['provider', 'admin', 'patient']),
  availabilityController.getAvailability
);

// PUT /api/v1/providers/availability/:id - Update availability
router.put('/providers/availability/:id',
  authorizeRole(['provider', 'admin']),
  validateRequest(availabilitySchema),
  availabilityController.updateAvailability
);

// DELETE /api/v1/providers/availability/:id - Delete availability
router.delete('/providers/availability/:id',
  authorizeRole(['provider', 'admin']),
  availabilityController.deleteAvailability
);

// POST /api/v1/providers/availability/bulk - Bulk create weekly schedule
router.post('/providers/availability/bulk',
  authorizeRole(['provider', 'admin']),
  validateRequest(bulkAvailabilitySchema),
  availabilityController.bulkCreateAvailability
);

// GET /api/v1/providers/:providerId/available-slots - Get available time slots
router.get('/providers/:providerId/available-slots',
  authorizeRole(['provider', 'admin', 'patient']),
  validateRequest(getAvailableSlotsSchema, 'query'),
  availabilityController.getAvailableSlots
);

// POST /api/v1/providers/availability/block - Block a specific day/time
router.post('/providers/availability/block',
  authorizeRole(['provider', 'admin']),
  validateRequest(blockDaySchema),
  availabilityController.blockDay
);

module.exports = router; 