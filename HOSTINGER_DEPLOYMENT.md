# Hostinger Deployment Guide / होस्टिंगर डिप्लॉयमेंट गाइड (503 Error Solution)

Hostinger GitHub Deployment में **503 Service Unavailable** का मुख्य कारण यह होता है कि Hostinger ऑटोमैटिक बिल्ड (`npm run build`) नहीं चलाता था और `dist/` फोल्डर न होने से सर्वर स्टार्ट नहीं हो पाता था।

---

## 🛠️ क्या अपडेट किया गया है (What We Updated to Fix 503):

1. **`package.json` में `"postinstall": "npm run build"` जोड़ा गया:**
   अब जब भी Hostinger GitHub से नया कोड pull करके `npm install` चलाएगा, तो React वेबसाइट (`dist/`) और Backend (`server.js`) अपने आप बिल्ड हो जाएंगे।

2. **`server.ts` को 503 Crash Safe बनाया गया:**
   सर्वर अब ऑटोमैटिक डिटेक्ट कर लेता है कि `dist/index.html` मौजूद है और बिना crash हुए Production mode में वेबसाइट और APIs को स्टार्ट कर देता है।

---

## 🚀 Hostinger पर 503 Error ठीक करने के स्टेप्स (Steps to Fix 503 on Hostinger):

### स्टेप 1: Code Update / Re-deploy
1. GitHub प्रोजेक्ट में इन नए अपडेटेड बदलावों को पुश (Push/Sync) करें।
2. **Hostinger hPanel** ➔ **Node.js Deployment** ➔ **Deployment Details** पर जाएं।
3. **Re-deploy** या **Deploy** बटन पर क्लिक करें।

---

### स्टेप 2: Environment Variables सेट करें (Hostinger Dashboard)
Hostinger Node.js Dashboard में **Deployment Settings** ➔ **Environment Variables** में ये Key-Value जोड़े:

| Variable Name | Value Example | Description |
|---|---|---|
| `NODE_ENV` | `production` | **जरूरी:** प्रोडक्शन मोड ऑन करने के लिए |
| `SUPABASE_URL` | `https://xyz.supabase.co` | Supabase Database URL |
| `SUPABASE_SERVICE_ROLE_KEY` | `eyJhbGciOi...` | Supabase Service Role Key |
| `RAZORPAY_KEY_ID` | `rzp_live_...` | Razorpay API Key |
| `RAZORPAY_KEY_SECRET` | `secret...` | Razorpay Secret |

---

### स्टेप 3: Deployment Details चेक करें
- **Build Command:** (खाली रख सकते हैं या `npm run build` लिख सकते हैं)
- **Start Command:** `npm start`
- **Startup File:** `server.js`

**Re-deploy** करने के बाद 1-2 मिनट रुकें और अपनी वेबसाइट रीफ्रेश करें (`aquamarine-mink-190526.hostingersite.com`) — आपकी वेबसाइट बिना किसी 503 Error के काम करने लगेगी!
