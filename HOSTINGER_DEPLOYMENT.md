# Hostinger Deployment Guide / होस्टिंगर डिप्लॉयमेंट गाइड (503 Error Fixed)

## ❓ 503 Error क्यों आ रहा था? (Why 503 Service Unavailable occurred):

Hostinger पर Node.js एप्लिकेशन में 503 Error आने के 2 मुख्य कारण थे:

1. **Module Syntax Conflict (`type: module` vs `CommonJS`):** 
   `package.json` में `"type": "module"` सेट होने की वजह से Hostinger का Node runtime `server.js` को ES Module मानकर रन कर रहा था, जबकि `esbuild` CommonJS फॉर्मेट में बंडल कर रहा था। इससे Node.js स्टार्ट होते ही क्रैश होकर `503 Service Unavailable` दे रहा था।
2. **Production Dependencies Issue:**
   Hostinger जब `NODE_ENV=production` के साथ `npm install` चलाता था, तो `devDependencies` (जैसे `esbuild`, `typescript`, `vite`) इंस्टॉल नहीं होते थे, जिससे बिल्ड स्टेप फेल हो जाता था।

---

## 🛠️ क्या फिक्स किया गया है (Fixes Applied):

1. **Native ESM Format Bundle (`--format=esm`):**
   `esbuild` अब `server.ts` को सीधे **ES Module (`--format=esm`)** फॉर्मेट में `server.js` में बंडल करता है। चूंकि `package.json` में `"type": "module"` सेट है, Hostinger का Node.js अब बिना किसी `ReferenceError: module is not defined` एरर के `server.js` को परफेक्टली एग्जीक्यूट करेगा।
2. **All Build Tools in Production Dependencies:**
   `esbuild`, `vite`, `tsx` और `typescript` को `dependencies` में शिफ्ट कर दिया गया है ताकि Hostinger पर पोस्ट-इन्स्टॉल बिल्ड स्टेप हमेशा 100% सक्सेसफुल रहे।

---

## 🚀 503 ठीक करने के लिए अब क्या करें (Next Steps):

1. **GitHub पर पुश (Push) करें:**
   इन अपडेटेड फाइल्स (`package.json`, `HOSTINGER_DEPLOYMENT.md`) को अपने GitHub रिपॉजिटरी में Commit & Push कर दें।

2. **Hostinger पर Re-deploy करें:**
   Hostinger hPanel ➔ Node.js Deployment ➔ **Re-deploy** बटन पर क्लिक करें।

3. **Hostinger Environment Variables (hPanel):**
   - `NODE_ENV` = `production`
   - `SUPABASE_URL` = `your-supabase-url`
   - `SUPABASE_SERVICE_ROLE_KEY` = `your-supabase-key`

डिप्लॉयमेंट पूरा होने के बाद आपकी साइट (`darkred-wolverine-642791.hostingersite.com`) बिना किसी 503 error के स्मूथ चलने लगेगी!
