import { Types } from 'mongoose';
import Wishlist from '../models/Wishlist';

type Id = Types.ObjectId | string;

interface RawProduct {
  productId?: Id;
}

const getByUser = (userId: Id) => Wishlist.findOne({ userId });

const replace = (userId: Id, rawProducts: Array<RawProduct | Id> = []) => {
  const products = rawProducts.map((p) => ({
    productId: (typeof p === 'object' && p !== null && 'productId' in p ? p.productId : p) || p,
  }));
  return Wishlist.findOneAndUpdate(
    { userId },
    { $set: { products } },
    { new: true, upsert: true, setDefaultsOnInsert: true },
  );
};

const add = (userId: Id, productId: Id) => Wishlist.findOneAndUpdate(
  { userId },
  { $addToSet: { products: { productId } } },
  { new: true, upsert: true, setDefaultsOnInsert: true },
);

const remove = (userId: Id, productId: Id) => Wishlist.findOneAndUpdate(
  { userId },
  { $pull: { products: { productId } } },
  { new: true },
);

export {
  getByUser, replace, add, remove,
};
