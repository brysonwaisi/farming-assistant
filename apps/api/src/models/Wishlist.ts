import { Schema, model, Document, Types } from 'mongoose';

export interface WishlistProduct {
  productId?: Types.ObjectId;
}

export interface WishlistDocument extends Document {
  userId: Types.ObjectId;
  products: WishlistProduct[];
  createdAt: Date;
  updatedAt: Date;
}

const WishlistSchema = new Schema<WishlistDocument>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    products: [
      new Schema<WishlistProduct>(
        {
          productId: { type: Schema.Types.ObjectId, ref: 'Product' },
        },
        { _id: false },
      ),
    ],
  },
  { timestamps: true },
);

export default model<WishlistDocument>('Wishlist', WishlistSchema);
