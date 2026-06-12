const express = require('express');
const router = express.Router();
const {
  placeOrder,
  getAllOrders,
  getOrder,
  updateOrderStatus,
  getDashboardStats,
} = require('../controllers/orderController');
const protect = require('../middleware/auth');

router.post('/', placeOrder);
router.get('/stats', protect, getDashboardStats);
router.get('/', protect, getAllOrders);
router.get('/:id', getOrder);
router.put('/:id/status', protect, updateOrderStatus);

module.exports = router;
