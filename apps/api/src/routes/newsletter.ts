import { Router } from 'express';
import { body } from 'express-validator';
import validate from '../middleware/validate';
import asyncHandler from '../util/asyncHandler';
import * as ctrl from '../controllers/newsletterController';

const router = Router();

const rules = [body('email').trim().isEmail().withMessage('A valid email is required')];

router.post('/', rules, validate, asyncHandler(ctrl.subscribe));

export default router;
