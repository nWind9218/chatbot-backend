const express = require('express');
const config = require('../config');

const router = express.Router();

// Import route modules
const authRoutes = require('./auth');
const organizationRoutes = require('./organizations');
const apiKeyRoutes = require('./apiKeys');

// Health check endpoint
router.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'API is running',
    version: config.API_VERSION,
    timestamp: new Date().toISOString(),
  });
});

// API routes
router.use('/auth', authRoutes);
router.use('/organizations', organizationRoutes);
router.use('/api-keys', apiKeyRoutes);

module.exports = router;
