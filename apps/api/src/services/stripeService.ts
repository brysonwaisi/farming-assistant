import Stripe from 'stripe';
import ApiError from '../util/ApiError';

// The installed stripe@11 type definitions require an `apiVersion` in the
// config and lag behind the runtime API used below (embedded Checkout). The
// original code passed only the key so the account default API version is used
// at runtime; the cast preserves that behavior without pinning a version.
// Instantiated lazily so the key is read at first use (not at import time).
let stripeClient: Stripe | undefined;
const stripe = (): Stripe => {
  if (!stripeClient) {
    stripeClient = new Stripe(process.env.STRIPE_KEY!, {} as Stripe.StripeConfig);
  }
  return stripeClient;
};

const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173';

interface CartProduct {
  title?: string;
  price?: number | string;
  img?: string;
  quantity?: number;
}

const buildLineItems = (
  products: CartProduct[],
): Stripe.Checkout.SessionCreateParams.LineItem[] => {
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

const wrapStripe = async <T>(fn: () => Promise<T>): Promise<T> => {
  try {
    return await fn();
  } catch (err: unknown) {
    const stripeErr = err as { type?: string; statusCode?: number; message?: string };
    if (stripeErr.type && stripeErr.type.startsWith('Stripe')) {
      throw new ApiError(stripeErr.statusCode || 400, stripeErr.message ?? '');
    }
    throw err;
  }
};

const createEmbeddedSession = (userId: string, products: CartProduct[]) =>
  wrapStripe(async () => {
    // `ui_mode`/`return_url`/`client_secret` are embedded Checkout fields not
    // present in the installed stripe@11 types; cast to keep the runtime call.
    const session = await stripe().checkout.sessions.create({
      ui_mode: 'embedded',
      mode: 'payment',
      line_items: buildLineItems(products),
      client_reference_id: String(userId),
      billing_address_collection: 'required',
      return_url: `${CLIENT_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
    } as unknown as Stripe.Checkout.SessionCreateParams);
    return { clientSecret: (session as { client_secret?: string }).client_secret };
  });

const createHostedSession = (userId: string, products: CartProduct[]) =>
  wrapStripe(async () => {
    const session = await stripe().checkout.sessions.create({
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

const retrieveSession = (id: string) =>
  wrapStripe(async () => {
    const session = await stripe().checkout.sessions.retrieve(id);
    return {
      paymentStatus: session.payment_status,
      amountTotal: session.amount_total,
      customerEmail: session.customer_details?.email,
      address: session.customer_details?.address,
    };
  });

export { createEmbeddedSession, createHostedSession, retrieveSession };
