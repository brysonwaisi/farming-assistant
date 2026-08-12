import { Request, Response } from 'express';
import * as authService from '../services/authService';
import { setAccessCookie, setRefreshCookie, clearAuthCookies } from '../util/tokens';

const register = async (req: Request, res: Response) => {
  const { user, refreshToken } = await authService.register(req.body);
  setAccessCookie(res, String(user._id));
  setRefreshCookie(res, refreshToken);
  return res.status(201).json(user);
};

const login = async (req: Request, res: Response) => {
  const { user, refreshToken } = await authService.login(req.body);
  setAccessCookie(res, String(user._id));
  setRefreshCookie(res, refreshToken);
  return res.status(200).json(user);
};

const refresh = async (req: Request, res: Response) => {
  const { user, refreshToken } = await authService.refresh(req.cookies.refreshToken);
  setAccessCookie(res, String(user._id));
  setRefreshCookie(res, refreshToken);
  return res.status(200).json({ success: true, user });
};

const logout = async (req: Request, res: Response) => {
  await authService.logout(req.cookies.refreshToken);
  clearAuthCookies(res);
  return res.status(200).json({ success: true, message: 'Logged out successfully' });
};

const verifyEmail = async (req: Request, res: Response) => {
  const user = await authService.verifyEmail(req.body.code);
  return res.status(200).json({ success: true, message: 'Email verified successfully', user });
};

const forgotPassword = async (req: Request, res: Response) => {
  await authService.forgotPassword(req.body.email);
  return res.status(200).json({ success: true, message: 'Password reset link sent to your email' });
};

const resetPassword = async (req: Request, res: Response) => {
  await authService.resetPassword(req.params.token!, req.body.password);
  return res.status(200).json({ success: true, message: 'Password reset successful' });
};

const checkAuth = async (req: Request, res: Response) => {
  const user = await authService.getByAccessToken(req.cookies.token);
  return res.status(200).json({ success: true, user });
};

export {
  register,
  login,
  refresh,
  logout,
  verifyEmail,
  forgotPassword,
  resetPassword,
  checkAuth,
};
