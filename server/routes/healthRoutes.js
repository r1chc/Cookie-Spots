const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const os = require('os');

// Health check endpoint
router.get('/', async (req, res) => {
  try {
    const healthcheck = {
      uptime: process.uptime(),
      message: 'OK',
      timestamp: Date.now(),
      database: {
        status: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
        readyState: mongoose.connection.readyState
      },
      system: {
        memory: {
          total: os.totalmem(),
          free: os.freemem(),
          used: os.totalmem() - os.freemem()
        },
        cpu: os.cpus(),
        loadAvg: os.loadavg()
      }
    };

    res.status(200).json(healthcheck);
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Health check failed',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Detailed health check endpoint (protected, for admin use)
router.get('/detailed', async (req, res) => {
  // TODO: Add authentication middleware
  try {
    const detailedHealthcheck = {
      uptime: process.uptime(),
      message: 'OK',
      timestamp: Date.now(),
      database: {
        status: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
        readyState: mongoose.connection.readyState,
        collections: Object.keys(mongoose.connection.collections),
        models: Object.keys(mongoose.models)
      },
      system: {
        memory: {
          total: os.totalmem(),
          free: os.freemem(),
          used: os.totalmem() - os.freemem()
        },
        cpu: os.cpus(),
        loadAvg: os.loadavg(),
        platform: os.platform(),
        release: os.release(),
        hostname: os.hostname()
      },
      process: {
        pid: process.pid,
        version: process.version,
        memoryUsage: process.memoryUsage(),
        uptime: process.uptime()
      }
    };

    res.status(200).json(detailedHealthcheck);
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Detailed health check failed',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

module.exports = router; 