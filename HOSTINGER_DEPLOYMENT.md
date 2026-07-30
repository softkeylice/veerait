# Hostinger Deployment Guide / होस्टिंगर डिप्लॉयमेंट गाइड (React + Node.js)

यह गाइड आपकी React + Express Node.js वेबसाइट को **Hostinger** पर डिप्लॉय करने के लिए तैयार की गई है।

---

## 📌 तरीका 1: Hostinger Node.js Application (Full-Stack Backend Server + React Frontend)

यदि आप Hostinger पर **Node.js Selector / Application Manager** या **VPS** का उपयोग कर रहे हैं:

### Hostinger Node.js App Settings:
- **Node.js Version**: 18.x या 20.x चुनें
- **Application Root**: `public_html` (या आपका ऐप फोल्डर)
- **Application Startup File**: `server.js`
- **Application Mode**: Production

### स्टेप्स (Steps):
1. अपने प्रोजेक्ट में बिल्ड कमांड रन करें:
   ```bash
   npm run build
   ```
   *यह कमांड React ऐप को `dist/` में बिल्ड करेगी और Express Node.js सर्वर को एक सिंगल `server.js` में बंडल कर देगी।*

2. अपनी प्रोजेक्ट फाइलें (`server.js`, `dist/`, `package.json`, `.env`) Hostinger में अपलोड करें।
3. Hostinger Terminal / SSH में डिपेंडेंसी इंस्टॉल करें:
   ```bash
   npm install --production
   ```
4. `.env` फाइल बनाकर अपने सिक्रेट्स सेट करें (जैसे `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `RAZORPAY_KEY_ID` आदि)।
5. एप्लीकेशन स्टार्ट करें:
   ```bash
   npm start
   ```
   *(या PM2 से चलाएं: `pm2 start server.js --name "react-node-app"`)*

---

## 📌 तरीका 2: Hostinger Web Hosting (Static React Frontend - `public_html`)

यदि आपके पास Hostinger का **Premium Web Hosting / Business Web Hosting** है (जहां केवल Apache / LiteSpeed है):

### स्टेप्स (Steps):
1. अपने प्रोजेक्ट में रन करें:
   ```bash
   npm run build
   ```
2. यह प्रोजेक्ट में **`dist`** नाम का फोल्डर बना देगा।
3. **`dist`** फोल्डर के अंदर मौजूद सभी फाइलों (जिसमें `index.html`, `assets/`, और `.htaccess` शामिल हैं) को ज़िप (Zip) कर लें।
4. **Hostinger hPanel** में जाएं ➔ **File Manager** चुनें ➔ **`public_html`** फोल्डर खोलें।
5. ज़िप फाइल अपलोड करें और `public_html` के अंदर ही **Extract (Unzip)** कर दें।
6. `.htaccess` फाइल पहले से `dist` में मौजूद है, जिससे React Router के सभी लिंक्स, रीफ्रेश करने पर 404 Error नहीं आएगा।

---

## ⚙️ मुख्य विशेषताएं (Key Features Included):
- **Bundled Single Node.js Entry Point (`server.js`)**: `npm run build` रन करने पर आपका पूरा Node.js Express Backend एक रेडी-टू-रन `server.js` फाइल में कंपाइल हो जाता है।
- **React Frontend Serving**: `server.js` ऑटोमैटिकली `dist/` फोल्डर में मौजूद आपकी React वेबसाइट को सर्व करता है और सभी `/api/*` बैकएंड रिक्वेस्ट्स हैंडल करता है।
- **Static `.htaccess` SPA Routing**: Static HTML hosting पर React Router को बिना 404 Error के चलाने के लिए `.htaccess` फाइल शामिल है।
