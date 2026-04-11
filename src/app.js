require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const swaggerUi = require('swagger-ui-express');

const config = require('./config');
const logger = require('./utils/logger');
const { errorHandler, notFoundHandler } = require('./middlewares/errorMiddleware');
const { apiLimiter } = require('./middlewares/rateLimiter');
const stockRoutes = require('./routes/stockRoutes');
const apiRoutes = require('./routes/apiRoutes');
const swaggerSpec = require('./config/swagger');
const cacheService = require('./services/cacheService');
const { startCron } = require('./jobs/scheduler');

const app = express();

app.use(cors());

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  logger.info(`${req.method} ${req.url}`);
  next();
});

app.use('/api', apiLimiter);

app.use('/api/stocks', stockRoutes);

app.get('/api/quota', (req, res) => {
  const marketstackService = require('./services/marketstackService');
  const quota = marketstackService.getQuotaStatus();
  res.status(200).json({
    status: 'success',
    data: quota,
    message: `Free plan: ${quota.remaining}/100 requests remaining this month`
  });
});

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date(),
    database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
  });
});

app.use(notFoundHandler);
app.use(errorHandler);

const startServer = async () => {
  try {
    await mongoose.connect(config.mongodb.uri, {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000
    });
    logger.info('Connected to MongoDB');
  } catch (error) {
    logger.error('MongoDB connection error', { error: error.message });
  }

  try {
    await cacheService.connect();
    logger.info('Cache service initialized');
  } catch (error) {
    logger.error('Cache service error', { error: error.message });
  }

  startCron();

  app.listen(config.port, () => {
    logger.info(`Server running on port ${config.port}`);
    logger.info(`API Documentation available at http://localhost:${config.port}/api-docs`);
  });
};

if (require.main === module) {
  startServer();
}

module.exports = app;