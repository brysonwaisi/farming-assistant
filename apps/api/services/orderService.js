const Order = require('../models/Order');
const ApiError = require('../util/ApiError');

const create = (userId, data) => new Order({ ...data, userId }).save();

const updateById = async (id, data) => {
  const order = await Order.findByIdAndUpdate(id, { $set: data }, { new: true });
  if (!order) throw new ApiError(404, 'Order not found');
  return order;
};

const removeById = async (id) => {
  const deleted = await Order.findByIdAndDelete(id);
  if (!deleted) throw new ApiError(404, 'Order not found');
};

const getByUser = (userId) => Order.find({ userId });

const getAll = () => Order.find();

const monthlyIncome = () => {
  // Income for the trailing two months. Build the cutoff immutably so we don't
  // corrupt intermediate dates via setMonth().
  const now = new Date();
  const twoMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 2, 1);
  return Order.aggregate([
    { $match: { createdAt: { $gte: twoMonthsAgo } } },
    { $project: { month: { $month: '$createdAt' }, sales: '$amount' } },
    { $group: { _id: '$month', total: { $sum: '$sales' } } },
  ]);
};

module.exports = {
  create, updateById, removeById, getByUser, getAll, monthlyIncome,
};
