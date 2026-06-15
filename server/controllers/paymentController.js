const crypto = require('crypto');
const razorpay = require('../config/razorpay');
const Payment = require('../models/Payment');
const Order = require('../models/Order');

// Create Razorpay order
// POST /api/payments/create-order
// Public
exports.createRazorpayOrder = async (req, res) => {
  try {
    const { orderId, amount } = req.body;

    const options = {
      amount: Math.round(amount * 100), // amount in paise
      currency: 'INR',
      receipt: `receipt_${orderId}_${Date.now()}`,
      notes: { orderId },
    };

    const razorpayOrder = await razorpay.orders.create(options);

    // Save payment record
    await Payment.create({
      orderId,
      amount,
      razorpayOrderId: razorpayOrder.id,
      status: 'pending',
    });

    // Update order with razorpayOrderId
    await Order.findByIdAndUpdate(orderId, { razorpayOrderId: razorpayOrder.id });

    res.json({
      success: true,
      data: {
        razorpayOrderId: razorpayOrder.id,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
        keyId: process.env.RAZORPAY_KEY_ID,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Verify Razorpay payment signature
// POST /api/payments/verify
// Public
exports.verifyPayment = async (req, res) => {
  try {
    const { razorpayOrderId, razorpayPaymentId, razorpaySignature, orderId } = req.body;

    // Verify signature
    const body = razorpayOrderId + '|' + razorpayPaymentId;
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(body.toString())
      .digest('hex');

    if (expectedSignature !== razorpaySignature) {
      return res.status(400).json({ success: false, message: 'Invalid payment signature' });
    }

    // Update payment record
    await Payment.findOneAndUpdate(
      { razorpayOrderId },
      { razorpayPaymentId, razorpaySignature, status: 'success' }
    );

    // Update order payment status and emit socket
    const order = await Order.findByIdAndUpdate(
      orderId,
      { paymentStatus: 'paid', orderStatus: 'accepted', paymentId: razorpayPaymentId },
      { new: true }
    );

    const io = req.app.get('io');
    if (io) io.to('admin_room').emit('new_order', order);

    res.json({ success: true, message: 'Payment verified successfully', data: order });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get payment by order ID
// GET /api/payments/:orderId
// Public
exports.getPayment = async (req, res) => {
  try {
    const payment = await Payment.findOne({ orderId: req.params.orderId });
    if (!payment) return res.status(404).json({ success: false, message: 'Payment not found' });
    res.json({ success: true, data: payment });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
