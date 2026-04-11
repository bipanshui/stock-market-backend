const mongoose = require('mongoose');

const portfolioItemSchema = new mongoose.Schema({
  symbol: {
    type: String,
    required: true,
    uppercase: true
  },
  quantity: {
    type: Number,
    required: true,
    min: 0
  },
  averagePrice: {
    type: Number,
    required: true,
    min: 0
  },
  purchaseDate: {
    type: Date,
    default: Date.now
  }
});

const portfolioSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    default: 'Default Portfolio'
  },
  userId: {
    type: String,
    required: true,
    index: true
  },
  items: [portfolioItemSchema],
  cash: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

portfolioSchema.virtual('totalValue').get(function() {
  return this.cash;
});

portfolioSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('Portfolio', portfolioSchema);