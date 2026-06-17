const orderService = require('../services/orderService');

const create = async (req, res) => {
  const order = await orderService.create(req.user._id, req.body);
  return res.status(201).json(order);
};

const updateById = async (req, res) => {
  const order = await orderService.updateById(req.params.id, req.body);
  return res.status(200).json(order);
};

const removeById = async (req, res) => {
  await orderService.removeById(req.params.id);
  return res.status(200).json({ message: 'Order has been deleted' });
};

const getByUser = async (req, res) => {
  const orders = await orderService.getByUser(req.params.userId);
  return res.status(200).json(orders);
};

const getAll = async (req, res) => {
  const orders = await orderService.getAll();
  return res.status(200).json(orders);
};

const income = async (req, res) => {
  const data = await orderService.monthlyIncome();
  return res.status(200).json(data);
};

module.exports = {
  create, updateById, removeById, getByUser, getAll, income,
};
