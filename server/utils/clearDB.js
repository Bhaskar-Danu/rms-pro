/**
 * Clear Database — wipes ALL demo/sample data from MongoDB.
 * Preserves the Users collection (login accounts remain).
 * Run with: node server/utils/clearDB.js
 */
require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });
const mongoose = require('mongoose');

const User        = require('../models/User');
const MenuItem    = require('../models/MenuItem');
const Staff       = require('../models/Staff');
const Inventory   = require('../models/Inventory');
const Order       = require('../models/Order');
const Payment     = require('../models/Payment');
const Reservation = require('../models/Reservation');
const Feedback    = require('../models/Feedback');
const Expense     = require('../models/Expense');
const ActivityLog = require('../models/ActivityLog');

async function clearDB() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('✅ Connected to MongoDB');

  const results = await Promise.all([
    MenuItem.deleteMany({}),
    Staff.deleteMany({}),
    Inventory.deleteMany({}),
    Order.deleteMany({}),
    Payment.deleteMany({}),
    Reservation.deleteMany({}),
    Feedback.deleteMany({}),
    Expense.deleteMany({}),
    ActivityLog.deleteMany({}),
    // Preserve users — do NOT delete users so login still works
  ]);

  console.log('🗑  All demo data cleared:');
  console.log(`   Menu Items:   ${results[0].deletedCount}`);
  console.log(`   Staff:        ${results[1].deletedCount}`);
  console.log(`   Inventory:    ${results[2].deletedCount}`);
  console.log(`   Orders:       ${results[3].deletedCount}`);
  console.log(`   Payments:     ${results[4].deletedCount}`);
  console.log(`   Reservations: ${results[5].deletedCount}`);
  console.log(`   Feedback:     ${results[6].deletedCount}`);
  console.log(`   Expenses:     ${results[7].deletedCount}`);
  console.log(`   Activity Logs:${results[8].deletedCount}`);
  console.log('\n✅ Database cleared! Users are preserved.\n');

  process.exit(0);
}

clearDB().catch(err => {
  console.error('❌ Clear failed:', err.message);
  process.exit(1);
});
