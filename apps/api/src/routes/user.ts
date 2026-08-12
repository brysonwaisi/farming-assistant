import { Router } from 'express';
import { verifyToken, verifyTokenAndAuthorization, verifyTokenAndAdmin } from '../middleware/tokenVerify';
import asyncHandler from '../util/asyncHandler';
import * as ctrl from '../controllers/userController';
import * as uploadCtrl from '../controllers/uploadController';

const router = Router();

// Presigned URL for the current user's own avatar upload.
router.post('/avatar-upload-url', verifyToken, asyncHandler(uploadCtrl.createAvatarUploadUrl));

router.put('/:id', verifyTokenAndAuthorization, asyncHandler(ctrl.update));
router.delete('/:id', verifyTokenAndAuthorization, asyncHandler(ctrl.remove));
router.get('/stats', verifyTokenAndAdmin, asyncHandler(ctrl.stats));
router.get('/find/:id', verifyTokenAndAdmin, asyncHandler(ctrl.getById));
router.get('/', verifyTokenAndAdmin, asyncHandler(ctrl.list));

export default router;
