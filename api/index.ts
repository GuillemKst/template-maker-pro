import { VercelRequest, VercelResponse } from '@vercel/node';

export default function handler(req: VercelRequest, res: VercelResponse) {
  res.status(200).json({ 
    message: 'Vercel Image Generator API', 
    documentation: '/api/docs',
    health: '/api/health',
    generate: '/api/generate-image (POST)',
    version: '2.0.0'
  });
}
