const Appointment = require('../models/Appointment');
const TimeSlot = require('../models/TimeSlot');
const Patient = require('../models/Patient');
const Provider = require('../models/Provider');
const { appointmentSchema, updateAppointmentSchema, cancelAppointmentSchema, getAppointmentsSchema } = require('../validation/appointmentValidation');

// Book a new appointment
const bookAppointment = async (req, res) => {
  try {
    const { error, value } = appointmentSchema.validate(req.body);
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

    // Check if patient exists
    const patient = await Patient.findById(value.patientId);
    if (!patient) {
      return res.status(404).json({
        success: false,
        message: 'Patient not found',
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

    // Check if time slot is available
    const existingAppointment = await Appointment.findOne({
      providerId: value.providerId,
      appointmentDate: value.appointmentDate,
      $or: [
        {
          startTime: { $lt: value.endTime },
          endTime: { $gt: value.startTime }
        }
      ],
      status: { $nin: ['cancelled', 'no-show'] }
    });

    if (existingAppointment) {
      return res.status(409).json({
        success: false,
        message: 'Time slot is not available',
        timestamp: new Date().toISOString(),
        request_id: req.headers['x-request-id'] || null
      });
    }

    // Create appointment
    const appointment = new Appointment(value);
    await appointment.save();

    // Update time slot as booked
    await TimeSlot.findOneAndUpdate(
      {
        providerId: value.providerId,
        date: value.appointmentDate,
        startTime: value.startTime,
        endTime: value.endTime
      },
      {
        isBooked: true,
        appointmentId: appointment._id
      }
    );

    // Populate patient and provider details
    await appointment.populate('patientId', 'firstName lastName email phone dateOfBirth');
    await appointment.populate('providerId', 'firstName lastName email phone specialization');

    res.status(201).json({
      success: true,
      message: 'Appointment booked successfully',
      data: appointment,
      timestamp: new Date().toISOString(),
      request_id: req.headers['x-request-id'] || null
    });
  } catch (error) {
    console.error('Error booking appointment:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      timestamp: new Date().toISOString(),
      request_id: req.headers['x-request-id'] || null
    });
  }
};

// Get appointment by ID
const getAppointment = async (req, res) => {
  try {
    const { id } = req.params;

    const appointment = await Appointment.findById(id)
      .populate('patientId', 'firstName lastName email phone dateOfBirth')
      .populate('providerId', 'firstName lastName email phone specialization');

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found',
        timestamp: new Date().toISOString(),
        request_id: req.headers['x-request-id'] || null
      });
    }

    res.status(200).json({
      success: true,
      message: 'Appointment retrieved successfully',
      data: appointment,
      timestamp: new Date().toISOString(),
      request_id: req.headers['x-request-id'] || null
    });
  } catch (error) {
    console.error('Error getting appointment:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      timestamp: new Date().toISOString(),
      request_id: req.headers['x-request-id'] || null
    });
  }
};

// Update appointment
const updateAppointment = async (req, res) => {
  try {
    const { id } = req.params;
    const { error, value } = updateAppointmentSchema.validate(req.body);
    
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

    const appointment = await Appointment.findByIdAndUpdate(
      id,
      { ...value, updatedAt: new Date() },
      { new: true, runValidators: true }
    ).populate('patientId', 'firstName lastName email phone dateOfBirth')
     .populate('providerId', 'firstName lastName email phone specialization');

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found',
        timestamp: new Date().toISOString(),
        request_id: req.headers['x-request-id'] || null
      });
    }

    res.status(200).json({
      success: true,
      message: 'Appointment updated successfully',
      data: appointment,
      timestamp: new Date().toISOString(),
      request_id: req.headers['x-request-id'] || null
    });
  } catch (error) {
    console.error('Error updating appointment:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      timestamp: new Date().toISOString(),
      request_id: req.headers['x-request-id'] || null
    });
  }
};

// Cancel appointment
const cancelAppointment = async (req, res) => {
  try {
    const { id } = req.params;
    const { error, value } = cancelAppointmentSchema.validate(req.body);
    
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

    const appointment = await Appointment.findByIdAndUpdate(
      id,
      {
        status: 'cancelled',
        cancellationReason: value.cancellationReason,
        cancelledBy: value.cancelledBy,
        cancelledAt: new Date(),
        updatedAt: new Date()
      },
      { new: true }
    ).populate('patientId', 'firstName lastName email phone dateOfBirth')
     .populate('providerId', 'firstName lastName email phone specialization');

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found',
        timestamp: new Date().toISOString(),
        request_id: req.headers['x-request-id'] || null
      });
    }

    // Free up the time slot
    await TimeSlot.findOneAndUpdate(
      {
        providerId: appointment.providerId,
        date: appointment.appointmentDate,
        startTime: appointment.startTime,
        endTime: appointment.endTime
      },
      {
        isBooked: false,
        appointmentId: null
      }
    );

    res.status(200).json({
      success: true,
      message: 'Appointment cancelled successfully',
      data: appointment,
      timestamp: new Date().toISOString(),
      request_id: req.headers['x-request-id'] || null
    });
  } catch (error) {
    console.error('Error cancelling appointment:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      timestamp: new Date().toISOString(),
      request_id: req.headers['x-request-id'] || null
    });
  }
};

// Get appointments with filters
const getAppointments = async (req, res) => {
  try {
    const { error, value } = getAppointmentsSchema.validate(req.query);
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

    const {
      providerId,
      patientId,
      status,
      startDate,
      endDate,
      appointmentType,
      page = 1,
      limit = 10,
      search
    } = value;

    // Build query
    const query = {};
    if (providerId) query.providerId = providerId;
    if (patientId) query.patientId = patientId;
    if (status) query.status = status;
    if (appointmentType) query.appointmentType = appointmentType;
    if (startDate || endDate) {
      query.appointmentDate = {};
      if (startDate) query.appointmentDate.$gte = new Date(startDate);
      if (endDate) query.appointmentDate.$lte = new Date(endDate);
    }

    // Search functionality
    if (search) {
      query.$or = [
        { appointmentId: { $regex: search, $options: 'i' } },
        { reasonForVisit: { $regex: search, $options: 'i' } }
      ];
    }

    // Calculate pagination
    const skip = (page - 1) * limit;
    const total = await Appointment.countDocuments(query);
    const totalPages = Math.ceil(total / limit);

    // Get appointments with pagination
    const appointments = await Appointment.find(query)
      .populate('patientId', 'firstName lastName email phone dateOfBirth')
      .populate('providerId', 'firstName lastName email phone specialization')
      .sort({ appointmentDate: 1, startTime: 1 })
      .skip(skip)
      .limit(limit);

    res.status(200).json({
      success: true,
      message: 'Appointments retrieved successfully',
      data: appointments,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1
      },
      timestamp: new Date().toISOString(),
      request_id: req.headers['x-request-id'] || null
    });
  } catch (error) {
    console.error('Error getting appointments:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      timestamp: new Date().toISOString(),
      request_id: req.headers['x-request-id'] || null
    });
  }
};

// Start appointment
const startAppointment = async (req, res) => {
  try {
    const { id } = req.params;

    const appointment = await Appointment.findByIdAndUpdate(
      id,
      {
        status: 'in-exam',
        updatedAt: new Date()
      },
      { new: true }
    ).populate('patientId', 'firstName lastName email phone dateOfBirth')
     .populate('providerId', 'firstName lastName email phone specialization');

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found',
        timestamp: new Date().toISOString(),
        request_id: req.headers['x-request-id'] || null
      });
    }

    res.status(200).json({
      success: true,
      message: 'Appointment started successfully',
      data: appointment,
      timestamp: new Date().toISOString(),
      request_id: req.headers['x-request-id'] || null
    });
  } catch (error) {
    console.error('Error starting appointment:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      timestamp: new Date().toISOString(),
      request_id: req.headers['x-request-id'] || null
    });
  }
};

// Complete appointment
const completeAppointment = async (req, res) => {
  try {
    const { id } = req.params;

    const appointment = await Appointment.findByIdAndUpdate(
      id,
      {
        status: 'completed',
        updatedAt: new Date()
      },
      { new: true }
    ).populate('patientId', 'firstName lastName email phone dateOfBirth')
     .populate('providerId', 'firstName lastName email phone specialization');

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found',
        timestamp: new Date().toISOString(),
        request_id: req.headers['x-request-id'] || null
      });
    }

    res.status(200).json({
      success: true,
      message: 'Appointment completed successfully',
      data: appointment,
      timestamp: new Date().toISOString(),
      request_id: req.headers['x-request-id'] || null
    });
  } catch (error) {
    console.error('Error completing appointment:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      timestamp: new Date().toISOString(),
      request_id: req.headers['x-request-id'] || null
    });
  }
};

module.exports = {
  bookAppointment,
  getAppointment,
  updateAppointment,
  cancelAppointment,
  getAppointments,
  startAppointment,
  completeAppointment
}; 