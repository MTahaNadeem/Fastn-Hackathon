const { handleAdaptContent } = require('../server');

module.exports = async function handler(req, res) {
  return handleAdaptContent(req, res);
};
