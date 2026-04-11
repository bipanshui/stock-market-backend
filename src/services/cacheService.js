const Redis = require('ioredis');
const config = require('../config');
const logger = require('../utils/logger');

class CacheService {
  constructor() {
    this.client = null;
    this.isReady = false;
  }

  async connect() {
    try {
      this.client = new Redis(config.redis.url, {
        retryStrategy: (times) => Math.min(times * 50, 2000),
        maxRetriesPerRequest: 3
      });

      this.client.on('connect', () => {
        logger.info('Connected to Redis');
        this.isReady = true;
      });

      this.client.on('error', (error) => {
        logger.error('Redis connection error', { error: error.message });
        this.isReady = false;
      });
    } catch (error) {
      logger.error('Failed to connect to Redis', { error: error.message });
    }
  }

  async get(key) {
    if (!this.isReady) return null;
    
    try {
      const data = await this.client.get(key);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      logger.error('Redis GET error', { key, error: error.message });
      return null;
    }
  }

  async set(key, value, ttl = config.redis.ttl) {
    if (!this.isReady) return false;
    
    try {
      await this.client.setex(key, ttl, JSON.stringify(value));
      return true;
    } catch (error) {
      logger.error('Redis SET error', { key, error: error.message });
      return false;
    }
  }

  async del(key) {
    if (!this.isReady) return false;
    
    try {
      await this.client.del(key);
      return true;
    } catch (error) {
      logger.error('Redis DEL error', { key, error: error.message });
      return false;
    }
  }

  async getPattern(pattern) {
    if (!this.isReady) return [];
    
    try {
      const keys = await this.client.keys(pattern);
      if (keys.length === 0) return [];
      
      const values = await this.client.mget(...keys);
      return values
        .map((v, i) => ({ key: keys[i], data: v ? JSON.parse(v) : null }))
        .filter(v => v.data !== null);
    } catch (error) {
      logger.error('Redis GET pattern error', { pattern, error: error.message });
      return [];
    }
  }

  buildKey(type, symbol) {
    return `${type}:${symbol}`;
  }
}

module.exports = new CacheService();