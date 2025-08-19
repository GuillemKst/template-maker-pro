# 🆓 Render.com Deployment (Forever Free!)

## Why Render?
- ✅ **Forever free tier** (750 hours/month = 24/7 for 30+ days)
- ✅ **Canvas works perfectly** 
- ✅ **No 20-day limit** like Railway
- ✅ **Easy GitHub deployment**
- ✅ **Automatic HTTPS**
- ✅ **Perfect for image generation**

## 🚀 Deployment Steps

### 1. Push to GitHub
```bash
git add .
git commit -m "Canvas-based image generation API"
git push origin main
```

### 2. Connect to Render
1. Go to [render.com](https://render.com)
2. Sign up with GitHub
3. Click **"New Web Service"**
4. Connect your GitHub repo
5. Use these settings:
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Plan**: **Free**

### 3. Deploy
Render will automatically deploy and give you a URL like:
`https://your-app.onrender.com`

## 🧪 Test Your Free Deployment

```bash
curl -X POST https://your-app.onrender.com/api/generate-image \
  -H "Content-Type: application/json" \
  -d '{
    "data": {
      "name": "Guillem",
      "role": "I'\''m a builder",
      "timezone": "Spain/Barcelona",
      "skills": "JavaScript, Node.js, React",
      "projects": "Discord Bots, APIs"
    }
  }' \
  --output render-welcome.png
```

## 🤖 Update Your Bot Code

```javascript
// Change from Vercel to Render
const API_URL = 'https://your-app.onrender.com';

// Same exact API calls - just different URL!
const imageBuffer = await fetch(`${API_URL}/api/generate-image`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ data: welcomeData })
}).then(r => r.buffer());
```

## ✅ What You Get (FREE)
- **Perfect text rendering** with Canvas
- **30KB+ beautiful PNG images**
- **All emojis working** 👋 🌍 🔨 🚀
- **750 hours/month** (enough for 24/7 usage)
- **No 20-day limits**
- **Automatic deployments** from GitHub

## 💡 Alternative: Free VPS Options
If you want 100% free forever:
- **Oracle Cloud Always Free** (1-4 ARM cores free forever)
- **Google Cloud Platform** ($300 credit + free tier)
- **AWS Free Tier** (12 months free)

**Render.com is your best bet for easy, free, reliable image generation!**
