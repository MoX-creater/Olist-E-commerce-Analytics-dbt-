import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import routes from './routes.js';
import pool from './db.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;
const FRONTEND_ORIGIN = process.env.FRONTEND_ORIGIN || 'http://localhost:5173';

// Middleware
app.use(cors({
  origin: FRONTEND_ORIGIN,
  credentials: true
}));

app.use(express.json());

// Request logging
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`${req.method} ${req.path} - ${res.statusCode} (${duration}ms)`);
  });
  next();
});

// Mount API routes
app.use('/api', routes);

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    name: 'Olist Analytics API',
    version: '1.0.0',
    endpoints: [
      'GET /api/health',
      'GET /api/revenue/monthly',
      'GET /api/delivery/performance',
      'GET /api/reviews/analysis',
      'GET /api/products/top-categories',
      'GET /api/orders/status-breakdown'
    ]
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Endpoint not found'
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({
    success: false,
    error: 'Internal server error',
    message: err.message
  });
});

// Start server
app.listen(PORT, () => {
  console.log('');
  console.log('🚀 Olist Analytics API Server');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`📡 Server running on: http://localhost:${PORT}`);
  console.log(`🌐 CORS enabled for: ${FRONTEND_ORIGIN}`);
  console.log(`💾 Database: ${process.env.PGDATABASE}@${process.env.PGHOST}:${process.env.PGPORT}`);
  console.log('');
  console.log('📊 Available endpoints:');
  console.log('   GET /api/health');
  console.log('   GET /api/revenue/monthly');
  console.log('   GET /api/delivery/performance');
  console.log('   GET /api/reviews/analysis');
  console.log('   GET /api/products/top-categories');
  console.log('   GET /api/orders/status-breakdown');
  console.log('');
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received, shutting down gracefully...');
  await pool.end();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('\nSIGINT received, shutting down gracefully...');
  await pool.end();
  process.exit(0);
});
