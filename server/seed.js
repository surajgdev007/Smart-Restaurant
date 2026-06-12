require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const User = require('./models/User');
const Category = require('./models/Category');
const MenuItem = require('./models/MenuItem');
const Table = require('./models/Table');
const QRCode = require('qrcode');

const connectDB = require('./config/db');

const categories = [
  { name: 'Starters', description: 'Delicious appetizers to begin your meal', sortOrder: 1 },
  { name: 'Soups', description: 'Hot and comforting soups', sortOrder: 2 },
  { name: 'Main Course', description: 'Hearty main dishes', sortOrder: 3 },
  { name: 'Pizza', description: 'Wood-fired pizzas with fresh toppings', sortOrder: 4 },
  { name: 'Burger', description: 'Juicy gourmet burgers', sortOrder: 5 },
  { name: 'Pasta', description: 'Italian pasta dishes', sortOrder: 6 },
  { name: 'Chinese', description: 'Authentic Chinese cuisine', sortOrder: 7 },
  { name: 'South Indian', description: 'Traditional South Indian dishes', sortOrder: 8 },
  { name: 'Desserts', description: 'Sweet endings to your meal', sortOrder: 9 },
  { name: 'Beverages', description: 'Refreshing drinks and juices', sortOrder: 10 },
  { name: 'Combos', description: 'Value combo meals', sortOrder: 11 },
];

const seed = async () => {
  try {
    await connectDB();
    console.log('🌱 Starting database seeding...');

    // Clear existing data
    await Promise.all([
      User.deleteMany({}),
      Category.deleteMany({}),
      MenuItem.deleteMany({}),
      Table.deleteMany({}),
    ]);
    console.log('🗑️  Cleared existing data');

    // Create admin user
    const admin = await User.create({
      name: 'Admin',
      email: 'admin@restaurant.com',
      password: 'admin123',
      role: 'admin',
    });
    console.log(`✅ Admin created: ${admin.email} / admin123`);

    // Create categories
    const createdCategories = await Category.insertMany(categories);
    console.log(`✅ ${createdCategories.length} categories created`);

    // Map category names to IDs
    const catMap = {};
    createdCategories.forEach(c => { catMap[c.name] = c._id; });

    // Create menu items
    const menuItems = [
      // Starters
      { name: 'Paneer Tikka', description: 'Marinated cottage cheese grilled in tandoor', price: 280, category: catMap['Starters'], isVeg: true, isPopular: true, isBestSeller: true, rating: 4.5, totalRatings: 120, prepTime: 15, spiceLevel: 'medium' },
      { name: 'Chicken Wings', description: 'Crispy buffalo chicken wings with dipping sauce', price: 320, category: catMap['Starters'], isVeg: false, isPopular: true, rating: 4.3, totalRatings: 95, prepTime: 20, spiceLevel: 'hot' },
      { name: 'Veg Spring Rolls', description: 'Crispy rolls stuffed with fresh vegetables', price: 180, category: catMap['Starters'], isVeg: true, rating: 4.1, totalRatings: 67, prepTime: 12 },
      { name: 'Onion Rings', description: 'Golden crispy onion rings with ranch dip', price: 150, category: catMap['Starters'], isVeg: true, rating: 4.0, totalRatings: 54 },

      // Soups
      { name: 'Tomato Basil Soup', description: 'Creamy roasted tomato soup with fresh basil', price: 160, category: catMap['Soups'], isVeg: true, isPopular: true, rating: 4.4, totalRatings: 88, prepTime: 10 },
      { name: 'Chicken Sweet Corn', description: 'Classic chicken sweet corn soup', price: 180, category: catMap['Soups'], isVeg: false, rating: 4.2, totalRatings: 76, prepTime: 10 },
      { name: 'Hot & Sour Soup', description: 'Spicy and tangy vegetable soup', price: 170, category: catMap['Soups'], isVeg: true, rating: 4.0, totalRatings: 45, spiceLevel: 'hot' },

      // Main Course
      { name: 'Butter Chicken', description: 'Tender chicken in rich buttery tomato gravy', price: 380, category: catMap['Main Course'], isVeg: false, isPopular: true, isBestSeller: true, rating: 4.8, totalRatings: 230, prepTime: 25, spiceLevel: 'medium' },
      { name: 'Paneer Butter Masala', description: 'Cottage cheese in creamy tomato-cashew gravy', price: 320, category: catMap['Main Course'], isVeg: true, isBestSeller: true, rating: 4.6, totalRatings: 180, prepTime: 20 },
      { name: 'Dal Makhani', description: 'Slow-cooked black lentils with butter and cream', price: 260, category: catMap['Main Course'], isVeg: true, rating: 4.5, totalRatings: 155, prepTime: 30 },
      { name: 'Chicken Biryani', description: 'Aromatic basmati rice cooked with spiced chicken', price: 420, category: catMap['Main Course'], isVeg: false, isPopular: true, rating: 4.7, totalRatings: 210, prepTime: 35, spiceLevel: 'medium' },

      // Pizza
      { name: 'Margherita Pizza', description: 'Classic pizza with tomato sauce, fresh mozzarella & basil', price: 280, category: catMap['Pizza'], isVeg: true, isPopular: true, rating: 4.4, totalRatings: 140, prepTime: 20 },
      { name: 'BBQ Chicken Pizza', description: 'Smoky BBQ sauce, chicken, peppers, onions', price: 360, category: catMap['Pizza'], isVeg: false, isBestSeller: true, rating: 4.6, totalRatings: 165, prepTime: 22 },
      { name: 'Veggie Supreme', description: 'Loaded with fresh garden vegetables', price: 300, category: catMap['Pizza'], isVeg: true, rating: 4.2, totalRatings: 98, prepTime: 20 },

      // Burger
      { name: 'Classic Beef Burger', description: 'Juicy beef patty with lettuce, tomato, cheese', price: 280, category: catMap['Burger'], isVeg: false, isBestSeller: true, rating: 4.5, totalRatings: 175, prepTime: 15 },
      { name: 'Veggie Burger', description: 'Crispy veggie patty with fresh veggies', price: 220, category: catMap['Burger'], isVeg: true, isPopular: true, rating: 4.1, totalRatings: 88, prepTime: 12 },
      { name: 'Chicken Zinger', description: 'Crispy fried chicken fillet with spicy sauce', price: 260, category: catMap['Burger'], isVeg: false, rating: 4.4, totalRatings: 132, prepTime: 15, spiceLevel: 'hot' },

      // Pasta
      { name: 'Pasta Arrabiata', description: 'Spicy tomato sauce with garlic and herbs', price: 240, category: catMap['Pasta'], isVeg: true, rating: 4.2, totalRatings: 78, spiceLevel: 'medium' },
      { name: 'Chicken Alfredo', description: 'Creamy white sauce pasta with grilled chicken', price: 320, category: catMap['Pasta'], isVeg: false, isPopular: true, rating: 4.5, totalRatings: 112, prepTime: 20 },

      // Chinese
      { name: 'Veg Fried Rice', description: 'Wok-tossed rice with fresh vegetables', price: 220, category: catMap['Chinese'], isVeg: true, isPopular: true, rating: 4.3, totalRatings: 145 },
      { name: 'Chicken Manchurian', description: 'Crispy chicken in tangy Manchurian sauce', price: 280, category: catMap['Chinese'], isVeg: false, isBestSeller: true, rating: 4.5, totalRatings: 168, spiceLevel: 'hot' },
      { name: 'Veg Hakka Noodles', description: 'Stir-fried noodles with vegetables', price: 200, category: catMap['Chinese'], isVeg: true, rating: 4.1, totalRatings: 95 },

      // South Indian
      { name: 'Masala Dosa', description: 'Crispy dosa filled with spiced potato filling', price: 160, category: catMap['South Indian'], isVeg: true, isBestSeller: true, rating: 4.6, totalRatings: 200, prepTime: 15 },
      { name: 'Idli Sambar', description: 'Steamed rice cakes with sambar and chutneys', price: 120, category: catMap['South Indian'], isVeg: true, rating: 4.4, totalRatings: 135, prepTime: 10 },
      { name: 'Medu Vada', description: 'Crispy lentil donuts with sambar', price: 140, category: catMap['South Indian'], isVeg: true, rating: 4.2, totalRatings: 98, prepTime: 12 },

      // Desserts
      { name: 'Chocolate Brownie', description: 'Warm chocolate brownie with vanilla ice cream', price: 180, category: catMap['Desserts'], isVeg: true, isPopular: true, rating: 4.7, totalRatings: 220, prepTime: 5 },
      { name: 'Gulab Jamun', description: 'Soft milk solid dumplings in rose sugar syrup', price: 120, category: catMap['Desserts'], isVeg: true, rating: 4.5, totalRatings: 178, prepTime: 5 },
      { name: 'Ice Cream (2 Scoops)', description: 'Choice of vanilla, chocolate, or strawberry', price: 140, category: catMap['Desserts'], isVeg: true, rating: 4.3, totalRatings: 142 },

      // Beverages
      { name: 'Fresh Lime Soda', description: 'Refreshing lime with soda water', price: 80, category: catMap['Beverages'], isVeg: true, isPopular: true, rating: 4.2, totalRatings: 98, prepTime: 3 },
      { name: 'Mango Lassi', description: 'Thick and sweet mango yogurt drink', price: 120, category: catMap['Beverages'], isVeg: true, rating: 4.6, totalRatings: 165, prepTime: 3 },
      { name: 'Cold Coffee', description: 'Creamy blended coffee with ice cream', price: 150, category: catMap['Beverages'], isVeg: true, rating: 4.4, totalRatings: 130, prepTime: 5 },

      // Combos
      { name: 'Family Combo', description: '2 Main Course + 4 Rotis + 2 Rice + 2 Desserts', price: 999, category: catMap['Combos'], isVeg: true, isBestSeller: true, rating: 4.5, totalRatings: 88, prepTime: 30 },
      { name: 'Couple Combo', description: '1 Starter + 2 Main Course + 2 Beverages + 1 Dessert', price: 799, category: catMap['Combos'], isVeg: false, isPopular: true, rating: 4.4, totalRatings: 65, prepTime: 25 },
    ];

    await MenuItem.insertMany(menuItems);
    console.log(`✅ ${menuItems.length} menu items created`);

    // Create 10 tables with QR codes
    const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
    for (let i = 1; i <= 10; i++) {
      const qrUrl = `${clientUrl}/menu?table=${i}`;
      const qrCode = await QRCode.toDataURL(qrUrl, {
        width: 300, margin: 2,
        color: { dark: '#1a1a2e', light: '#ffffff' },
      });
      await Table.create({ tableNumber: i, capacity: i <= 5 ? 2 : 4, qrCode, qrUrl });
    }
    console.log('✅ 10 tables created with QR codes');

    console.log('\n🎉 Database seeding completed!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('👤 Admin Login:');
    console.log('   Email   : admin@restaurant.com');
    console.log('   Password: admin123');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed:', error.message);
    process.exit(1);
  }
};

seed();
