# Himig — Music & Merch Marketplace Backend API

**Course:** ITEC 116 — IT Elective 4 (Systems Integration and Architecture 2)  
**Author:** Beia Ann E. Rodriguez  

## Project Overview

**Himig** is a Philippines-centric e-commerce and peer-to-peer trading RESTful backend API built for physical music albums, vinyl records, cassette tapes, photocards, and official artist merchandise across OPM, K-pop, J-pop, Western pop, and rock. The platform supports direct buy-and-sell transactions (with payment verification and courier shipment tracking), item-for-item collector trades, real-time direct messaging, and verified post-order seller reviews.

---

## Technology Stack

| Component | Technology |
| :--- | :--- |
| **Backend Framework** | NestJS (TypeScript) |
| **ORM** | TypeORM |
| **Database** | MySQL (`utf8mb4`) |
| **Authentication & Security** | Passport-JWT, Role-Based Access Control (RBAC), `bcrypt`, `class-validator` |
| **API Testing** | Postman |
| **Version Control** | Git & GitHub |

---

## Database Schema & Modules

The backend implements **9 feature modules** backed by **8 normalized MySQL entities** with foreign-key constraints and check rules:

1. **Auth & Users (`users`):** Account registration, JWT login, profile retrieval, and role management (`user`, `admin`).
2. **Products (`products`):** Music/merchandise listings with artist, category, condition, pricing, and status lifecycle (`Available`, `Reserved`, `Sold`, `Traded`).
3. **Orders (`orders`):** Purchase order creation with automatic product reservation and self-purchase prevention.
4. **Payments (`payments`):** Payment submission (`GCash`, `Maya`, `Bank Transfer`, etc.) that automatically confirms pending orders.
5. **Shipments (`shipments`):** Courier tracking (e.g., J&T Express, LBC) and delivery confirmation that transitions orders to `Completed` and products to `Sold`.
6. **Trades (`trades`):** Item-for-item trade proposals between collectors with transactional product reservation upon acceptance.
7. **Messages (`messages`):** Direct user-to-user messaging and chronological conversation threads.
8. **Reviews (`reviews`):** Verified 1–5 star ratings and comments restricted to completed orders, plus aggregated seller rating calculation.

---

## Local Setup & Installation

### 1. Prerequisites
* **Node.js** (v18 or higher) and **npm**
* **MySQL** (v8.0 or higher)

### 2. Clone & Install Dependencies
```bash
git clone <https://github.com/beia-rodriguez/Himig-FinalProject.git>
cd himig-backend
npm install