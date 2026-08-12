import { Router } from 'express';
import {
  verifyToken,
  verifyTokenAndAdmin,
  checkOwnership,
} from '../middleware/tokenVerify';
import asyncHandler from '../util/asyncHandler';
import * as ctrl from '../controllers/cartController';

const router = Router();

router.post('/', verifyToken, asyncHandler(ctrl.create));
router.put('/find/:userId', verifyToken, checkOwnership, asyncHandler(ctrl.upsertByUser));
// :id is a cart document id — ownership is verified inside the controller/service.
router.put('/:id', verifyToken, asyncHandler(ctrl.updateById));
router.delete('/:id', verifyToken, asyncHandler(ctrl.removeById));
router.get('/find/:userId', verifyToken, checkOwnership, asyncHandler(ctrl.getByUser));
router.get('/', verifyTokenAndAdmin, asyncHandler(ctrl.getAll));

export default router;
