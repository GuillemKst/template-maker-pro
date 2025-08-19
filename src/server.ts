import express from 'express';
import cors from 'cors';
import { createCanvas, loadImage, registerFont } from 'canvas';
import sharp from 'sharp';
import { z } from 'zod';

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Request validation schema for Discord bot integration
const DiscordWelcomeRequest = z.object({
  data: z.object({
    name: z.string(),
    role: z.string(),
    timezone: z.string(),
    skills: z.string(),
    projects: z.string(),
    profilePicUrl: z.string().url().optional()
  })
});

// Legacy request validation schema (for backward compatibility)
const ImageGenerationRequest = z.object({
  data: z.record(z.string()),
  template: z.object({
    width: z.number().default(800),
    height: z.number().default(600),
    backgroundColor: z.string().default('#ffffff'),
    textColor: z.string().default('#000000'),
    fontSize: z.number().default(16),
    fontFamily: z.string().default('Arial'),
    layout: z.array(z.object({
      key: z.string(),
      x: z.number(),
      y: z.number(),
      fontSize: z.number().optional(),
      color: z.string().optional(),
      maxWidth: z.number().optional(),
      align: z.enum(['left', 'center', 'right']).default('left')
    })).optional()
  }).optional()
});

type ImageGenerationData = z.infer<typeof ImageGenerationRequest>;
type DiscordWelcomeData = z.infer<typeof DiscordWelcomeRequest>;

// Helper function to fetch and load image from URL
async function fetchAndLoadImage(url: string): Promise<any> {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch image: ${response.status}`);
    }
    const buffer = await response.arrayBuffer();
    return await loadImage(Buffer.from(buffer));
  } catch (error) {
    console.warn('Failed to load image from URL:', url, error);
    return null;
  }
}

// Helper function to wrap text
function wrapText(context: any, text: string, maxWidth: number): string[] {
  const words = text.split(' ');
  const lines: string[] = [];
  let currentLine = words[0];

  for (let i = 1; i < words.length; i++) {
    const word = words[i];
    const width = context.measureText(currentLine + ' ' + word).width;
    if (width < maxWidth) {
      currentLine += ' ' + word;
    } else {
      lines.push(currentLine);
      currentLine = word;
    }
  }
  lines.push(currentLine);
  return lines;
}

// Helper function to create a Discord welcome card template
function createDiscordWelcomeCardTemplate(data: DiscordWelcomeData['data']) {
  const { name, role, timezone, skills, projects } = data;
  
  return {
    width: 600,
    height: 800,
    backgroundColor: '#1a1a2e',
    layout: [
      // Welcome header with emoji
      { key: 'welcome_header', x: 50, y: 80, fontSize: 28, color: '#ffffff', text: `👋 Welcome ${name}!` },
      
      // Role/Description
      { key: 'role', x: 50, y: 140, fontSize: 18, color: '#a8a8a8', text: role },
      
      // Timezone section
      { key: 'timezone_label', x: 50, y: 220, fontSize: 20, color: '#ffd700', text: '🌍 Timezone' },
      { key: 'timezone_value', x: 50, y: 260, fontSize: 16, color: '#ffffff', text: timezone, maxWidth: 450 },
      
      // Skills section
      { key: 'skills_label', x: 50, y: 340, fontSize: 20, color: '#ffd700', text: '🔨 Skills' },
      { key: 'skills_value', x: 50, y: 380, fontSize: 16, color: '#ffffff', text: skills, maxWidth: 450 },
      
      // Projects section (could be Twitter URL or "Getting Started")
      { key: 'projects_label', x: 50, y: 460, fontSize: 20, color: '#ffd700', text: projects.startsWith('http') ? '🐦 Twitter' : '🚀 Projects' },
      { key: 'projects_value', x: 50, y: 500, fontSize: 16, color: '#ffffff', text: projects, maxWidth: 450 }
    ]
  };
}

// Legacy helper function (for backward compatibility)
function createWelcomeCardTemplate(name: string, role: string, timezone: string, skills: string, projects: string) {
  return createDiscordWelcomeCardTemplate({ name, role, timezone, skills, projects });
}

// Generate image endpoint
app.post('/api/generate-image', async (req, res) => {
  try {
    // First try Discord format, then fall back to legacy format
    let isDiscordRequest = false;
    let discordData: DiscordWelcomeData['data'] | null = null;
    let legacyData: any = null;
    
    try {
      const discordValidated = DiscordWelcomeRequest.parse(req.body);
      discordData = discordValidated.data;
      isDiscordRequest = true;
      console.log('✅ Discord welcome card request received for:', discordData.name);
    } catch {
      // Fall back to legacy format
      const legacyValidated = ImageGenerationRequest.parse(req.body);
      legacyData = legacyValidated;
      console.log('📄 Legacy format request received');
    }

    let config;
    if (isDiscordRequest && discordData) {
      // Use Discord welcome card template
      config = createDiscordWelcomeCardTemplate(discordData);
    } else if (legacyData) {
      const { data, template } = legacyData;
      // Check if this is a legacy welcome card request
      const isWelcomeCard = data.name && data.role && data.timezone && data.skills && data.projects;
      
      if (isWelcomeCard && !template) {
        // Use legacy welcome card template
        const welcomeTemplate = createWelcomeCardTemplate(
          data.name, 
          data.role, 
          data.timezone, 
          data.skills, 
          data.projects
        );
        config = welcomeTemplate;
      } else {
        // Use custom or default template
        config = {
          width: template?.width || 800,
          height: template?.height || 600,
          backgroundColor: template?.backgroundColor || '#ffffff',
          textColor: template?.textColor || '#000000',
          fontSize: template?.fontSize || 16,
          fontFamily: template?.fontFamily || 'Arial',
          layout: template?.layout
        };
      }
    } else {
      throw new Error('Invalid request format');
    }

    // Create canvas
    const canvas = createCanvas(config.width, config.height);
    const ctx = canvas.getContext('2d');

    // Set background with gradient for welcome cards
    const isWelcomeCard = isDiscordRequest || (legacyData && legacyData.data.name && legacyData.data.role);
    if (isWelcomeCard) {
      // Create gradient background
      const gradient = ctx.createLinearGradient(0, 0, 0, config.height);
      gradient.addColorStop(0, '#1a1a2e');
      gradient.addColorStop(0.5, '#16213e');
      gradient.addColorStop(1, '#0f3460');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, config.width, config.height);
      
      // Add some decorative elements
      ctx.fillStyle = 'rgba(255, 215, 0, 0.1)';
      ctx.fillRect(0, 0, config.width, 5); // Top border
      ctx.fillRect(0, config.height - 5, config.width, 5); // Bottom border
    } else {
      // Standard background
      ctx.fillStyle = config.backgroundColor || '#ffffff';
      ctx.fillRect(0, 0, config.width, config.height);
    }

    // Set default text properties
    ctx.fillStyle = config.textColor || '#000000';
    ctx.font = `${config.fontSize || 16}px ${config.fontFamily || 'Arial'}`;

    // Handle Discord profile image
    if (isDiscordRequest && discordData?.profilePicUrl) {
      try {
        console.log('🖼️ Fetching Discord profile image:', discordData.profilePicUrl);
        const profileImage = await fetchAndLoadImage(discordData.profilePicUrl);
        
        if (profileImage) {
          const profileX = config.width - 120;
          const profileY = 80;
          const profileRadius = 50;
          
          // Create circular clipping path
          ctx.save();
          ctx.beginPath();
          ctx.arc(profileX, profileY, profileRadius, 0, 2 * Math.PI);
          ctx.clip();
          
          // Draw the profile image
          ctx.drawImage(
            profileImage, 
            profileX - profileRadius, 
            profileY - profileRadius, 
            profileRadius * 2, 
            profileRadius * 2
          );
          
          ctx.restore();
          
          // Add golden border around profile image
          ctx.strokeStyle = '#ffd700';
          ctx.lineWidth = 3;
          ctx.beginPath();
          ctx.arc(profileX, profileY, profileRadius, 0, 2 * Math.PI);
          ctx.stroke();
          
          console.log('✅ Discord profile image added successfully');
        } else {
          throw new Error('Failed to load profile image');
        }
      } catch (error) {
        console.warn('⚠️ Could not load Discord profile image:', error);
        // Draw fallback circle with emoji
        const profileX = config.width - 120;
        const profileY = 80;
        const profileRadius = 50;
        
        ctx.fillStyle = '#ffd700';
        ctx.beginPath();
        ctx.arc(profileX, profileY, profileRadius, 0, 2 * Math.PI);
        ctx.fill();
        
        ctx.fillStyle = '#1a1a2e';
        ctx.font = '24px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('👤', profileX, profileY + 8);
        ctx.textAlign = 'left';
      }
    } else if (isWelcomeCard) {
      // Draw fallback profile placeholder for legacy requests
      const profileX = config.width - 120;
      const profileY = 80;
      const profileRadius = 50;
      
      ctx.fillStyle = '#ffd700';
      ctx.beginPath();
      ctx.arc(profileX, profileY, profileRadius, 0, 2 * Math.PI);
      ctx.fill();
      
      ctx.fillStyle = '#1a1a2e';
      ctx.font = '24px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('👤', profileX, profileY + 8);
      ctx.textAlign = 'left';
    }

    if ((config.layout && config.layout.length > 0) || isWelcomeCard) {
      // Use custom layout or welcome card layout
      const layoutItems = config.layout || [];
      
      for (const item of layoutItems) {
        // For welcome cards, use the predefined text, otherwise use data values
        let value = '';
        if (item.text) {
          value = item.text;
        } else if (isDiscordRequest && discordData) {
          value = (discordData as any)[item.key] || '';
        } else if (legacyData && legacyData.data) {
          value = legacyData.data[item.key] || '';
        }
        if (!value) continue;

        // Set custom properties for this text item
        const fontSize = item.fontSize || config.fontSize;
        const color = item.color || config.textColor;
        
        ctx.fillStyle = color;
        ctx.font = `${fontSize}px ${config.fontFamily || 'Arial'}`;

        if (item.maxWidth) {
          // Handle text wrapping
          const lines = wrapText(ctx, value, item.maxWidth);
          lines.forEach((line, index) => {
            let x = item.x;
            
            // Handle text alignment
            if (item.align === 'center') {
              const textWidth = ctx.measureText(line).width;
              x = item.x - textWidth / 2;
            } else if (item.align === 'right') {
              const textWidth = ctx.measureText(line).width;
              x = item.x - textWidth;
            }
            
            ctx.fillText(line, x, item.y + (index * fontSize * 1.2));
          });
        } else {
          let x = item.x;
          
          // Handle text alignment
          if (item.align === 'center') {
            const textWidth = ctx.measureText(value).width;
            x = item.x - textWidth / 2;
          } else if (item.align === 'right') {
            const textWidth = ctx.measureText(value).width;
            x = item.x - textWidth;
          }
          
          ctx.fillText(value, x, item.y);
        }
      }
    } else {
      // Default layout - arrange data in a simple list
      let y = 50;
      const lineHeight = (config.fontSize || 16) + 10;
      
      const dataToRender = isDiscordRequest && discordData ? discordData : 
                          legacyData && legacyData.data ? legacyData.data : {};
      
      Object.entries(dataToRender).forEach(([key, value]) => {
        if (key !== 'profilePicUrl') { // Skip the profile pic URL in text display
          ctx.fillText(`${key}: ${value}`, 50, y);
          y += lineHeight;
        }
      });
    }

    // Convert canvas to buffer
    const buffer = canvas.toBuffer('image/png');

    // Set response headers
    res.setHeader('Content-Type', 'image/png');
    res.setHeader('Content-Disposition', 'attachment; filename="generated-image.png"');
    
    // Send the image
    res.send(buffer);

  } catch (error) {
    console.error('Error generating image:', error);
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: 'Invalid request data', details: error.errors });
    } else {
      res.status(500).json({ error: 'Internal server error' });
    }
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Image Generator API is running' });
});

// API documentation endpoint
app.get('/api/docs', (req, res) => {
  const documentation = {
    title: 'Image Generator API',
    version: '1.0.0',
    endpoints: {
      'POST /api/generate-image': {
        description: 'Generate an image with provided data',
        requestBody: {
          data: {
            type: 'object',
            description: 'Key-value pairs of data to render in the image',
            example: {
              name: 'John Doe',
              email: 'john@example.com',
              date: '2024-01-15'
            }
          },
          template: {
            type: 'object',
            optional: true,
            description: 'Template configuration for the image',
            properties: {
              width: { type: 'number', default: 800 },
              height: { type: 'number', default: 600 },
              backgroundColor: { type: 'string', default: '#ffffff' },
              textColor: { type: 'string', default: '#000000' },
              fontSize: { type: 'number', default: 16 },
              fontFamily: { type: 'string', default: 'Arial' },
              layout: {
                type: 'array',
                description: 'Custom layout for positioning text elements',
                items: {
                  key: 'string - data key to render',
                  x: 'number - X position',
                  y: 'number - Y position',
                  fontSize: 'number - optional font size',
                  color: 'string - optional text color',
                  maxWidth: 'number - optional max width for text wrapping',
                  align: 'string - text alignment (left, center, right)'
                }
              }
            }
          }
        },
        response: {
          type: 'image/png',
          description: 'Generated PNG image'
        }
      },
      'GET /api/health': {
        description: 'Health check endpoint',
        response: { status: 'OK', message: 'Image Generator API is running' }
      }
    }
  };
  
  res.json(documentation);
});

// Default route
app.get('/', (req, res) => {
  res.json({ 
    message: 'Image Generator API', 
    documentation: '/api/docs',
    health: '/api/health' 
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Image Generator API running on port ${PORT}`);
  console.log(`📚 API Documentation: http://localhost:${PORT}/api/docs`);
  console.log(`❤️  Health Check: http://localhost:${PORT}/api/health`);
});
