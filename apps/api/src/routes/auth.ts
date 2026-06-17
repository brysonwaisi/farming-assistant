import { Router } from 'express';
import asyncHandler from '../util/asyncHandler';
import { authLimiter } from '../middleware/rateLimit';
import validate from '../middleware/validate';
import {
  registerRules,
  loginRules,
  forgotPasswordRules,
  resetPasswordRules,
} from '../validations/authValidation';
import * as ctrl from '../controllers/authController';

const router = Router();

router.post('/register', authLimiter, registerRules, validate, asyncHandler(ctrl.register));
router.post('/login', authLimiter, loginRules, validate, asyncHandler(ctrl.login));
router.post('/refresh', asyncHandler(ctrl.refresh));
router.post('/logout', asyncHandler(ctrl.logout));
router.post('/verify-email', asyncHandler(ctrl.verifyEmail));
router.post('/forgot-password', authLimiter, forgotPasswordRules, validate, asyncHandler(ctrl.forgotPassword));
router.post('/reset-password/:token', authLimiter, resetPasswordRules, validate, asyncHandler(ctrl.resetPassword));
router.get('/check-auth', asyncHandler(ctrl.checkAuth));

export default router;
