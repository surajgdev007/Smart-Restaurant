# 🍽️ Smart Restaurant Digital Menu & Ordering System

> **Final Year College Project** – A complete full-stack digital restaurant menu system with QR table ordering, real-time order tracking, and online payment.

---

## 🚀 Features

### 👤 Customer
- Scan QR code → Menu opens with table number auto-detected
- Browse menu by category, search, veg/non-veg filter
- Add to cart with quantity controls
- Checkout with Razorpay payment (test mode)
- Real-time order tracking (Socket.io)

### 🔐 Admin Panel
- Secure JWT login
- Dashboard with stats + revenue charts
- Full CRUD for Menu Items (with image upload)
- Category Management
- Table Management (auto-generates QR codes)
- Order Management with one-click status updates
- Reports & Analytics with charts

---

## 🛠️ Tech Stack

| Layer | Tech |
|---|---|
| Frontend | React 18 + Vite + Tailwind CSS |
| Backend | Node.js + Express.js |
| Database | MongoDB + Mongoose |
| Auth | JWT |
| Payment | Razorpay (test mode) |
| Real-time | Socket.io |
| Images | Multer (local) |
| Charts | Recharts |

---

## 📂 Project Structure

```
digital-restaurant/
├── client/          ← React Frontend (port 5173)
└── server/          ← Express Backend (port 5000)
```

---

## ⚙️ Setup Instructions

### Prerequisites
- Node.js v18+
- MongoDB (local) or MongoDB Atlas URI
- Razorpay test account (free at razorpay.com)

---

### 1️⃣ Clone / Open Project

```
cd digital-restaurant
```

---

### 2️⃣ Setup Backend

```bash
cd server
npm install
```

Edit `.env`:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/smart_restaurant
JWT_SECRET=your_secret_key_here
RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxx
RAZORPAY_KEY_SECRET=your_razorpay_secret
CLIENT_URL=http://localhost:5173
```

> **Razorpay Test Keys**: Sign up free at [dashboard.razorpay.com](https://dashboard.razorpay.com) → Settings → API Keys → Generate Test Key

**Seed the database** (creates admin user + 30 menu items + 10 tables):
```bash
npm run seed
```

**Start backend**:
```bash
npm run dev
```

---

### 3️⃣ Setup Frontend

```bash
cd ../client
npm install
npm run dev
```

---

### 4️⃣ Access the App

| URL | Page |
|---|---|
| `http://localhost:5173` | Landing Page |
| `http://localhost:5173/menu?table=1` | Customer Menu (Table 1) |
| `http://localhost:5173/admin/login` | Admin Login |

**Admin Credentials** (after seeding):
- Email: `admin@restaurant.com`
- Password: `admin123`

---

## 📱 QR Code Flow

1. Admin creates tables in Admin Panel → Table Management
2. QR codes are auto-generated (encoded URL: `/menu?table=N`)
3. Download & print QR codes → place on tables
4. Customer scans QR → menu opens with table number set
5. Customer orders → payment → order appears in admin dashboard
6. Admin updates status → customer sees live updates

---

## 💳 Razorpay Test Payment

Use these test card details in Razorpay:
- Card: `4111 1111 1111 1111`
- Expiry: Any future date
- CVV: Any 3 digits
- OTP: `1234`

---

## 🗄️ Database Schema

### Collections
- **Users** – Admin accounts
- **Categories** – Menu sections (Starters, Pizza, etc.)
- **MenuItems** – Food items with price, image, availability
- **Tables** – Restaurant tables with QR codes
- **Orders** – Customer orders with status lifecycle
- **Payments** – Razorpay transaction records

---

## 🔌 API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/login` | Admin login |
| GET | `/api/menu` | Get menu items |
| POST | `/api/menu` | Add menu item (admin) |
| PUT | `/api/menu/:id` | Update item (admin) |
| DELETE | `/api/menu/:id` | Delete item (admin) |
| GET | `/api/categories` | Get categories |
| GET | `/api/tables` | Get all tables |
| POST | `/api/tables` | Create table + QR |
| POST | `/api/orders` | Place order |
| GET | `/api/orders` | Get orders (admin) |
| PUT | `/api/orders/:id/status` | Update order status |
| POST | `/api/payments/create-order` | Create Razorpay order |
| POST | `/api/payments/verify` | Verify payment |
| GET | `/api/orders/stats` | Dashboard stats |

---

## 👥 Team

Final Year Project – [Your College Name]

---

## 📄 License

MIT License – Free to use for academic purposes.
