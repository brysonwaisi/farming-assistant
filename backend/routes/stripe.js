const router = require('express').Router();
const { verifyToken } = require('../middleware/tokenVerify');
const asyncHandler = require('../util/asyncHandler');
const ctrl = require('../controllers/stripeController');

router.post('/create-embedded-session', verifyToken, asyncHandler(ctrl.createEmbeddedSession));
router.post('/create-checkout-session', verifyToken, asyncHandler(ctrl.createCheckoutSession));
router.get('/session/:id', verifyToken, asyncHandler(ctrl.getSession));

module.exports = router;
