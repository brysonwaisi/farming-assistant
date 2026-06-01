const authService = require('../services/authService');
const { setAccessCookie, setRefreshCookie, clearAuthCookies } = require('../util/tokens');

const register = async (req, res) => {
  const { user, refreshToken } = await authService.register(req.body);
  setAccessCookie(res, user._id);
  setRefreshCookie(res, refreshToken);
  return res.status(201).json(user);
};

const login = async (req, res) => {
  const { user, refreshToken } = await authService.login(req.body);
  setAccessCookie(res, user._id);
  setRefreshCookie(res, refreshToken);
  return res.status(200).json(user);
};

const refresh = async (req, res) => {
  const { user, refreshToken } = await authService.refresh(req.cookies.refreshToken);
  setAccessCookie(res, user._id);
  setRefreshCookie(res, refreshToken);
  return res.status(200).json({ success: true, user });
};

const logout = async (req, res) => {
  await authService.logout(req.cookies.refreshToken);
  clearAuthCookies(res);
  return res.status(200).json({ success: true, message: 'Logged out successfully' });
};

const verifyEmail = async (req, res) => {
  const user = await authService.verifyEmail(req.body.code);
  return res.status(200).json({ success: true, message: 'Email verified successfully', user });
};

const forgotPassword = async (req, res) => {
  await authService.forgotPassword(req.body.email);
  return res.status(200).json({ success: true, message: 'Password reset link sent to your email' });
};

const resetPassword = async (req, res) => {
  await authService.resetPassword(req.params.token, req.body.password);
  return res.status(200).json({ success: true, message: 'Password reset successful' });
};

const checkAuth = async (req, res) => {
  const user = await authService.getByAccessToken(req.cookies.token);
  return res.status(200).json({ success: true, user });
};

module.exports = {
  register,
  login,
  refresh,
  logout,
  verifyEmail,
  forgotPassword,
  resetPassword,
  checkAuth,
};
