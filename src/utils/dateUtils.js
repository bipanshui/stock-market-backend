const formatDate = (date) => {
  const d = new Date(date);
  return d.toISOString().split('T')[0];
};

const parseDate = (dateString) => {
  return new Date(dateString);
};

const getDateRange = (days) => {
  const end = new Date();
  const start = new Date();
  start.setDate(start.getDate() - days);
  return { from: formatDate(start), to: formatDate(end) };
};

const isTradingDay = (date) => {
  const d = new Date(date);
  const day = d.getDay();
  return day >= 1 && day <= 5;
};

const getMarketOpenTime = () => {
  const now = new Date();
  const hour = now.getUTCHours();
  return hour >= 14 && hour < 21;
};

module.exports = {
  formatDate,
  parseDate,
  getDateRange,
  isTradingDay,
  getMarketOpenTime
};