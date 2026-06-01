const Cart = require('../models/Cart');
const ApiError = require('../util/ApiError');

const create = (userId, data) => new Cart({ ...data, userId }).save();

const upsertByUser = (userId, products = []) => Cart.findOneAndUpdate(
  { userId },
  { $set: { products } },
  { new: true, upsert: true, setDefaultsOnInsert: true },
);

// The caller may only touch a cart they own (admins may touch any). `:id` here
// is the cart document id, so ownership must be checked against cart.userId.
const assertOwner = (cart, requester) => {
  if (!cart) throw new ApiError(404, 'Cart not found');
  const owns = String(cart.userId) === String(requester._id);
  if (!owns && !requester.isAdmin) {
    throw new ApiError(403, 'You are not allowed to perform the operation!');
  }
};

const updateById = async (id, data, requester) => {
  const cart = await Cart.findById(id);
  assertOwner(cart, requester);
  cart.set({ products: data.products ?? cart.products });
  await cart.save();
  return cart;
};

const removeById = async (id, requester) => {
  const cart = await Cart.findById(id);
  assertOwner(cart, requester);
  await cart.deleteOne();
};

const getByUser = (userId) => Cart.findOne({ userId });

const getAll = () => Cart.find();

module.exports = {
  create, upsertByUser, updateById, removeById, getByUser, getAll,
};
