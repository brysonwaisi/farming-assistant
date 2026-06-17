import request from 'supertest';
import bcrypt from 'bcryptjs';
import User, { IUser } from '../models/User';
import app from '../app';

interface UserOverrides {
  username?: string;
  email?: string;
  password?: string;
  isAdmin?: boolean;
}

// Create a user directly in the DB (bypassing email side-effects).
const createUser = async (
  overrides: UserOverrides = {},
): Promise<{ user: IUser; password: string }> => {
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
const cookieFrom = (res: request.Response): string => {
  const raw = res.headers['set-cookie'] || [];
  const cookies = Array.isArray(raw) ? raw : [raw];
  return cookies.map((c) => c.split(';')[0]).join('; ');
};

// Create a user and return a supertest agent already logged in (cookies set).
const authedAgent = async (
  overrides: UserOverrides = {},
): Promise<{ agent: ReturnType<typeof request.agent>; user: IUser }> => {
  const { user, password } = await createUser(overrides);
  const agent = request.agent(app);
  await agent.post('/api/auth/login').send({ username: user.username, password });
  return { agent, user };
};

export { createUser, cookieFrom, authedAgent };
