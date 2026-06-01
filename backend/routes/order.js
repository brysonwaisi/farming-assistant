const router = require('express').Router();
const {
  verifyToken,
  verifyTokenAndAdmin,
  checkOwnership,
} = require('../middleware/tokenVerify');
const asyncHandler = require('../util/asyncHandler');
const ctrl = require('../controllers/orderController');

router.post('/', verifyToken, asyncHandler(ctrl.create));
router.put('/:id', verifyTokenAndAdmin, asyncHandler(ctrl.updateById));
router.delete('/:id', verifyTokenAndAdmin, asyncHandler(ctrl.removeById));
router.get('/income', verifyTokenAndAdmin, asyncHandler(ctrl.income));
router.get('/find/:userId', verifyToken, checkOwnership, asyncHandler(ctrl.getByUser));
router.get('/', verifyTokenAndAdmin, asyncHandler(ctrl.getAll));

module.exports = router;
