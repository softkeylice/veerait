# Hostinger Deployment Guide / होस्टिंगर डिप्लॉयमेंट गाइड

यह वेबसाइट होस्टिंगर (Hostinger) पर डिप्लॉय करने के लिए पूरी तरह से तैयार कर दी गई है। आप इसे दो तरीकों से होस्ट कर सकते हैं:

---

## 📌 ऑप्शन 1: Hostinger Web Hosting / hPanel (Static / Single Page App)

यदि आप Hostinger के स्टैंडर्ड **Web Hosting / Business Hosting / Premium Hosting** का उपयोग कर रहे हैं:

### स्टेप्स:
1. अपने प्रोजेक्ट में बिल्ड कमांड रन करें:
   ```bash
   npm run build
   ```
2. यह प्रोजेक्ट की रूट डायरेक्टरी में `dist` नाम का फोल्डर बना देगा।
3. `dist` फोल्डर के अंदर मौजूद सभी फाइलों (जिसमें `.htaccess`, `index.html`, `assets/` आदि शामिल हैं) को ज़िप (Zip) कर लें।
4. **Hostinger hPanel** में जाएं ➔ **File Manager** चुनें ➔ `public_html` फोल्डर खोलें।
5. ज़िप फाइल अपलोड करें और उसे `public_html` के अंदर Unzip (Extract) कर दें।
6. **बस आपका काम हो गया!** 
   - `.htaccess` फाइल पहले से `dist` फोल्डर में मौजूद है, जिससे आपकी वेबसाइट पर Back/Forward बटन, रीफ्रेश करने पर 404 Error नहीं आएगा और पेज स्मूथ चलेंगे।

---

## 📌 ऑप्शन 2: Hostinger VPS / Node.js Web Application (Full-Stack Backend Server)

यदि आप **Hostinger VPS** या Node.js सर्वर (Node.js App / Express Server) चला रहे हैं:

### स्टेप्स:
1. Hostinger VPS / Node.js में अपने प्रोजेक्ट की सभी फाइलें अपलोड करें।
2. `.env.example` फाइल को देखकर एक नई `.env` फाइल बनाएं और उसमें अपने Supabase, Razorpay, SMTP Email और WhatsApp की चाबियां (Keys) सेट करें।
3. डिप्लॉयमेंट कमांड्स रन करें:
   ```bash
   npm install
   npm run build
   npm start
   ```
4. PM2 प्रोसेस मैनेजर (ऑप्शनल):
   ```bash
   npm install -g pm2
   pm2 start server.js --name "softkey-app"
   pm2 save
   ```

---

## ⚙️ मुख्य सुधार जो कर दिए गए हैं (Hostinger Optimization Features):
- **`.htaccess` Auto-Inclusion**: `public/.htaccess` फाइल बना दी गई है ताकि `npm run build` करने पर Hostinger Web Server (Apache/LiteSpeed) बिना 404 Error के React Routing सपोर्ट करे।
- **Dynamic Asset & SPA Fallback**: static assets के लिए Caching और Gzip compression कॉन्फ़िगर कर दिया गया है।
- **Back/Forward History Preservation**: ब्राउज़र का Back और Forward बटन दबाने पर कस्टमर लॉगआउट नहीं होगा, और हिस्ट्री पेज आसानी से दिखाई देंगे।
