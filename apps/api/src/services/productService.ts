import type { FilterQuery } from 'mongoose';
import Product, { IProduct } from '../models/Product';
import ApiError from '../util/ApiError';

const create = (data: Partial<IProduct>): Promise<IProduct> => new Product(data).save();

const update = async (id: string, data: Partial<IProduct>): Promise<IProduct> => {
  const product = await Product.findByIdAndUpdate(id, { $set: data }, { new: true });
  if (!product) throw new ApiError(404, 'Product not found');
  return product;
};

const remove = async (id: string): Promise<void> => {
  const deleted = await Product.findByIdAndDelete(id);
  if (!deleted) throw new ApiError(404, 'Product not found');
};

const getById = async (id: string): Promise<IProduct> => {
  const product = await Product.findById(id);
  if (!product) throw new ApiError(404, 'Product not found');
  return product;
};

interface ListQuery {
  qNew?: unknown;
  qCategory?: unknown;
  qSearch?: unknown;
}

const list = ({ qNew, qCategory, qSearch }: ListQuery) => {
  if (qSearch) {
    const term = String(qSearch).trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(term, 'i');
    return Product.find({
      $or: [{ title: regex }, { desc: regex }, { categories: regex }],
    } as FilterQuery<IProduct>);
  }
  if (qNew) {
    return Product.find().sort({ createdAt: -1 }).limit(5);
  }
  if (qCategory) {
    return Product.find({ categories: { $in: [qCategory] } });
  }
  return Product.find();
};

export {
  create, update, remove, getById, list,
};
