const MenuItem = require('../models/MenuItem');
const path = require('path');
const fs = require('fs');

// Get all menu items (public)
// GET /api/menu
// Public
exports.getMenuItems = async (req, res) => {
  try {
    const filter = { isAvailable: true };
    if (req.query.category) filter.category = req.query.category;
    if (req.query.search) {
      filter.name = { $regex: req.query.search, $options: 'i' };
    }

    const items = await MenuItem.find(filter)
      .populate('category', 'name')
      .sort({ isBestSeller: -1, isPopular: -1, name: 1 });

    res.json({ success: true, data: items });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get all menu items (admin - includes unavailable)
// GET /api/menu/all
// Private (Admin)
exports.getAllMenuItems = async (req, res) => {
  try {
    const filter = {};
    if (req.query.category) filter.category = req.query.category;

    const items = await MenuItem.find(filter)
      .populate('category', 'name')
      .sort({ createdAt: -1 });

    res.json({ success: true, data: items });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get single menu item
// GET /api/menu/:id
// Public
exports.getMenuItem = async (req, res) => {
  try {
    const item = await MenuItem.findById(req.params.id).populate('category', 'name');
    if (!item) return res.status(404).json({ success: false, message: 'Menu item not found' });
    res.json({ success: true, data: item });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Helper: convert FormData string booleans to real booleans
const parseBooleans = (data) => {
  const boolFields = ['isVeg', 'isAvailable', 'isPopular', 'isBestSeller'];
  boolFields.forEach(field => {
    if (field in data) {
      data[field] = data[field] === 'true' || data[field] === true;
    }
  });
  return data;
};

// Create menu item
// POST /api/menu
// Private (Admin)
exports.createMenuItem = async (req, res) => {
  try {
    const itemData = parseBooleans({ ...req.body });
    if (req.file) {
      itemData.image = `/uploads/${req.file.filename}`;
    }
    const item = await MenuItem.create(itemData);
    const populated = await MenuItem.findById(item._id).populate('category', 'name');
    res.status(201).json({ success: true, data: populated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update menu item
// PUT /api/menu/:id
// Private (Admin)
exports.updateMenuItem = async (req, res) => {
  try {
    const updateData = parseBooleans({ ...req.body });
    if (req.file) {
      updateData.image = `/uploads/${req.file.filename}`;
    }

    const item = await MenuItem.findByIdAndUpdate(req.params.id, updateData, {
      new: true, runValidators: true,
    }).populate('category', 'name');

    if (!item) return res.status(404).json({ success: false, message: 'Menu item not found' });
    res.json({ success: true, data: item });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Delete menu item
// DELETE /api/menu/:id
// Private (Admin)
exports.deleteMenuItem = async (req, res) => {
  try {
    const item = await MenuItem.findByIdAndDelete(req.params.id);
    if (!item) return res.status(404).json({ success: false, message: 'Menu item not found' });

    // Remove image file if exists
    if (item.image && item.image.startsWith('/uploads/')) {
      const filePath = path.join(__dirname, '..', item.image);
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    }

    res.json({ success: true, message: 'Menu item deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
