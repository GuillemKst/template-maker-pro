# 🚀 Render.com Deployment Guide

## Why Render.com?

✅ **Forever Free Tier** - No expiration like Railway  
✅ **Native Dependencies** - Supports Canvas library  
✅ **High-Quality Images** - 31KB PNG files with perfect text rendering  
✅ **Easy Deployment** - Git-based deployment  

## 📝 Prerequisites

1. GitHub account
2. Render.com account (free)
3. Your code pushed to GitHub

## 🛠️ Step-by-Step Deployment

### 1. Push to GitHub
```bash
# Add all files
git add .

# Commit changes
git commit -m "Canvas-based image generation API ready for Render"

# Push to GitHub
git push origin main
```

### 2. Deploy on Render.com

1. Go to [render.com](https://render.com)
2. Sign up/login with GitHub
3. Click **"New +"** → **"Web Service"**
4. Connect your GitHub repository
5. Configure deployment:

**Basic Settings:**
- **Name**: `template-maker-pro` (or your choice)
- **Environment**: `Node`
- **Region**: Choose closest to your users
- **Branch**: `main`

**Build & Deploy:**
- **Build Command**: `npm install`
- **Start Command**: `npm start`

**Plan:**
- Select **"Free"** plan (0$/month forever)

6. Click **"Create Web Service"**

### 3. Wait for Deployment

- First deployment takes 5-10 minutes
- Watch the deploy logs for any errors
- You'll get a URL like: `https://your-app.onrender.com`

### 4. Test Your API

```bash
curl -X POST https://your-app.onrender.com/api/generate-image \
  -H "Content-Type: application/json" \
  -d '{
    "data": {
      "name": "Guillem",
      "role": "Builder",
      "timezone": "Spain/Barcelona",
      "skills": "JavaScript, Node.js",
      "projects": "APIs, Bots"
    }
  }' \
  --output test-welcome.png
```

## 🤖 Bot Integration

Update your bot code to use your new Render URL:

```javascript
// Replace with your actual Render URL
const API_URL = 'https://your-app.onrender.com';

// Use the integration code from integration-examples/render-integration.js
```

## 🔧 Troubleshooting

### Service Shows 502 Bad Gateway
- Check deploy logs in Render dashboard
- Ensure `npm start` script points to correct file
- Verify all dependencies are in `package.json`

### Images Not Generating
- Check if Canvas installed properly in logs
- Verify API endpoint responds: `https://your-app.onrender.com/api/health`

### Slow First Response (Cold Start)
- Free tier has ~30 second cold start after inactivity
- First image generation might take longer
- Subsequent requests are fast

## ⚡ Performance Tips

- **Keep Warm**: Make periodic health checks to prevent cold starts
- **Cache**: Consider caching common images
- **Optimize**: Reduce image size if needed for faster uploads

## 🆓 Free Tier Limits

- **750 hours/month** (more than enough for most bots)
- **No credit card required**
- **Automatic sleep** after 15 minutes of inactivity
- **0.1 CPU, 512MB RAM**

## 📊 Monitoring

Monitor your service in the Render dashboard:
- **Metrics**: CPU, Memory usage
- **Logs**: Real-time application logs
- **Settings**: Environment variables, custom domains

## 🔄 Updates

To update your API:
```bash
git add .
git commit -m "Update API"
git push origin main
```

Render automatically redeploys when you push to GitHub! 🎉

---

**Your API will be available at**: `https://your-app.onrender.com`

Use this URL in your Discord/Telegram bot integration! 🤖✨
