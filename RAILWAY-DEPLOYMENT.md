# 🚀 Railway Deployment Guide

## Why Railway?
- ✅ **Canvas works perfectly** (native dependencies supported)
- ✅ **Easy deployment** (one command)
- ✅ **Reliable image generation** 
- ✅ **Free tier available**
- ✅ **Better than Vercel for image generation**

## 🚀 Deploy Steps

### 1. Install Railway CLI
```bash
npm install -g @railway/cli
```

### 2. Login to Railway
```bash
railway login
```

### 3. Initialize Project
```bash
railway init
```

### 4. Deploy
```bash
railway up
```

### 5. Get Your Domain
Railway will give you a domain like: `your-app.railway.app`

## 🧪 Test Your Deployment

Once deployed, test with:

```bash
curl -X POST https://your-app.railway.app/api/generate-image \
  -H "Content-Type: application/json" \
  -d '{
    "data": {
      "name": "Guillem",
      "role": "I'\''m a builder",
      "timezone": "Spain/Barcelona",
      "skills": "JavaScript, Node.js, React, TypeScript",
      "projects": "Image Generator API, Discord Bots, Telegram Integrations"
    }
  }' \
  --output railway-welcome.png
```

## 🤖 Update Your Bot

Just change the URL in your bot code:

```javascript
// OLD (Vercel - text rendering issues)
const API_URL = 'https://template-maker-pro-4upiasdasd.vercel.app';

// NEW (Railway - perfect text rendering!)
const API_URL = 'https://your-app.railway.app';
```

## ✅ What You'll Get

- **Perfect text rendering** (30KB+ PNG images)
- **All emojis working** 👋 🌍 🔨 🚀
- **Beautiful gradients and styling**
- **Reliable Canvas-based generation**
- **Same API interface** (no code changes needed)

Railway is specifically designed for apps like yours that need native dependencies!
