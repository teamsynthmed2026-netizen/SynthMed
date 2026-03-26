// server.js - CureConnect Backend Main Entry Point
// =====================================================
// MERN Stack Healthcare App - Backend API Server
// Using Express.js + Supabase PostgreSQL
// =====================================================

const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

// Load environment variables from .env file
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// =====================================================
// MIDDLEWARE
// =====================================================

// Allow cross-origin requests from the React frontend
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:3000'], // Vite + CRA ports
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Parse incoming JSON request bodies
app.use(express.json({ limit: '10mb' }));

// Parse URL-encoded form data
app.use(express.urlencoded({ extended: true }));

// Request logger (shows all incoming requests in console)
app.use((req, res, next) => {
  console.log(`📥 ${req.method} ${req.path} - ${new Date().toLocaleTimeString()}`);
  next();
});

// =====================================================
// ROUTES
// =====================================================
const authRoutes = require('./routes/auth');
const symptomsRoutes = require('./routes/symptoms');
const firstAidRoutes = require('./routes/firstaid');
const doctorsRoutes = require('./routes/doctors');
const appointmentsRoutes = require('./routes/appointments');

// Mount routes with /api prefix
app.use('/api/auth', authRoutes);           // Register, Login, Profile
app.use('/api/symptoms', symptomsRoutes);   // Symptom check, History
app.use('/api/firstaid', firstAidRoutes);   // First aid guides
app.use('/api/doctors', doctorsRoutes);     // Find doctors
app.use('/api/appointments', appointmentsRoutes); // Book appointments

// =====================================================
// HEALTH CHECK ENDPOINT
// =====================================================
app.get('/', (req, res) => {
  res.json({
    message: '🏥 CureConnect API is running!',
    version: '1.0.0',
    status: 'healthy',
    endpoints: {
      auth: '/api/auth',
      symptoms: '/api/symptoms/check',
      firstaid: '/api/firstaid',
      doctors: '/api/doctors',
      appointments: '/api/appointments'
    },
    timestamp: new Date().toISOString()
  });
});

// =====================================================
// n8n WEBHOOK ENDPOINT
// Receives automation events from n8n workflows
// =====================================================
app.post('/api/webhook/n8n', (req, res) => {
  const payload = req.body;
  console.log('📨 n8n webhook received:', JSON.stringify(payload, null, 2));

  // Handle different n8n automation events
  switch (payload.event) {
    case 'appointment_reminder':
      console.log(`📅 Appointment reminder for: ${payload.user_email}`);
      break;
    case 'health_alert':
      console.log(`🚨 Health alert triggered: ${payload.message}`);
      break;
    default:
      console.log('📌 Generic webhook event received');
  }

  res.json({ received: true, timestamp: new Date().toISOString() });
});

// =====================================================
// 404 HANDLER - Route not found
// =====================================================
app.use((req, res) => {
  res.status(404).json({
    message: `Route ${req.method} ${req.path} not found`,
    available_routes: ['/api/auth', '/api/symptoms', '/api/firstaid', '/api/doctors', '/api/appointments']
  });
});

// =====================================================
// GLOBAL ERROR HANDLER
// =====================================================
app.use((err, req, res, next) => {
  console.error('❌ Unhandled error:', err.message);
  res.status(500).json({ message: 'Internal server error', error: err.message });
});

// =====================================================
// START SERVER
// =====================================================
app.listen(PORT, () => {
  console.log('');
  console.log('╔════════════════════════════════════════╗');
  console.log('║   🏥  CureConnect API Server Started   ║');
  console.log(`║   🚀  Running on port ${PORT}              ║`);
  console.log(`║   📡  http://localhost:${PORT}             ║`);
  console.log('╚════════════════════════════════════════╝');
  console.log('');
});

module.exports = app;
