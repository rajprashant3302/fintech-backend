# 🚀 FinTech RBAC API (Financial Records Management System)

![Node.js](https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node.js&logoColor=white)
![Express.js](https://img.shields.io/badge/Express.js-404D59?style=for-the-badge)
![MongoDB](https://img.shields.io/badge/MongoDB-4EA94B?style=for-the-badge&logo=mongodb&logoColor=white)
![JWT](https://img.shields.io/badge/JWT-black?style=for-the-badge&logo=JSON%20web%20tokens)

A robust, secure, and highly optimized Node.js RESTful API designed for financial transaction management. This backend features comprehensive Role-Based Access Control (RBAC), stateless JWT authentication, MongoDB Aggregation pipelines for complex analytics, and enterprise-grade security middleware.

## 🛠️ Tech Stack
* **Runtime:** Node.js
* **Framework:** Express.js
* **Database:** MongoDB & Mongoose (ODM)
* **Authentication:** JSON Web Tokens (JWT) & bcryptjs
* **Security:** express-rate-limit

---


## ⚙️ Setup & Installation

### 📥 1. Clone the Repository
```bash
git clone https://github.com/rajprashant3302/fintech-backend.git

📂 2. Navigate to Project Folder
cd fintech-backend

📦 3. Install Dependencies
npm install

▶️ 4. Start the Server
npm start


🌐 Environment Variables

Create a .env file in the root directory:

PORT=5000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key

🌍 Base URL
http://localhost:5000

## 📂 Architecture & File Structure

This project strictly follows the **MVC (Model-View-Controller)** design pattern to ensure separation of concerns, scalability, and maintainable code.

```text
├── src/
│   ├── config/
│   │   └── connectDB.js                  # MongoDB connection setup
│   ├── controllers/
│   │   ├── adminTransactionController.js      #add , edit , delete transactions
│   │   ├── analyticsController.js      # get full analytics
│   │   ├── authController.js      # Registration & Login logic
│   │   ├── manageUserController.js     # User management (block, update roles)
│   │   ├── userTransactionController.js # add , modify , delete , get transactions
│   │   ├── userDashboardController.js # Full CRUD & Dashboard Analytics
│   ├── middlewares/
│   │   ├── verifyToken.js         # Decodes and validates JWTs
│   │   ├── authorizeUserRole.js   # RBAC logic (restricts routes by role)
│   │   ├── globalRateLimiter.js   # Rate limiting to prevent abuse
│   │   └── apiLimiter.js          # Rate limiting to prevent abuse
│   ├── models/
│   │   ├── userModel.js           # User schema definition
│   │   └── transactionModel.js    # Financial record schema definition
│   ├── routes/
│   │   ├── authRoutes.js          # Public authentication routes
│   │   ├── dashboardRoutes.js         # Protected  routes
│   │   ├── manageAdminTransactionRoutes.js         # Protected admin-only routes
│   │   ├── manageTransactionRoutes.js         # Protected  routes
│   │   └── manageUserRoutes.js   # Protected CRUD and analytics routes
│   └── utils/
│       └── generateToken.js       # JWT signing utility
├── .env                           # Environment variables (Secrets, URIs)
├── .env.example                           # Environment variables (Secrets, URIs)
├── index.js                       # Entry point & Server configuration
└── README.md                      # Project documentation

```
---

## 💾 Database Schemas (MongoDB / Mongoose)

### 1. User Model (userModel.js)
Handles authentication credentials and role assignments.

```text
name: String.
email: String, unique, indexed for fast login.
password: String, hashed via bcryptjs before saving.
role: String, Enum restricted to ['viewer', 'analyst', 'admin']. Defaults to viewer.
status: String, Enum ['active', 'inactive']. Used for soft-blocking users.

```

### 2. Transaction Model (transactionModel.js)
Designed specifically for accurate financial tracking and fast dashboard aggregations.

```text
userId: ObjectId, references the User model.
amount: Decimal128 (Crucial for exact financial math, preventing floating-point errors).
type: Enum ['income', 'expense'].
category: Enum (e.g., food, rent, salary,education,clothing,others,none).
isDeleted: Boolean. Defaults to false. Implements the Soft Delete pattern.
Indexes: Utilizes a compound index on { userId: 1, transactionDate: -1, type: 1 } to guarantee lightning-fast filtering and aggregation.

```

### 🔒 Security & Authentication
**Token Generation (generateToken.js)**
Uses jsonwebtoken to sign a stateless token containing the user's userId and role. Signed with a secure .env secret and set to expire in 1 day to limit the lifespan of compromised tokens.

**Token Verification (verifyToken.js)**
An Express middleware that intercepts incoming requests, extracts the Bearer token from the Authorization header, verifies the cryptographic signature, and injects the decoded req.user object into the request pipeline.

**Role-Based Access Control (authorizeUserRole.js)**
A Higher-Order Function middleware that enforces authorization.
Usage: authorizeRole('admin', 'analyst')

It checks the req.user.role against the allowed array.
If unauthorized, it immediately returns a 403 Forbidden response, protecting sensitive controllers from being executed.

**Rate Limiting (apiLimiter.js)**
Utilizes express-rate-limit to protect the server from Brute Force and DDoS attacks.

globalLimiter: Applied to the entire Express app (e.g., max 1000 requests per minutes per IP).

apiLimiter: A stricter limiter applied to sensitive routes like /login or /register  to prevent spamming the database.

### 🧠 Controller Logic & Advanced Features
**1. Dynamic Query Filtering (getRecords)**
Instead of hardcoding database requests, the read controller dynamically constructs a MongoDB query object based on req.query parameters. It securely defaults to req.user.userId to prevent horizontal data leaks, while allowing Admins to pass a userId query to view specific user data.

**2. Soft Deletes (deleteRecord)**
Financial ledgers require strict audit trails. Deleting a transaction updates the isDeleted flag to true rather than dropping the document. Read controllers natively filter out isDeleted: true records.

**3. Business Logic Validation & Race Condition Handling**
When logging an expense, the API calculates the user's real-time Net Balance. If the expense exceeds their balance, the request is blocked. To prevent TOCTOU (Time-of-Check to Time-of-Use) race conditions during concurrent requests, the creation logic is wrapped in a MongoDB ACID Transaction (session.startTransaction()).

**4. Optimized Analytics via $facet (getDashboardSummary)**
The dashboard requires Net Balance, Category Totals, and Recent Activity. Rather than executing multiple await calls that slow down the server, the controller utilizes MongoDB's $facet operator to run multiple aggregation pipelines in a single database call.

# 🌐 API Routing Table

This document provides an overview of all available API endpoints, their access levels, and descriptions.

## 🔐 Authentication Routes

| Method | Endpoint              | Access  | Description                          |
|--------|---------------------|--------|--------------------------------------|
| POST   | /api/auth/register  | Public | Register a new user account          |
| POST   | /api/auth/login     | Public | Authenticate user and return JWT     |

---

## 👨‍💼 Admin Routes

| Method | Endpoint                        | Access | Description                                      |
|--------|--------------------------------------------|--------|--------------------------------------------------|
| GET    | /api/admin/all-users?page=1?limit=10       | Admin  | Retrieve paginated list of all users             |
| GET    | /api/admin/search?q=email                  | Admin  | Search users by name or email (Regex)            |
| PATCH  | /api/admin/update-role                     | Admin  | Promote or demote user roles                    |
| PATCH  | /api/admin/block-user                      | Admin  | Deactivate a user account                        |
| GET    | /api/admin/transactions/all/pae=1&limit=10 | Admin  | Get all platform transactions (Dynamic Filters)  |

---

## 💰 Transaction Routes

| Method | Endpoint                           | Access        | Description                                      |
|--------|------------------------------------|--------------|--------------------------------------------------|
| POST   | /api/trans/my/add                  | User         | Create a transaction (ACID Balance Check)        |

|        | /api/trans/my?type=expense&        |              |                                                  |
| GET    | category=food&startDate=2026-04-01 | User         | Get personal transactions (Dynamic Filters)      |
|        | &endDate=2026-04-04&page=1&limit=10|              |                                                  |

| PATCH  | /api/trans/my/update/:id           | User         | Partially update a transaction record            |
| DELETE | /api/trans/my/delete/:id           | User         | Soft delete a transaction                        |
| POST   | /api/admin/trans/add               | Admin        | Create any transaction (ACID Balance Check)      |

|        | /api/trans/my?type=expense&        |              |                                                  |
| GET    | category=food&startDate=2026-04-01 | Admin        | Get personal transactions (Dynamic Filters)      |
|        | &endDate=2026-04-04&page=1&limit=10|              |                                                  |

| PATCH  | /api/admin/trans/update/:id        | Admin        | Partially update any transaction record          |
| DELETE | /api/admin/trans/delete/:id        | Admin        | Soft delete any transaction                      |

---

## 📊 Dashboard & Analytics

| Method | Endpoint                             | Access            | Description                                 |
|--------|--------------------------------------|-------------------|---------------------------------------------|
| GET    | /api/dashboard/my                    | User              | Get personal financial analytics            |
| GET    | /api/dashboard/analytics             | Admin / Analyst   | Get global platform analytics               |

---

## 📌 Notes

- 🔑 **JWT Authentication** is required for all protected routes.
- 🛡️ Role-based access control is enforced (`user`, `admin`, `analyst`).
- 🔄 Supports **dynamic filtering**, **pagination**, and **regex search**.
- 💾 Transactions follow **ACID properties** for consistency and reliability.
- 🧮 Accurate calculations using Decimal128

---



# 🧠 Backend Controllers Documentation

This section provides a detailed explanation of all backend controllers, their responsibilities, and internal logic.

---

## 🔐 1. Authentication Controllers (`authController.js`)

### 📝 registerUser

**Validation**
- Ensures all required fields are provided.
- Validates the requested role against an allowed list.

**Security**
- Checks if the email already exists to prevent duplicate accounts.
- Uses `bcrypt.hash()` with salt rounds = 10 to securely hash passwords before storing.

---

### 🔑 loginUser

**Verification**
- Fetches user by email (explicitly selecting the hidden password field).
- Uses `bcrypt.compare()` to verify password correctness.

**Access Control**
- Checks if the user's status is `inactive` (blocked).
- Returns **403 Forbidden** if the account is blocked.

**Tokenization**
- Generates a stateless **JWT** containing:
  - `userId`
  - `role`

---

## 👨‍💼 2. Admin Management Controllers (`adminController.js`)

### 📄 listUsers

- Implements efficient pagination using:
  - `.skip()`
  - `.limit()`
- Uses `Promise.all()` to:
  - Fetch users
  - Run `countDocuments()` in parallel
- Returns total pages for frontend pagination.

---

### 🚫 blockUser

- Implements **soft-blocking**:
  - Updates `status` → `inactive`
- Prevents login without deleting user data.

---

### 🔄 updateRole

- Validates role against:
- Dynamically updates user permissions.
- Enables real-time **Role-Based Access Control (RBAC)**.

---

### 🔍 searchUser

- Uses MongoDB query:
- `$or` operator
- Case-insensitive regex:
  ```js
  new RegExp('^search', 'i')
  ```
- Searches users by:
- Name
- Email

---

## 💰 3. Transaction Controllers (`transactionController.js`)

### 🏛️ Architecture Note: Immutability

> In real-world fintech systems, transactions are **append-only** (never updated or deleted).  
> However, for this project, full CRUD functionality is implemented.

---

### ➕ addRecord / addMyRecord (Create)

**Data Conversion**
- Converts amounts to MongoDB `Decimal128`
- Prevents floating-point precision errors.

**ACID Transactions**
- Uses `mongoose.startSession()`
- Ensures atomic operations.

**Balance Check**
- Uses `$aggregate` to calculate current balance.
- If expense > balance:
- `session.abortTransaction()`
- Prevents invalid spending.

---

### 📖 getAllRecords / getMyRecords (Read)

**Dynamic Filtering**
- Builds query object dynamically:
- `type`
- `category`
- `date range ($gte / $lte)`
- Ensures:
- Users can only access their own data.

---

### ✏️ updateRecord (Update)

- Uses `$set` for partial updates.
- Re-validates:
- Amount
- Category
- Ensures only intended fields are modified.

---

### 🗑️ deleteRecord (Delete)

**Soft Delete Pattern**
- Sets:
```js
isDeleted: true



