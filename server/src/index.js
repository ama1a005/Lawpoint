const express = require('express');
const cors = require('cors');
require('dotenv').config();

const { sequelize } = require('./config/db');

// Load ALL models so Sequelize registers them before sync
require('./models');

const app = express();

// Middleware
app.use(cors({ origin: process.env.CLIENT_ORIGIN || 'http://localhost:5173' }));
app.use(express.json());

// Routes
app.use('/api/v1/auth',    require('./routes/auth'));
app.use('/api/v1/cases',   require('./routes/cases'));
app.use('/api/v1/lawyers', require('./routes/lawyers'));
app.use('/api/v1/hearings',require('./routes/hearings'));

// Health check
app.get('/health', (_req, res) => res.json({ status: 'ok', timestamp: new Date().toISOString() }));

// 404 handler
app.use((_req, res) => res.status(404).json({ success: false, message: 'Route not found' }));

// Global error handler
app.use((err, _req, res, _next) => {
  console.error('[Server Error]', err);
  res.status(500).json({ success: false, message: 'Internal server error', error: err.message });
});

// Sync DB and start server — retry up to 5 times (Railway free-tier may be waking up)
const PORT = process.env.PORT || 5000;

const MAX_RETRIES = 5;
const RETRY_DELAY_MS = 5000;

async function startServer(attempt = 1) {
  try {
    await sequelize.authenticate();
    await sequelize.sync({ alter: true });
    console.log('✓ Database synced');
    app.listen(PORT, () => console.log(`✓ Server running on http://localhost:${PORT}`));
  } catch (err) {
    console.error(`✗ DB connection attempt ${attempt}/${MAX_RETRIES} failed: ${err.message}`);
    if (attempt < MAX_RETRIES) {
      console.log(`  Retrying in ${RETRY_DELAY_MS / 1000}s...`);
      setTimeout(() => startServer(attempt + 1), RETRY_DELAY_MS);
    } else {
      console.error('✗ Could not connect to database. Starting server without DB (limited functionality).');
      app.listen(PORT, () => console.log(`⚠ Server running on http://localhost:${PORT} (no DB)`));
    }
  }
}

startServer();
