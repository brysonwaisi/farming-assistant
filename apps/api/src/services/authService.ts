import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import jwt, { JwtPayload } from 'jsonwebtoken';
import User, { IUser } from '../models/User';
import ApiError from '../util/ApiError';
import logger from './logger';
import { createRefreshToken, hashToken } from '../util/tokens';
import {
  sendVerificationEmail,
  sendWelcomeEmail,
  sendPasswordResetEmail,
  sendResetSuccessEmail,
} from '../mailtrap/emails';

const sanitize = (userDoc: IUser): Record<string, unknown> => {
  const obj = (userDoc.toObject ? userDoc.toObject() : userDoc) as Record<string, unknown>;
  delete obj.password;
  delete obj.refreshTokenHash;
  delete obj.refreshTokenExpiresAt;
  return obj;
};

const issueRefreshToken = async (user: IUser): Promise<string> => {
  const { raw, hash, expiresAt } = createRefreshToken();
  /* eslint-disable no-param-reassign */
  user.refreshTokenHash = hash;
  user.refreshTokenExpiresAt = expiresAt;
  /* eslint-enable no-param-reassign */
  await user.save();
  return raw;
};

interface RegisterInput {
  username: string;
  email: string;
  password: string;
}

interface AuthResult {
  user: Record<string, unknown>;
  refreshToken: string;
}

const register = async ({ username, email, password }: RegisterInput): Promise<AuthResult> => {
  const verificationToken = Math.floor(100000 + Math.random() * 900000).toString();
  let user: IUser;
  try {
    user = await new User({
      username,
      email,
      password: await bcrypt.hash(password, 10),
      verificationToken,
      verificationTokenExpiresAt: Date.now() + 24 * 60 * 60 * 1000,
    }).save();
  } catch (err: unknown) {
    if (typeof err === 'object' && err !== null && (err as { code?: number }).code === 11000) {
      throw new ApiError(409, 'Username or email already in use');
    }
    throw err;
  }

  try {
    await sendVerificationEmail(user.email, verificationToken);
  } catch (mailErr: unknown) {
    logger.error('Failed to send verification email', mailErr);
  }

  const refreshToken = await issueRefreshToken(user);
  return { user: sanitize(user), refreshToken };
};

interface LoginInput {
  username: string;
  password: string;
}

const login = async ({ username, password }: LoginInput): Promise<AuthResult> => {
  const user = await User.findOne({ username });
  if (!user) throw new ApiError(401, 'Wrong username!');

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) throw new ApiError(401, 'Wrong password!');

  user.lastLogin = new Date();
  const refreshToken = await issueRefreshToken(user); // also saves lastLogin
  return { user: sanitize(user), refreshToken };
};

const refresh = async (rawToken: string | undefined): Promise<AuthResult> => {
  if (!rawToken) throw new ApiError(401, 'No refresh token');
  const hash = hashToken(rawToken);
  const user = await User.findOne({ refreshTokenHash: hash }).select(
    '+refreshTokenHash +refreshTokenExpiresAt',
  );
  if (!user) throw new ApiError(401, 'Invalid refresh token');
  if (!user.refreshTokenExpiresAt || user.refreshTokenExpiresAt.getTime() < Date.now()) {
    throw new ApiError(401, 'Refresh token expired');
  }
  const refreshToken = await issueRefreshToken(user); // rotate
  return { user: sanitize(user), refreshToken };
};

const logout = async (rawToken: string | undefined): Promise<void> => {
  if (!rawToken) return;
  const hash = hashToken(rawToken);
  await User.findOneAndUpdate(
    { refreshTokenHash: hash },
    { $unset: { refreshTokenHash: '', refreshTokenExpiresAt: '' } },
  );
};

const verifyEmail = async (code: string): Promise<Record<string, unknown>> => {
  const user = await User.findOne({
    verificationToken: code,
    verificationTokenExpiresAt: { $gt: Date.now() },
  });
  if (!user) throw new ApiError(400, 'Invalid or expired verification code');

  user.isVerified = true;
  user.verificationToken = undefined;
  user.verificationTokenExpiresAt = undefined;
  await user.save();

  try {
    await sendWelcomeEmail(user.email, user.username);
  } catch (mailErr: unknown) {
    logger.error('Failed to send welcome email', mailErr);
  }
  return sanitize(user);
};

const forgotPassword = async (email: string): Promise<void> => {
  const user = await User.findOne({ email });
  // Don't reveal whether the email is registered (prevents user enumeration):
  // always resolve the same way; only issue a token + email when it exists.
  if (!user) return;

  user.resetPasswordToken = crypto.randomBytes(20).toString('hex');
  user.resetPasswordExpiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
  await user.save();

  try {
    await sendPasswordResetEmail(
      user.email,
      `${process.env.CLIENT_URL}/reset-password/${user.resetPasswordToken}`,
    );
  } catch (mailErr: unknown) {
    logger.error('Failed to send password reset email', mailErr);
  }
};

const resetPassword = async (token: string, password: string): Promise<void> => {
  const user = await User.findOne({
    resetPasswordToken: token,
    resetPasswordExpiresAt: { $gt: Date.now() },
  });
  if (!user) throw new ApiError(400, 'Invalid or expired reset token');

  user.password = await bcrypt.hash(password, 10);
  user.resetPasswordToken = undefined;
  user.resetPasswordExpiresAt = undefined;
  await user.save();

  try {
    await sendResetSuccessEmail(user.email);
  } catch (mailErr: unknown) {
    logger.error('Failed to send reset success email', mailErr);
  }
};

const getByAccessToken = async (token: string | undefined): Promise<IUser> => {
  if (!token) throw new ApiError(401, 'No token provided');
  let decoded: string | JwtPayload;
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET as string);
  } catch (err: unknown) {
    throw new ApiError(401, 'Invalid token');
  }
  const userId = typeof decoded === 'object' ? (decoded as JwtPayload).userId : undefined;
  const user = await User.findById(userId).select('-password');
  if (!user) throw new ApiError(401, 'User not found');
  return user;
};

export {
  register,
  login,
  refresh,
  logout,
  verifyEmail,
  forgotPassword,
  resetPassword,
  getByAccessToken,
};
