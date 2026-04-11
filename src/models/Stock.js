const mongoose = require('mongoose');

const stockSchema = new mongoose.Schema({
  symbol: {
    type: String,
    required: true,
    uppercase: true,
    index: true
  },
  date: {
    type: Date,
    required: true,
    index: true
  },
  open: {
    type: Number,
    required: true
  },
  high: {
    type: Number,
    required: true
  },
  low: {
    type: Number,
    required: true
  },
  close: {
    type: Number,
    required: true
  },
  volume: {
    type: Number,
    required: true
  },
  adjusted_close: {
    type: Number,
    default: null
  }
}, {
  timestamps: true
});

stockSchema.index({ symbol: 1, date: -1 }, { unique: true });

module.exports = mongoose.model('Stock', stockSchema);