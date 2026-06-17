const mongoose = require('mongoose');

const OrderSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    products: [
      {
        productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
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

module.exports = mongoose.model('Order', OrderSchema);
