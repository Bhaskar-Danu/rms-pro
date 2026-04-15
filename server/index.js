// Load .env from repo root in local dev; on Render env vars are injected natively
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });

const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const connectDB = require('./config/db');

const app = express();
const PORT = process.env.PORT || 5000;

// ── Connect to MongoDB ────────────────────────────────────────────────────────
connectDB();

// ── Security Middleware ───────────────────────────────────────────────────────
app.use(helmet()); // Sets secure HTTP headers (XSS, MIME, clickjacking, etc.)

// Rate limit on auth routes: max 20 requests per 15 minutes per IP
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,  // 15 minutes
  max: 20,
  message: { error: 'Too many requests from this IP. Please try again in 15 minutes.' },
  standardHeaders: true,
  legacyHeaders: false,
});

// ── Core Middleware ───────────────────────────────────────────────────────────
const ALLOWED_ORIGINS = [
  'http://localhost:5173',
  'http://localhost:5174',
  'https://rms-pro-gilt.vercel.app',
  process.env.CLIENT_URL,
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (e.g. Postman, curl)
    if (!origin || ALLOWED_ORIGINS.includes(origin)) return callback(null, true);
    callback(new Error(`CORS: origin ${origin} not allowed`));
  },
  credentials: true,
}));
app.use(express.json({ limit: '1mb' }));
if (process.env.NODE_ENV === 'development') app.use(morgan('dev'));

// ── API Routes ────────────────────────────────────────────────────────────────
app.use('/api/auth', authLimiter, require('./routes/auth')); // Rate-limited
app.use('/api/menu', require('./routes/menu'));
app.use('/api/orders', require('./routes/orders'));
app.use('/api/staff', require('./routes/staff'));
app.use('/api/inventory', require('./routes/inventory'));
app.use('/api/reservations', require('./routes/reservations'));
app.use('/api/feedback', require('./routes/feedback'));
app.use('/api/expenses', require('./routes/expenses'));
app.use('/api/reports', require('./routes/reports'));
app.use('/api/stats', require('./routes/stats'));
app.use('/api/sales', require('./routes/sales'));
app.use('/api/activity', require('./routes/activity'));
app.use('/api/profile', require('./routes/profile'));
app.use('/api/payments', require('./routes/payments'));
app.use('/api/admin', require('./routes/admin'));

// ── Health check (required by Render) ───────────────────────────────────────
app.get('/health', (req, res) => res.json({ status: 'ok', uptime: process.uptime() }));

// ── Root route ───────────────────────────────────────────────────────────────
app.get('/', (req, res) => res.json({ message: 'RMS Pro API is running 🚀' }));

// ── 404 for unmatched API routes ─────────────────────────────────────────────
app.use('/api/*', (req, res) => {
  res.status(404).json({ error: 'API endpoint not found' });
});

// ── Global Error Handler ──────────────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error('❌ Error:', err.message);
  res.status(err.status || 500).json({ error: err.message || 'Internal server error' });
});

// ── Start Server ──────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`\n🚀 RMS Pro API  →  http://localhost:${PORT}`);
  console.log(`🌎 Environment  →  ${process.env.NODE_ENV || 'development'}\n`);
});
