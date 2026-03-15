const express = require('express');
const cors = require('cors');
const path = require('path');
const db = require('./db');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '..')));

// Initialize database
db.init();

// ============ API ROUTES ============

// Dashboard stats
app.get('/api/stats', (req, res) => {
  try {
    const stats = db.getStats();
    res.json(stats);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Menu items
app.get('/api/menu', (req, res) => {
  try {
    const items = db.getMenuItems();
    res.json(items);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/menu', (req, res) => {
  try {
    const { name, category, price, description } = req.body;
    const id = db.addMenuItem({ name, category, price, description });
    res.status(201).json({ id, name, category, price, description });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/menu/:id', (req, res) => {
  try {
    const id = parseInt(req.params.id);
    db.updateMenuItem(id, req.body);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/menu/:id', (req, res) => {
  try {
    db.deleteMenuItem(parseInt(req.params.id));
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Orders
app.get('/api/orders', (req, res) => {
  try {
    const today = req.query.today === 'true';
    const orders = db.getOrders(today);
    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/orders', (req, res) => {
  try {
    const { items, table_number, customer_name } = req.body;
    const order = db.createOrder({ items, table_number, customer_name });
    res.status(201).json(order);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/orders/:id/status', (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { status } = req.body;
    db.updateOrderStatus(id, status);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/orders/:id', (req, res) => {
  try {
    db.deleteOrder(parseInt(req.params.id));
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Staff
app.get('/api/staff', (req, res) => {
  try {
    const staff = db.getStaff();
    res.json(staff);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/staff', (req, res) => {
  try {
    const { name, role, phone, salary } = req.body;
    const id = db.addStaff({ name, role, phone, salary });
    res.status(201).json({ id, name, role, phone, salary });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/staff/:id', (req, res) => {
  try {
    db.updateStaff(parseInt(req.params.id), req.body);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/staff/:id', (req, res) => {
  try {
    db.deleteStaff(parseInt(req.params.id));
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Inventory
app.get('/api/inventory', (req, res) => {
  try {
    const items = db.getInventory();
    res.json(items);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/inventory', (req, res) => {
  try {
    const { name, quantity, unit, min_level } = req.body;
    const id = db.addInventoryItem({ name, quantity, unit, min_level });
    res.status(201).json({ id, name, quantity, unit, min_level: min_level || 0 });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/inventory/:id', (req, res) => {
  try {
    db.updateInventoryItem(parseInt(req.params.id), req.body);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/inventory/:id', (req, res) => {
  try {
    db.deleteInventoryItem(parseInt(req.params.id));
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Sales analytics
app.get('/api/sales', (req, res) => {
  try {
    const days = parseInt(req.query.days) || 7;
    const sales = db.getSalesReport(days);
    res.json(sales);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Serve frontend
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'form.html'));
});

app.listen(PORT, () => {
  console.log(`RMS Pro server running at http://localhost:${PORT}`);
});
