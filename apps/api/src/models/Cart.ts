import { Schema, model, Document, Types } from 'mongoose';

export interface ICartProduct {
  productId?: Types.ObjectId;
  quantity: number;
}

export interface ICart extends Document {
  userId: Types.ObjectId;
  products: ICartProduct[];
  createdAt: Date;
  updatedAt: Date;
}

const CartSchema = new Schema<ICart>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    products: [
      {
        productId: { type: Schema.Types.ObjectId, ref: 'Product' },
        quantity: { type: Number, default: 1 },
      },
    ],
  },
  { timestamps: true },
);

export default model<ICart>('Cart', CartSchema);
