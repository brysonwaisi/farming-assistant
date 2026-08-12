import { Types } from 'mongoose';
import Order, { OrderDocument } from '../models/Order';
import ApiError from '../util/ApiError';

const create = (
  userId: Types.ObjectId | string,
  data: Partial<OrderDocument>,
): Promise<OrderDocument> => new Order({ ...data, userId }).save();

const updateById = async (
  id: Types.ObjectId | string,
  data: Partial<OrderDocument>,
): Promise<OrderDocument> => {
  const order = await Order.findByIdAndUpdate(id, { $set: data }, { new: true });
  if (!order) throw new ApiError(404, 'Order not found');
  return order;
};

const removeById = async (id: Types.ObjectId | string): Promise<void> => {
  const deleted = await Order.findByIdAndDelete(id);
  if (!deleted) throw new ApiError(404, 'Order not found');
};

const getByUser = (userId: Types.ObjectId | string) => Order.find({ userId });

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

export {
  create, updateById, removeById, getByUser, getAll, monthlyIncome,
};
