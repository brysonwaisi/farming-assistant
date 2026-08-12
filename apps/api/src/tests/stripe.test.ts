// Mock the Stripe SDK so no network call happens; we test our wiring + error mapping.
const mockCreate = jest.fn();
const mockRetrieve = jest.fn();
// __esModule + default so the esModuleInterop `import Stripe from 'stripe'` resolves the constructor.
jest.mock('stripe', () => ({
  __esModule: true,
  default: function Stripe() {
    return {
      checkout: { sessions: { create: mockCreate, retrieve: mockRetrieve } },
    };
  },
}));

import request from 'supertest';
import app from '../app';
import { authedAgent } from './helpers';

beforeEach(() => {
  mockCreate.mockReset();
  mockRetrieve.mockReset();
});

describe('Stripe checkout', () => {
  it('requires authentication', async () => {
    const res = await request(app)
      .post('/api/checkout/create-embedded-session')
      .send({ products: [{ title: 'X', price: 100, quantity: 1 }] });
    expect(res.status).toBe(401);
  });

  it('returns a clientSecret for a valid embedded session', async () => {
    mockCreate.mockResolvedValue({ client_secret: 'cs_test_123' });
    const { agent } = await authedAgent();
    const res = await agent
      .post('/api/checkout/create-embedded-session')
      .send({ products: [{ title: 'Tomatoes', price: 100, quantity: 2 }] });
    expect(res.status).toBe(201);
    expect(res.body.clientSecret).toBe('cs_test_123');
  });

  it('rejects an empty cart with 400 (no Stripe call)', async () => {
    const { agent } = await authedAgent();
    const res = await agent.post('/api/checkout/create-embedded-session').send({ products: [] });
    expect(res.status).toBe(400);
    expect(mockCreate).not.toHaveBeenCalled();
  });

  it('rejects a product with invalid price with 400', async () => {
    const { agent } = await authedAgent();
    const res = await agent
      .post('/api/checkout/create-embedded-session')
      .send({ products: [{ title: 'X', price: 0, quantity: 1 }] });
    expect(res.status).toBe(400);
  });

  it('creates a hosted session with converted cent amounts and returns id + url', async () => {
    mockCreate.mockResolvedValue({ id: 'cs_1', url: 'https://checkout.stripe.test/cs_1' });
    const { agent } = await authedAgent();
    const res = await agent
      .post('/api/checkout/create-checkout-session')
      .send({ products: [{ title: 'Tomatoes', price: 99.5, quantity: 2 }] });
    expect(res.status).toBe(201);
    expect(res.body).toEqual({ id: 'cs_1', url: 'https://checkout.stripe.test/cs_1' });
    const params = mockCreate.mock.calls[0][0];
    expect(params.mode).toBe('payment');
    expect(params.line_items).toEqual([
      expect.objectContaining({
        quantity: 2,
        price_data: expect.objectContaining({ unit_amount: 9950 }),
      }),
    ]);
    expect(params.success_url).toContain('/success');
  });

  it('retrieves a session mapped to payment status, total and customer details', async () => {
    mockRetrieve.mockResolvedValue({
      payment_status: 'paid',
      amount_total: 19900,
      customer_details: { email: 'b@x.com', address: { city: 'Nairobi' } },
    });
    const { agent } = await authedAgent();
    const res = await agent.get('/api/checkout/session/cs_1');
    expect(res.status).toBe(200);
    expect(res.body).toEqual({
      paymentStatus: 'paid',
      amountTotal: 19900,
      customerEmail: 'b@x.com',
      address: { city: 'Nairobi' },
    });
  });

  it('requires authentication to retrieve a session', async () => {
    const res = await request(app).get('/api/checkout/session/cs_1');
    expect(res.status).toBe(401);
    expect(mockRetrieve).not.toHaveBeenCalled();
  });

  it('maps a Stripe API error to its status, not a 500', async () => {
    const stripeErr = Object.assign(new Error('No business name set'), {
      type: 'StripeInvalidRequestError',
      statusCode: 400,
    });
    mockCreate.mockRejectedValue(stripeErr);
    const { agent } = await authedAgent();
    const res = await agent
      .post('/api/checkout/create-embedded-session')
      .send({ products: [{ title: 'X', price: 100, quantity: 1 }] });
    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/business name/i);
  });
});
