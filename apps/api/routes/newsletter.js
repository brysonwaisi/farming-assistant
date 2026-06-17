const router = require('express').Router();
const { body } = require('express-validator');
const validate = require('../middleware/validate');
const asyncHandler = require('../util/asyncHandler');
const ctrl = require('../controllers/newsletterController');

const rules = [body('email').trim().isEmail().withMessage('A valid email is required')];

router.post('/', rules, validate, asyncHandler(ctrl.subscribe));

module.exports = router;
