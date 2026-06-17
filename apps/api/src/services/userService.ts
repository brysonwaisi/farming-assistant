import bcrypt from 'bcryptjs';
import User, { IUser } from '../models/User';
import ApiError from '../util/ApiError';

// Only these fields may be changed via the profile-update endpoint. Anything
// else in the request body (isAdmin, isVerified, refresh tokens, …) is ignored
// so a user can't escalate their own privileges.
const UPDATABLE_FIELDS = ['username', 'email', 'password', 'image'] as const;

type UpdatableField = (typeof UPDATABLE_FIELDS)[number];
type UpdateData = Partial<Record<UpdatableField, unknown>>;

const update = async (id: string, data: UpdateData): Promise<IUser> => {
  const patch: Partial<Record<UpdatableField, unknown>> = {};
  UPDATABLE_FIELDS.forEach((field) => {
    if (data[field] !== undefined) patch[field] = data[field];
  });
  if (patch.password) {
    patch.password = await bcrypt.hash(String(patch.password), 10);
  }
  const user = await User.findByIdAndUpdate(id, { $set: patch }, { new: true }).select('-password');
  if (!user) throw new ApiError(404, 'User not found');
  return user;
};

const remove = async (id: string): Promise<void> => {
  const deleted = await User.findByIdAndDelete(id);
  if (!deleted) throw new ApiError(404, 'User not found');
};

const getById = async (id: string): Promise<IUser> => {
  const user = await User.findById(id).select('-password');
  if (!user) throw new ApiError(404, 'User not found');
  return user;
};

const list = (recentOnly: boolean) => (recentOnly
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

export {
  update, remove, getById, list, stats,
};
