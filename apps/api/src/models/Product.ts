import { Schema, model, Document } from 'mongoose';

export interface IProduct extends Document {
  title: string;
  desc: string;
  img: string;
  categories?: unknown[];
  type?: unknown[];
  price: number;
  inStock: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const ProductSchema = new Schema<IProduct>(
  {
    title: { type: String, required: true, unique: true },
    desc: { type: String, required: true },
    img: { type: String, required: true },
    categories: { type: Array },
    type: { type: Array },
    price: { type: Number, required: true },
    inStock: { type: Boolean, default: true },

  },
  { timestamps: true },
);

export default model<IProduct>('Product', ProductSchema);
