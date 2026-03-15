# RMS Pro - Restaurant Management System

Full-stack restaurant management system with Order Management, Staff, Menu, Inventory, and Sales Analytics.

## Tech Stack

- **Backend**: Node.js, Express, SQLite (better-sqlite3)
- **Frontend**: HTML, CSS, Vanilla JavaScript
- **Database**: SQLite (file-based, no setup required)

## Setup & Run

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the server:
   ```bash
   npm start
   ```

3. Open http://localhost:3000 in your browser.

## Features

- **Dashboard** – Live stats: Orders today, active staff, daily revenue, menu items
- **Orders** – Create, view, complete, delete orders
- **Menu** – Add, edit, delete menu items with categories and prices
- **Staff** – Add, edit, remove staff with roles and salaries
- **Inventory** – Track stock, set min levels, low-stock alerts
- **Sales** – 7-day revenue report and order counts

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/stats | Dashboard statistics |
| GET | /api/menu | List menu items |
| POST | /api/menu | Add menu item |
| PUT | /api/menu/:id | Update menu item |
| DELETE | /api/menu/:id | Delete menu item |
| GET | /api/orders | List orders (query: ?today=true) |
| POST | /api/orders | Create order |
| PUT | /api/orders/:id/status | Update order status |
| DELETE | /api/orders/:id | Delete order |
| GET | /api/staff | List staff |
| POST | /api/staff | Add staff |
| PUT | /api/staff/:id | Update staff |
| DELETE | /api/staff/:id | Remove staff (soft delete) |
| GET | /api/inventory | List inventory |
| POST | /api/inventory | Add inventory item |
| PUT | /api/inventory/:id | Update inventory |
| DELETE | /api/inventory/:id | Delete inventory |
| GET | /api/sales?days=7 | Sales report |

Database file: `server/rms.db` (created on first run)
