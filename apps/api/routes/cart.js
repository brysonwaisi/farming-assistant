const router = require('express').Router();
const {
  verifyToken,
  verifyTokenAndAdmin,
  checkOwnership,
} = require('../middleware/tokenVerify');
const asyncHandler = require('../util/asyncHandler');
const ctrl = require('../controllers/cartController');

router.post('/', verifyToken, asyncHandler(ctrl.create));
router.put('/find/:userId', verifyToken, checkOwnership, asyncHandler(ctrl.upsertByUser));
// :id is a cart document id — ownership is verified inside the controller/service.
router.put('/:id', verifyToken, asyncHandler(ctrl.updateById));
router.delete('/:id', verifyToken, asyncHandler(ctrl.removeById));
router.get('/find/:userId', verifyToken, checkOwnership, asyncHandler(ctrl.getByUser));
router.get('/', verifyTokenAndAdmin, asyncHandler(ctrl.getAll));

module.exports = router;
