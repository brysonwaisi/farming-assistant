import { Router } from 'express';
import { verifyToken, checkOwnership } from '../middleware/tokenVerify';
import asyncHandler from '../util/asyncHandler';
import * as ctrl from '../controllers/wishlistController';

const router = Router();

router.get('/find/:userId', verifyToken, checkOwnership, asyncHandler(ctrl.getByUser));
router.put('/find/:userId', verifyToken, checkOwnership, asyncHandler(ctrl.replace));
router.post('/:productId', verifyToken, asyncHandler(ctrl.add));
router.delete('/:productId', verifyToken, asyncHandler(ctrl.remove));

export default router;
