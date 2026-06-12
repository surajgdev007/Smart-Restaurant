const express = require('express');
const router = express.Router();
const { createRazorpayOrder, verifyPayment, getPayment } = require('../controllers/paymentController');

router.post('/create-order', createRazorpayOrder);
router.post('/verify', verifyPayment);
router.get('/:orderId', getPayment);

module.exports = router;
