const router = require('express').Router();
const asyncHandler = require('../util/asyncHandler');
const { authLimiter } = require('../middleware/rateLimit');
const validate = require('../middleware/validate');
const {
  registerRules,
  loginRules,
  forgotPasswordRules,
  resetPasswordRules,
} = require('../validations/authValidation');
const ctrl = require('../controllers/authController');

router.post('/register', authLimiter, registerRules, validate, asyncHandler(ctrl.register));
router.post('/login', authLimiter, loginRules, validate, asyncHandler(ctrl.login));
router.post('/refresh', asyncHandler(ctrl.refresh));
router.post('/logout', asyncHandler(ctrl.logout));
router.post('/verify-email', asyncHandler(ctrl.verifyEmail));
router.post('/forgot-password', authLimiter, forgotPasswordRules, validate, asyncHandler(ctrl.forgotPassword));
router.post('/reset-password/:token', authLimiter, resetPasswordRules, validate, asyncHandler(ctrl.resetPassword));
router.get('/check-auth', asyncHandler(ctrl.checkAuth));

module.exports = router;
