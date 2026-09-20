const { handlePosts } = require('../server');

module.exports = async function handler(req, res) {
  return handlePosts(req, res);
};
