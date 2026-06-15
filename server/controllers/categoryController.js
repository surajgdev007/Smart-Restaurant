const Category = require('../models/Category');

// Get all categories
// GET /api/categories
// Public
exports.getCategories = async (req, res) => {
  try {
    const categories = await Category.find({ isActive: true }).sort({ sortOrder: 1, name: 1 });
    res.json({ success: true, data: categories });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get all categories including inactive (admin)
// GET /api/categories/all
// Private
exports.getAllCategories = async (req, res) => {
  try {
    const categories = await Category.find().sort({ sortOrder: 1, name: 1 });
    res.json({ success: true, data: categories });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @Create category
// @POST /api/categories
// @Private (Admin)
exports.createCategory = async (req, res) => {
  try {
    const { name, description, sortOrder } = req.body;
    const category = await Category.create({ name, description, sortOrder });
    res.status(201).json({ success: true, data: category });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ success: false, message: 'Category with this name already exists' });
    }
    res.status(500).json({ success: false, message: error.message });
  }
};

// @Update category
// @PUT /api/categories/:id
// @Private (Admin)
exports.updateCategory = async (req, res) => {
  try {
    const category = await Category.findByIdAndUpdate(req.params.id, req.body, {
      new: true, runValidators: true,
    });
    if (!category) return res.status(404).json({ success: false, message: 'Category not found' });
    res.json({ success: true, data: category });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

//  Delete category
//  DELETE /api/categories/:id
//  Private (Admin)
exports.deleteCategory = async (req, res) => {
  try {
    const category = await Category.findByIdAndDelete(req.params.id);
    if (!category) return res.status(404).json({ success: false, message: 'Category not found' });
    res.json({ success: true, message: 'Category deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
