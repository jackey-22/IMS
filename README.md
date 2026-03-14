# IMS — Inventory Management System

> **Live Demo:** [https://ims-0nmu.onrender.com](https://ims-0nmu.onrender.com)

A full-stack, role-based **Inventory Management System** built for real warehouse operations. It covers stock tracking, receipts, deliveries, internal transfers, a stock ledger, reports with PDF export, real-time in-app notifications, and full user management.

---

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Roles & Permissions](#roles--permissions)
- [Getting Started (Local)](#getting-started-local)
- [Environment Variables](#environment-variables)
- [Deployment (Render)](#deployment-render)
- [API Reference](#api-reference)
- [Data Models](#data-models)
- [Notifications](#notifications)

---

## Features

| Area | Capabilities |
|------|-------------|
| **Auth** | Register, Login, Password reset via OTP, JWT sessions |
| **Products** | CRUD, SKU, UOM, reorder point/qty, category |
| **Warehouses** | Multi-warehouse with named sub-locations |
| **Stock** | Live on-hand balance, free-to-use quantity, per-warehouse drill-down |
| **Receipts** | Create → Confirm flow; stock added on confirmation |
| **Deliveries** | Create → Confirm flow; stock deducted on confirmation |
| **Transfers** | Internal warehouse-to-warehouse / location-to-location moves |
| **Stock Ledger** | Full audit trail with filters (type, warehouse, location, product, date range), CSV export |
| **Reports** | Product Movement, Warehouse Distribution, Monthly Trend, PDF generation with filters |
| **Notifications** | Real-time in-app alerts: new receipts, deliveries, transfers (all staff) + new user signups (admins) |
| **User Management** | Admin can create/deactivate users, assign roles, reset passwords |

---

## Tech Stack

### Frontend (`/client`)
| Package | Version | Purpose |
|---------|---------|---------|
| React | 18 | UI framework |
| React Router DOM | 7 | SPA routing |
| Vite | 5 | Build tool & dev server |
| Tailwind CSS | 3 | Utility-first styling |
| Recharts | 3 | Charts in reports |
| Lucide React | 0.577 | Icon set |

### Backend (`/server`)
| Package | Version | Purpose |
|---------|---------|---------|
| Express | 4 | HTTP server & routing |
| Mongoose | 8 | MongoDB ODM |
| JSON Web Token | 9 | Stateless auth |
| bcryptjs | 2 | Password hashing |
| Nodemailer | 6 | OTP email delivery |
| dotenv | 16 | Environment config |
| cors | 2 | Cross-origin requests |

---

## Project Structure

```
IMS/
├── client/                     # React frontend (Vite)
│   ├── public/
│   ├── src/
│   │   ├── components/         # Shared UI components
│   │   ├── context/            # React context providers
│   │   │   ├── AuthContext.jsx
│   │   │   ├── InventoryOpsContext.jsx
│   │   │   └── NotificationsContext.jsx
│   │   ├── pages/
│   │   │   ├── auth/           # Login, Register, Reset Password
│   │   │   └── inventory/      # Dashboard, Products, Stock, Receipts,
│   │   │                       # Deliveries, Transfers, StockLedger,
│   │   │                       # Reports, Warehouses, Users
│   │   └── services/           # API client modules
│   │       ├── apiBase.js      # Central backend URL resolver
│   │       ├── authApi.js
│   │       ├── operationsApi.js
│   │       ├── productsApi.js
│   │       ├── warehousesApi.js
│   │       ├── categoriesApi.js
│   │       ├── usersApi.js
│   │       ├── dashboardApi.js
│   │       ├── profileApi.js
│   │       └── notificationsApi.js
│   ├── .env                    # Local env (VITE_BACKEND_URL)
│   └── vite.config.js
│
└── server/                     # Express backend
    └── src/
        ├── config/db.js        # MongoDB connection
        ├── middleware/auth.js  # JWT verify + requireRole
        ├── models/             # Mongoose schemas
        │   ├── User.js
        │   ├── Product.js
        │   ├── Category.js
        │   ├── Warehouse.js
        │   ├── InventoryDoc.js
        │   ├── StockBalance.js
        │   ├── StockLedger.js
        │   ├── Notification.js
        │   └── PasswordResetOtp.js
        ├── routes/             # Express routers
        │   ├── auth.js
        │   ├── operations.js   # Stock, Receipts, Deliveries, Transfers
        │   ├── products.js
        │   ├── warehouses.js
        │   ├── categories.js
        │   ├── users.js
        │   ├── profile.js
        │   ├── notifications.js
        │   └── dashboard.js
        └── index.js
```

---

## Roles & Permissions

| Action | `admin` | `inventory_manager` | `warehouse_staff` |
|--------|:-------:|:-------------------:|:-----------------:|
| View stock / ledger | ✅ | ✅ | ✅ |
| Create receipt / delivery | ✅ | ✅ | ❌ |
| Confirm receipt / delivery / transfer | ✅ | ✅ | ✅ |
| Create internal transfer |  ❌ | ✅ | ❌ |
| Add / edit products | ✅ | ✅ | ❌ |
| Manage warehouses | ✅ | ❌ | ❌ |
| Manage users | ✅ | ❌ | ❌ |
| View notifications | ✅ | ✅ | ✅ |
| Receive "new user signup" alert | ✅ | ❌ | ❌ |

---

## Getting Started (Local)

### Prerequisites
- Node.js ≥ 18
- MongoDB (local instance or Atlas cluster)
- A Gmail account for OTP emails (or any SMTP provider)

### 1 — Clone & install

```bash
git clone <your-repo-url>
cd IMS

# Install server dependencies
cd server && npm install

# Install client dependencies
cd ../client && npm install
```

### 2 — Configure environment variables

#### `server/.env`
```env
PORT=4000
MONGODB_URI=mongodb://localhost:27017/ims
JWT_SECRET=your_super_secret_key_here
OTP_TTL_MINUTES=15

# Nodemailer (Gmail example)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=you@gmail.com
SMTP_PASS=your_app_password
SMTP_FROM="IMS System <you@gmail.com>"
```

#### `client/.env`
```env
# In local dev, Vite proxies /api/* automatically.
# Set this to your backend origin only if NOT using the Vite proxy.
VITE_BACKEND_URL=http://localhost:4000
```

### 3 — Run

```bash
# Terminal 1 — backend
cd server
npm run dev        # nodemon watches for changes

# Terminal 2 — frontend
cd client
npm run dev        # Vite dev server on http://localhost:5173
```

Open [http://localhost:5173](http://localhost:5173).  
Register the first user — they will be assigned the default role (`inventory_manager`).  
Use the admin panel to promote them to `admin` if needed, or seed an admin directly in MongoDB.

---

## Environment Variables

### Server

| Variable | Required | Description |
|----------|:--------:|-------------|
| `PORT` | ✅ | Express listen port (default `4000`) |
| `MONGODB_URI` | ✅ | Full MongoDB connection string |
| `JWT_SECRET` | ✅ | Secret used to sign/verify JWTs. Keep this long and random. |
| `OTP_TTL_MINUTES` | ❌ | Expiry for password-reset OTPs (default `15`) |
| `SMTP_HOST` | ✅ | SMTP server hostname |
| `SMTP_PORT` | ✅ | SMTP server port (`587` for TLS, `465` for SSL) |
| `SMTP_USER` | ✅ | SMTP login username |
| `SMTP_PASS` | ✅ | SMTP login password / app password |
| `SMTP_FROM` | ❌ | Sender display name + address |

### Client (Vite — must be prefixed `VITE_`)

| Variable | Required | Description |
|----------|:--------:|-------------|
| `VITE_BACKEND_URL` | ✅ in production | Full URL of the backend (e.g. `https://ims-api.onrender.com`). In local dev, Vite's proxy makes this optional. |

---

## Deployment (Render)

This project is deployed on [Render](https://render.com) as two separate services.

### Backend (Web Service)

| Setting | Value |
|---------|-------|
| **Root Directory** | `server` |
| **Build Command** | `npm install` |
| **Start Command** | `npm start` |
| **Environment** | Add all variables from the [Server env table](#server) above |

### Frontend (Static Site)

| Setting | Value |
|---------|-------|
| **Root Directory** | `client` |
| **Build Command** | `npm install && npm run build` |
| **Publish Directory** | `dist` |
| **Environment** | `VITE_BACKEND_URL=https://<your-backend-service>.onrender.com` |

> **Important:** Add a rewrite rule so the SPA works on direct URL access:
> - Source: `/*`
> - Destination: `/index.html`
> - Action: **Rewrite**

### Live URLs
| Service | URL |
|---------|-----|
| Frontend | [https://ims-0nmu.onrender.com](https://ims-0nmu.onrender.com) |

---

## API Reference

All routes are prefixed with `/api`. Protected routes require:
```
Authorization: Bearer <token>
```

### Auth — `/api/auth`
| Method | Path | Auth | Description |
|--------|------|:----:|-------------|
| POST | `/register` | ❌ | Create new user |
| POST | `/login` | ❌ | Login, returns JWT |
| POST | `/password-reset/request` | ❌ | Send OTP to email |
| POST | `/password-reset/confirm` | ❌ | Confirm OTP + new password |

### Products — `/api/products`
| Method | Path | Roles | Description |
|--------|------|-------|-------------|
| GET | `/` | All | List products (supports `?q=`, `?categoryId=`, `?isActive=`) |
| GET | `/:id` | All | Get single product |
| POST | `/` | admin, manager | Create product |
| PUT | `/:id` | admin, manager | Update product |
| DELETE | `/:id` | admin, manager | Delete product |

### Operations — `/api/operations`
| Method | Path | Roles | Description |
|--------|------|-------|-------------|
| GET | `/stock` | All | Aggregated on-hand per product |
| GET | `/stock-ledger` | All | Full audit trail |
| GET | `/receipts` | All | List receipts |
| POST | `/receipts` | admin, manager | Create receipt |
| PUT | `/receipts/:id/confirm` | All | Confirm receipt (adds stock) |
| GET | `/deliveries` | All | List deliveries |
| POST | `/deliveries` | admin, manager | Create delivery |
| PUT | `/deliveries/:id/confirm` | All | Confirm delivery (deducts stock) |
| GET | `/transfers` | All | List transfers |
| POST | `/transfers` | admin, manager | Create internal transfer |
| PUT | `/transfers/:id/confirm` | All | Confirm transfer |

### Warehouses — `/api/warehouses`
| Method | Path | Description |
|--------|------|-------------|
| GET | `/` | List all warehouses |
| POST | `/` | Create warehouse |
| PUT | `/:id` | Update warehouse |
| DELETE | `/:id` | Delete warehouse |
| POST | `/:id/locations` | Add sub-location |
| PUT | `/:id/locations/:lid` | Update location |
| DELETE | `/:id/locations/:lid` | Remove location |

### Notifications — `/api/notifications`
| Method | Path | Description |
|--------|------|-------------|
| GET | `/` | List my notifications |
| PUT | `/:id/read` | Mark one as read |
| PUT | `/read-all` | Mark all as read |

### Other
- `GET /api/categories` — list categories
- `GET /api/dashboard/stats` — summary counts for dashboard
- `GET /api/users` — list users (admin only)
- `GET /api/profile/me` — current user profile
- `GET /api/health` — health check

---

## Data Models

```
User          — name, loginId, email, passwordHash, role, isActive
Product       — name, sku, categoryId, uom, initialStock, reorderPoint, reorderQty
Category      — name, description
Warehouse     — name, code, locations[]
InventoryDoc  — type, documentNo, status, lines[], warehouses, createdBy, validatedBy
StockBalance  — productId, warehouseId, locationId, qtyOnHand, qtyReserved
StockLedger   — productId, warehouseId, locationId, documentId, type, qtyIn, qtyOut, balanceAfter
Notification  — userId, title, message, type, link, readAt
PasswordResetOtp — userId, otp, expiresAt
```

---

## Notifications

The system creates in-app notifications automatically:

| Event | Recipients |
|-------|-----------|
| New Receipt created | All staff (admin, manager, warehouse_staff) |
| New Delivery created | All staff |
| New Internal Transfer created | All staff |
| New User registered | Admins only |

Notifications are polled every **30 seconds** on the client. Unread count is shown in the top navigation bar.

---

## License

MIT — feel free to use, fork, and improve.
