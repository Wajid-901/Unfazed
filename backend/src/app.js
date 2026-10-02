const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');

const errorHandler = require('./middleware/errorHandler');

// Route imports
const authRoutes = require('./routes/authRoutes');
const therapistRoutes = require('./routes/therapistRoutes');
const publicRoutes = require('./routes/publicRoutes');
const clientRoutes = require('./routes/clientRoutes');
const sessionRoutes = require('./routes/sessionRoutes');
const noteRoutes = require('./routes/noteRoutes');
const subscriptionRoutes = require('./routes/subscriptionRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const analyticsRoutes = require('./routes/analyticsRoutes');
const chatRoutes = require('./routes/chatRoutes');

const app = express();

// Security HTTP headers
app.use(
  helmet({
    contentSecurityPolicy: false, // Set false for local API development
    crossOriginEmbedderPolicy: false
  })
);

// CORS configuration
// ALLOWED_ORIGINS env var can be a comma-separated list of extra origins
const extraOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',').map((o) => o.trim())
  : [];

const allowedOrigins = [
  process.env.CLIENT_URL || 'http://localhost:5173',
  'http://localhost:5174',
  'http://localhost:3000',
  // Production domains
  'https://unfazed.in',
  'https://www.unfazed.in',
  'https://app.unfazed.in',
  // Vercel deployment
  'https://unfazed-umber.vercel.app',
  ...extraOrigins
];

const corsOptions = {
  origin: function (origin, callback) {
    // Allow server-to-server / curl (no origin header)
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error(`CORS policy: Origin '${origin}' not allowed`));
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
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// Request logging
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

// Root endpoint for Render health probes & browser visits
app.get('/', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    service: 'Unfazed Practice Management SaaS API Gateway',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

// Health check endpoint (DEV-004)
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
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
app.use('/api/v1/notes', noteRoutes);
app.use('/api/v1/subscriptions', subscriptionRoutes);
app.use('/api/v1/payments', paymentRoutes);
app.use('/api/v1/analytics', analyticsRoutes);
app.use('/api/v1/chat', chatRoutes);

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
