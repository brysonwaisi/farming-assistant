// Provide S3 config before app/services load, and stub the presigner so no AWS
// call happens.
process.env.AWS_REGION = 'us-east-1';
process.env.S3_BUCKET = 'test-bucket';
process.env.CLOUDFRONT_DOMAIN = 'dtest.cloudfront.net';

jest.mock('@aws-sdk/s3-request-presigner', () => ({
  getSignedUrl: jest.fn().mockResolvedValue('https://test-bucket.s3.amazonaws.com/signed-put-url'),
}));

const request = require('supertest');
const app = require('../app');
const { authedAgent } = require('./helpers');

describe('POST /api/products/upload-url', () => {
  it('returns a presigned URL + CloudFront fileUrl for an admin', async () => {
    const { agent } = await authedAgent({ username: 'admin', email: 'a@a.com', isAdmin: true });
    const res = await agent.post('/api/products/upload-url').send({ contentType: 'image/png' });

    expect(res.status).toBe(201);
    expect(res.body.uploadUrl).toMatch(/signed-put-url/);
    expect(res.body.fileUrl).toMatch(/^https:\/\/dtest\.cloudfront\.net\/products\/.*\.png$/);
    expect(res.body.key).toMatch(/^products\/.*\.png$/);
  });

  it('blocks a non-admin (403)', async () => {
    const { agent } = await authedAgent({ username: 'shopper', isAdmin: false });
    const res = await agent.post('/api/products/upload-url').send({ contentType: 'image/png' });
    expect(res.status).toBe(403);
  });

  it('blocks an unauthenticated request (401)', async () => {
    const res = await request(app).post('/api/products/upload-url').send({ contentType: 'image/png' });
    expect(res.status).toBe(401);
  });

  it('rejects an unsupported content type (400)', async () => {
    const { agent } = await authedAgent({ username: 'admin', email: 'a@a.com', isAdmin: true });
    const res = await agent.post('/api/products/upload-url').send({ contentType: 'application/pdf' });
    expect(res.status).toBe(400);
  });

  it('requires a contentType (400)', async () => {
    const { agent } = await authedAgent({ username: 'admin', email: 'a@a.com', isAdmin: true });
    const res = await agent.post('/api/products/upload-url').send({});
    expect(res.status).toBe(400);
  });
});

describe('POST /api/users/avatar-upload-url', () => {
  it('lets any logged-in user get a presigned avatar URL under avatars/', async () => {
    const { agent } = await authedAgent({ username: 'shopper', isAdmin: false });
    const res = await agent.post('/api/users/avatar-upload-url').send({ contentType: 'image/jpeg' });

    expect(res.status).toBe(201);
    expect(res.body.uploadUrl).toMatch(/signed-put-url/);
    expect(res.body.fileUrl).toMatch(/^https:\/\/dtest\.cloudfront\.net\/avatars\/.*\.jpg$/);
    expect(res.body.key).toMatch(/^avatars\/.*\.jpg$/);
  });

  it('blocks an unauthenticated request (401)', async () => {
    const res = await request(app).post('/api/users/avatar-upload-url').send({ contentType: 'image/jpeg' });
    expect(res.status).toBe(401);
  });

  it('rejects an unsupported content type (400)', async () => {
    const { agent } = await authedAgent({ username: 'shopper', isAdmin: false });
    const res = await agent.post('/api/users/avatar-upload-url').send({ contentType: 'application/pdf' });
    expect(res.status).toBe(400);
  });
});
