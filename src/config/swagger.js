const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Stock Analytics API',
      version: '1.0.0',
      description: 'Production-grade Stock Analytics API with Marketstack integration',
      contact: {
        name: 'API Support'
      }
    },
    servers: [
      {
        url: 'http://localhost:3000',
        description: 'Development server'
      }
    ],
    tags: [
      {
        name: 'Stocks',
        description: 'Stock data endpoints'
      },
      {
        name: 'Portfolio',
        description: 'Portfolio management endpoints'
      },
      {
        name: 'Analysis',
        description: 'Technical analysis endpoints'
      }
    ],
    paths: {
      '/api/stocks/{symbol}': {
        get: {
          tags: ['Stocks'],
          summary: 'Get stock data by symbol',
          parameters: [
            {
              name: 'symbol',
              in: 'path',
              required: true,
              schema: { type: 'string' },
              example: 'AAPL'
            }
          ],
          responses: {
            '200': {
              description: 'Stock data retrieved successfully',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      status: { type: 'string' },
                      data: { type: 'object' }
                    }
                  }
                }
              }
            }
          }
        }
      },
      '/api/stocks/{symbol}/history': {
        get: {
          tags: ['Stocks'],
          summary: 'Get historical stock data',
          parameters: [
            {
              name: 'symbol',
              in: 'path',
              required: true,
              schema: { type: 'string' }
            },
            {
              name: 'from',
              in: 'query',
              required: true,
              schema: { type: 'string' },
              example: '2024-01-01'
            },
            {
              name: 'to',
              in: 'query',
              required: true,
              schema: { type: 'string' },
              example: '2024-12-31'
            }
          ],
          responses: {
            '200': {
              description: 'Historical data retrieved successfully'
            }
          }
        }
      },
      '/api/stocks': {
        get: {
          tags: ['Stocks'],
          summary: 'Get multiple stocks',
          parameters: [
            {
              name: 'symbols',
              in: 'query',
              required: true,
              schema: { type: 'string' },
              example: 'AAPL,MSFT,GOOGL'
            }
          ],
          responses: {
            '200': {
              description: 'Multiple stocks retrieved successfully'
            }
          }
        }
      },
      '/api/stocks/top-movers': {
        get: {
          tags: ['Stocks'],
          summary: 'Get top gainers and losers',
          responses: {
            '200': {
              description: 'Top movers retrieved successfully'
            }
          }
        }
      },
      '/api/stocks/{symbol}/moving-average': {
        get: {
          tags: ['Analysis'],
          summary: 'Calculate moving average',
          parameters: [
            {
              name: 'symbol',
              in: 'path',
              required: true,
              schema: { type: 'string' }
            },
            {
              name: 'period',
              in: 'query',
              schema: { type: 'integer' },
              example: 20
            }
          ],
          responses: {
            '200': {
              description: 'Moving average calculated successfully'
            }
          }
        }
      },
      '/api/portfolio/{userId}': {
        get: {
          tags: ['Portfolio'],
          summary: 'Get user portfolio',
          parameters: [
            {
              name: 'userId',
              in: 'path',
              required: true,
              schema: { type: 'string' }
            }
          ],
          responses: {
            '200': {
              description: 'Portfolio retrieved successfully'
            }
          }
        },
        post: {
          tags: ['Portfolio'],
          summary: 'Add to portfolio',
          parameters: [
            {
              name: 'userId',
              in: 'path',
              required: true,
              schema: { type: 'string' }
            }
          ],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    symbol: { type: 'string' },
                    quantity: { type: 'number' },
                    averagePrice: { type: 'number' }
                  }
                }
              }
            }
          },
          responses: {
            '201': {
              description: 'Item added to portfolio successfully'
            }
          }
        }
      }
    }
  },
  apis: ['./routes/*.js']
};

module.exports = swaggerJsdoc(options);