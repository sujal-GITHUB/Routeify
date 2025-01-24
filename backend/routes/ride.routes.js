const express = require('express');
const router = express.Router();
const {body} = require('express-validator');

router.post('/create',
    body('userId').isString().isLength({min:24, max:24}).withMessage('Invalid user id'),
    body('pickup').isString().isLength({min: 3}).notEmpty().withMessage('Invalid pickup location'),
    body('destination').isString().isLength({min: 3}).notEmpty().withMessage('Invalid destination location'),
);

module.exports = router;