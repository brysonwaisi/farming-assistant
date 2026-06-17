const mongoose = require('mongoose');

const WishlistSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    products: [
      new mongoose.Schema(
        {
          productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
        },
        { _id: false },
      ),
    ],
  },
  { timestamps: true },
);

module.exports = mongoose.model('Wishlist', WishlistSchema);
