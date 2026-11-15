const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const mongoose = require('mongoose');

const errorHandler = require('./middleware/errorHandler');
const getAllowedOrigins = require('./config/origins');

// Route imports
const authRoutes = require('./routes/authRoutes');
const therapistRoutes = require('./routes/therapistRoutes');
const publicRoutes = require('./routes/publicRoutes');
const clientRoutes = require('./routes/clientRoutes');
const sessionRoutes = require('./routes/sessionRoutes');
const subscriptionRoutes = require('./routes/subscriptionRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const analyticsRoutes = require('./routes/analyticsRoutes');
const chatRoutes = require('./routes/chatRoutes');
const notificationRoutes = require('./routes/notificationRoutes');

const app = express();

// Trust first proxy (Render, Vercel, etc.) so express-rate-limit
// reads the real client IP from X-Forwarded-For instead of crashing.
app.set('trust proxy', 1);

// Security HTTP headers
app.use(
  helmet({
    contentSecurityPolicy: false, // Set false for local API development
    crossOriginEmbedderPolicy: false
  })
);

// ALLOWED_ORIGINS can contain comma-separated additional origins.
const allowedOrigins = getAllowedOrigins();

const corsOptions = {
  origin: function (origin, callback) {
    // Allow server-to-server / curl (no origin header)
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      const error = new Error(`CORS policy: Origin '${origin}' not allowed`);
      error.statusCode = 403;
      callback(error);
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  optionsSuccessStatus: 200 // Some legacy browsers choke on 204
};

// Handle pre-flight across all routes BEFORE other middleware
app.options('*', cors(corsOptions));
app.use(cors(corsOptions));

// Body parsers & cookies
app.use(express.json({
  limit: '10mb',
  verify: (req, res, buffer) => {
    if (req.originalUrl.split('?')[0] === '/api/v1/payments/webhook') {
      req.rawBody = buffer;
    }
  }
}));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// Request logging
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

// Root endpoint for Render health probes & browser visits
app.get('/', (req, res) => {
  const isDatabaseConnected = mongoose.connection.readyState === 1;
  res.status(isDatabaseConnected ? 200 : 503).json({
    status: isDatabaseConnected ? 'healthy' : 'unavailable',
    service: 'Unfazed Practice Management SaaS API Gateway',
    version: '1.0.0',
    database: isDatabaseConnected ? 'connected' : 'disconnected',
    timestamp: new Date().toISOString()
  });
});

app.get('/api/health', (req, res) => {
  const isDatabaseConnected = mongoose.connection.readyState === 1;
  res.status(isDatabaseConnected ? 200 : 503).json({
    status: isDatabaseConnected ? 'healthy' : 'unavailable',
    database: isDatabaseConnected ? 'connected' : 'disconnected',
    timestamp: new Date().toISOString(),
    service: 'Unfazed API Gateway',
    version: '1.0.0'
  });
});

// API Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/therapist', therapistRoutes);
app.use('/api/v1/public', publicRoutes);
app.use('/api/v1/clients', clientRoutes);
app.use('/api/v1/sessions', sessionRoutes);
app.use('/api/v1/subscriptions', subscriptionRoutes);
app.use('/api/v1/payments', paymentRoutes);
app.use('/api/v1/analytics', analyticsRoutes);
app.use('/api/v1/chat', chatRoutes);
app.use('/api/v1/notifications', notificationRoutes);

// 404 Route Catch-all
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: `API endpoint '${req.originalUrl}' not found on this server.`
  });
});

// Centralized Error Handling
app.use(errorHandler);

module.exports = app;
