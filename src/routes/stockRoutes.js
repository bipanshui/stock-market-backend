const express = require('express');
const router = express.Router();
const stockController = require('../controllers/stockController');
const analysisController = require('../controllers/analysisController');
const { asyncHandler } = require('../middlewares/errorMiddleware');

router.get('/quota', asyncHandler((req, res) => {
  const marketstackService = require('../services/marketstackService');
  const quota = marketstackService.getQuotaStatus();
  res.status(200).json({
    status: 'success',
    data: quota,
    message: `Free plan: ${quota.remaining}/100 requests remaining this month`
  });
}));

router.get('/top-movers', asyncHandler(stockController.getTopMovers));
router.get('/compare', asyncHandler(stockController.compareStocks));

router.get('/:symbol', asyncHandler(stockController.getStock));
router.get('/:symbol/history', asyncHandler(stockController.getStockHistory));
router.get('/:symbol/moving-average', asyncHandler(analysisController.getMovingAverage));
router.get('/:symbol/moving-averages', asyncHandler(analysisController.getMultipleMovingAverages));

module.exports = router;