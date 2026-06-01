const Product = require('../models/Product');
const ApiError = require('../util/ApiError');

const create = (data) => new Product(data).save();

const update = async (id, data) => {
  const product = await Product.findByIdAndUpdate(id, { $set: data }, { new: true });
  if (!product) throw new ApiError(404, 'Product not found');
  return product;
};

const remove = async (id) => {
  const deleted = await Product.findByIdAndDelete(id);
  if (!deleted) throw new ApiError(404, 'Product not found');
};

const getById = async (id) => {
  const product = await Product.findById(id);
  if (!product) throw new ApiError(404, 'Product not found');
  return product;
};

const list = ({ qNew, qCategory, qSearch }) => {
  if (qSearch) {
    const term = String(qSearch).trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(term, 'i');
    return Product.find({
      $or: [{ title: regex }, { desc: regex }, { categories: regex }],
    });
  }
  if (qNew) {
    return Product.find().sort({ createdAt: -1 }).limit(5);
  }
  if (qCategory) {
    return Product.find({ categories: { $in: [qCategory] } });
  }
  return Product.find();
};

module.exports = {
  create, update, remove, getById, list,
};
