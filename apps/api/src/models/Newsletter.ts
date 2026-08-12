import { Schema, model, Document } from 'mongoose';

export interface INewsletterSubscription extends Document {
  email: string;
  subscribedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const newsletterSubscriptionSchema = new Schema<INewsletterSubscription>(
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

const NewsletterSubscription = model<INewsletterSubscription>(
  'NewsletterSubscription',
  newsletterSubscriptionSchema,
);

export default NewsletterSubscription;
