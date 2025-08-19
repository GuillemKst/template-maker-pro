# 🚀 Deployment Guide

## Problem: Canvas Library on Vercel

The original `canvas` library requires native dependencies that don't work on serverless platforms like Vercel. 

## ✅ Solution: HTML/CSS to PNG

I've created a **serverless-friendly version** that uses HTML/CSS and Puppeteer to generate images.

## 📁 Files

- `src/server.ts` - **Original Canvas version** (for local development)
- `src/server-serverless.ts` - **Serverless version** (for Vercel/Netlify)
- `vercel.json` - **Vercel configuration**

## 🌐 Deploy to Vercel

### 1. Install Vercel CLI
```bash
npm i -g vercel
```

### 2. Deploy
```bash
vercel --prod
```

### 3. Environment Variables (Optional)
```bash
vercel env add NODE_ENV production
```

## 🐳 Deploy to Railway/Render

These platforms support Canvas, so you can use either version:

```bash
# For Canvas version (Railway/Render)
npm run start:canvas

# For Serverless version (any platform)
npm run start
```

## 🔧 Local Development

### Canvas Version (More features)
```bash
npm run dev:canvas
```

### Serverless Version (Deployment-ready)
```bash
npm run dev
```

## 📊 Comparison

| Feature | Canvas Version | Serverless Version |
|---------|----------------|-------------------|
| **Platform Support** | Local, VPS, Docker | ✅ Vercel, Netlify, Any |
| **Dependencies** | ❌ Native (canvas) | ✅ Pure JavaScript |
| **Performance** | Faster | Good |
| **Styling** | Manual positioning | ✅ CSS/HTML |
| **Fonts** | Limited | ✅ Google Fonts |
| **Deployment** | Complex | ✅ Simple |

## 🎯 Recommendation

- **Use Serverless Version** for production (Vercel/Netlify)
- **Use Canvas Version** for local development if you prefer it

## 🤖 Bot Integration

The API calls remain **exactly the same**:

```javascript
const response = await fetch('https://your-deployed-api.vercel.app/api/generate-image', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    data: {
      name: 'Guillem',
      role: "I'm a builder",
      timezone: 'Spain/Barcelona',
      skills: 'JavaScript, Node.js, React',
      projects: 'Discord Bots, APIs'
    }
  })
});

const imageBuffer = await response.buffer();
```

## ✅ Benefits of Serverless Version

- ✅ **No build issues** on Vercel
- ✅ **Better typography** with Google Fonts
- ✅ **Responsive design** with CSS
- ✅ **Easy styling** with HTML/CSS
- ✅ **Zero configuration** deployment
- ✅ **Same API interface**

Your bot integration code doesn't need to change at all! 🎉
