const express = require('express');
const router = express.Router();
const stockController = require('../controllers/stockController');
const portfolioController = require('../controllers/portfolioController');
const marketstackService = require('../services/marketstackService');
const { asyncHandler } = require('../middlewares/errorMiddleware');

router.get('/quota', asyncHandler((req, res) => {
  const quota = marketstackService.getQuotaStatus();
  res.status(200).json({
    status: 'success',
    data: quota,
    message: `Free plan: ${quota.remaining}/100 requests remaining this month`
  });
}));

router.get('/stocks', asyncHandler(stockController.getMultipleStocks));
router.get('/stocks/top-movers', asyncHandler(stockController.getTopMovers));
router.get('/stocks/compare', asyncHandler(stockController.compareStocks));

router.get('/portfolio/:userId', asyncHandler(portfolioController.getPortfolio));
router.post('/portfolio/:userId', asyncHandler(portfolioController.addToPortfolio));
router.put('/portfolio/:userId', asyncHandler(portfolioController.removeFromPortfolio));
router.patch('/portfolio/:userId/cash', asyncHandler(portfolioController.setCash));

module.exports = router;