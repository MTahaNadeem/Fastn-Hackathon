const { handlePublish } = require('../server');

module.exports = async function handler(req, res) {
  return handlePublish(req, res);
};
