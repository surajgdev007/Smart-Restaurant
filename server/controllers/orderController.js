const Order = require('../models/Order');

// Place a new order (Customer)
// POST /api/orders
// Public
exports.placeOrder = async (req, res) => {
  try {
    const { tableNumber, items, specialInstructions, customerName } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ success: false, message: 'Order must have at least one item' });
    }

    // Calculate totals
    const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const tax = parseFloat((subtotal * 0.05).toFixed(2));           // 5% tax
    const serviceCharge = parseFloat((subtotal * 0.02).toFixed(2)); // 2% service charge
    const grandTotal = parseFloat((subtotal + tax + serviceCharge).toFixed(2));

    const order = await Order.create({
      tableNumber,
      items,
      subtotal,
      tax,
      serviceCharge,
      grandTotal,
      specialInstructions,
      customerName: customerName || 'Guest',
    });

    // Emit socket event to admin room only
    const io = req.app.get('io');
    if (io) io.to('admin_room').emit('new_order', order);

    res.status(201).json({ success: true, data: order });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get all orders (Admin)
// GET /api/orders
// Private (Admin)
exports.getAllOrders = async (req, res) => {
  try {
    const filter = {};
    if (req.query.status) filter.orderStatus = req.query.status;
    if (req.query.tableNumber) filter.tableNumber = Number(req.query.tableNumber);
    if (req.query.date) {
      const startDate = new Date(req.query.date);
      const endDate = new Date(req.query.date);
      endDate.setDate(endDate.getDate() + 1);
      filter.createdAt = { $gte: startDate, $lt: endDate };
    }

    const orders = await Order.find(filter)
      .populate('items.menuItem', 'name image')
      .sort({ createdAt: -1 });

    res.json({ success: true, data: orders, count: orders.length });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get single order
// GET /api/orders/:id
// Public
exports.getOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate('items.menuItem', 'name image price');
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
    res.json({ success: true, data: order });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update order status (Admin)
// PUT /api/orders/:id/status
// Private (Admin)
exports.updateOrderStatus = async (req, res) => {
  try {
    const { orderStatus } = req.body;
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { orderStatus },
      { new: true, runValidators: true }
    );
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });

    // Emit socket event to the specific order's room
    const io = req.app.get('io');
    if (io) {
      io.to(`order_${order._id}`).emit('order_status_update', {
        orderId: order._id,
        orderStatus: order.orderStatus,
      });
    }

    res.json({ success: true, data: order });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get dashboard stats (Admin)
// GET /api/orders/stats
// Private (Admin)
exports.getDashboardStats = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const [totalOrders, todayOrders, activeOrders, revenueData, recentOrders] = await Promise.all([
      Order.countDocuments({ paymentStatus: 'paid' }),
      Order.countDocuments({ createdAt: { $gte: today, $lt: tomorrow } }),
      Order.countDocuments({ orderStatus: { $in: ['accepted', 'preparing', 'ready'] } }),
      Order.aggregate([
        { $match: { paymentStatus: 'paid' } },
        { $group: { _id: null, total: { $sum: '$grandTotal' } } },
      ]),
      Order.find().sort({ createdAt: -1 }).limit(10).populate('items.menuItem', 'name'),
    ]);

    // Last 7 days revenue
    const last7Days = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      date.setHours(0, 0, 0, 0);
      const nextDay = new Date(date);
      nextDay.setDate(nextDay.getDate() + 1);

      const dayRevenue = await Order.aggregate([
        { $match: { createdAt: { $gte: date, $lt: nextDay }, paymentStatus: 'paid' } },
        { $group: { _id: null, total: { $sum: '$grandTotal' } } },
      ]);

      last7Days.push({
        date: date.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric' }),
        revenue: dayRevenue[0]?.total || 0,
      });
    }

    res.json({
      success: true,
      data: {
        totalOrders,
        todayOrders,
        activeOrders,
        totalRevenue: revenueData[0]?.total || 0,
        recentOrders,
        last7Days,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
