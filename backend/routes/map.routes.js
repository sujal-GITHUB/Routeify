const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/auth.middleware');
const { 
    getCoordinates, 
    getDistanceTime, 
    getDistanceTimeFromCoords,
    getSuggestions, 
    getFeatureDetails,
    calculateETA, 
    reverseGeocode, 
    getRoute,
    getIsoline 
} = require('../controllers/map.controller');
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
    .isLength({ min: 2 })
    .withMessage('Address must be at least 2 characters long');

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

router.get('/get-distance-time-from-coords',
    authMiddleware.authUser,
    getDistanceTimeFromCoords
)

router.get('/get-suggestions',
    validateAddress,
    validateRequest,
    authMiddleware.authUser,
    getSuggestions
)

// Search Box API - Get feature details
router.get('/get-feature-details',
    authMiddleware.authUser,
    getFeatureDetails
)

router.get('/calculate-ETA',
    validateRequest,
    authMiddleware.authUser,
    calculateETA
);

// Reverse geocoding endpoint
router.get('/reverse-geocode',
    authMiddleware.authUser,
    reverseGeocode
);

// Route endpoint
router.get('/get-route',
    authMiddleware.authUser,
    getRoute
);

// Isoline endpoint
router.get('/isoline',
    authMiddleware.authUser,
    getIsoline
);

module.exports = router;