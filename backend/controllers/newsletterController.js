const newsletterService = require('../services/newsletterService');

const subscribe = async (req, res) => {
  await newsletterService.subscribe(req.body.email);
  return res.status(201).json({ message: 'Subscription successful' });
};

module.exports = { subscribe };
