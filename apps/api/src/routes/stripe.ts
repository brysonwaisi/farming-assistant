import { Router } from 'express';
import { verifyToken } from '../middleware/tokenVerify';
import asyncHandler from '../util/asyncHandler';
import * as ctrl from '../controllers/stripeController';

const router = Router();

router.post('/create-embedded-session', verifyToken, asyncHandler(ctrl.createEmbeddedSession));
router.post('/create-checkout-session', verifyToken, asyncHandler(ctrl.createCheckoutSession));
router.get('/session/:id', verifyToken, asyncHandler(ctrl.getSession));

export default router;
