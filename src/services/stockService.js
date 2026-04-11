const Stock = require('../models/Stock');
const marketstackService = require('./marketstackService');
const cacheService = require('./cacheService');
const logger = require('../utils/logger');
const { formatDate } = require('../utils/dateUtils');
const config = require('../config');

const MAX_SYMBOLS_PER_REQUEST = 5;

class StockService {
  async getStockData(symbol) {
    const cacheKey = cacheService.buildKey('stock', symbol.toUpperCase());
    
    const cached = await cacheService.get(cacheKey);
    if (cached) {
      logger.info(`Cache hit for ${symbol}`);
      return cached;
    }

    try {
      logger.info(`Cache miss for ${symbol}, fetching from API`);
      const data = await marketstackService.getEndOfDayData(symbol);
      
      if (data && data.length > 0) {
        const stockData = this.formatStockData(data[0]);
        await cacheService.set(cacheKey, stockData);
        return stockData;
      }
    } catch (err) {
      logger.error(`Failed to fetch ${symbol}: ${err.message}`);
    }
    
    return null;
  }

  async getHistoricalData(symbol, from, to) {
    try {
      const data = await marketstackService.getHistoricalData(symbol, from, to);
      if (data && data.length > 0) {
        return data.map(d => this.formatStockData(d));
      }
    } catch (err) {
      logger.error(`History error: ${err.message}`);
    }

    return [];
  }

  async getMultipleStocks(symbols, optimized = true) {
    if (optimized && symbols.length > 1) {
      try {
        const batchedSymbols = symbols.slice(0, MAX_SYMBOLS_PER_REQUEST).join(',');
        const data = await marketstackService.getEndOfDayData(batchedSymbols);
        
        if (data && data.length > 0) {
          await this.saveBatch(data);
          
          for (const stock of data) {
            const stockData = this.formatStockData(stock);
            const cacheKey = cacheService.buildKey('stock', stock.symbol);
            await cacheService.set(cacheKey, stockData);
          }
          
          return data.map(d => this.formatStockData(d));
        }
      } catch (err) {
        logger.error(`Batch fetch failed: ${err.message}`);
      }
    }

    const results = await Promise.all(
      symbols.map(async (symbol) => {
        try {
          const data = await this.getStockData(symbol);
          return data ? { symbol, ...data } : null;
        } catch {
          return null;
        }
      })
    );
    
    return results.filter(r => r !== null);
  }

  async fetchAndStoreDailyData(symbols) {
    const today = formatDate(new Date());
    const data = await marketstackService.getEndOfDayData(symbols);
    await this.saveBatch(data);
    logger.info(`Stored ${data.length} records for ${today}`);
    return data.length;
  }

  async saveBatch(stocksData) {
    if (!stocksData || stocksData.length === 0) return 0;

    const operations = stocksData.map(stock => ({
      updateOne: {
        filter: { symbol: stock.symbol, date: new Date(stock.date) },
        update: this.formatStockData(stock),
        upsert: true
      }
    }));

    const result = await Stock.bulkWrite(operations);
    return result.modifiedCount + result.upsertedCount;
  }

  async calculateMovingAverage(symbol, days = 20) {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const stocks = await Stock.find({
      symbol: symbol.toUpperCase(),
      date: { $gte: startDate, $lte: endDate }
    }).sort({ date: -1 }).limit(days);

    if (stocks.length === 0) return null;

    const sum = stocks.reduce((acc, s) => acc + s.close, 0);
    return {
      symbol: symbol.toUpperCase(),
      period: days,
      movingAverage: parseFloat((sum / stocks.length).toFixed(2)),
      calculatedAt: new Date()
    };
  }

  async getTopMovers(symbols, limit = 5) {
    const results = await this.getMultipleStocks(symbols);
    
    const sorted = results
      .map(stock => ({
        ...stock,
        changePercent: ((stock.close - stock.open) / stock.open) * 100
      }))
      .sort((a, b) => Math.abs(b.changePercent) - Math.abs(a.changePercent));

    return {
      gainers: sorted.filter(s => s.changePercent > 0).slice(0, limit),
      losers: sorted.filter(s => s.changePercent < 0).slice(0, limit)
    };
  }

  async compareStocks(symbols) {
    const results = await this.getMultipleStocks(symbols);
    
    return results.map(stock => ({
      symbol: stock.symbol,
      price: stock.close,
      change: stock.close - stock.open,
      changePercent: ((stock.close - stock.open) / stock.open) * 100,
      volume: stock.volume
    }));
  }

  formatStockData(stock) {
    return {
      symbol: stock.symbol,
      date: stock.date,
      open: parseFloat(stock.open),
      high: parseFloat(stock.high),
      low: parseFloat(stock.low),
      close: parseFloat(stock.close),
      volume: parseInt(stock.volume),
      adjusted_close: stock.adjusted_close ? parseFloat(stock.adjusted_close) : null
    };
  }
}

module.exports = new StockService();