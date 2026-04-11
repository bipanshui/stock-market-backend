require('dotenv').config();

module.exports = {
  port: process.env.PORT || 3000,
  marketstack: {
    apiKey: process.env.MARKETSTACK_API_KEY,
    baseUrl: 'http://api.marketstack.com/v1',
    timeout: 10000,
    retryAttempts: 0,
    retryDelay: 5000,
    freePlan: true
  },
  mongodb: {
    uri: process.env.MONGO_URI || 'mongodb://localhost:27017/stockanalytics'
  },
  redis: {
    url: process.env.REDIS_URL || 'redis://localhost:6379',
    ttl: 600
  },
  rateLimit: {
    windowMs: 15 * 60 * 1000,
    max: 5
  },
  cron: {
    schedule: '0 16 * * 1-5'
  },
  stocks: {
    watched: ['AAPL', 'MSFT', 'GOOGL', 'AMZN', 'TSLA']
  }
};