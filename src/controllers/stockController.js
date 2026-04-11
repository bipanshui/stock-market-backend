const stockService = require('../services/stockService');
const { AppError } = require('../middlewares/errorMiddleware');
const logger = require('../utils/logger');
const { getDateRange } = require('../utils/dateUtils');

const getStock = async (req, res, next) => {
  try {
    const { symbol } = req.params;
    const data = await stockService.getStockData(symbol);
    
    if (!data) {
      throw new AppError(`Stock data not found for ${symbol}`, 404);
    }

    res.status(200).json({
      status: 'success',
      data
    });
  } catch (error) {
    next(error);
  }
};

const getStockHistory = async (req, res, next) => {
  try {
    const { symbol } = req.params;
    const { from, to } = req.query;

    if (!from || !to) {
      throw new AppError('Please provide from and to date parameters', 400);
    }

    const data = await stockService.getHistoricalData(symbol, from, to);

    res.status(200).json({
      status: 'success',
      count: data.length,
      data
    });
  } catch (error) {
    next(error);
  }
};

const getMultipleStocks = async (req, res, next) => {
  try {
    const { symbols } = req.query;

    if (!symbols) {
      throw new AppError('Please provide symbols parameter', 400);
    }

    const symbolList = symbols.split(',').map(s => s.trim().toUpperCase());
    const data = await stockService.getMultipleStocks(symbolList);

    res.status(200).json({
      status: 'success',
      count: data.length,
      data
    });
  } catch (error) {
    next(error);
  }
};

const getTopMovers = async (req, res, next) => {
  try {
    const { symbols } = req.query;
    const symbolsList = symbols ? symbols.split(',').map(s => s.trim().toUpperCase()) : ['AAPL', 'MSFT', 'GOOGL', 'AMZN', 'TSLA'];
    
    const data = await stockService.getTopMovers(symbolsList);

    res.status(200).json({
      status: 'success',
      data
    });
  } catch (error) {
    next(error);
  }
};

const compareStocks = async (req, res, next) => {
  try {
    const { symbols } = req.query;

    if (!symbols) {
      throw new AppError('Please provide symbols parameter', 400);
    }

    const symbolList = symbols.split(',').map(s => s.trim().toUpperCase());
    const data = await stockService.compareStocks(symbolList);

    res.status(200).json({
      status: 'success',
      data
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getStock,
  getStockHistory,
  getMultipleStocks,
  getTopMovers,
  compareStocks
};