const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, 'rms.db');
let db;

function getDb() {
  if (!db) db = new Database(dbPath);
  return db;
}

function init() {
  const d = getDb();

  d.exec(`
    CREATE TABLE IF NOT EXISTS menu_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      category TEXT DEFAULT 'General',
      price REAL NOT NULL,
      description TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS staff (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      role TEXT DEFAULT 'Employee',
      phone TEXT,
      salary REAL DEFAULT 0,
      is_active INTEGER DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS inventory (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      quantity REAL NOT NULL,
      unit TEXT DEFAULT 'kg',
      min_level REAL DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS orders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      table_number INTEGER DEFAULT 0,
      customer_name TEXT,
      total REAL DEFAULT 0,
      status TEXT DEFAULT 'pending',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS order_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      order_id INTEGER,
      menu_id INTEGER,
      quantity INTEGER DEFAULT 1,
      price REAL,
      FOREIGN KEY (order_id) REFERENCES orders(id),
      FOREIGN KEY (menu_id) REFERENCES menu_items(id)
    );
  `);

  // Seed sample data if empty
  const menuCount = d.prepare('SELECT COUNT(*) as c FROM menu_items').get();
  if (menuCount.c === 0) {
    const seedMenu = d.prepare(
      'INSERT INTO menu_items (name, category, price, description) VALUES (?, ?, ?, ?)'
    );
    const sampleMenu = [
      ['Butter Naan', 'Breads', 50, 'Fresh baked naan with butter'],
      ['Paneer Butter Masala', 'Main Course', 220, 'Cottage cheese in rich tomato gravy'],
      ['Chicken Biryani', 'Main Course', 280, 'Fragrant basmati rice with spiced chicken'],
      ['Dal Makhani', 'Dals', 180, 'Creamy black lentils slow cooked'],
      ['Veg Fried Rice', 'Chinese', 150, 'Wok-tossed rice with vegetables'],
      ['Gulab Jamun', 'Desserts', 60, 'Sweet milk dumplings in syrup'],
      ['Masala Chai', 'Beverages', 30, 'Spiced Indian tea'],
      ['Lassi', 'Beverages', 50, 'Sweet yogurt drink'],
    ];
    sampleMenu.forEach(([n, c, p, d2]) => seedMenu.run(n, c, p, d2));
  }

  const staffCount = d.prepare('SELECT COUNT(*) as c FROM staff').get();
  if (staffCount.c === 0) {
    const seedStaff = d.prepare(
      'INSERT INTO staff (name, role, phone, salary) VALUES (?, ?, ?, ?)'
    );
    [
      ['Rahul Sharma', 'Manager', '9876543210', 35000],
      ['Priya Singh', 'Waiter', '9876543211', 18000],
      ['Amit Kumar', 'Chef', '9876543212', 25000],
      ['Sneha Reddy', 'Cashier', '9876543213', 16000],
      ['Vikram Patel', 'Waiter', '9876543214', 18000],
    ].forEach(([n, r, p, s]) => seedStaff.run(n, r, p, s));
  }

  const invCount = d.prepare('SELECT COUNT(*) as c FROM inventory').get();
  if (invCount.c === 0) {
    const seedInv = d.prepare(
      'INSERT INTO inventory (name, quantity, unit, min_level) VALUES (?, ?, ?, ?)'
    );
    [
      ['Rice', 50, 'kg', 10],
      ['Flour', 25, 'kg', 5],
      ['Vegetables', 30, 'kg', 5],
      ['Paneer', 15, 'kg', 3],
      ['Chicken', 20, 'kg', 5],
    ].forEach(([n, q, u, m]) => seedInv.run(n, q, u, m));
  }

  const orderCount = d.prepare('SELECT COUNT(*) as c FROM orders').get();
  if (orderCount.c === 0) {
    const insOrder = d.prepare(
      'INSERT INTO orders (table_number, customer_name, total, status) VALUES (?, ?, ?, ?)'
    );
    insOrder.run(1, 'John', 350, 'completed');
    insOrder.run(2, 'Guest', 180, 'completed');
    const oid = d.prepare('SELECT last_insert_rowid() as id').get().id;
    const insItem = d.prepare(
      'INSERT INTO order_items (order_id, menu_id, quantity, price) VALUES (?, ?, ?, ?)'
    );
    insItem.run(oid, 1, 2, 50);
    insItem.run(oid, 2, 1, 220);
  }
}

function getStats() {
  const d = getDb();
  const ordersToday = d.prepare(`
    SELECT COUNT(*) as c FROM orders 
    WHERE date(created_at) = date('now', 'localtime')
  `).get().c;
  const activeStaff = d.prepare(
    'SELECT COUNT(*) as c FROM staff WHERE is_active = 1'
  ).get().c;
  const dailyRevenue = d.prepare(`
    SELECT COALESCE(SUM(total), 0) as r FROM orders 
    WHERE date(created_at) = date('now', 'localtime') AND status = 'completed'
  `).get().r;
  const menuCount = d.prepare('SELECT COUNT(*) as c FROM menu_items').get().c;
  return {
    ordersToday,
    activeStaff,
    dailyRevenue: Math.round(dailyRevenue * 100) / 100,
    menuItems: menuCount,
  };
}

function getMenuItems() {
  return getDb().prepare('SELECT * FROM menu_items ORDER BY category, name').all();
}

function addMenuItem({ name, category = 'General', price, description = '' }) {
  const d = getDb();
  const stmt = d.prepare(
    'INSERT INTO menu_items (name, category, price, description) VALUES (?, ?, ?, ?)'
  );
  stmt.run(name, category, price, description);
  return d.prepare('SELECT last_insert_rowid() as id').get().id;
}

function updateMenuItem(id, { name, category, price, description }) {
  const d = getDb();
  const row = d.prepare('SELECT * FROM menu_items WHERE id = ?').get(id);
  if (!row) throw new Error('Menu item not found');
  const stmt = d.prepare(
    'UPDATE menu_items SET name=?, category=?, price=?, description=? WHERE id=?'
  );
  stmt.run(
    name ?? row.name,
    category ?? row.category,
    price ?? row.price,
    description ?? row.description,
    id
  );
}

function deleteMenuItem(id) {
  getDb().prepare('DELETE FROM menu_items WHERE id = ?').run(id);
}

function getOrders(todayOnly = false) {
  const d = getDb();
  const sql = todayOnly
    ? "SELECT * FROM orders WHERE date(created_at) = date('now','localtime') ORDER BY created_at DESC"
    : 'SELECT * FROM orders ORDER BY created_at DESC LIMIT 100';
  const orders = d.prepare(sql).all();
  const itemsStmt = d.prepare(`
    SELECT oi.*, m.name as menu_name 
    FROM order_items oi 
    JOIN menu_items m ON oi.menu_id = m.id 
    WHERE oi.order_id = ?
  `);
  return orders.map((o) => ({
    ...o,
    items: itemsStmt.all(o.id),
  }));
}

function createOrder({ items = [], table_number = 0, customer_name = 'Guest' }) {
  const d = getDb();
  let total = 0;
  const menuStmt = d.prepare('SELECT price FROM menu_items WHERE id = ?');
  for (const it of items) {
    const row = menuStmt.get(it.menu_id);
    if (row) total += row.price * (it.quantity || 1);
  }
  d.prepare(
    'INSERT INTO orders (table_number, customer_name, total, status) VALUES (?, ?, ?, ?)'
  ).run(table_number, customer_name, total, 'pending');
  const orderId = d.prepare('SELECT last_insert_rowid() as id').get().id;
  const insItem = d.prepare(
    'INSERT INTO order_items (order_id, menu_id, quantity, price) VALUES (?, ?, ?, ?)'
  );
  for (const it of items) {
    const row = menuStmt.get(it.menu_id);
    if (row) insItem.run(orderId, it.menu_id, it.quantity || 1, row.price);
  }
  return { id: orderId, table_number, customer_name, total, status: 'pending' };
}

function updateOrderStatus(id, status) {
  getDb().prepare('UPDATE orders SET status = ? WHERE id = ?').run(status, id);
}

function deleteOrder(id) {
  getDb().prepare('DELETE FROM order_items WHERE order_id = ?').run(id);
  getDb().prepare('DELETE FROM orders WHERE id = ?').run(id);
}

function getStaff() {
  return getDb().prepare('SELECT * FROM staff WHERE is_active = 1 ORDER BY name').all();
}

function addStaff({ name, role = 'Employee', phone = '', salary = 0 }) {
  const d = getDb();
  d.prepare(
    'INSERT INTO staff (name, role, phone, salary) VALUES (?, ?, ?, ?)'
  ).run(name, role, phone, salary);
  return d.prepare('SELECT last_insert_rowid() as id').get().id;
}

function updateStaff(id, { name, role, phone, salary }) {
  const d = getDb();
  const row = d.prepare('SELECT * FROM staff WHERE id = ?').get(id);
  if (!row) throw new Error('Staff not found');
  d.prepare(
    'UPDATE staff SET name=?, role=?, phone=?, salary=? WHERE id=?'
  ).run(name ?? row.name, role ?? row.role, phone ?? row.phone, salary ?? row.salary, id);
}

function deleteStaff(id) {
  getDb().prepare('UPDATE staff SET is_active = 0 WHERE id = ?').run(id);
}

function getInventory() {
  return getDb().prepare('SELECT * FROM inventory ORDER BY name').all();
}

function addInventoryItem({ name, quantity = 0, unit = 'kg', min_level = 0 }) {
  const d = getDb();
  d.prepare(
    'INSERT INTO inventory (name, quantity, unit, min_level) VALUES (?, ?, ?, ?)'
  ).run(name, quantity, unit, min_level);
  return d.prepare('SELECT last_insert_rowid() as id').get().id;
}

function updateInventoryItem(id, { name, quantity, unit, min_level }) {
  const d = getDb();
  const row = d.prepare('SELECT * FROM inventory WHERE id = ?').get(id);
  if (!row) throw new Error('Inventory item not found');
  d.prepare(
    'UPDATE inventory SET name=?, quantity=?, unit=?, min_level=? WHERE id=?'
  ).run(
    name ?? row.name,
    quantity ?? row.quantity,
    unit ?? row.unit,
    min_level ?? row.min_level,
    id
  );
}

function deleteInventoryItem(id) {
  getDb().prepare('DELETE FROM inventory WHERE id = ?').run(id);
}

function getSalesReport(days = 7) {
  const d = getDb();
  const rows = d.prepare(`
    SELECT date(created_at) as date, SUM(total) as total, COUNT(*) as orders
    FROM orders
    WHERE status = 'completed'
    AND date(created_at) >= date('now','-${days} days')
    GROUP BY date(created_at)
    ORDER BY date
  `).all();
  const totalRevenue = d.prepare(`
    SELECT COALESCE(SUM(total),0) as t FROM orders 
    WHERE status = 'completed' AND date(created_at) >= date('now','-${days} days')
  `).get().t;
  return { daily: rows, totalRevenue: Math.round(totalRevenue * 100) / 100 };
}

module.exports = {
  init,
  getStats,
  getMenuItems,
  addMenuItem,
  updateMenuItem,
  deleteMenuItem,
  getOrders,
  createOrder,
  updateOrderStatus,
  deleteOrder,
  getStaff,
  addStaff,
  updateStaff,
  deleteStaff,
  getInventory,
  addInventoryItem,
  updateInventoryItem,
  deleteInventoryItem,
  getSalesReport,
};
