# Stock Analytics API

Production-grade backend for stock market data with Marketstack integration.

## 🚀 Quick Start

### Prerequisites

- Node.js (v18+)
- MongoDB
- Redis

### Installation

```bash
npm install
```

### Configuration

1. Copy `.env.sample` to `.env`:
```bash
cp .env.sample .env
```

2. Update `.env` with your credentials:
```
PORT=3000
MARKETSTACK_API_KEY=your_api_key
MONGO_URI=mongodb://localhost:27017/stockanalytics
REDIS_URL=redis://localhost:6379
```

3. Get a free Marketstack API key at [marketstack.com](https://marketstack.com)

### Running

```bash
# Development
npm run dev

# Production
npm start

# Cron job only
npm run cron
```

## 📁 Project Structure

```
src/
├── config/         # Configuration files
├── controllers/   # Request handlers
├── services/      # Business logic
├── routes/        # API routes
├── models/        # MongoDB schemas
├── jobs/          # Cron jobs
├── utils/         # Utilities
├── middlewares/   # Express middlewares
└── app.js         # Entry point
```

## 📡 API Endpoints

### Stocks

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/stocks/:symbol` | Get latest stock data |
| GET | `/api/stocks/:symbol/history?from=&to=` | Get historical data |
| GET | `/api/stocks` | Get multiple stocks |
| GET | `/api/stocks/top-movers` | Get top gainers/losers |
| GET | `/api/stocks/compare?symbols=` | Compare stocks |

### Portfolio

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/portfolio/:userId` | Get portfolio |
| POST | `/api/portfolio/:userId` | Add position |
| PUT | `/api/portfolio/:userId` | Remove position |

### Analysis

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/stocks/:symbol/moving-average?period=` | Moving average |

## 📖 Example API Responses

### GET /api/stocks/AAPL

```json
{
  "status": "success",
  "data": {
    "symbol": "AAPL",
    "date": "2024-04-10",
    "open": 175.50,
    "high": 178.25,
    "low": 174.80,
    "close": 177.90,
    "volume": 52410000
  }
}
```

### GET /api/stocks/top-movers

```json
{
  "status": "success",
  "data": {
    "gainers": [
      { "symbol": "NVDA", "changePercent": 5.2 },
      { "symbol": "AAPL", "changePercent": 2.1 }
    ],
    "losers": [
      { "symbol": "TSLA", "changePercent": -3.4 }
    ]
  }
}
```

## 🔧 Available Scripts

- `npm start` - Start production server
- `npm run dev` - Start development server
- `npm run cron` - Run daily data fetch job
- `npm test` - Run tests

## 📚 Documentation

Swagger UI available at: `http://localhost:3000/api-docs`

## 🛡️ Features

- Redis caching (5-minute TTL)
- Rate limiting (100 requests/15 min)
- Winston logging
- Cron jobs for daily data
- Error handling middleware
- Swagger documentation
- Portfolio tracking
- Technical analysis (Moving Averages)
- Stock comparison
- Top movers endpoint