const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  menuItem: { type: mongoose.Schema.Types.ObjectId, ref: 'MenuItem', required: true },
  name: { type: String, required: true },
  price: { type: Number, required: true },
  quantity: { type: Number, required: true, min: 1 },
  image: { type: String, default: '' },
});

const orderSchema = new mongoose.Schema({
  tableNumber: { type: Number, required: true },
  items: [orderItemSchema],
  subtotal: { type: Number, required: true },
  tax: { type: Number, default: 0 },       // 5% of subtotal
  serviceCharge: { type: Number, default: 0 }, // 2% of subtotal
  grandTotal: { type: Number, required: true },
  specialInstructions: { type: String, default: '' },
  customerName: { type: String, default: 'Guest' },
  orderStatus: {
    type: String,
    enum: ['pending', 'accepted', 'preparing', 'ready', 'delivered', 'cancelled'],
    default: 'pending',
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'failed', 'refunded'],
    default: 'pending',
  },
  paymentId: { type: String, default: '' },
  razorpayOrderId: { type: String, default: '' },
  estimatedTime: { type: Number, default: 20 }, // minutes
}, { timestamps: true });

module.exports = mongoose.model('Order', orderSchema);
