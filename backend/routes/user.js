const router = require('express').Router();
const { verifyToken, verifyTokenAndAuthorization, verifyTokenAndAdmin } = require('../middleware/tokenVerify');
const asyncHandler = require('../util/asyncHandler');
const ctrl = require('../controllers/userController');
const uploadCtrl = require('../controllers/uploadController');

// Presigned URL for the current user's own avatar upload.
router.post('/avatar-upload-url', verifyToken, asyncHandler(uploadCtrl.createAvatarUploadUrl));

router.put('/:id', verifyTokenAndAuthorization, asyncHandler(ctrl.update));
router.delete('/:id', verifyTokenAndAuthorization, asyncHandler(ctrl.remove));
router.get('/stats', verifyTokenAndAdmin, asyncHandler(ctrl.stats));
router.get('/find/:id', verifyTokenAndAdmin, asyncHandler(ctrl.getById));
router.get('/', verifyTokenAndAdmin, asyncHandler(ctrl.list));

module.exports = router;
