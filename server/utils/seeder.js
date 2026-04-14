/**
 * Database Seeder — populates MongoDB with sample data.
 * Run with: npm run seed
 * WARNING: This will clear existing data!
 */
require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const User = require('../models/User');
const MenuItem = require('../models/MenuItem');
const Staff = require('../models/Staff');
const Inventory = require('../models/Inventory');
const Order = require('../models/Order');

async function seed() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('✅ Connected to MongoDB');

  // Clear existing data
  await Promise.all([
    User.deleteMany(), MenuItem.deleteMany(), Staff.deleteMany(),
    Inventory.deleteMany(), Order.deleteMany(),
  ]);
  console.log('🗑  Cleared existing data');

  // Create admin user
  const admin = await User.create({
    username: 'admin',
    email: 'admin@rms.com',
    password: 'admin123',
    restaurant_name: 'Spice Garden',
    role: 'admin',
  });
  console.log('👤 Admin created — email: admin@rms.com | password: admin123');

  // Menu Items
  const menuItems = await MenuItem.insertMany([
    { name: 'Butter Naan',           category: 'Breads',      price: 50,  description: 'Fresh baked naan with butter' },
    { name: 'Paneer Butter Masala',  category: 'Main Course', price: 220, description: 'Cottage cheese in rich tomato gravy' },
    { name: 'Chicken Biryani',       category: 'Main Course', price: 280, description: 'Fragrant basmati rice with spiced chicken' },
    { name: 'Dal Makhani',           category: 'Dals',        price: 180, description: 'Creamy black lentils slow cooked' },
    { name: 'Veg Fried Rice',        category: 'Chinese',     price: 150, description: 'Wok-tossed rice with vegetables' },
    { name: 'Gulab Jamun',           category: 'Desserts',    price: 60,  description: 'Sweet milk dumplings in syrup' },
    { name: 'Masala Chai',           category: 'Beverages',   price: 30,  description: 'Spiced Indian tea' },
    { name: 'Lassi',                 category: 'Beverages',   price: 50,  description: 'Sweet yogurt drink' },
    { name: 'Garlic Naan',           category: 'Breads',      price: 60,  description: 'Garlic-infused fresh naan' },
    { name: 'Palak Paneer',          category: 'Main Course', price: 200, description: 'Spinach and cottage cheese curry' },
  ]);
  console.log(`🍽  Created ${menuItems.length} menu items`);

  // Staff
  await Staff.insertMany([
    { name: 'Rahul Sharma',  role: 'Manager',  phone: '9876543210', salary: 35000 },
    { name: 'Priya Singh',   role: 'Waiter',   phone: '9876543211', salary: 18000 },
    { name: 'Amit Kumar',    role: 'Chef',     phone: '9876543212', salary: 25000 },
    { name: 'Sneha Reddy',   role: 'Cashier',  phone: '9876543213', salary: 16000 },
    { name: 'Vikram Patel',  role: 'Waiter',   phone: '9876543214', salary: 18000 },
  ]);
  console.log('👥 Created 5 staff members');

  // Inventory
  await Inventory.insertMany([
    { name: 'Rice',        quantity: 50, unit: 'kg',  min_level: 10 },
    { name: 'Flour',       quantity: 25, unit: 'kg',  min_level: 5  },
    { name: 'Vegetables',  quantity: 8,  unit: 'kg',  min_level: 5  },  // Low stock intentionally
    { name: 'Paneer',      quantity: 15, unit: 'kg',  min_level: 3  },
    { name: 'Chicken',     quantity: 20, unit: 'kg',  min_level: 5  },
    { name: 'Oil',         quantity: 10, unit: 'ltr', min_level: 3  },
  ]);
  console.log('📦 Created 6 inventory items (1 low-stock alert)');

  // Sample orders
  const item0 = menuItems[0]; // Butter Naan
  const item2 = menuItems[2]; // Chicken Biryani
  const item1 = menuItems[1]; // Paneer Butter Masala

  await Order.insertMany([
    {
      items: [
        { menuItem: item2._id, name: item2.name, price: item2.price, quantity: 1 },
        { menuItem: item0._id, name: item0.name, price: item0.price, quantity: 2 },
      ],
      table_number: 1, customer_name: 'Arjun', total: 380, status: 'completed',
    },
    {
      items: [{ menuItem: item1._id, name: item1.name, price: item1.price, quantity: 1 }],
      table_number: 2, customer_name: 'Priya', total: 220, status: 'completed',
    },
    {
      items: [{ menuItem: item0._id, name: item0.name, price: item0.price, quantity: 3 }],
      table_number: 3, customer_name: 'Rahul', total: 150, status: 'pending',
    },
  ]);
  console.log('📋 Created 3 sample orders (2 completed, 1 pending)');

  console.log('\n✅ Seeding complete! You can now start the server.\n');
  process.exit(0);
}

seed().catch(err => {
  console.error('❌ Seeding failed:', err.message);
  process.exit(1);
});
