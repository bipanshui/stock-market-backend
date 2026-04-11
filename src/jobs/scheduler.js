const cron = require('node-cron');
const stockService = require('../services/stockService');
const logger = require('../utils/logger');
const config = require('../config');

const DEFAULT_SYMBOLS = ['AAPL', 'MSFT', 'GOOGL', 'AMZN', 'TSLA', 'META', 'NVDA', 'JPM', 'V', 'WMT'];

const fetchDailyData = async () => {
  logger.info('Starting scheduled daily stock data fetch');
  
  try {
    const count = await stockService.fetchAndStoreDailyData(DEFAULT_SYMBOLS);
    logger.info(`Scheduled job completed: stored ${count} records`);
  } catch (error) {
    logger.error('Scheduled job failed', { error: error.message });
  }
};

const startCron = () => {
  if (!cron.validate(config.cron.schedule)) {
    logger.error('Invalid cron schedule', config.cron.schedule);
    return;
  }

  cron.schedule(config.cron.schedule, fetchDailyData, {
    timezone: 'America/New_York'
  });

  logger.info(`Cron job scheduled: ${config.cron.schedule}`);
};

const runOnce = async () => {
  logger.info('Running one-time stock data fetch');
  await fetchDailyData();
  process.exit(0);
};

if (require.main === module) {
  runOnce();
} else {
  module.exports = {
    startCron,
    fetchDailyData
  };
}