# SoftKey Store - Enterprise Production Deployment Guide

This comprehensive guide details the unified architecture, file structures, database setup, and advanced security protocols of the **SoftKey Store** digital license & hardware e-commerce platform.

---

## 1. Complete Unified Project Structure

The project implements a full-stack SPA architecture utilizing a high-performance **Express API Gateway Server** on the backend, and a reactive **Vite-bundled React TypeScript client** on the frontend.

```text
├── server.ts                       # Full-Stack API Gateway (JWT, Security Middlewares, Razorpay & SMS Gateways)
├── package.json                    # Native TSX runtime script, ESBuild production server compiler, Node dependencies
├── tsconfig.json                   # TypeScript configuration
├── vite.config.ts                  # Client asset build pipeline
├── index.html                      # Root HTML shell
├── .env.example                    # Template for secure runtime credentials & environment configurations
├── supabase_schema.sql             # Production-grade PostgreSQL schema with Indexes, Triggers, and 15+ RLS Policies
├── users_db.json                   # Persistent JSON flat-file storage mapping users, carts, and order rows (fallback)
│
└── src/                            # React Single-Page Frontend Source
    ├── main.tsx                    # Client-side bootstrap entry-point
    ├── index.css                   # Global Tailwind CSS style imports & theme directives
    ├── App.tsx                     # Main Router, Application state engine, and notification dispatcher
    │
    └── components/                 # Component Library (Aesthetic, Modular, Accessible Components)
        ├── CustomerWebsite.tsx     # Shopper Storefront & Checkout UI (Category Filters, Coupons, Razorpay Interface)
        ├── CustomerDashboard.tsx   # Authenticated Customer Panel (Profile edit, OTP verify, Resend WhatsApp/Email)
        ├── AdminPanel.tsx          # Administrator Command Center (Key Import, Stock Alerts, Banners, Coupon Config)
        ├── CustomerHeader.tsx      # Fluid Responsive Navigation (Active Cart, Authentication flow toggles)
        ├── OrderTracking.tsx       # Live Waybill Shipments tracker (Milestones, Ledger verification steps)
        └── AuthModal.tsx           # Multi-Factor Secure Registration / Sign-In portal (Password & 2FA SMS OTP)
```

---

## 2. Supabase Postgres SQL Database Setup

To provision the persistent backend database under Supabase (or any PostgreSQL instance), run the contents of `supabase_schema.sql` inside your SQL Query Editor. It defines:

1. **Category Mapping & Stock Status Enums**: Strong static type systems enforcing product categorizations (`software` vs `hardware`), license key lifecycles (`available`, `assigned`, `revoked`), and payment statuses.
2. **Relational Database Schema**: Enforces referential integrity with cascading deletes across `orders`, `order_items`, `profiles`, `license_keys`, and `hardware_tracking` tables.
3. **Database Performance Indexing**: Explicit database index maps for lighting-fast lookup response times:
   * `idx_orders_customer_email` on `public.orders`
   * `idx_license_keys_product_id` and `idx_license_keys_status` on `public.license_keys`
   * `idx_coupon_usage_customer_email` on `public.coupon_usage`
4. **Auth Profile Sync Trigger**: Automatically invokes a stored procedure `handle_new_user()` when a customer signs up using Supabase Auth, mapping their secure identities inside `public.profiles`.
5. **Row Level Security (RLS) Rules**: Policies protecting consumer privacy.

---

## 3. High-Performance Front-End & Dashboards

* **Responsive Layout Design**: Implements absolute desktop-first spacing precision coupled with dynamic grid structures (`sm:grid-cols-2 lg:grid-cols-3`) styled purely via Tailwind CSS. No custom UI frameworks or unrequested styles are imported.
* **Customer Dashboard Workspace**: Customers can check live physical shipments, monitor digital key inventory pools, trigger resends for invoices/SMS, and manage multi-factor secure profile settings.
* **Admin Dashboard Portal**: Displays real-time stock-depletion telemetry, manages discount thresholds, configures home slideshow banners, and imports bulk-encrypted keys.

---

## 4. Advanced Production Security Modules

The API server `server.ts` is reinforced with multi-layered secure frameworks compliant with enterprise standards:

### 🔒 JWT Session Control
* All active sessions are maintained through `HttpOnly`, `Secure`, and `SameSite=Strict` cookies to block potential XSS and session-hijacking scripts.
* Employs secure signing and payload validation with cryptographic key verification.

### 🛡️ CSRF Double-Submit Validation
* Prevents Cross-Site Request Forgery attacks. Double-submit validation compares client headers with signed cookies before executing state-changing operations (`POST`, `PUT`, `DELETE`).

### ⚙️ Multi-Factor OTP Expiry & Brute-Force Safeguards
* Standard 2FA SMS tokens generated via the **2Factor.in Gateway** or secure fallback generators are capped with a strict **5-minute expiration window**.
* To eliminate automated brute-force scripts, OTP codes undergo automatic rate-tracking. An active session is completely destroyed upon registering **3 consecutive invalid attempts**.

### ⚡ Secure PBKDF2 Hashing
* Sensitive passwords are encoded using PBKDF2 (SHA-512) iterating 10,000 times combined with cryptographic salts.
* Authentications use constant-time `crypto.timingSafeEqual` string comparisons to prevent timing side-channel attacks.

### 📡 API Rate Limiting
* Endpoint routes are protected by IP-based rate-limiting bucket algorithms:
  * Authentication (Register/Login): Restricts traffic to 5/10 attempts per 5 minutes.
  * OTP dispatch & Webhooks: Throttles high-frequency triggers to mitigate DDoS vectors.

### 💸 Cryptographic Webhook & Razorpay Verification
* Active transactions verified using verified Hmac HMAC-SHA256 signature verifiers.
* Secure webhook payloads verified natively utilizing custom enterprise secrets (`RAZORPAY_WEBHOOK_SECRET`) to intercept mock data injection vectors.

---

## 5. Deployment Guide & Build Execution

To prepare the application for optimized container deployments on Cloud Run, Netlify, or AWS, follow these commands:

### Phase A: Install dependencies
```bash
npm install
```

### Phase B: Development Mode
Boots the Express API server concurrently mounting hot-reloaded Vite client assets:
```bash
npm run dev
```

### Phase C: Production Compilation
1. Bundles client-side React assets into a compiled, compressed static distribution directory `/dist`.
2. Compiles the backend TypeScript server `server.ts` into a unified CommonJS file (`dist/server.cjs`) via `esbuild`. This bypasses strict ESM module path resolution checks and optimizes file system read times inside sandboxed micro-containers.
```bash
npm run build
```

### Phase D: Launch Production Application
```bash
npm start
```
