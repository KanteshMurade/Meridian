const express = require('express');
const cors = require('cors');
const session = require('express-session');
const passport = require('passport');
const dotenv = require('dotenv');

// Load environment variables from .env file
dotenv.config();

const connectDB = require('./config/db');

const REQUIRED_ENV = [
  'MONGO_URI',
  'JWT_SECRET',
  'SESSION_SECRET',
  'GITHUB_CLIENT_ID',
  'GITHUB_CLIENT_SECRET',
  'GITHUB_CALLBACK_URL',
];
const OPTIONAL_ENV = ['FRONTEND_URL', 'AI_SERVICE_URL', 'EMAIL_HOST', 'EMAIL_PORT', 'EMAIL_USER', 'EMAIL_PASS', 'EMAIL_FROM'];

const validateEnvironment = () => {
  const missingRequired = REQUIRED_ENV.filter((key) => !process.env[key] || !process.env[key].trim());

  if (missingRequired.length > 0) {
    throw new Error(`Missing required backend .env value(s): ${missingRequired.join(', ')}`);
  }

  const missingOptional = OPTIONAL_ENV.filter((key) => !process.env[key] || !process.env[key].trim());

  if (missingOptional.length > 0) {
    console.warn(`[Config] Optional .env value(s) missing: ${missingOptional.join(', ')}`);
    console.warn('[Config] Related optional features may not work until these values are added.');
  }
};

validateEnvironment();

// Import route files after env validation
const authRoutes = require('./routes/auth');
const reviewRoutes = require('./routes/review');
const githubRoutes = require('./routes/github');

// Import passport config after env variables are loaded
require('./config/passport');

// Initialize express app
const app = express();
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';

// Middlewares
app.use(cors({
  origin: FRONTEND_URL,
  credentials: true,
}));

app.use(express.json({ limit: '1mb' }));

app.use((err, req, res, next) => {
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return res.status(400).json({ message: 'Invalid JSON request body.' });
  }

  if (err.type === 'entity.too.large') {
    return res.status(413).json({
      message: 'Request body is too large. Please submit code up to 500 lines only.',
    });
  }

  return next(err);
});

app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    sameSite: 'lax',
  },
}));

app.use(passport.initialize());
app.use(passport.session());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/review', reviewRoutes);
app.use('/api/github', githubRoutes);

// Health/test routes
app.get('/', (req, res) => {
  res.json({ message: 'Meridian.ai API is running' });
});

app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'Meridian.ai backend',
    timestamp: new Date().toISOString(),
  });
});

app.use((req, res) => {
  res.status(404).json({ message: `API route not found: ${req.originalUrl}` });
});

app.use((err, req, res, next) => {
  console.error('Unhandled server error:', err.message);

  res.status(err.status || 500).json({
    message: process.env.NODE_ENV === 'production'
      ? 'Internal server error.'
      : err.message || 'Internal server error.',
  });
});

const startServer = async () => {
  try {
    await connectDB();

    const PORT = process.env.PORT || 5000;
    const server = app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
      console.log(`Frontend URL allowed by CORS: ${FRONTEND_URL}`);
    });

    const shutdown = async () => {
      console.log('Shutting down backend server...');
      server.close(() => {
        console.log('HTTP server closed.');
      });
    };

    process.on('SIGINT', shutdown);
    process.on('SIGTERM', shutdown);
  } catch (error) {
    console.error('[Startup] Backend failed to start.');
    console.error(`[Startup] ${error.message}`);
    process.exit(1);
  }
};

process.on('unhandledRejection', (error) => {
  console.error('[Unhandled Rejection]', error.message);
});

startServer();
