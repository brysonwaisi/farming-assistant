import { Schema, model, Document, Types } from 'mongoose';

export interface OrderProduct {
  productId?: Types.ObjectId;
  quantity: number;
}

export interface OrderDocument extends Document {
  userId: Types.ObjectId;
  products: OrderProduct[];
  amount: number;
  address: Record<string, unknown>;
  status: string;
  createdAt: Date;
  updatedAt: Date;
}

const OrderSchema = new Schema<OrderDocument>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    products: [
      {
        productId: { type: Schema.Types.ObjectId, ref: 'Product' },
        quantity: { type: Number, default: 1 },
      },
    ],
    amount: { type: Number, required: true },
    address: { type: Object, required: true },
    status: { type: String, default: 'pending' },
  },
  { timestamps: true },
);

OrderSchema.index({ userId: 1 });
OrderSchema.index({ createdAt: -1 });

export default model<OrderDocument>('Order', OrderSchema);
