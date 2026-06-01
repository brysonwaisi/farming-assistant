const stripeService = require('../services/stripeService');

const createEmbeddedSession = async (req, res) => {
  const data = await stripeService.createEmbeddedSession(req.user._id, req.body.products);
  return res.status(201).json(data);
};

const createCheckoutSession = async (req, res) => {
  const data = await stripeService.createHostedSession(req.user._id, req.body.products);
  return res.status(201).json(data);
};

const getSession = async (req, res) => {
  const data = await stripeService.retrieveSession(req.params.id);
  return res.status(200).json(data);
};

module.exports = { createEmbeddedSession, createCheckoutSession, getSession };
