# 🚀 GearUp Backend API

![Node.js](https://img.shields.io/badge/Node.js-24.x-green)
![Express](https://img.shields.io/badge/Express-5.x-black)
![TypeScript](https://img.shields.io/badge/TypeScript-6.x-blue)
![Prisma](https://img.shields.io/badge/Prisma-ORM-2D3748)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-17-blue)
![Stripe](https://img.shields.io/badge/Stripe-Payment-635BFF)
![License](https://img.shields.io/badge/License-MIT-green)

A production-ready RESTful Backend API for **GearUp**, a Sports & Outdoor Gear Rental Platform.

This project was developed as a backend assignment using **Node.js, Express.js, TypeScript, PostgreSQL, Prisma ORM, and Stripe**. It provides secure authentication, role-based authorization, gear rental management, Stripe payment integration, reviews, and administrative functionalities.

---

# 🌐 Live Links

## 🚀 Live API

https://gearup-backend-eight.vercel.app

## 📘 API Documentation

https://documenter.getpostman.com/view/51629043/2sBY4Mu1he

---

# ✨ Features

## 🔐 Authentication

- Register as Customer or Provider
- Secure Login with JWT Authentication
- Get Current User Profile
- Update Profile
- Change Password
- Role-Based Authorization
- Suspend User Login Protection

---

## 👤 Customer Features

- Browse available sports & outdoor gear
- Search and filter gear
- View gear details
- Place rental orders
- Secure payment using Stripe Checkout
- View payment history
- Track rental status
- Leave reviews after returning gear
- Manage profile

---

## 🏪 Provider Features

- Add gear
- Update gear
- Delete gear
- Manage inventory
- Manage stock availability
- View incoming rental orders
- Update rental status

---

## 👑 Admin Features

- View all users
- Suspend / Activate users
- View all gear listings
- View all rental orders
- Manage gear categories

---

## 💳 Payment Features

- Stripe Checkout Session
- Stripe Webhook
- Payment Status Tracking
- Transaction ID Storage
- Payment History

---

# 🛠 Tech Stack

## Backend

- Node.js
- Express.js
- TypeScript

## Database

- PostgreSQL
- Prisma ORM

## Authentication

- JWT
- bcrypt

## Validation

- Zod

## Payment

- Stripe

## Deployment

- Vercel

---

# 📂 Project Structure

```text
src
│
├── app
│   ├── config
│   ├── middlewares
│   ├── modules
│   │   ├── admin
│   │   ├── auth
│   │   ├── category
│   │   ├── gear
│   │   ├── payment
│   │   ├── rental
│   │   └── review
│   │
│   ├── routes
│   └── utils
│
├── app.ts
└── server.ts
```

---

# ⚙️ Installation

### Clone Repository

```bash
git clone https://github.com/md-jahirul-islam-tuku/gearup-backend.git
```

### Move to Project Folder

```bash
cd gearup-backend
```

### Install Dependencies

```bash
npm install
```

### Generate Prisma Client

```bash
npx prisma generate
```

### Run Database Migration

```bash
npx prisma migrate dev
```

### Seed Database

```bash
npm run seed
```

### Start Development Server

```bash
npm run dev
```

---

# 🔑 Environment Variables

Create a `.env` file in the project root and configure the following variables:

```env
PORT=5000

APP_URL="http://localhost:3000"

DATABASE_URL="YOUR_DATABASE_URL_HERE"

JWT_ACCESS_SECRET="YOUR_JWT_ACCESS_SECRET"

JWT_ACCESS_EXPIRES_IN="1d"

JWT_REFRESH_SECRET="YOUR_JWT_REFRESH_SECRET"

JWT_REFRESH_EXPIRES_IN="7d"

BCRYPT_SALT_ROUNDS=10

STRIPE_SECRET_KEY=YOUR_STRIPE_SECRET_KEY

STRIPE_WEBHOOK_SECRET=YOUR_STRIPE_WEBHOOK_SECRET
```

---

# 📦 Available Scripts

| Command            | Description                     |
| ------------------ | ------------------------------- |
| `npm run dev`      | Run development server          |
| `npm run build`    | Build the project               |
| `npm start`        | Start production server         |
| `npm run seed`     | Seed demo data                  |
| `npm run lint`     | Run ESLint                      |
| `npm run lint:fix` | Automatically fix ESLint issues |
| `npm run format`   | Format code using Prettier      |

---

# 📚 API Endpoints

## 🔐 Authentication

| Method | Endpoint                    | Description                    |
| ------ | --------------------------- | ------------------------------ |
| POST   | `/api/auth/register`        | Register new customer/provider |
| POST   | `/api/auth/login`           | Login user                     |
| GET    | `/api/auth/me`              | Get authenticated user         |
| PATCH  | `/api/auth/me`              | Update profile                 |
| PATCH  | `/api/auth/change-password` | Change password                |

---

## 🏷 Categories

| Method | Endpoint              | Description             |
| ------ | --------------------- | ----------------------- |
| GET    | `/api/categories`     | Get all categories      |
| POST   | `/api/categories`     | Create category (Admin) |
| PATCH  | `/api/categories/:id` | Update category (Admin) |
| DELETE | `/api/categories/:id` | Delete category (Admin) |

---

## 🏕 Gear

| Method | Endpoint         | Description            |
| ------ | ---------------- | ---------------------- |
| GET    | `/api/gears`     | Get all gear           |
| GET    | `/api/gears/:id` | Get gear details       |
| POST   | `/api/gears`     | Add gear (Provider)    |
| PATCH  | `/api/gears/:id` | Update gear (Provider) |
| DELETE | `/api/gears/:id` | Delete gear (Provider) |

---

## 📦 Rental Orders

| Method | Endpoint           | Description         |
| ------ | ------------------ | ------------------- |
| POST   | `/api/rentals`     | Create rental order |
| GET    | `/api/rentals`     | Get user rentals    |
| GET    | `/api/rentals/:id` | Get rental details  |

---

## 💳 Payments

| Method | Endpoint                 | Description                    |
| ------ | ------------------------ | ------------------------------ |
| POST   | `/api/payments/checkout` | Create Stripe Checkout Session |
| POST   | `/api/payments/webhook`  | Stripe Webhook                 |
| GET    | `/api/payments`          | Get payment history            |
| GET    | `/api/payments/:id`      | Get payment details            |

---

## ⭐ Reviews

| Method | Endpoint       | Description   |
| ------ | -------------- | ------------- |
| POST   | `/api/reviews` | Create review |

---

## 👑 Admin

| Method | Endpoint               | Description             |
| ------ | ---------------------- | ----------------------- |
| GET    | `/api/admin/users`     | Get all users           |
| PATCH  | `/api/admin/users/:id` | Suspend / Activate user |
| GET    | `/api/admin/gears`     | Get all gear            |
| GET    | `/api/admin/rentals`   | Get all rentals         |

---

# 🌱 Seed Data

The project includes a seed script that creates demo data for testing.

### Demo Users

| Role        | Email               | Password     |
| ----------- | ------------------- | ------------ |
| 👑 Admin    | admin@gearup.com    | Admin123@    |
| 🏪 Provider | provider@gearup.com | Provider123@ |
| 👤 Customer | customer@gearup.com | Customer123@ |

Run the seed command:

```bash
npm run seed
```

The seed script creates:

- 1 Admin
- 1 Provider
- 1 Customer
- 5 Categories
- Demo Gear Items

---

# 📌 API Response Format

## Success Response

```json
{
  "success": true,
  "message": "Request completed successfully.",
  "data": {}
}
```

## Error Response

```json
{
  "success": false,
  "message": "Validation Error",
  "errorDetails": {}
}
```

The project uses a consistent JSON response format across all endpoints.

---

# 🔒 Security Features

- JWT Authentication
- Role-Based Authorization
- Password Hashing using bcrypt
- Protected Routes
- Server-side Input Validation with Zod
- Global Error Handler
- Stripe Webhook Signature Verification
- Suspended User Access Protection

---

# ✅ Assignment Requirements Completed

- RESTful API Design
- PostgreSQL Database
- Prisma ORM
- JWT Authentication
- Role-Based Authorization
- CRUD Operations
- Sports Gear Rental Management
- Stripe Payment Integration
- Stripe Webhook
- Payment Status Tracking
- Review System
- Admin Dashboard APIs
- Category Management
- Input Validation
- Structured Error Responses
- Seed Script
- API Documentation
- Live Deployment

---

# 🚀 Deployment

**Live API**

https://gearup-backend-eight.vercel.app

**Platform**

- Vercel

---

# 👨‍💻 Author

**Md. Jahirul Islam Tuku**

GitHub: https://github.com/md-jahirul-islam-tuku

---

# 📄 License

This project was developed for educational purposes as part of a backend assignment.

---

## ⭐ If you found this project helpful, consider giving it a star on GitHub!
