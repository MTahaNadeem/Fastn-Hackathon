const { handleStatus } = require('../server');
module.exports = async function handler(req, res) {
  return handleStatus(req, res);
};
