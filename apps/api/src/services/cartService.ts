import Cart, { ICart } from '../models/Cart';
import { IUser } from '../models/User';
import ApiError from '../util/ApiError';

type Requester = Pick<IUser, '_id' | 'isAdmin'>;

const create = (userId: IUser['_id'], data: Partial<ICart>) => new Cart({ ...data, userId }).save();

const upsertByUser = (userId: IUser['_id'], products: ICart['products'] = []) => Cart.findOneAndUpdate(
  { userId },
  { $set: { products } },
  { new: true, upsert: true, setDefaultsOnInsert: true },
);

// The caller may only touch a cart they own (admins may touch any). `:id` here
// is the cart document id, so ownership must be checked against cart.userId.
const assertOwner: (cart: ICart | null, requester: Requester) => asserts cart is ICart = (cart, requester) => {
  if (!cart) throw new ApiError(404, 'Cart not found');
  const owns = String(cart.userId) === String(requester._id);
  if (!owns && !requester.isAdmin) {
    throw new ApiError(403, 'You are not allowed to perform the operation!');
  }
};

const updateById = async (id: string, data: Partial<ICart>, requester: Requester) => {
  const cart = await Cart.findById(id);
  assertOwner(cart, requester);
  cart.set({ products: data.products ?? cart.products });
  await cart.save();
  return cart;
};

const removeById = async (id: string, requester: Requester) => {
  const cart = await Cart.findById(id);
  assertOwner(cart, requester);
  await cart.deleteOne();
};

const getByUser = (userId: IUser['_id']) => Cart.findOne({ userId });

const getAll = () => Cart.find();

export {
  create, upsertByUser, updateById, removeById, getByUser, getAll,
};
