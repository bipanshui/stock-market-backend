const rateLimit = require('express-rate-limit');
const logger = require('../utils/logger');

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: {
    status: 'fail',
    message: 'Too many requests from this IP, please try again later'
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    logger.warn('Rate limit exceeded', { ip: req.ip });
    res.status(429).json({
      status: 'fail',
      message: 'Too many requests from this IP, please try again later'
    });
  }
});

const strictLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 20,
  message: {
    status: 'fail',
    message: 'Too many requests, please slow down'
  }
});

module.exports = {
  apiLimiter,
  strictLimiter
};