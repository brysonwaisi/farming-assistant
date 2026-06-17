const stripe = require('stripe')(process.env.STRIPE_KEY);
const ApiError = require('../util/ApiError');

const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173';

const buildLineItems = (products) => {
  if (!Array.isArray(products) || products.length === 0) {
    throw new ApiError(400, 'products are required');
  }
  return products.map((p) => {
    const unitAmount = Math.round(Number(p.price) * 100);
    if (!p.title || !Number.isFinite(unitAmount) || unitAmount <= 0) {
      throw new ApiError(400, 'Invalid product in cart');
    }
    return {
      price_data: {
        currency: 'usd',
        product_data: { name: p.title, ...(p.img ? { images: [p.img] } : {}) },
        unit_amount: unitAmount,
      },
      quantity: p.quantity || 1,
    };
  });
};

const wrapStripe = async (fn) => {
  try {
    return await fn();
  } catch (err) {
    if (err.type && err.type.startsWith('Stripe')) {
      throw new ApiError(err.statusCode || 400, err.message);
    }
    throw err;
  }
};

const createEmbeddedSession = (userId, products) => wrapStripe(async () => {
  const session = await stripe.checkout.sessions.create({
    ui_mode: 'embedded',
    mode: 'payment',
    line_items: buildLineItems(products),
    client_reference_id: String(userId),
    billing_address_collection: 'required',
    return_url: `${CLIENT_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
  });
  return { clientSecret: session.client_secret };
});

const createHostedSession = (userId, products) => wrapStripe(async () => {
  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    payment_method_types: ['card'],
    line_items: buildLineItems(products),
    client_reference_id: String(userId),
    billing_address_collection: 'required',
    shipping_address_collection: { allowed_countries: ['US', 'KE', 'GB'] },
    success_url: `${CLIENT_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${CLIENT_URL}/cart`,
  });
  return { id: session.id, url: session.url };
});

const retrieveSession = (id) => wrapStripe(async () => {
  const session = await stripe.checkout.sessions.retrieve(id);
  return {
    paymentStatus: session.payment_status,
    amountTotal: session.amount_total,
    customerEmail: session.customer_details?.email,
    address: session.customer_details?.address,
  };
});

module.exports = { createEmbeddedSession, createHostedSession, retrieveSession };
