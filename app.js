const API = '/api';

const navLinks = document.querySelectorAll('nav ul li');
const mainContent = document.getElementById('main-content');

function showView(name) {
  document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
  document.querySelectorAll('nav ul li').forEach(l => l.classList.remove('active'));
  const view = document.getElementById(`view-${name}`);
  const link = [...navLinks].find(l => l.dataset.view === name);
  if (view) view.classList.add('active');
  if (link) link.classList.add('active');
  if (name === 'dashboard') loadDashboard();
  if (name === 'orders') loadOrders();
  if (name === 'menu') loadMenu();
  if (name === 'staff') loadStaff();
  if (name === 'inventory') loadInventory();
  if (name === 'sales') loadSales();
}

async function fetchAPI(path, opts = {}) {
  const res = await fetch(`${API}${path}`, opts);
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || 'Request failed');
  return data;
}

async function loadDashboard() {
  const stats = await fetchAPI('/stats');
  document.getElementById('stat-orders').textContent = stats.ordersToday;
  document.getElementById('stat-staff').textContent = stats.activeStaff;
  document.getElementById('stat-revenue').textContent = `₹${stats.dailyRevenue.toLocaleString()}`;
  document.getElementById('stat-menu').textContent = stats.menuItems;
}

async function loadOrders() {
  const orders = await fetchAPI('/orders');
  const tbody = document.getElementById('orders-tbody');
  tbody.innerHTML = orders.length
    ? orders.map(o => `
        <tr>
          <td>#${o.id}</td>
          <td>${o.table_number}</td>
          <td>${o.customer_name}</td>
          <td>₹${o.total}</td>
          <td><span class="badge ${o.status}">${o.status}</span></td>
          <td>${new Date(o.created_at).toLocaleString()}</td>
          <td>
            ${o.status === 'pending' ? '<button class="btn-sm btn-ok" onclick="markCompleted(' + o.id + ')">Complete</button> ' : ''}
            <button class="btn-sm btn-del" onclick="deleteOrder(' + o.id + ')">Delete</button>
          </td>
        </tr>
      `).join('')
    : '<tr><td colspan="7">No orders yet</td></tr>';
}

async function markCompleted(id) {
  await fetchAPI(`/orders/${id}/status`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status: 'completed' }) });
  loadOrders();
}

async function deleteOrder(id) {
  if (!confirm('Delete this order?')) return;
  await fetchAPI(`/orders/${id}`, { method: 'DELETE' });
  loadOrders();
}

function openNewOrderModal() {
  document.getElementById('new-order-modal').classList.add('active');
  loadMenuForOrder();
}

async function loadMenuForOrder() {
  const menu = await fetchAPI('/menu');
  const sel = document.getElementById('new-order-menu');
  sel.innerHTML = '<option value="">Select item</option>' + menu.map(m => `<option value="${m.id}" data-price="${m.price}">${m.name} - ₹${m.price}</option>`).join('');
}

async function submitNewOrder(e) {
  e.preventDefault();
  const table = parseInt(document.getElementById('new-order-table').value) || 0;
  const customer = document.getElementById('new-order-customer').value || 'Guest';
  const sel = document.getElementById('new-order-menu');
  const qty = parseInt(document.getElementById('new-order-qty').value) || 1;
  const menuId = parseInt(sel.value);
  if (!menuId) { alert('Select a menu item'); return; }
  await fetchAPI('/orders', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ table_number: table, customer_name: customer, items: [{ menu_id: menuId, quantity: qty }] })
  });
  document.getElementById('new-order-modal').classList.remove('active');
  document.getElementById('new-order-form').reset();
  loadOrders();
}

async function loadMenu() {
  const menu = await fetchAPI('/menu');
  const tbody = document.getElementById('menu-tbody');
  tbody.innerHTML = menu.length
    ? menu.map(m => `
        <tr>
          <td>${m.name}</td>
          <td>${m.category}</td>
          <td>₹${m.price}</td>
          <td>${m.description || '-'}</td>
          <td>
            <button class="btn-sm" onclick="editMenuItem(${m.id}, '${m.name.replace(/'/g, "\\'")}', '${m.category}', ${m.price})">Edit</button>
            <button class="btn-sm btn-del" onclick="deleteMenuItem(${m.id})">Delete</button>
          </td>
        </tr>
      `).join('')
    : '<tr><td colspan="5">No menu items</td></tr>';
}

function editMenuItem(id, name, category, price) {
  const n = prompt('Name', name);
  if (n === null) return;
  const c = prompt('Category', category);
  if (c === null) return;
  const p = parseFloat(prompt('Price', price));
  if (isNaN(p)) return;
  fetchAPI(`/menu/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: n, category: c, price: p }) })
    .then(() => loadMenu());
}

async function deleteMenuItem(id) {
  if (!confirm('Delete this menu item?')) return;
  await fetchAPI(`/menu/${id}`, { method: 'DELETE' });
  loadMenu();
}

function openAddMenuModal() {
  document.getElementById('add-menu-modal').classList.add('active');
}

async function submitAddMenu(e) {
  e.preventDefault();
  const name = document.getElementById('menu-name').value;
  const category = document.getElementById('menu-category').value || 'General';
  const price = parseFloat(document.getElementById('menu-price').value) || 0;
  const desc = document.getElementById('menu-desc').value || '';
  await fetchAPI('/menu', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name, category, price, description: desc }) });
  document.getElementById('add-menu-modal').classList.remove('active');
  document.getElementById('add-menu-form').reset();
  loadMenu();
}

async function loadStaff() {
  const staff = await fetchAPI('/staff');
  const tbody = document.getElementById('staff-tbody');
  tbody.innerHTML = staff.length
    ? staff.map(s => `
        <tr>
          <td>${s.name}</td>
          <td>${s.role}</td>
          <td>${s.phone || '-'}</td>
          <td>₹${s.salary}</td>
          <td>
            <button class="btn-sm" onclick="editStaff(${s.id}, '${s.name.replace(/'/g, "\\'")}', '${s.role}', '${s.phone || ''}', ${s.salary})">Edit</button>
            <button class="btn-sm btn-del" onclick="deleteStaff(${s.id})">Remove</button>
          </td>
        </tr>
      `).join('')
    : '<tr><td colspan="5">No staff</td></tr>';
}

function editStaff(id, name, role, phone, salary) {
  const n = prompt('Name', name);
  if (n === null) return;
  const r = prompt('Role', role);
  if (r === null) return;
  const p = prompt('Phone', phone);
  const s = parseFloat(prompt('Salary', salary));
  fetchAPI(`/staff/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: n, role: r, phone: p, salary: s }) })
    .then(() => loadStaff());
}

async function deleteStaff(id) {
  if (!confirm('Remove this staff member?')) return;
  await fetchAPI(`/staff/${id}`, { method: 'DELETE' });
  loadStaff();
}

function openAddStaffModal() {
  document.getElementById('add-staff-modal').classList.add('active');
}

async function submitAddStaff(e) {
  e.preventDefault();
  const name = document.getElementById('staff-name').value;
  const role = document.getElementById('staff-role').value || 'Employee';
  const phone = document.getElementById('staff-phone').value || '';
  const salary = parseFloat(document.getElementById('staff-salary').value) || 0;
  await fetchAPI('/staff', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name, role, phone, salary }) });
  document.getElementById('add-staff-modal').classList.remove('active');
  document.getElementById('add-staff-form').reset();
  loadStaff();
}

async function loadInventory() {
  const inv = await fetchAPI('/inventory');
  const tbody = document.getElementById('inventory-tbody');
  tbody.innerHTML = inv.length
    ? inv.map(i => {
        const low = i.quantity <= i.min_level;
        return `
        <tr class="${low ? 'low-stock' : ''}">
          <td>${i.name}</td>
          <td>${i.quantity} ${i.unit}</td>
          <td>${i.min_level} ${i.unit}</td>
          <td>${low ? '⚠ Low' : 'OK'}</td>
          <td>
            <button class="btn-sm" onclick="editInventory(${i.id}, '${i.name.replace(/'/g, "\\'")}', ${i.quantity}, '${i.unit}', ${i.min_level})">Edit</button>
            <button class="btn-sm btn-del" onclick="deleteInventory(${i.id})">Delete</button>
          </td>
        </tr>
      `}).join('')
    : '<tr><td colspan="5">No inventory items</td></tr>';
}

function editInventory(id, name, quantity, unit, minLevel) {
  const n = prompt('Name', name);
  if (n === null) return;
  const q = parseFloat(prompt('Quantity', quantity));
  if (isNaN(q)) return;
  const u = prompt('Unit', unit) || 'kg';
  const m = parseFloat(prompt('Min level', minLevel)) || 0;
  fetchAPI(`/inventory/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: n, quantity: q, unit: u, min_level: m }) })
    .then(() => loadInventory());
}

async function deleteInventory(id) {
  if (!confirm('Delete this inventory item?')) return;
  await fetchAPI(`/inventory/${id}`, { method: 'DELETE' });
  loadInventory();
}

function openAddInventoryModal() {
  document.getElementById('add-inventory-modal').classList.add('active');
}

async function submitAddInventory(e) {
  e.preventDefault();
  const name = document.getElementById('inv-name').value;
  const quantity = parseFloat(document.getElementById('inv-qty').value) || 0;
  const unit = document.getElementById('inv-unit').value || 'kg';
  const minLevel = parseFloat(document.getElementById('inv-min').value) || 0;
  await fetchAPI('/inventory', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name, quantity, unit, min_level: minLevel }) });
  document.getElementById('add-inventory-modal').classList.remove('active');
  document.getElementById('add-inventory-form').reset();
  loadInventory();
}

async function loadSales() {
  const data = await fetchAPI('/sales?days=7');
  document.getElementById('sales-total').textContent = `₹${data.totalRevenue.toLocaleString()}`;
  const tbody = document.getElementById('sales-tbody');
  tbody.innerHTML = data.daily.length
    ? data.daily.map(d => `<tr><td>${d.date}</td><td>₹${parseFloat(d.total).toLocaleString()}</td><td>${d.orders}</td></tr>`).join('')
    : '<tr><td colspan="3">No sales data</td></tr>';
}

navLinks.forEach(li => {
  if (li.dataset.view) {
    li.addEventListener('click', () => showView(li.dataset.view));
  }
});

document.getElementById('hero-get-started')?.addEventListener('click', () => showView('dashboard'));

// Modal close handlers
document.querySelectorAll('.modal-overlay').forEach(m => {
  m.addEventListener('click', e => { if (e.target === m) m.classList.remove('active'); });
});
