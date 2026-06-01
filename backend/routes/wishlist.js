const router = require('express').Router();
const { verifyToken, checkOwnership } = require('../middleware/tokenVerify');
const asyncHandler = require('../util/asyncHandler');
const ctrl = require('../controllers/wishlistController');

router.get('/find/:userId', verifyToken, checkOwnership, asyncHandler(ctrl.getByUser));
router.put('/find/:userId', verifyToken, checkOwnership, asyncHandler(ctrl.replace));
router.post('/:productId', verifyToken, asyncHandler(ctrl.add));
router.delete('/:productId', verifyToken, asyncHandler(ctrl.remove));

module.exports = router;
