import { VercelRequest, VercelResponse } from '@vercel/node';

export default function handler(req: VercelRequest, res: VercelResponse) {
  const documentation = {
    title: 'Vercel Image Generator API',
    version: '2.0.0',
    description: 'Generate welcome cards using HTML/CSS to PNG conversion on Vercel',
    endpoints: {
      'POST /api/generate-image': {
        description: 'Generate a welcome card image',
        requestBody: {
          data: {
            name: 'string (required) - User name',
            role: 'string (required) - User role/description', 
            timezone: 'string (required) - User timezone',
            skills: 'string (required) - User skills',
            projects: 'string (required) - User projects'
          }
        },
        response: {
          type: 'image/png',
          description: 'Generated PNG welcome card (600x800px)'
        }
      },
      'GET /api/health': {
        description: 'Health check endpoint',
        response: { status: 'OK', message: 'API is running' }
      },
      'GET /api/docs': {
        description: 'This documentation endpoint'
      }
    },
    example: {
      method: 'POST',
      url: '/api/generate-image',
      body: {
        data: {
          name: 'Guillem',
          role: "I'm a builder",
          timezone: 'Spain/Barcelona',
          skills: 'JavaScript, Node.js, React, TypeScript',
          projects: 'Image Generator API, Discord Bots, Telegram Integrations'
        }
      }
    },
    integration: {
      javascript: `
// For your Discord/Telegram bot:
const response = await fetch('https://your-app.vercel.app/api/generate-image', {
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
// Send imageBuffer directly to Discord/Telegram
      `
    }
  };
  
  res.status(200).json(documentation);
}
