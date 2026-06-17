import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';

// Env the app/services rely on. Set before anything requires them.
process.env.JWT_SECRET = 'test-jwt-secret';
process.env.CLIENT_URL = 'http://localhost:5173';
process.env.STRIPE_KEY = process.env.STRIPE_KEY || 'sk_test_dummy';
process.env.NODE_ENV = 'test';

let mongo: MongoMemoryServer | undefined;

beforeAll(async () => {
  mongo = await MongoMemoryServer.create();
  await mongoose.connect(mongo.getUri());
});

// Wipe every collection between tests so cases are independent.
afterEach(async () => {
  const { collections } = mongoose.connection;
  await Promise.all(
    Object.values(collections).map((c) => c.deleteMany({})),
  );
});

afterAll(async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
  if (mongo) await mongo.stop();
});
