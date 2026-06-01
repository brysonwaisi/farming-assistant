const NewsletterSubscription = require('../models/Newsletter');
const ApiError = require('../util/ApiError');

const subscribe = async (email) => {
  try {
    return await new NewsletterSubscription({ email }).save();
  } catch (err) {
    if (err.code === 11000) throw new ApiError(409, 'Email is already subscribed');
    throw err;
  }
};

module.exports = { subscribe };
