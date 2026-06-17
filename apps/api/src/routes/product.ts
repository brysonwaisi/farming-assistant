import { Router } from 'express';
import { verifyTokenAndAdmin } from '../middleware/tokenVerify';
import asyncHandler from '../util/asyncHandler';
import * as ctrl from '../controllers/productController';
import * as uploadCtrl from '../controllers/uploadController';

const router = Router();

// Presigned S3 upload URL for product images (admin only).
router.post('/upload-url', verifyTokenAndAdmin, asyncHandler(uploadCtrl.createUploadUrl));

router.post('/', verifyTokenAndAdmin, asyncHandler(ctrl.create));
router.put('/:id', verifyTokenAndAdmin, asyncHandler(ctrl.update));
router.delete('/:id', verifyTokenAndAdmin, asyncHandler(ctrl.remove));
router.get('/find/:id', asyncHandler(ctrl.getById));
router.get('/', asyncHandler(ctrl.list));

export default router;
