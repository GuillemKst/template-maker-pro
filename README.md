# Image Generator API

A Node.js API service that generates images with dynamic text content based on provided data.

## Features

- Generate PNG images with custom data
- Flexible template system for positioning text elements
- Support for text wrapping and alignment
- Customizable fonts, colors, and sizing
- Built with Express.js, Canvas, and Sharp

## Installation

```bash
npm install
```

## Development

```bash
npm run dev
```

## Production

```bash
npm start
```

## API Endpoints

### POST /api/generate-image

Generate an image with provided data.

**Request Body:**
```json
{
  "data": {
    "name": "John Doe",
    "email": "john@example.com",
    "date": "2024-01-15",
    "title": "Certificate of Completion"
  },
  "template": {
    "width": 800,
    "height": 600,
    "backgroundColor": "#ffffff",
    "textColor": "#000000",
    "fontSize": 16,
    "fontFamily": "Arial",
    "layout": [
      {
        "key": "title",
        "x": 400,
        "y": 100,
        "fontSize": 24,
        "align": "center"
      },
      {
        "key": "name",
        "x": 400,
        "y": 200,
        "fontSize": 18,
        "align": "center"
      },
      {
        "key": "date",
        "x": 400,
        "y": 500,
        "fontSize": 14,
        "align": "center"
      }
    ]
  }
}
```

**Response:** PNG image file

### GET /api/health

Health check endpoint.

### GET /api/docs

API documentation endpoint.

## Template Configuration

- `width`: Image width in pixels (default: 800)
- `height`: Image height in pixels (default: 600)
- `backgroundColor`: Background color (default: "#ffffff")
- `textColor`: Default text color (default: "#000000")
- `fontSize`: Default font size (default: 16)
- `fontFamily`: Font family (default: "Arial")
- `layout`: Array of text positioning objects

## Layout Object Properties

- `key`: Data key to render
- `x`: X position
- `y`: Y position
- `fontSize`: Custom font size (optional)
- `color`: Custom text color (optional)
- `maxWidth`: Maximum width for text wrapping (optional)
- `align`: Text alignment - "left", "center", or "right" (default: "left")

## Welcome Card Template (Perfect for Telegram Bots!)

The API automatically detects welcome card data and applies a beautiful dark theme template:

```bash
curl -X POST http://localhost:3000/api/generate-image \
  -H "Content-Type: application/json" \
  -d '{
    "data": {
      "name": "Guillem",
      "role": "I'\''m a builder",
      "timezone": "Spain/Barcelona",
      "skills": "JavaScript, Node.js, React, TypeScript",
      "projects": "Image Generator API, Telegram Bots, Discord Integrations",
      "profileImage": "placeholder"
    }
  }' \
  --output welcome-card.png
```

**Features of Welcome Cards:**
- 🎨 Dark gradient background with gold accents
- 👤 Profile image placeholder 
- 📱 Optimized for social media sharing
- 🎯 Perfect for Discord/Telegram bot integration

## Custom Template Example

```bash
curl -X POST http://localhost:3000/api/generate-image \
  -H "Content-Type: application/json" \
  -d '{
    "data": {
      "name": "John Doe",
      "title": "Certificate of Completion"
    },
    "template": {
      "width": 800,
      "height": 400,
      "backgroundColor": "#f0f8ff",
      "layout": [
        {
          "key": "title",
          "x": 400,
          "y": 100,
          "fontSize": 24,
          "align": "center"
        },
        {
          "key": "name",
          "x": 400,
          "y": 200,
          "fontSize": 18,
          "align": "center"
        }
      ]
    }
  }' \
  --output certificate.png
```

## Simple Example (Default Layout)

If you don't specify a custom layout, the API will arrange your data in a simple list format:

```bash
curl -X POST http://localhost:3000/api/generate-image \
  -H "Content-Type: application/json" \
  -d '{
    "data": {
      "name": "John Doe",
      "email": "john@example.com",
      "date": "2024-01-15"
    }
  }' \
  --output simple-image.png
```

## For Telegram/Discord Bots

```javascript
// In your bot code:
const response = await fetch('http://your-api-domain.com/api/generate-image', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    data: {
      name: userData.name,
      role: userData.role,
      timezone: userData.timezone,
      skills: userData.skills,
      projects: userData.projects
    }
  })
});

const imageBuffer = await response.buffer();
// Send imageBuffer directly to Discord/Telegram - no file saving needed!
```