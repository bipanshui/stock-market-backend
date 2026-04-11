const axios = require('axios');
const config = require('../config');
const logger = require('../utils/logger');

let apiRequestCount = 0;
const MONTHLYQuota = 100;

class MarketstackService {
  constructor() {
    this.api = axios.create({
      baseURL: config.marketstack.baseUrl,
      timeout: config.marketstack.timeout
    });
    this.lastRequestTime = null;
    this.requestsRemaining = MONTHLYQuota;
  }

  async makeRequest(endpoint, params = {}, retries = 0) {
    if (apiRequestCount >= this.requestsRemaining) {
      logger.error('Free plan monthly quota exceeded', { used: apiRequestCount, limit: this.requestsRemaining });
      throw new Error('Monthly API quota exceeded (100 requests). Upgrade to Basic plan for more requests.');
    }

    if (retries === 0) {
      if (this.lastRequestTime) {
        const timeSinceLastRequest = Date.now() - this.lastRequestTime;
        if (timeSinceLastRequest < 200) {
          logger.warn('Rate limiting: waiting 200ms between requests');
          await this.delay(200 - timeSinceLastRequest);
        }
      }
      this.lastRequestTime = Date.now();
    }

    try {
      const response = await this.api.get(endpoint, {
        params: {
          access_key: config.marketstack.apiKey,
          ...params
        }
      });

      apiRequestCount++;
      this.requestsRemaining = MONTHLYQuota - apiRequestCount;

      logger.info(`Marketstack API call: ${endpoint}`, { 
        params, 
        requestsUsed: apiRequestCount,
        remaining: this.requestsRemaining 
      });
      return response.data;
    } catch (error) {
      if (retries < config.marketstack.retryAttempts && this.isRetryable(error)) {
        logger.warn(`Retrying Marketstack API call: ${endpoint}, attempt ${retries + 1}`);
        await this.delay(config.marketstack.retryDelay);
        return this.makeRequest(endpoint, params, retries + 1);
      }
      logger.error(`Marketstack API error: ${endpoint}`, { error: error.message });
      throw this.handleError(error);
    }
  }

  isRetryable(error) {
    if (!error.response) return true;
    const status = error.response?.status;
    return status >= 500;
  }

  handleError(error) {
    const status = error.response?.status;
    const apiError = error.response?.data?.error;
    const message = apiError?.message || error.message;
    const code = apiError?.code;

    if (status === 401 || code === 'invalid_access_key') {
      return new Error('Invalid API key. Please check your MARKETSTACK_API_KEY');
    }
    if (status === 403 || code === 'https_access_restricted') {
      return new Error('HTTPS not supported on Free plan. Contact support.');
    }
    if (code === 'API Monthly quota exceeded') {
      return new Error('Monthly API quota exceeded. Upgrade to Basic plan ($9.99/mo) for 10,000 requests.');
    }
    if (status === 404) return new Error('Stock symbol not found');
    if (status === 429) return new Error('API rate limit reached. Wait before making more requests.');
    if (status >= 500) return new Error('Marketstack service unavailable. Try again later.');

    return new Error(message);
  }

  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async getEndOfDayData(symbols) {
    const symbolList = Array.isArray(symbols) ? symbols.join(',') : symbols;
    const data = await this.makeRequest('/eod', { symbols: symbolList });
    return data.data || [];
  }

  async getHistoricalData(symbol, dateFrom, dateTo) {
    const now = new Date();
    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(now.getFullYear() - 1);

    const from = new Date(dateFrom);
    const to = new Date(dateTo);

    if (from < oneYearAgo) {
      logger.warn('Free plan limited to 1 year history', { requested: dateFrom });
    }

    const params = {
      symbols: symbol,
      date_from: dateFrom,
      date_to: dateTo
    };
    const data = await this.makeRequest('/eod', params);
    return data.data || [];
  }

  getQuotaStatus() {
    return {
      used: apiRequestCount,
      remaining: this.requestsRemaining,
      limit: MONTHLYQuota
    };
  }

  resetMonthlyCount() {
    apiRequestCount = 0;
    this.requestsRemaining = MONTHLYQuota;
    logger.info('Monthly API quota reset');
  }
}

module.exports = new MarketstackService();