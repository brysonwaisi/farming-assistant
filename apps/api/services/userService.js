const bcrypt = require('bcryptjs');
const User = require('../models/User');
const ApiError = require('../util/ApiError');

// Only these fields may be changed via the profile-update endpoint. Anything
// else in the request body (isAdmin, isVerified, refresh tokens, …) is ignored
// so a user can't escalate their own privileges.
const UPDATABLE_FIELDS = ['username', 'email', 'password', 'image'];

const update = async (id, data) => {
  const patch = {};
  UPDATABLE_FIELDS.forEach((field) => {
    if (data[field] !== undefined) patch[field] = data[field];
  });
  if (patch.password) {
    patch.password = await bcrypt.hash(patch.password, 10);
  }
  const user = await User.findByIdAndUpdate(id, { $set: patch }, { new: true }).select('-password');
  if (!user) throw new ApiError(404, 'User not found');
  return user;
};

const remove = async (id) => {
  const deleted = await User.findByIdAndDelete(id);
  if (!deleted) throw new ApiError(404, 'User not found');
};

const getById = async (id) => {
  const user = await User.findById(id).select('-password');
  if (!user) throw new ApiError(404, 'User not found');
  return user;
};

const list = (recentOnly) => (recentOnly
  ? User.find().sort({ _id: -1 }).limit(5).select('-password')
  : User.find().select('-password'));

const stats = () => {
  const now = new Date();
  const lastYear = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
  return User.aggregate([
    { $match: { createdAt: { $gte: lastYear } } },
    { $project: { month: { $month: '$createdAt' } } },
    { $group: { _id: '$month', total: { $sum: 1 } } },
  ]);
};

module.exports = {
  update, remove, getById, list, stats,
};
