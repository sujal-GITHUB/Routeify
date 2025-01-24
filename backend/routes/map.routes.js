const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/auth.middleware');
const { getCoordinates } = require('../controllers/map.controller');
const { getDistanceTime } = require('../controllers/map.controller');
const { getSuggestions } = require('../controllers/map.controller');
const { query, validationResult } = require('express-validator');

// Validation middleware
const validateRequest = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    next();
};

// Address validation
const validateAddress = query('address')
    .notEmpty()
    .withMessage('Address is required')
    .isString()
    .isLength({ min: 3 })
    .withMessage('Address must be at least 3 characters long');

// Define route with middleware chain as separate arguments
router.get('/get-coordinates', 
    validateAddress,
    validateRequest,
    authMiddleware.authUser,
    getCoordinates
);

router.get('/get-distance-time',
    validateRequest,
    authMiddleware.authUser,
    getDistanceTime
)

router.get('/get-suggestions',
    validateAddress,
    validateRequest,
    authMiddleware.authUser,
    getSuggestions
)

module.exports = router;