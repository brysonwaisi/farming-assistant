const Wishlist = require('../models/Wishlist');

const getByUser = (userId) => Wishlist.findOne({ userId });

const replace = (userId, rawProducts = []) => {
  const products = rawProducts.map((p) => ({ productId: p.productId || p }));
  return Wishlist.findOneAndUpdate(
    { userId },
    { $set: { products } },
    { new: true, upsert: true, setDefaultsOnInsert: true },
  );
};

const add = (userId, productId) => Wishlist.findOneAndUpdate(
  { userId },
  { $addToSet: { products: { productId } } },
  { new: true, upsert: true, setDefaultsOnInsert: true },
);

const remove = (userId, productId) => Wishlist.findOneAndUpdate(
  { userId },
  { $pull: { products: { productId } } },
  { new: true },
);

module.exports = {
  getByUser, replace, add, remove,
};
