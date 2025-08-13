const Availability = require('../models/Availability');
const TimeSlot = require('../models/TimeSlot');
const Provider = require('../models/Provider');
const { availabilitySchema, bulkAvailabilitySchema, blockDaySchema, getAvailableSlotsSchema } = require('../validation/availabilityValidation');

// Create availability for a provider
const createAvailability = async (req, res) => {
  try {
    const { error, value } = availabilitySchema.validate(req.body);
    if (error) {
      return res.status(422).json({
        success: false,
        message: 'Validation failed',
        errors: error.details.map(e => ({
          field: e.path.join('.'),
          message: e.message,
          value: e.context.value
        })),
        timestamp: new Date().toISOString(),
        request_id: req.headers['x-request-id'] || null
      });
    }

    // Check if provider exists
    const provider = await Provider.findById(value.providerId);
    if (!provider) {
      return res.status(404).json({
        success: false,
        message: 'Provider not found',
        timestamp: new Date().toISOString(),
        request_id: req.headers['x-request-id'] || null
      });
    }

    // Check if availability already exists for this day
    const existingAvailability = await Availability.findOne({
      providerId: value.providerId,
      dayOfWeek: value.dayOfWeek
    });

    if (existingAvailability) {
      return res.status(409).json({
        success: false,
        message: 'Availability already exists for this day',
        timestamp: new Date().toISOString(),
        request_id: req.headers['x-request-id'] || null
      });
    }

    const availability = new Availability(value);
    await availability.save();

    res.status(201).json({
      success: true,
      message: 'Availability created successfully',
      data: availability,
      timestamp: new Date().toISOString(),
      request_id: req.headers['x-request-id'] || null
    });
  } catch (error) {
    console.error('Error creating availability:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      timestamp: new Date().toISOString(),
      request_id: req.headers['x-request-id'] || null
    });
  }
};

// Get availability for a provider
const getAvailability = async (req, res) => {
  try {
    const { providerId } = req.params;

    const availability = await Availability.find({ providerId })
      .sort({ dayOfWeek: 1 });

    res.status(200).json({
      success: true,
      message: 'Availability retrieved successfully',
      data: availability,
      timestamp: new Date().toISOString(),
      request_id: req.headers['x-request-id'] || null
    });
  } catch (error) {
    console.error('Error getting availability:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      timestamp: new Date().toISOString(),
      request_id: req.headers['x-request-id'] || null
    });
  }
};

// Update availability
const updateAvailability = async (req, res) => {
  try {
    const { id } = req.params;
    const { error, value } = availabilitySchema.validate(req.body);
    
    if (error) {
      return res.status(422).json({
        success: false,
        message: 'Validation failed',
        errors: error.details.map(e => ({
          field: e.path.join('.'),
          message: e.message,
          value: e.context.value
        })),
        timestamp: new Date().toISOString(),
        request_id: req.headers['x-request-id'] || null
      });
    }

    const availability = await Availability.findByIdAndUpdate(
      id,
      { ...value, updatedAt: new Date() },
      { new: true, runValidators: true }
    );

    if (!availability) {
      return res.status(404).json({
        success: false,
        message: 'Availability not found',
        timestamp: new Date().toISOString(),
        request_id: req.headers['x-request-id'] || null
      });
    }

    res.status(200).json({
      success: true,
      message: 'Availability updated successfully',
      data: availability,
      timestamp: new Date().toISOString(),
      request_id: req.headers['x-request-id'] || null
    });
  } catch (error) {
    console.error('Error updating availability:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      timestamp: new Date().toISOString(),
      request_id: req.headers['x-request-id'] || null
    });
  }
};

// Delete availability
const deleteAvailability = async (req, res) => {
  try {
    const { id } = req.params;

    const availability = await Availability.findByIdAndDelete(id);

    if (!availability) {
      return res.status(404).json({
        success: false,
        message: 'Availability not found',
        timestamp: new Date().toISOString(),
        request_id: req.headers['x-request-id'] || null
      });
    }

    res.status(200).json({
      success: true,
      message: 'Availability deleted successfully',
      timestamp: new Date().toISOString(),
      request_id: req.headers['x-request-id'] || null
    });
  } catch (error) {
    console.error('Error deleting availability:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      timestamp: new Date().toISOString(),
      request_id: req.headers['x-request-id'] || null
    });
  }
};

// Bulk create availability
const bulkCreateAvailability = async (req, res) => {
  try {
    const { error, value } = bulkAvailabilitySchema.validate(req.body);
    if (error) {
      return res.status(422).json({
        success: false,
        message: 'Validation failed',
        errors: error.details.map(e => ({
          field: e.path.join('.'),
          message: e.message,
          value: e.context.value
        })),
        timestamp: new Date().toISOString(),
        request_id: req.headers['x-request-id'] || null
      });
    }

    // Check if provider exists
    const provider = await Provider.findById(value.providerId);
    if (!provider) {
      return res.status(404).json({
        success: false,
        message: 'Provider not found',
        timestamp: new Date().toISOString(),
        request_id: req.headers['x-request-id'] || null
      });
    }

    // Delete existing availability for this provider
    await Availability.deleteMany({ providerId: value.providerId });

    // Create new availability records
    const availabilities = await Availability.insertMany(value.availabilities);

    res.status(201).json({
      success: true,
      message: 'Bulk availability created successfully',
      data: availabilities,
      timestamp: new Date().toISOString(),
      request_id: req.headers['x-request-id'] || null
    });
  } catch (error) {
    console.error('Error creating bulk availability:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      timestamp: new Date().toISOString(),
      request_id: req.headers['x-request-id'] || null
    });
  }
};

// Get available time slots for a provider on a specific date
const getAvailableSlots = async (req, res) => {
  try {
    const { error, value } = getAvailableSlotsSchema.validate(req.query);
    if (error) {
      return res.status(422).json({
        success: false,
        message: 'Validation failed',
        errors: error.details.map(e => ({
          field: e.path.join('.'),
          message: e.message,
          value: e.context.value
        })),
        timestamp: new Date().toISOString(),
        request_id: req.headers['x-request-id'] || null
      });
    }

    const { providerId, date, timezone = 'UTC' } = value;

    // Get provider availability for the day of week
    const dayOfWeek = new Date(date).getDay();
    const availability = await Availability.findOne({
      providerId,
      dayOfWeek,
      isActive: true
    });

    if (!availability) {
      return res.status(200).json({
        success: true,
        message: 'No availability for this date',
        data: [],
        timestamp: new Date().toISOString(),
        request_id: req.headers['x-request-id'] || null
      });
    }

    // Generate time slots for the date
    const timeSlots = await TimeSlot.find({
      providerId,
      date: new Date(date),
      isBooked: false,
      isBlocked: false
    }).sort({ startTime: 1 });

    res.status(200).json({
      success: true,
      message: 'Available slots retrieved successfully',
      data: timeSlots,
      timestamp: new Date().toISOString(),
      request_id: req.headers['x-request-id'] || null
    });
  } catch (error) {
    console.error('Error getting available slots:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      timestamp: new Date().toISOString(),
      request_id: req.headers['x-request-id'] || null
    });
  }
};

// Block a specific day/time
const blockDay = async (req, res) => {
  try {
    const { error, value } = blockDaySchema.validate(req.body);
    if (error) {
      return res.status(422).json({
        success: false,
        message: 'Validation failed',
        errors: error.details.map(e => ({
          field: e.path.join('.'),
          message: e.message,
          value: e.context.value
        })),
        timestamp: new Date().toISOString(),
        request_id: req.headers['x-request-id'] || null
      });
    }

    // Create time slots for the blocked period
    const blockedSlots = await TimeSlot.create({
      providerId: value.providerId,
      date: value.date,
      startTime: value.startTime,
      endTime: value.endTime,
      isBlocked: true,
      blockReason: value.reason || 'Provider blocked',
      timezone: 'UTC'
    });

    res.status(201).json({
      success: true,
      message: 'Day blocked successfully',
      data: blockedSlots,
      timestamp: new Date().toISOString(),
      request_id: req.headers['x-request-id'] || null
    });
  } catch (error) {
    console.error('Error blocking day:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      timestamp: new Date().toISOString(),
      request_id: req.headers['x-request-id'] || null
    });
  }
};

module.exports = {
  createAvailability,
  getAvailability,
  updateAvailability,
  deleteAvailability,
  bulkCreateAvailability,
  getAvailableSlots,
  blockDay
}; 