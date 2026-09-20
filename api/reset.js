const { handleReset } = require('../server');

module.exports = async function handler(req, res) {
  return handleReset(req, res);
};
