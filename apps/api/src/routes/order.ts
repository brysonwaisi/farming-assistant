import { Router } from 'express';
import {
  verifyToken,
  verifyTokenAndAdmin,
  checkOwnership,
} from '../middleware/tokenVerify';
import asyncHandler from '../util/asyncHandler';
import * as ctrl from '../controllers/orderController';

const router = Router();

router.post('/', verifyToken, asyncHandler(ctrl.create));
router.put('/:id', verifyTokenAndAdmin, asyncHandler(ctrl.updateById));
router.delete('/:id', verifyTokenAndAdmin, asyncHandler(ctrl.removeById));
router.get('/income', verifyTokenAndAdmin, asyncHandler(ctrl.income));
router.get('/find/:userId', verifyToken, checkOwnership, asyncHandler(ctrl.getByUser));
router.get('/', verifyTokenAndAdmin, asyncHandler(ctrl.getAll));

export default router;
