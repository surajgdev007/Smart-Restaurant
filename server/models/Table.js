const mongoose = require('mongoose');

const tableSchema = new mongoose.Schema({
  tableNumber: { type: Number, required: true, unique: true },
  capacity: { type: Number, default: 4 },
  qrCode: { type: String, default: '' }, // Base64 QR image
  qrUrl: { type: String, default: '' },  // URL encoded in QR
  isOccupied: { type: Boolean, default: false },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

module.exports = mongoose.model('Table', tableSchema);
