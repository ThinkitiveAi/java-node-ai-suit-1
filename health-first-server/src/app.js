const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const mongoSanitize = require('express-mongo-sanitize');
const cookieParser = require('cookie-parser');
const providerRoutes = require('./routes/providerRoutes');
const patientRoutes = require('./routes/patientRoutes');
const availabilityRoutes = require('./routes/availabilityRoutes');
const appointmentRoutes = require('./routes/appointmentRoutes');

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(cookieParser());
app.use(mongoSanitize());

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Health First API is running',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

app.use('/api/v1/provider', providerRoutes);
app.use('/api/v1/patient', patientRoutes);
app.use('/api/v1', availabilityRoutes);
app.use('/api/v1', appointmentRoutes);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
    error_code: 'ROUTE_NOT_FOUND',
    timestamp: new Date().toISOString(),
    request_id: req.headers['x-request-id'] || null
  });
});

// Error handler (basic, can be expanded)
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({
    success: false,
    message: err.message || 'Internal server error',
    error_id: 'ERR_APP_001',
    timestamp: new Date().toISOString(),
    request_id: req.headers['x-request-id'] || null
  });
});

module.exports = app; 