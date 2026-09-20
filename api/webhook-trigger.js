const { handleWebhookTrigger } = require('../server');
module.exports = async function handler(req, res) {
  return handleWebhookTrigger(req, res);
};
