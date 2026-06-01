const request = require('supertest');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const app = require('../app');

// Create a user directly in the DB (bypassing email side-effects).
const createUser = async (overrides = {}) => {
  const password = overrides.password || 'Passw0rd!';
  const user = await User.create({
    username: overrides.username || 'tester',
    email: overrides.email || 'tester@example.com',
    password: await bcrypt.hash(password, 10),
    isAdmin: overrides.isAdmin || false,
    isVerified: true,
  });
  return { user, password };
};

// Extract the access-token cookie string from a supertest response.
const cookieFrom = (res) => {
  const cookies = res.headers['set-cookie'] || [];
  return cookies.map((c) => c.split(';')[0]).join('; ');
};

// Create a user and return a supertest agent already logged in (cookies set).
const authedAgent = async (overrides = {}) => {
  const { user, password } = await createUser(overrides);
  const agent = request.agent(app);
  await agent.post('/api/auth/login').send({ username: user.username, password });
  return { agent, user };
};

module.exports = { createUser, cookieFrom, authedAgent };
