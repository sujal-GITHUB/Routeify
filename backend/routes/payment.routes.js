const express = require('express')
const authMiddleware = require('../middlewares/auth.middleware');
const router = express.Router();
const paymentController = require('../controllers/payment.controller')

router.post('/create-order',
    authMiddleware.authUser,
    paymentController.generateOrder
)

router.post('/verify-payment',
    authMiddleware.authUser,
    paymentController.verifyPayment
);

module.exports = router
