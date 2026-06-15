const Table = require('../models/Table');
const QRCode = require('qrcode');

// Helper: generate QR for a table
const generateQR = async (tableNumber, clientUrl) => {
  const qrUrl = `${clientUrl || 'http://localhost:5173'}/menu?table=${tableNumber}`;
  const qrCode = await QRCode.toDataURL(qrUrl, {
    width: 300,
    margin: 2,
    color: { dark: '#1a1a2e', light: '#ffffff' },
  });
  return { qrCode, qrUrl };
};

// Get all tables
// GET /api/tables
// Public
exports.getTables = async (req, res) => {
  try {
    const tables = await Table.find({ isActive: true }).sort({ tableNumber: 1 });
    res.json({ success: true, data: tables });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get single table by number
// GET /api/tables/:number
// Public
exports.getTableByNumber = async (req, res) => {
  try {
    const table = await Table.findOne({ tableNumber: req.params.number, isActive: true });
    if (!table) return res.status(404).json({ success: false, message: 'Table not found' });
    res.json({ success: true, data: table });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Create table and generate QR
// POST /api/tables
// Private (Admin)
exports.createTable = async (req, res) => {
  try {
    const { tableNumber, capacity } = req.body;

    const existing = await Table.findOne({ tableNumber });
    if (existing) {
      return res.status(400).json({ success: false, message: `Table ${tableNumber} already exists` });
    }

    const { qrCode, qrUrl } = await generateQR(tableNumber, process.env.CLIENT_URL);
    const table = await Table.create({ tableNumber, capacity, qrCode, qrUrl });

    res.status(201).json({ success: true, data: table });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update table
// PUT /api/tables/:id
// Private (Admin)
exports.updateTable = async (req, res) => {
  try {
    const table = await Table.findByIdAndUpdate(req.params.id, req.body, {
      new: true, runValidators: true,
    });
    if (!table) return res.status(404).json({ success: false, message: 'Table not found' });
    res.json({ success: true, data: table });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Delete table
// DELETE /api/tables/:id
// Private (Admin)
exports.deleteTable = async (req, res) => {
  try {
    const table = await Table.findByIdAndDelete(req.params.id);
    if (!table) return res.status(404).json({ success: false, message: 'Table not found' });
    res.json({ success: true, message: 'Table deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Regenerate QR for a table
// POST /api/tables/:id/regenerate-qr
// Private (Admin)
exports.regenerateQR = async (req, res) => {
  try {
    const table = await Table.findById(req.params.id);
    if (!table) return res.status(404).json({ success: false, message: 'Table not found' });

    const { qrCode, qrUrl } = await generateQR(table.tableNumber, process.env.CLIENT_URL);
    table.qrCode = qrCode;
    table.qrUrl = qrUrl;
    await table.save();

    res.json({ success: true, data: table, message: 'QR Code regenerated successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
