import { body, ValidationChain } from 'express-validator';

const registerRules: ValidationChain[] = [
  body('username').trim().isLength({ min: 3 }).withMessage('Username must be at least 3 characters'),
  body('email').trim().isEmail().withMessage('A valid email is required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
];

const loginRules: ValidationChain[] = [
  body('username').trim().notEmpty().withMessage('Username is required'),
  body('password').notEmpty().withMessage('Password is required'),
];

const forgotPasswordRules: ValidationChain[] = [
  body('email').trim().isEmail().withMessage('A valid email is required'),
];

const resetPasswordRules: ValidationChain[] = [
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
];

export { registerRules, loginRules, forgotPasswordRules, resetPasswordRules };
