const mongoose = require('mongoose');

const menuItemSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  description: { type: String, default: '' },
  price: { type: Number, required: true, min: 0 },
  image: { type: String, default: '' },
  category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
  isAvailable: { type: Boolean, default: true },
  isPopular: { type: Boolean, default: false },
  isBestSeller: { type: Boolean, default: false },
  isVeg: { type: Boolean, default: true },
  rating: { type: Number, default: 0, min: 0, max: 5 },
  totalRatings: { type: Number, default: 0 },
  prepTime: { type: Number, default: 15 }, // minutes
  spiceLevel: { type: String, enum: ['mild', 'medium', 'hot', 'extra-hot'], default: 'mild' },
}, { timestamps: true });

module.exports = mongoose.model('MenuItem', menuItemSchema);
