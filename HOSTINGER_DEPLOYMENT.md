# Hostinger Production Deployment Guide - SoftKey Store 🚀

Aapki application Hostinger standard **Node.js Web Hosting (hPanel/cPanel)** ya **VPS Hosting** par deploy hone ke liye fully optimize ho chuki hai. Is guide me step-by-step bataya gaya hai ki kaise aap **Supabase Database, Mobile OTP, SMTP Mail, aur WhatsApp Notifications** ko configure aur deploy karenge.

---

## 🏗️ Architecture & Hostinger Adaptations
Humne Hostinger deployment ko seamless banane ke liye special improvements kiye hain:
1. **Root `server.js` Startup File**: Hostinger ka Node App Manager root directory me `server.js` ko load karta hai. Humne ek root-level `server.js` file create kar di hai jo hamare production-compiled Express server (`dist/server.cjs`) ko bind karti hai.
2. **Adaptive Socket Binding (`PORT`)**: Hostinger's Phusion Passenger dynamic socket path/pipe provide karta hai. Server ab custom pipe strings aur numeric ports dono ko smartly detect aur handle karta hai.
3. **Double Configuration Channel (DB + .env)**: Aap notification settings (SMTP, WhatsApp, SMS) ko Admin Dashboard se control kar sakte hain, ya direct `.env` me provide kar sakte hain.

---

## 📊 Step 1: Supabase Database Setup
Aapki app me live Supabase fetching ready hai. Database prepare karne ke liye:
1. **Supabase Dashboard** (https://supabase.com) me login karein aur naya project banayein.
2. Project ke **SQL Editor** me jayein aur naye query tab me `supabase_schema.sql` file ke saare contents ko copy-paste karke **Run** karein. Isse tables, constraints, aur triggers generate ho jayenge.
3. Uske baad **SQL Editor** me `supabase_seed_all.sql` ke contents ko copy-paste karke **Run** karein. Isse initial products, banners, aur category data seed ho jayenge.

---

## 🌐 Step 2: Hostinger hPanel Node.js App Setup
Agar aap Hostinger Shared/Cloud hosting use kar rahe hain:
1. **Hostinger hPanel** me jayein aur **Advanced -> Node.js** dashboard open karein.
2. **Create Application** par click karein aur ye settings set karein:
   - **Node.js Version**: Node.js 18 LTS ya 20 LTS select karein.
   - **Application Mode**: `production`
   - **Application Root**: `/` (ya folder path jahan aapne zip upload ki hai)
   - **Application URL**: `https://yourdomain.com` (Aapka domain name)
   - **Startup File**: `server.js` (Ye automatically `dist/server.cjs` ko call karega)
3. Apne project files ko Hostinger's **File Manager** ke zariye upload karein (ya SSH se `git clone` karein).

---

## 🔒 Step 3: Configure Environment Variables
Hostinger Node.js Application Manager me **Environment Variables** section me ya direct `.env` file me ye exact values save karein:

```env
# --- JWT SESSION CONFIGURATION ---
JWT_SECRET="APNA_STRONG_CUSTOM_SECRET_KEY_YAHAN_LIKHEIN"

# --- SUPABASE CREDENTIALS (Live Data Fetching) ---
SUPABASE_URL="https://your-project-id.supabase.co"
SUPABASE_SERVICE_ROLE_KEY="your-supabase-service-role-key"
VITE_SUPABASE_URL="https://your-project-id.supabase.co"
VITE_SUPABASE_ANON_KEY="your-supabase-anon-key"

# --- SMTP EMAIL DELIVERY (Hostinger/Gmail SMTP) ---
SMTP_HOST="smtp.hostinger.com"   # Gmail ke liye: smtp.gmail.com
SMTP_USER="noreply@yourdomain.com"
SMTP_PASSWORD="your-email-smtp-password"

# --- 2FACTOR MOBILE SMS OTP GATEWAY ---
TWO_FACTOR_API_KEY="your-2factor-api-key"

# --- WHATSAPP CLOUD API (META Official) ---
WHATSAPP_API_TOKEN="your-permanent-meta-developer-token"
WHATSAPP_PHONE_NUMBER_ID="your-phone-number-id"
WHATSAPP_BUSINESS_ID="your-business-id"
WHATSAPP_TEMPLATE_LANGUAGE="en" # ya hi (Hindi)

# --- RAZORPAY PAYMENT GATEWAY ---
RAZORPAY_KEY_ID="rzp_live_..."
RAZORPAY_SECRET="your-razorpay-secret"
RAZORPAY_WEBHOOK_SECRET="your-razorpay-webhook-secret"
```

---

## 🛠️ Step 4: Installation & Production Compilation
Aap Hostinger me custom script run karke, ya Hostinger terminal/SSH se direct deploy kar sakte hain.

### SSH ke zariye Deploy karein (Recommended):
SSH ke zariye login karein aur project root me ye commands run karein:

```bash
# 1. Dependencies install karein
npm install

# 2. Production Build banayein (Vite compiled code builds in /dist and Express backend in dist/server.cjs)
npm run build
```

---

## 🚀 Step 5: Start & Run App
1. Build complete hone ke baad Hostinger Node.js Dashboard me **Start** (ya **Restart**) button par click karein.
2. Aapki application live ho chuki hai!
3. Apne live URL par `/admin` path ko visit karein (Default login credentials setup karein aur notifications test karein).
4. Aap Admin Panel me **Notification Settings** tab me jaakar live test dispatches bhi send kar sakte hain WhatsApp, SMS OTP, aur Email ka.

Mubarak ho! 🎉 Aapki premium SoftKey Store enterprise web-application Hostinger par fully functional chalne ke liye ready hai.
