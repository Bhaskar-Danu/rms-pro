# 🍽️ RMS Pro — Restaurant Management System

> A full-featured, production-ready **Restaurant Management System** built on the **MERN Stack** (MongoDB, Express.js, React, Node.js). Designed to digitise and streamline every aspect of day-to-day restaurant operations — from order taking and kitchen workflow to inventory tracking, financial reporting, and customer feedback.

---

## 📑 Table of Contents

1. [Problem Statement](#-problem-statement)
2. [Proposed Solution](#-proposed-solution)
3. [Key Features](#-key-features)
4. [Technology Stack](#-technology-stack)
5. [System Architecture](#-system-architecture)
6. [Project Structure](#-project-structure)
7. [Database Schema (MongoDB Models)](#-database-schema-mongodb-models)
8. [REST API Endpoints](#-rest-api-endpoints)
9. [Authentication & Authorisation](#-authentication--authorisation)
10. [Security Measures](#-security-measures)
11. [Getting Started](#-getting-started)
12. [Environment Variables](#-environment-variables)
13. [Available Scripts](#-available-scripts)
14. [Screenshots](#-screenshots)
15. [Future Enhancements](#-future-enhancements)
16. [License](#-license)

---

## 🔍 Problem Statement

Traditional restaurant management relies heavily on **manual, paper-based processes** — handwritten order slips, physical inventory ledgers, verbal communication between waitstaff and kitchen, and end-of-day cash tallying. This approach leads to several critical problems:

| Problem | Impact |
|---|---|
| **Order Errors** | Handwritten orders are frequently misread by kitchen staff, resulting in wrong dishes, customer complaints, and food waste. |
| **Slow Service** | Paper slips must physically travel from table to kitchen, adding unnecessary delay to the dining experience. |
| **Inventory Blind Spots** | Without real-time tracking, restaurants discover stock shortages only when a customer orders a dish — causing embarrassment and lost revenue. |
| **Revenue Leakage** | Manual cash handling and billing are prone to calculation errors, pilferage, and unrecorded discounts. |
| **No Data-Driven Decisions** | Without digital records, owners cannot analyse sales trends, peak hours, popular dishes, or cost breakdowns. |
| **Staff Mismanagement** | Scheduling, payroll, and performance tracking done on spreadsheets or memory alone leads to over/under-staffing. |
| **Reservation Chaos** | Phone-based bookings with no centralised calendar result in double-bookings, forgotten reservations, and unhappy guests. |
| **Customer Feedback Gap** | Paper comment cards are rarely filled and even more rarely analysed, leaving service issues unaddressed. |

---

## 💡 Proposed Solution

**RMS Pro** replaces fragmented manual workflows with a **single, unified web application** that connects every stakeholder — owner, manager, waiter, and chef — in real time.

### How It Solves the Problems

| Problem | RMS Pro Solution |
|---|---|
| Order Errors | Digital order entry with menu item selection — no handwriting ambiguity. |
| Slow Service | Orders appear instantly on the kitchen display; status updates flow back in real time. |
| Inventory Blind Spots | Inventory module with minimum-level alerts warns staff before items run out. |
| Revenue Leakage | Automated total calculation, itemised bills, and audit-grade activity logs. |
| No Data-Driven Decisions | Built-in Sales Analytics, Reports, and Expense dashboards with Chart.js visualisations. |
| Staff Mismanagement | Staff registry with role, salary, and active/inactive tracking. |
| Reservation Chaos | Centralised reservation calendar with status management (confirmed / completed / cancelled). |
| Customer Feedback Gap | In-app feedback collection with 5-star ratings and comment tracking linked to orders. |

---

## ✨ Key Features

### 🏠 Dashboard & Home
- At-a-glance KPI cards (total orders, revenue, active staff, pending orders)
- Interactive charts showing sales trends and order distribution
- Quick-action shortcuts to frequently used modules

### 📋 Digital Menu Management
- Full CRUD (Create, Read, Update, Delete) for menu items
- Categorisation (Starters, Main Course, Beverages, Desserts, etc.)
- Real-time search and filter
- Price management with ₹ currency support

### 🛒 Order Processing
- Create orders by selecting items from the digital menu
- Assign orders to specific table numbers and customer names
- 5-stage order lifecycle: `Pending → Preparing → Ready → Completed → Cancelled`
- Automatic total calculation based on item prices and quantities
- Order history with date/time stamps

### 👨‍🍳 Kitchen Display
- Live queue of active orders for kitchen staff
- Status update buttons for workflow progression
- Visual distinction between order priorities

### 🪑 Table Management
- Visual table layout with real-time occupancy status
- Link tables to active orders and reservations

### 📅 Reservation System
- Book reservations with customer name, phone, date, time, and guest count
- Assign tables to reservations
- Status tracking: Confirmed → Completed / Cancelled
- Notes field for special requests

### 📦 Inventory Management
- Track stock items with quantity, unit, and minimum level
- Low-stock alerts when quantity falls below minimum threshold
- Full CRUD operations with search capability

### 👥 Staff Management
- Employee directory with name, role, phone, and salary
- Active/Inactive status toggle
- Admin-only access for staff data

### 💳 Payment Gateway (Online + Offline)
- **4 Payment Methods**: Cash, Card, UPI, and Online (Razorpay)
- **Cash Payments**: Accepts tendered amount, auto-calculates change to return
- **Card Payments**: Record card last-4 digits or transaction ID for reference
- **UPI Payments**: Capture UPI reference number for offline tracking
- **Online Payments (Razorpay)**: Full Razorpay checkout integration with order creation, payment verification, and signature validation
- **Demo Mode**: Automatically falls back to demo mode when Razorpay keys are not configured — perfect for development and testing
- **Payment Dashboard**: Real-time stats cards showing total revenue, today's revenue, cash vs digital breakdown
- **Payment History**: Full transaction log with method, status, processed-by, and timestamps
- **Refund Support**: Admin can refund completed payments; order auto-cancelled on refund
- **Order Integration**: Orders track `payment_status` (unpaid / paid / refunded) and `payment_method`
- **Activity Logging**: Every payment and refund is recorded in the activity audit trail

### 💰 Expense Tracking
- Record expenses by category (Rent, Utilities, Supplies, Salaries, etc.)
- Date-wise expense logging
- Expense distribution charts (Doughnut chart visualisation)

### 📊 Sales Analytics
- Revenue trends over time (Line charts)
- Category-wise sales breakdown
- Date-range filtering for custom reports

### 📈 Reports & Analytics
- Comprehensive business reports with Chart.js
- Order volume analysis
- Revenue vs Expense comparison
- Exportable data views

### 💬 Customer Feedback
- Collect feedback with 1-5 star ratings
- Link feedback to specific orders
- Comment/review collection
- Average rating tracking

### 📝 Activity Logs
- Audit trail of all critical actions (item added, order placed, payment received, etc.)
- User attribution — who performed what action and when
- Chronological activity feed

### 👤 User Profile
- View and manage personal account details
- Restaurant name configuration

### 🔐 Authentication & Role-Based Access
- Secure JWT-based authentication
- Role-based access control (Admin / Staff)
- Password strength indicator on registration
- Auto-logout on token expiry

---

## 🛠️ Technology Stack

### Frontend

| Technology | Version | Purpose |
|---|---|---|
| **React** | 19.x | Component-based UI library |
| **React Router DOM** | 7.x | Client-side routing & navigation |
| **Vite** | 8.x | Lightning-fast build tool & dev server |
| **Axios** | 1.x | HTTP client for API communication |
| **Chart.js** | 4.x | Data visualisation (Bar, Line, Doughnut charts) |
| **react-chartjs-2** | 5.x | React wrapper for Chart.js |
| **CSS3 (Vanilla)** | — | Custom styling with CSS variables, glassmorphism, and dark theme |
| **Font Awesome** | 6.x | Icon library for UI elements |
| **Razorpay Checkout** | 1.x | Online payment gateway SDK (browser-side) |

### Backend

| Technology | Version | Purpose |
|---|---|---|
| **Node.js** | 18+ | JavaScript runtime environment |
| **Express.js** | 4.x | Web framework for RESTful APIs |
| **MongoDB** | 7+ | NoSQL document database |
| **Mongoose** | 8.x | MongoDB ODM (Object Document Mapper) |
| **JSON Web Token (JWT)** | 9.x | Stateless authentication tokens |
| **bcrypt.js** | 3.x | Password hashing (12 salt rounds) |
| **Helmet** | 8.x | HTTP security headers |
| **express-rate-limit** | 8.x | Brute-force protection on auth routes |
| **Morgan** | 1.x | HTTP request logger (development mode) |
| **CORS** | 2.x | Cross-Origin Resource Sharing |
| **dotenv** | 16.x | Environment variable management |
| **Razorpay** | — | Payment gateway server SDK (optional — demo mode available) |

### DevDependencies

| Technology | Purpose |
|---|---|
| **Nodemon** | Auto-restart server on file changes |
| **Concurrently** | Run backend + frontend in parallel |
| **ESLint** | Code quality and linting |
| **@vitejs/plugin-react** | Vite React integration |

### Database

| Service | Purpose |
|---|---|
| **MongoDB Atlas** | Cloud-hosted MongoDB cluster (free tier M0) |

---

## 🏗️ System Architecture

### Architecture Pattern: **MVC (Model-View-Controller)**

RMS Pro follows a clean **MVC architecture** with a clear separation of concerns between the frontend and backend, connected via RESTful APIs.

```
┌─────────────────────────────────────────────────────────────────────┐
│                         CLIENT (Browser)                           │
│                                                                     │
│  ┌─────────────┐   ┌──────────────┐   ┌──────────────────────────┐ │
│  │  React App  │──▶│  Axios API   │──▶│  Vite Dev Server (:5173) │ │
│  │  (Views)    │   │  Client      │   │  Proxy /api → :5000      │ │
│  └─────────────┘   └──────────────┘   └──────────────────────────┘ │
└────────────────────────────────┬────────────────────────────────────┘
                                 │ HTTP (REST API)
                                 ▼
┌─────────────────────────────────────────────────────────────────────┐
│                     SERVER (Node.js + Express)                      │
│                                                                     │
│  ┌──────────┐   ┌──────────────┐   ┌────────────┐   ┌───────────┐ │
│  │ Middleware│──▶│   Routes     │──▶│ Controllers│──▶│  Models   │ │
│  │ (Auth,   │   │ (/api/menu,  │   │ (Business  │   │ (Mongoose │ │
│  │  Helmet, │   │  /api/orders │   │  Logic)    │   │  Schemas) │ │
│  │  CORS)   │   │  /api/staff) │   │            │   │           │ │
│  └──────────┘   └──────────────┘   └────────────┘   └─────┬─────┘ │
└────────────────────────────────────────────────────────────┬───────┘
                                                             │
                                                             ▼
                                                  ┌──────────────────┐
                                                  │  MongoDB Atlas   │
                                                  │  (Cloud DB)      │
                                                  │  Database: rms_  │
                                                  │  pro             │
                                                  └──────────────────┘
```

### Data Flow

```
User Action → React Component → Axios HTTP Request → Express Route
→ Auth Middleware (JWT verify) → Controller (Business Logic)
→ Mongoose Model (DB Operation) → MongoDB Atlas
→ JSON Response → React State Update → UI Re-render
```

### Frontend Architecture

```
src/
├── main.jsx                    ← Entry point (React DOM root)
├── AppRouter.jsx               ← Route definitions (Login vs App)
├── App.jsx                     ← Main layout (Sidebar + View switching)
│
├── context/                    ← React Context for global state
│   ├── AuthContext.jsx         ← Authentication state (user, token, role)
│   └── ToastContext.jsx        ← Toast notification system
│
├── api/
│   └── axios.js                ← Configured Axios instance with JWT interceptors
│
├── pages/
│   └── Login.jsx               ← Login & Registration page
│
├── components/
│   ├── layout/
│   │   └── Sidebar.jsx         ← Navigation sidebar with role-based menu
│   ├── common/
│   │   ├── Modal.jsx           ← Reusable modal dialog
│   │   ├── ConfirmModal.jsx    ← Confirmation dialog (delete actions)
│   │   └── Badge.jsx           ← Status badge component
│   └── views/                  ← Feature modules (16 views)
│       ├── Dashboard.jsx       ← KPI dashboard with charts
│       ├── Orders.jsx          ← Order management + payment status
│       ├── Payments.jsx        ← Payment processing (cash/card/UPI/online)
│       ├── Menu.jsx            ← Menu CRUD
│       ├── Kitchen.jsx         ← Kitchen display
│       ├── Tables.jsx          ← Table layout
│       ├── Reservations.jsx    ← Reservation management
│       ├── Inventory.jsx       ← Stock management
│       ├── Staff.jsx           ← Employee management
│       ├── Expenses.jsx        ← Expense tracking
│       ├── Sales.jsx           ← Sales analytics
│       ├── Reports.jsx         ← Business reports
│       ├── Feedback.jsx        ← Customer feedback
│       ├── Activity.jsx        ← Activity audit log
│       ├── Profile.jsx         ← User profile
│       └── Home.jsx            ← Welcome/landing page
```

### Backend Architecture (MVC)

```
server/
├── index.js                    ← Express app setup, middleware, routes
├── config/
│   └── db.js                   ← MongoDB Atlas connection
│
├── middleware/
│   └── auth.js                 ← JWT verification & role-based access
│
├── models/                     ← Mongoose schemas (DATA LAYER)
│   ├── User.js                 ← User accounts with bcrypt hashing
│   ├── MenuItem.js             ← Menu items (name, category, price)
│   ├── Order.js                ← Orders with embedded items + payment tracking
│   ├── Payment.js              ← Payment transactions (cash/card/UPI/online)
│   ├── Staff.js                ← Employee records
│   ├── Inventory.js            ← Stock items with min-level alerts
│   ├── Reservation.js          ← Table reservations
│   ├── Expense.js              ← Financial expenses
│   ├── Feedback.js             ← Customer reviews & ratings
│   └── ActivityLog.js          ← Audit trail entries
│
├── controllers/                ← Business logic (CONTROLLER LAYER)
│   ├── authController.js       ← Register, Login, GetMe
│   ├── menuController.js       ← Menu CRUD operations
│   ├── orderController.js      ← Order CRUD + status updates
│   ├── paymentController.js    ← Offline/online payments, refunds, stats
│   ├── staffController.js      ← Staff CRUD operations
│   ├── inventoryController.js  ← Inventory CRUD operations
│   ├── reservationController.js← Reservation CRUD operations
│   ├── expenseController.js    ← Expense CRUD operations
│   ├── feedbackController.js   ← Feedback CRUD operations
│   ├── reportController.js     ← Aggregated report data
│   ├── salesController.js      ← Sales analytics data
│   ├── statsController.js      ← Dashboard KPI statistics
│   ├── activityController.js   ← Activity log retrieval
│   └── profileController.js    ← User profile management
│
├── routes/                     ← Route definitions (ROUTING LAYER)
│   ├── auth.js                 ← /api/auth/*
│   ├── menu.js                 ← /api/menu/*
│   ├── orders.js               ← /api/orders/*
│   ├── payments.js             ← /api/payments/*
│   ├── staff.js                ← /api/staff/*
│   ├── inventory.js            ← /api/inventory/*
│   ├── reservations.js         ← /api/reservations/*
│   ├── expenses.js             ← /api/expenses/*
│   ├── feedback.js             ← /api/feedback/*
│   ├── reports.js              ← /api/reports/*
│   ├── sales.js                ← /api/sales/*
│   ├── stats.js                ← /api/stats/*
│   ├── activity.js             ← /api/activity/*
│   └── profile.js              ← /api/profile/*
│
└── utils/
    └── seeder.js               ← Database seed script
```

---

## 📐 Database Schema (MongoDB Models)

### User
| Field | Type | Constraints |
|---|---|---|
| `username` | String | Required, Unique, Trimmed |
| `email` | String | Required, Unique, Lowercase |
| `password` | String | Required, Hashed (bcrypt, 12 rounds), Hidden from queries |
| `restaurant_name` | String | Default: "My Restaurant" |
| `role` | String | Enum: `admin`, `staff` — Default: `staff` |
| `createdAt` | Date | Auto-generated |
| `updatedAt` | Date | Auto-generated |

### MenuItem
| Field | Type | Constraints |
|---|---|---|
| `name` | String | Required, Trimmed |
| `category` | String | Default: "General", Trimmed |
| `price` | Number | Required, Min: 0 |
| `description` | String | Default: "" |

### Order
| Field | Type | Constraints |
|---|---|---|
| `items` | Array\<OrderItem\> | Required — embedded sub-documents |
| `items[].menuItem` | ObjectId → MenuItem | Reference to original menu item |
| `items[].name` | String | Snapshot of item name at order time |
| `items[].price` | Number | Snapshot of item price at order time |
| `items[].quantity` | Number | Min: 1 |
| `table_number` | Number | Default: 0 |
| `customer_name` | String | Default: "Guest" |
| `total` | Number | Default: 0 |
| `status` | String | Enum: `pending`, `preparing`, `ready`, `completed`, `cancelled` |
| `payment_status` | String | Enum: `unpaid`, `paid`, `refunded` — Default: `unpaid` |
| `payment_method` | String | Enum: `cash`, `card`, `upi`, `online`, `null` — Default: `null` |

### Staff
| Field | Type | Constraints |
|---|---|---|
| `name` | String | Required, Trimmed |
| `role` | String | Default: "Employee" |
| `phone` | String | Default: "" |
| `salary` | Number | Default: 0 |
| `is_active` | Boolean | Default: true |

### Inventory
| Field | Type | Constraints |
|---|---|---|
| `name` | String | Required, Trimmed |
| `quantity` | Number | Required, Min: 0 |
| `unit` | String | Default: "kg" |
| `min_level` | Number | Default: 0 |

### Reservation
| Field | Type | Constraints |
|---|---|---|
| `customer_name` | String | Required, Trimmed |
| `phone` | String | Default: "" |
| `date` | String | Required |
| `time` | String | Required |
| `guests` | Number | Default: 1, Min: 1 |
| `table_number` | Number | Default: null |
| `status` | String | Enum: `confirmed`, `completed`, `cancelled` |
| `notes` | String | Default: "" |

### Expense
| Field | Type | Constraints |
|---|---|---|
| `category` | String | Required |
| `amount` | Number | Required, Min: 0 |
| `description` | String | Default: "" |
| `date` | String | Default: current date (YYYY-MM-DD) |

### Feedback
| Field | Type | Constraints |
|---|---|---|
| `customer_name` | String | Required, Trimmed |
| `rating` | Number | Required, Min: 1, Max: 5 |
| `comment` | String | Default: "" |
| `order` | ObjectId → Order | Optional reference to an order |

### Payment
| Field | Type | Constraints |
|---|---|---|
| `order` | ObjectId → Order | Required — reference to the paid order |
| `amount` | Number | Required, Min: 0 |
| `method` | String | Enum: `cash`, `card`, `upi`, `online` — Required |
| `status` | String | Enum: `pending`, `completed`, `failed`, `refunded` — Default: `pending` |
| `gateway_order_id` | String | Razorpay order ID (online payments only) |
| `gateway_payment_id` | String | Razorpay payment ID (online payments only) |
| `gateway_signature` | String | Razorpay signature for verification |
| `reference_number` | String | Card last-4 / UPI ref / transaction ID |
| `received_amount` | Number | Cash tendered by customer |
| `change_returned` | Number | Change given back (auto-calculated) |
| `processed_by` | String | Username of the staff who processed the payment |
| `notes` | String | Optional notes |

### ActivityLog
| Field | Type | Constraints |
|---|---|---|
| `user` | ObjectId → User | Default: null |
| `username` | String | Default: "System" |
| `action` | String | Required |
| `details` | String | Default: "" |

---

## 🌐 REST API Endpoints

### Authentication (`/api/auth`) — *Rate Limited: 20 req / 15 min*

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `POST` | `/api/auth/register` | Public | Register a new account |
| `POST` | `/api/auth/login` | Public | Login with email/username + password |
| `GET` | `/api/auth/me` | Protected | Get current user profile |

### Menu (`/api/menu`)

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/menu` | Protected | List all menu items |
| `POST` | `/api/menu` | Admin only | Add a new menu item |
| `PUT` | `/api/menu/:id` | Admin only | Update a menu item |
| `DELETE` | `/api/menu/:id` | Admin only | Delete a menu item |

### Orders (`/api/orders`)

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/orders` | Protected | List all orders |
| `POST` | `/api/orders` | Protected | Create a new order |
| `PUT` | `/api/orders/:id` | Protected | Update order details/status |
| `DELETE` | `/api/orders/:id` | Admin only | Delete an order |

### Staff (`/api/staff`)

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/staff` | Protected | List all staff members |
| `POST` | `/api/staff` | Admin only | Add a new staff member |
| `PUT` | `/api/staff/:id` | Admin only | Update staff details |
| `DELETE` | `/api/staff/:id` | Admin only | Remove a staff member |

### Inventory (`/api/inventory`)

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/inventory` | Protected | List all inventory items |
| `POST` | `/api/inventory` | Admin only | Add an inventory item |
| `PUT` | `/api/inventory/:id` | Admin only | Update stock details |
| `DELETE` | `/api/inventory/:id` | Admin only | Remove an inventory item |

### Reservations (`/api/reservations`)

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/reservations` | Protected | List all reservations |
| `POST` | `/api/reservations` | Protected | Create a reservation |
| `PUT` | `/api/reservations/:id` | Protected | Update reservation |
| `DELETE` | `/api/reservations/:id` | Admin only | Cancel/delete reservation |

### Feedback (`/api/feedback`)

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/feedback` | Protected | List all feedback |
| `POST` | `/api/feedback` | Protected | Submit feedback |
| `PUT` | `/api/feedback/:id` | Protected | Update feedback |
| `DELETE` | `/api/feedback/:id` | Admin only | Delete feedback |

### Expenses (`/api/expenses`)

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/expenses` | Protected | List all expenses |
| `POST` | `/api/expenses` | Admin only | Record an expense |
| `PUT` | `/api/expenses/:id` | Admin only | Update an expense |
| `DELETE` | `/api/expenses/:id` | Admin only | Delete an expense |

### Reports (`/api/reports`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/reports/summary` | Protected | Aggregated business report |

### Sales (`/api/sales`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/sales` | Protected | Sales analytics data |

### Statistics (`/api/stats`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/stats` | Protected | Dashboard KPI statistics |

### Activity (`/api/activity`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/activity` | Protected | Recent activity log entries |

### Profile (`/api/profile`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/profile` | Protected | Get user profile |
| `PUT` | `/api/profile` | Protected | Update user profile |

### Payments (`/api/payments`)

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/payments` | Protected | List all payment transactions |
| `GET` | `/api/payments/stats` | Protected | Payment stats (revenue, method breakdown) |
| `GET` | `/api/payments/order/:orderId` | Protected | Get payment for a specific order |
| `POST` | `/api/payments/offline` | Protected | Process cash / card / UPI payment |
| `POST` | `/api/payments/online/create` | Protected | Create Razorpay order for online payment |
| `POST` | `/api/payments/online/verify` | Protected | Verify Razorpay payment signature |
| `POST` | `/api/payments/:id/refund` | Admin only | Refund a completed payment |

---

## 🔐 Authentication & Authorisation

### Authentication Flow

```
1. User registers/logs in → Server returns JWT token
2. Token stored in localStorage (rms_token)
3. Every API request includes: Authorization: Bearer <token>
4. Axios interceptor auto-attaches token to all requests
5. On 401 response → auto-logout and redirect to /login
```

### JWT Token Payload

```json
{
  "id": "MongoDB ObjectId",
  "username": "admin",
  "email": "admin@restaurant.com",
  "role": "admin",
  "iat": 1712345678,
  "exp": 1712950478
}
```

- **Token Expiry**: 7 days
- **Hashing Algorithm**: HS256

### Role-Based Access Control (RBAC)

| Role | Permissions |
|---|---|
| **Admin** | Full access to all features — CRUD on menu, orders, staff, inventory, expenses, reservations, feedback |
| **Staff** | Read access to menu, orders; can create orders and update order status; limited write access |

---

## 🛡️ Security Measures

| Measure | Implementation |
|---|---|
| **Password Hashing** | bcrypt with 12 salt rounds — passwords never stored in plaintext |
| **JWT Authentication** | Stateless tokens with 7-day expiry; no server-side session storage |
| **HTTP Security Headers** | Helmet.js sets XSS protection, MIME sniffing prevention, clickjacking protection, HSTS |
| **Rate Limiting** | Auth endpoints limited to 20 requests per 15 minutes per IP — prevents brute-force attacks |
| **CORS Policy** | Restricted to configured client origin (`http://localhost:5173`) |
| **Input Validation** | Server-side validation on all models (required fields, min/max values, enums) |
| **Password Hidden** | User password field uses `select: false` — excluded from all queries by default |
| **Request Size Limit** | JSON body limited to 1 MB — prevents payload abuse |
| **404 Catch-All** | Unmatched `/api/*` routes return structured 404 errors — no information leakage |
| **Global Error Handler** | Centralised error middleware catches and formats all unhandled errors |

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** ≥ 18.x — [Download](https://nodejs.org/)
- **npm** ≥ 9.x (comes with Node.js)
- **MongoDB Atlas** account (free tier) — [Sign up](https://www.mongodb.com/cloud/atlas)
- **Git** — [Download](https://git-scm.com/)

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/your-username/rms-pro.git
cd rms-pro

# 2. Install backend dependencies
npm install

# 3. Install frontend dependencies
cd client
npm install
cd ..

# 4. Configure environment variables
#    Copy .env.example to .env and fill in your values (see section below)

# 5. (Optional) Seed the database with sample data
npm run seed
```

### Running the Application

```bash
# Option A — Run both servers together (recommended)
npm run dev:full

# Option B — Run separately in two terminals
# Terminal 1 (Backend):
npm run dev

# Terminal 2 (Frontend):
cd client
npm run dev
```

### Access the Application

| Service | URL |
|---|---|
| 🌐 Frontend (React) | `http://localhost:5173` |
| 🔧 Backend API | `http://localhost:5000` |

---

## ⚙️ Environment Variables

Create a `.env` file in the project root with the following variables:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# MongoDB Atlas Connection String
MONGO_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/rms_pro?retryWrites=true&w=majority

# JWT Secret Key (use a strong, random string)
JWT_SECRET=your_super_secret_jwt_key_here

# React Dev Server Origin (for CORS)
CLIENT_URL=http://localhost:5173

# Razorpay Payment Gateway (optional — runs in demo mode if not configured)
# Get your keys from https://dashboard.razorpay.com/app/keys
RAZORPAY_KEY_ID=YOUR_RAZORPAY_KEY_ID
RAZORPAY_KEY_SECRET=YOUR_RAZORPAY_KEY_SECRET
```

> ⚠️ **Important**: Never commit the `.env` file to version control. It is already included in `.gitignore`.

---

## 📜 Available Scripts

### Root Level

| Script | Command | Description |
|---|---|---|
| `npm start` | `node server/index.js` | Start the production server |
| `npm run dev` | `nodemon server/index.js` | Start backend with hot-reload |
| `npm run client` | `cd client && npm run dev` | Start the React dev server only |
| `npm run dev:full` | `concurrently "npm run dev" "npm run client"` | Start both backend + frontend simultaneously |
| `npm run seed` | `node server/utils/seeder.js` | Seed the database with sample data |

### Client Level (`/client`)

| Script | Command | Description |
|---|---|---|
| `npm run dev` | `vite` | Start Vite dev server on port 5173 |
| `npm run build` | `vite build` | Create production build |
| `npm run preview` | `vite preview` | Preview production build locally |
| `npm run lint` | `eslint .` | Run ESLint code quality checks |

---

## 🖼️ Screenshots

> *Screenshots can be added here to showcase the UI — Login page, Dashboard, Menu management, Order flow, Kitchen display, Reports, etc.*

---

## 🔮 Future Enhancements

- [x] **Payment Integration** — ✅ Razorpay online payments + offline (Cash/Card/UPI) with refund support
- [ ] **Real-time Updates** — WebSocket integration (Socket.io) for live order status updates between waiter and kitchen
- [ ] **Multi-Restaurant Support** — Tenant-based architecture for managing multiple restaurant branches
- [ ] **Mobile App** — React Native companion app for waitstaff to take orders tableside
- [ ] **QR Code Ordering** — Customers scan a QR code to view the menu and place orders directly
- [ ] **Email Notifications** — Automated reservation confirmations and order receipts via email
- [ ] **Export to PDF/Excel** — Download reports, invoices, and sales data in standard formats
- [ ] **Dark/Light Theme Toggle** — User preference-based theme switching
- [ ] **PWA Support** — Progressive Web App for offline capabilities and home screen installation
- [ ] **Multi-language Support** — i18n for Hindi, English, and regional languages

---

## 📄 License

This project is developed as a **Final Year Academic Project** and is available for educational purposes.

---

<p align="center">
  Built with ❤️ using the <strong>MERN Stack</strong><br/>
  <em>MongoDB • Express.js • React • Node.js</em>
</p>
