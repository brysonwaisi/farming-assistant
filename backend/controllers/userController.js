const userService = require('../services/userService');

const update = async (req, res) => {
  const user = await userService.update(req.params.id, req.body);
  return res.status(200).json(user);
};

const remove = async (req, res) => {
  await userService.remove(req.params.id);
  return res.status(200).json({ message: 'User has been deleted' });
};

const getById = async (req, res) => {
  const user = await userService.getById(req.params.id);
  return res.status(200).json(user);
};

const list = async (req, res) => {
  const users = await userService.list(Boolean(req.query.new));
  return res.status(200).json(users);
};

const stats = async (req, res) => {
  const data = await userService.stats();
  return res.status(200).json(data);
};

module.exports = {
  update, remove, getById, list, stats,
};
