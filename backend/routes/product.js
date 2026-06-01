const router = require('express').Router();
const { verifyTokenAndAdmin } = require('../middleware/tokenVerify');
const asyncHandler = require('../util/asyncHandler');
const ctrl = require('../controllers/productController');
const uploadCtrl = require('../controllers/uploadController');

// Presigned S3 upload URL for product images (admin only).
router.post('/upload-url', verifyTokenAndAdmin, asyncHandler(uploadCtrl.createUploadUrl));

router.post('/', verifyTokenAndAdmin, asyncHandler(ctrl.create));
router.put('/:id', verifyTokenAndAdmin, asyncHandler(ctrl.update));
router.delete('/:id', verifyTokenAndAdmin, asyncHandler(ctrl.remove));
router.get('/find/:id', asyncHandler(ctrl.getById));
router.get('/', asyncHandler(ctrl.list));

module.exports = router;
