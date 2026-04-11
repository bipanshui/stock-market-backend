const stockService = require('../services/stockService');
const { AppError } = require('../middlewares/errorMiddleware');

const getMovingAverage = async (req, res, next) => {
  try {
    const { symbol } = req.params;
    const { period } = req.query;
    const days = parseInt(period) || 20;

    const data = await stockService.calculateMovingAverage(symbol, days);

    if (!data) {
      throw new AppError(`Insufficient data for ${symbol}`, 404);
    }

    res.status(200).json({
      status: 'success',
      data
    });
  } catch (error) {
    next(error);
  }
};

const getMultipleMovingAverages = async (req, res, next) => {
  try {
    const { symbol } = req.params;
    const periods = [5, 10, 20, 50, 100, 200];

    const results = await Promise.all(
      periods.map(async (period) => {
        const data = await stockService.calculateMovingAverage(symbol, period);
        return data;
      })
    );

    res.status(200).json({
      status: 'success',
      data: results.filter(r => r !== null)
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getMovingAverage,
  getMultipleMovingAverages
};