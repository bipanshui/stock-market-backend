const Portfolio = require('../models/Portfolio');
const stockService = require('../services/stockService');
const { AppError } = require('../middlewares/errorMiddleware');

const getPortfolio = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const portfolio = await Portfolio.findOne({ userId });

    if (!portfolio) {
      throw new AppError('Portfolio not found', 404);
    }

    const enrichedItems = await Promise.all(
      portfolio.items.map(async (item) => {
        const stockData = await stockService.getStockData(item.symbol);
        if (!stockData) return { ...item.toObject(), currentPrice: null, totalValue: 0 };
        
        const totalValue = stockData.close * item.quantity;
        const costBasis = item.averagePrice * item.quantity;
        
        return {
          ...item.toObject(),
          currentPrice: stockData.close,
          totalValue,
          gain: totalValue - costBasis,
          gainPercent: ((totalValue - costBasis) / costBasis) * 100
        };
      })
    );

    const totalValue = enrichedItems.reduce((acc, item) => acc + item.totalValue, 0) + portfolio.cash;

    res.status(200).json({
      status: 'success',
      data: {
        ...portfolio.toObject(),
        items: enrichedItems,
        totalValue,
        cash: portfolio.cash
      }
    });
  } catch (error) {
    next(error);
  }
};

const addToPortfolio = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const { symbol, quantity, averagePrice } = req.body;

    if (!symbol || !quantity || !averagePrice) {
      throw new AppError('Please provide symbol, quantity, and averagePrice', 400);
    }

    let portfolio = await Portfolio.findOne({ userId });

    if (!portfolio) {
      portfolio = new Portfolio({ userId, items: [], cash: 0 });
    }

    const existingItem = portfolio.items.find(item => item.symbol === symbol.toUpperCase());
    
    if (existingItem) {
      const totalQuantity = existingItem.quantity + quantity;
      const totalCost = (existingItem.averagePrice * existingItem.quantity) + (averagePrice * quantity);
      existingItem.quantity = totalQuantity;
      existingItem.averagePrice = totalCost / totalQuantity;
    } else {
      portfolio.items.push({
        symbol: symbol.toUpperCase(),
        quantity,
        averagePrice
      });
    }

    await portfolio.save();

    res.status(201).json({
      status: 'success',
      data: portfolio
    });
  } catch (error) {
    next(error);
  }
};

const removeFromPortfolio = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const { symbol, quantity } = req.body;

    if (!symbol || !quantity) {
      throw new AppError('Please provide symbol and quantity', 400);
    }

    const portfolio = await Portfolio.findOne({ userId });

    if (!portfolio) {
      throw new AppError('Portfolio not found', 404);
    }

    const itemIndex = portfolio.items.findIndex(item => item.symbol === symbol.toUpperCase());
    
    if (itemIndex === -1) {
      throw new AppError('Symbol not found in portfolio', 404);
    }

    const item = portfolio.items[itemIndex];
    
    if (quantity >= item.quantity) {
      portfolio.items.splice(itemIndex, 1);
    } else {
      item.quantity -= quantity;
    }

    await portfolio.save();

    res.status(200).json({
      status: 'success',
      data: portfolio
    });
  } catch (error) {
    next(error);
  }
};

const setCash = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const { cash } = req.body;

    let portfolio = await Portfolio.findOne({ userId });

    if (!portfolio) {
      portfolio = new Portfolio({ userId, items: [], cash: 0 });
    }

    portfolio.cash = cash;
    await portfolio.save();

    res.status(200).json({
      status: 'success',
      data: portfolio
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getPortfolio,
  addToPortfolio,
  removeFromPortfolio,
  setCash
};