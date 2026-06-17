const mongoose = require('mongoose');

const newsletterSubscriptionSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    subscribedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true },
);

const NewsletterSubscription = mongoose.model(
  'NewsletterSubscription',
  newsletterSubscriptionSchema,
);

module.exports = NewsletterSubscription;
