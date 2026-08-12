import NewsletterSubscription, {
  INewsletterSubscription,
} from '../models/Newsletter';
import ApiError from '../util/ApiError';

const subscribe = async (email: string): Promise<INewsletterSubscription> => {
  try {
    return await new NewsletterSubscription({ email }).save();
  } catch (err: unknown) {
    if (err instanceof Error && (err as { code?: number }).code === 11000)
      throw new ApiError(409, 'Email is already subscribed');
    throw err;
  }
};

export { subscribe };
