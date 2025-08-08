const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI;
const MONGODB_OPTIONS = process.env.MONGODB_OPTIONS || '';

const connectDB = async () => {
  try {
    await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      // Spread options if provided as JSON string
      ...(MONGODB_OPTIONS ? JSON.parse('{"' + decodeURIComponent(MONGODB_OPTIONS.replace(/&/g, '\",\"').replace(/=/g,'\":\"')) + '"}') : {})
    });
    console.log('MongoDB connected');
  } catch (err) {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  }
};

mongoose.connection.on('connected', () => {
  console.log('Mongoose connected to DB');
});

mongoose.connection.on('error', (err) => {
  console.error('Mongoose connection error:', err);
});

mongoose.connection.on('disconnected', () => {
  console.warn('Mongoose disconnected');
});

process.on('SIGINT', async () => {
  await mongoose.connection.close();
  console.log('Mongoose connection closed on app termination');
  process.exit(0);
});

module.exports = connectDB; 