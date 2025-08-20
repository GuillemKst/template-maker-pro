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

// Request validation schema for Portfolio card
const PortfolioCardRequest = z.object({
  data: z.object({
    name: z.string(),
    location: z.string(),
    title: z.string(),
    handle: z.string(),
    description: z.string(),
    projects: z.string(),
    skills: z.array(z.string()),
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
type PortfolioCardData = z.infer<typeof PortfolioCardRequest>;

// Helper function to fetch and load image from URL (handles WebP conversion)
async function fetchAndLoadImage(url: string): Promise<any> {
  try {
    console.log('🌐 Fetching image from:', url);
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch image: ${response.status}`);
    }
    
    const buffer = await response.arrayBuffer();
    const imageBuffer = Buffer.from(buffer);
    
    // Check if it's a WebP image and convert to PNG using Sharp
    const contentType = response.headers.get('content-type');
    console.log('📷 Image content type:', contentType);
    
    if (contentType?.includes('webp') || url.includes('.webp')) {
      console.log('🔄 Converting WebP to PNG...');
      const pngBuffer = await sharp(imageBuffer)
        .png()
        .toBuffer();
      return await loadImage(pngBuffer);
    } else {
      // Try to load directly first
      try {
        return await loadImage(imageBuffer);
      } catch (loadError) {
        console.log('🔄 Direct load failed, trying Sharp conversion...');
        // If direct load fails, try converting with Sharp anyway
        const pngBuffer = await sharp(imageBuffer)
          .png()
          .toBuffer();
        return await loadImage(pngBuffer);
      }
    }
  } catch (error) {
    console.warn('❌ Failed to load image from URL:', url, error);
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

// Helper function to create a Discord welcome card template (matching portfolio design exactly)
function createDiscordWelcomeCardTemplate(data: DiscordWelcomeData['data']) {
  const { name, role, timezone, skills, projects } = data;
  
  return {
    width: 500,
    height: 320,
    backgroundColor: '#ffffff',
    layout: [
      // LEFT COLUMN - All aligned vertically below the profile image (same as portfolio)
      // Profile image placeholder will be at x: 20, y: 35, size: 140x140
      
      // Welcome with name (below profile image) - positioned as a column
      { key: 'welcome_name', x: 20, y: 200, fontSize: 22, color: '#000000', text: `👋 ${name}`, align: 'left' as const },
      
      // Role/Description (below name) - same x position to create column
      { key: 'role', x: 20, y: 230, fontSize: 11, color: '#666666', text: role, align: 'left' as const },
      
      // Timezone (below role) - same x position to create column
      { key: 'timezone', x: 20, y: 255, fontSize: 14, color: '#000000', text: timezone, align: 'left' as const },
      
      // Welcome message (at bottom of left column) - same x position
      { key: 'welcome_msg', x: 20, y: 270, fontSize: 11, color: '#000000', text: 'Welcome to the server!', align: 'left' as const },
      
      // RIGHT SIDE SECTIONS - positioned to the right (same as portfolio)
      // Skills header
      { key: 'skills_header', x: 200, y: 50, fontSize: 18, color: '#000000', text: 'SKILLS', align: 'left' as const },
      { key: 'skills_value', x: 200, y: 70, fontSize: 11, color: '#333333', text: skills, maxWidth: 180, align: 'left' as const },
      
      // Projects header
      { key: 'projects_header', x: 200, y: 135, fontSize: 18, color: '#000000', text: projects.startsWith('http') ? 'SOCIAL' : 'PROJECTS', align: 'left' as const },
      { key: 'projects_value', x: 200, y: 150, fontSize: 11, color: '#333333', text: projects, maxWidth: 180, align: 'left' as const },
      
      // Info header (replacing the third section to match portfolio structure)
      { key: 'info_header', x: 200, y: 215, fontSize: 18, color: '#000000', text: 'INFO', align: 'left' as const },
      { key: 'info_value', x: 200, y: 230, fontSize: 11, color: '#333333', text: 'New member - please give them a warm welcome!', maxWidth: 180, align: 'left' as const }
    ]
  };
}

// Helper function to create a Portfolio card template (matching the provided design)
function createPortfolioCardTemplate(data: PortfolioCardData['data']) {
  const { name, location, title, handle, description, projects, skills } = data;
  
  return {
    width: 500,
    height: 320,
    backgroundColor: '#ffffff',
    layout: [
      // LEFT COLUMN - All aligned vertically below the profile image
      // Profile image placeholder will be at x: 20, y: 35, size: 140x140
      
      // Name (below profile image) - positioned as a column
      { key: 'name', x: 20, y: 200, fontSize: 22, color: '#000000', text: name, align: 'left' as const },
      
      // Location (below name) - same x position to create column
      { key: 'location', x: 20, y: 230, fontSize: 11, color: '#666666', text: location, align: 'left' as const },
      
      // Professional title (below location) - same x position to create column
      { key: 'title', x: 20, y: 255, fontSize: 14, color: '#000000', text: title, align: 'left' as const },
      
      // Social handle (at bottom of left column) - same x position
      { key: 'handle', x: 20, y: 270, fontSize: 11, color: '#000000', text: `X ${handle}`, align: 'left' as const },
      
      // RIGHT SIDE SECTIONS - positioned to the right
      // Description header
      { key: 'desc_header', x: 200, y: 50, fontSize: 18, color: '#000000', text: 'DESCRIPTION', align: 'left' as const },
      { key: 'description', x: 200, y: 70, fontSize: 11, color: '#333333', text: description, maxWidth: 180, align: 'left' as const },
      
      // Projects header  
      { key: 'projects_header', x: 200, y: 135, fontSize: 18, color: '#000000', text: 'PROJECTS', align: 'left' as const },
      { key: 'projects', x: 200, y: 150, fontSize: 11, color: '#333333', text: projects, maxWidth: 180, align: 'left' as const },
      
      // Skills header
      { key: 'skills_header', x: 200, y: 215, fontSize: 18, color: '#000000', text: 'SKILLS', align: 'left' as const },
      // Skills will be handled specially to show as bullet points
      { key: 'skills_list', x: 200, y: 230, fontSize: 11, color: '#333333', text: '', maxWidth: 180, align: 'left' as const, skillsList: true }
    ],
    skillsData: skills // Store skills separately for special handling
  };
}

// Legacy helper function (for backward compatibility)
function createWelcomeCardTemplate(name: string, role: string, timezone: string, skills: string, projects: string) {
  return createDiscordWelcomeCardTemplate({ name, role, timezone, skills, projects });
}

// Generate image endpoint
app.post('/api/generate-image', async (req, res) => {
  try {
    // Try different formats: Portfolio, Discord, then legacy
    let isPortfolioRequest = false;
    let isDiscordRequest = false;
    let portfolioData: PortfolioCardData['data'] | null = null;
    let discordData: DiscordWelcomeData['data'] | null = null;
    let legacyData: any = null;
    
    try {
      const portfolioValidated = PortfolioCardRequest.parse(req.body);
      portfolioData = portfolioValidated.data;
      isPortfolioRequest = true;
      console.log('✅ Portfolio card request received for:', portfolioData.name);
    } catch {
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
    }

    let config;
    if (isPortfolioRequest && portfolioData) {
      // Use Portfolio card template
      config = createPortfolioCardTemplate(portfolioData);
    } else if (isDiscordRequest && discordData) {
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

    // Set background - both welcome and portfolio cards now use white background
    const isWelcomeCard = isDiscordRequest || (legacyData && legacyData.data.name && legacyData.data.role);
    const isPortfolioCard = isPortfolioRequest;
    
    if (isPortfolioCard || isWelcomeCard) {
      // Both cards: clean white background with subtle border
      ctx.fillStyle = config.backgroundColor || '#ffffff';
      ctx.fillRect(0, 0, config.width, config.height);
      
      // Add a subtle border around the entire card
      ctx.strokeStyle = '#e0e0e0';
      ctx.lineWidth = 1;
      ctx.strokeRect(0, 0, config.width, config.height);
      
      // Handle profile image (same for both portfolio and Discord welcome)
      const profileSize = 140;
      const profileX = 20;
      const profileY = 35;
      
      // Determine which profile image to use
      const profileUrl = isPortfolioRequest ? portfolioData?.profilePicUrl : 
                        isDiscordRequest ? discordData?.profilePicUrl : null;
      
      if (profileUrl) {
        try {
          console.log('🖼️ Fetching profile image:', profileUrl);
          const profileImage = await fetchAndLoadImage(profileUrl);
          
          if (profileImage) {
            // Draw the profile image (square for both templates)
            ctx.drawImage(
              profileImage, 
              profileX, 
              profileY, 
              profileSize, 
              profileSize
            );
            
            console.log('✅ Profile image added successfully');
          } else {
            throw new Error('Failed to load profile image');
          }
        } catch (error) {
          console.warn('⚠️ Could not load profile image:', error);
          // Draw fallback gray square
          ctx.fillStyle = '#666666';
          ctx.fillRect(profileX, profileY, profileSize, profileSize);
        }
      } else {
        // Draw default gray square placeholder
        ctx.fillStyle = '#666666';
        ctx.fillRect(profileX, profileY, profileSize, profileSize);
      }
    } else {
      // Standard background for other templates
      ctx.fillStyle = config.backgroundColor || '#ffffff';
      ctx.fillRect(0, 0, config.width, config.height);
    }

    // Set default text properties
    ctx.fillStyle = config.textColor || '#000000';
    ctx.font = `${config.fontSize || 16}px ${config.fontFamily || 'Arial'}`;



    if ((config.layout && config.layout.length > 0) || isWelcomeCard) {
      // Use custom layout or welcome card layout
      const layoutItems = config.layout || [];
      
      for (const item of layoutItems) {
        // Special handling for skills list in portfolio cards
        if ((item as any).skillsList && isPortfolioRequest && portfolioData && (config as any).skillsData) {
          const skillsArray = (config as any).skillsData;
          if (Array.isArray(skillsArray)) {
            const fontSize = item.fontSize || 16;
            const color = item.color || '#000000';
            ctx.fillStyle = color;
            ctx.font = `${fontSize}px Arial`;
            
            skillsArray.forEach((skill, index) => {
              const bulletText = `• ${skill}`;
              ctx.fillText(bulletText, item.x, item.y + (index * fontSize * 1.3));
            });
          }
          continue;
        }
        
        // For welcome cards and portfolio cards, use the predefined text, otherwise use data values
        let value = '';
        if (item.text) {
          value = item.text;
        } else if (isPortfolioRequest && portfolioData) {
          const portfolioValue = (portfolioData as any)[item.key];
          if (Array.isArray(portfolioValue) && item.key !== 'skills') {
            value = portfolioValue.join(', ');
          } else {
            value = portfolioValue || '';
          }
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
      
      const dataToRender = isPortfolioRequest && portfolioData ? portfolioData :
                          isDiscordRequest && discordData ? discordData : 
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

// Template preview endpoints

// Get Discord welcome card template structure
app.get('/api/templates/discord-welcome', (req, res) => {
  const sampleData = {
    name: 'John Doe',
    role: 'Full Stack Developer',
    timezone: 'UTC-5 (New York)',
    skills: 'JavaScript, Node.js, React, TypeScript, Python',
    projects: 'Building awesome web applications and Discord bots',
    profilePicUrl: '' // Optional - leave empty for gray placeholder or provide URL
  };
  
  const template = createDiscordWelcomeCardTemplate(sampleData);
  
  res.json({
    template,
    sampleData,
    description: 'Discord welcome card template with sample data'
  });
});

// Get Portfolio card template structure
app.get('/api/templates/portfolio', (req, res) => {
  const sampleData = {
    name: '[name]',
    location: 'BROOKLYN, NY',
    title: 'Graphic Designer',
    handle: '@lxprofilel',
    description: 'Graphic and visual design',
    projects: 'Finishing my portfolio',
    skills: ['Listen to lo-fi music', 'Play Animal Crossing'],
    profilePicUrl: '' // Optional - leave empty for gray placeholder or provide URL
  };
  
  const template = createPortfolioCardTemplate(sampleData);
  
  res.json({
    template,
    sampleData,
    description: 'Portfolio card template with sample data'
  });
});

// Generate preview image with sample data
app.get('/api/preview/discord-welcome', async (req, res) => {
  try {
    const sampleData = {
      name: 'John Doe',
      role: 'Full Stack Developer',
      timezone: 'UTC-5 (New York)', 
      skills: 'JavaScript, Node.js, React, TypeScript, Python',
      projects: 'Building awesome web applications and Discord bots',
      profilePicUrl: '' // Optional - leave empty for gray placeholder or provide URL
    };

    const config = createDiscordWelcomeCardTemplate(sampleData);

    // Create canvas
    const canvas = createCanvas(config.width, config.height);
    const ctx = canvas.getContext('2d');

    // Set white background with border (matching portfolio design)
    ctx.fillStyle = config.backgroundColor || '#ffffff';
    ctx.fillRect(0, 0, config.width, config.height);
    
    // Add a subtle border around the entire card
    ctx.strokeStyle = '#e0e0e0';
    ctx.lineWidth = 1;
    ctx.strokeRect(0, 0, config.width, config.height);

    // Handle profile image
    const profileSize = 140;
    const profileX = 20;
    const profileY = 35;
    
    // Try to load profile image if provided in sample data
    if (sampleData.profilePicUrl) {
      try {
        console.log('🖼️ Fetching Discord profile image:', sampleData.profilePicUrl);
        const profileImage = await fetchAndLoadImage(sampleData.profilePicUrl);
        
        if (profileImage) {
          // Draw the profile image (square, matching portfolio design)
          ctx.drawImage(
            profileImage, 
            profileX, 
            profileY, 
            profileSize, 
            profileSize
          );
          
          console.log('✅ Discord profile image added successfully');
        } else {
          throw new Error('Failed to load profile image');
        }
      } catch (error) {
        console.warn('⚠️ Could not load Discord profile image:', error);
        // Draw fallback gray square
        ctx.fillStyle = '#666666';
        ctx.fillRect(profileX, profileY, profileSize, profileSize);
      }
    } else {
      // Draw default gray square placeholder
      ctx.fillStyle = '#666666';
      ctx.fillRect(profileX, profileY, profileSize, profileSize);
    }

    // Render template layout
    if (config.layout && config.layout.length > 0) {
      for (const item of config.layout) {
        let value = item.text || sampleData[item.key as keyof typeof sampleData] || '';
        if (!value) continue;

        const fontSize = item.fontSize || 16;
        const color = item.color || '#000000';
        
        ctx.fillStyle = color;
        ctx.font = `${fontSize}px Arial`;

        if (item.maxWidth) {
          const lines = wrapText(ctx, value, item.maxWidth);
          lines.forEach((line, index) => {
            let x = item.x;
            
            const align = item.align as 'left' | 'center' | 'right' | undefined;
            if (align === 'center') {
              const textWidth = ctx.measureText(line).width;
              x = item.x - textWidth / 2;
            } else if (align === 'right') {
              const textWidth = ctx.measureText(line).width;
              x = item.x - textWidth;
            }
            
            ctx.fillText(line, x, item.y + (index * fontSize * 1.2));
          });
        } else {
          let x = item.x;
          
          const align = item.align as 'left' | 'center' | 'right' | undefined;
          if (align === 'center') {
            const textWidth = ctx.measureText(value).width;
            x = item.x - textWidth / 2;
          } else if (align === 'right') {
            const textWidth = ctx.measureText(value).width;
            x = item.x - textWidth;
          }
          
          ctx.fillText(value, x, item.y);
        }
      }
    }

    // Convert canvas to buffer
    const buffer = canvas.toBuffer('image/png');

    // Set response headers
    res.setHeader('Content-Type', 'image/png');
    res.setHeader('Content-Disposition', 'inline; filename="discord-welcome-preview.png"');
    
    // Send the image
    res.send(buffer);

  } catch (error) {
    console.error('Error generating preview:', error);
    res.status(500).json({ error: 'Failed to generate preview' });
  }
});

// Generate portfolio card preview image with sample data
app.get('/api/preview/portfolio', async (req, res) => {
  try {
    const sampleData = {
      name: '[name]',
      location: 'BROOKLYN, NY',
      title: 'Graphic Designer',
      handle: '@lxprofilel',
      description: 'Graphic and visual design',
      projects: 'Finishing my portfolio',
      skills: ['Listen to lo-fi music', 'Play Animal Crossing'],
      profilePicUrl: '' // Optional - leave empty for gray placeholder or provide URL
    };

    const config = createPortfolioCardTemplate(sampleData);

    // Create canvas
    const canvas = createCanvas(config.width, config.height);
    const ctx = canvas.getContext('2d');

    // Set white background
    ctx.fillStyle = config.backgroundColor || '#ffffff';
    ctx.fillRect(0, 0, config.width, config.height);

    // Handle profile image for portfolio card
    const profileSize = 140;
    const profileX = 20;
    const profileY = 35;
    
    // Try to load profile image if provided in sample data
    if (sampleData.profilePicUrl) {
      try {
        console.log('🖼️ Fetching portfolio profile image:', sampleData.profilePicUrl);
        const profileImage = await fetchAndLoadImage(sampleData.profilePicUrl);
        
        if (profileImage) {
          // Draw the profile image (square, not circular for portfolio)
          ctx.drawImage(
            profileImage, 
            profileX, 
            profileY, 
            profileSize, 
            profileSize
          );
          
          console.log('✅ Portfolio profile image added successfully');
        } else {
          throw new Error('Failed to load profile image');
        }
      } catch (error) {
        console.warn('⚠️ Could not load portfolio profile image:', error);
        // Draw fallback gray square
        ctx.fillStyle = '#666666';
        ctx.fillRect(profileX, profileY, profileSize, profileSize);
      }
    } else {
      // Draw default gray square placeholder
      ctx.fillStyle = '#666666';
      ctx.fillRect(profileX, profileY, profileSize, profileSize);
    }

    // Add a subtle border around the entire card
    ctx.strokeStyle = '#e0e0e0';
    ctx.lineWidth = 1;
    ctx.strokeRect(0, 0, config.width, config.height);

    // Render template layout
    if (config.layout && config.layout.length > 0) {
      for (const item of config.layout) {
        // Special handling for skills list
        if ((item as any).skillsList && (config as any).skillsData) {
          const skillsArray = (config as any).skillsData;
          if (Array.isArray(skillsArray)) {
            const fontSize = item.fontSize || 16;
            const color = item.color || '#000000';
            ctx.fillStyle = color;
            ctx.font = `${fontSize}px Arial`;
            
            skillsArray.forEach((skill, index) => {
              const bulletText = `• ${skill}`;
              ctx.fillText(bulletText, item.x, item.y + (index * fontSize * 1.3));
            });
          }
          continue;
        }
        
        let value = item.text || sampleData[item.key as keyof typeof sampleData] || '';
        if (!value) continue;

        // Convert array to string if needed (but skip for skills since we handle that specially)
        if (Array.isArray(value) && item.key !== 'skills') {
          value = value.join(', ');
        }

        const fontSize = item.fontSize || 16;
        const color = item.color || '#000000';
        
        ctx.fillStyle = color;
        ctx.font = `${fontSize}px Arial`;

        if (item.maxWidth) {
          const lines = wrapText(ctx, value.toString(), item.maxWidth);
          lines.forEach((line, index) => {
            let x = item.x;
            
            const align = item.align as 'left' | 'center' | 'right' | undefined;
            if (align === 'center') {
              const textWidth = ctx.measureText(line).width;
              x = item.x - textWidth / 2;
            } else if (align === 'right') {
              const textWidth = ctx.measureText(line).width;
              x = item.x - textWidth;
            }
            
            ctx.fillText(line, x, item.y + (index * fontSize * 1.2));
          });
        } else {
          let x = item.x;
          
          const align = item.align as 'left' | 'center' | 'right' | undefined;
          if (align === 'center') {
            const textWidth = ctx.measureText(value.toString()).width;
            x = item.x - textWidth / 2;
          } else if (align === 'right') {
            const textWidth = ctx.measureText(value.toString()).width;
            x = item.x - textWidth;
          }
          
          ctx.fillText(value.toString(), x, item.y);
        }
      }
    }

    // Convert canvas to buffer
    const buffer = canvas.toBuffer('image/png');

    // Set response headers
    res.setHeader('Content-Type', 'image/png');
    res.setHeader('Content-Disposition', 'inline; filename="portfolio-preview.png"');
    
    // Send the image
    res.send(buffer);

  } catch (error) {
    console.error('Error generating portfolio preview:', error);
    res.status(500).json({ error: 'Failed to generate portfolio preview' });
  }
});

// Template preview interface - HTML page
app.get('/preview', (req, res) => {
  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Template Preview - Image Generator API</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            padding: 20px;
        }
        
        .container {
            max-width: 1200px;
            margin: 0 auto;
            background: white;
            border-radius: 12px;
            box-shadow: 0 20px 60px rgba(0,0,0,0.1);
            overflow: hidden;
        }
        
        .header {
            background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
            color: white;
            padding: 2rem;
            text-align: center;
        }
        
        .header h1 {
            font-size: 2.5rem;
            margin-bottom: 0.5rem;
            font-weight: 700;
        }
        
        .header p {
            font-size: 1.1rem;
            opacity: 0.9;
        }
        
        .content {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 2rem;
            padding: 2rem;
        }
        
        .preview-section {
            background: #f8fafc;
            border-radius: 8px;
            padding: 1.5rem;
            border: 2px solid #e2e8f0;
        }
        
        .preview-section h2 {
            color: #1a202c;
            margin-bottom: 1rem;
            font-size: 1.5rem;
            display: flex;
            align-items: center;
            gap: 0.5rem;
        }
        
        .preview-image {
            max-width: 100%;
            border-radius: 8px;
            box-shadow: 0 10px 30px rgba(0,0,0,0.2);
            border: 3px solid #ffd700;
        }
        
        .template-info {
            background: white;
            border-radius: 8px;
            padding: 1rem;
            margin-top: 1rem;
            border-left: 4px solid #667eea;
        }
        
        .template-info h3 {
            color: #2d3748;
            margin-bottom: 0.5rem;
        }
        
        .template-info pre {
            background: #f7fafc;
            padding: 1rem;
            border-radius: 6px;
            overflow-x: auto;
            font-size: 0.9rem;
            border: 1px solid #e2e8f0;
        }
        
        .json-section {
            background: #1a202c;
            color: #e2e8f0;
            border-radius: 8px;
            padding: 1.5rem;
        }
        
        .json-section h2 {
            color: #ffd700;
            margin-bottom: 1rem;
        }
        
        .json-section pre {
            background: #2d3748;
            padding: 1rem;
            border-radius: 6px;
            overflow-x: auto;
            font-size: 0.9rem;
            border: 1px solid #4a5568;
            white-space: pre-wrap;
        }
        
        .refresh-btn {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            border: none;
            padding: 12px 24px;
            border-radius: 6px;
            cursor: pointer;
            font-size: 1rem;
            font-weight: 600;
            margin-top: 1rem;
            transition: all 0.3s ease;
        }
        
        .refresh-btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 10px 25px rgba(102, 126, 234, 0.3);
        }
        
        @media (max-width: 768px) {
            .content {
                grid-template-columns: 1fr;
            }
            
            .header h1 {
                font-size: 2rem;
            }
        }
        
        .loading {
            text-align: center;
            padding: 2rem;
            color: #64748b;
        }
        
        .error {
            background: #fee2e2;
            color: #dc2626;
            padding: 1rem;
            border-radius: 6px;
            border: 1px solid #fecaca;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🎨 Template Preview</h1>
            <p>Preview your Discord welcome card and portfolio templates</p>
        </div>
        
        <div class="content">
            <div class="preview-section">
                <h2>🖼️ Template Previews</h2>
                
                <div style="margin-bottom: 2rem;">
                    <h3 style="margin-bottom: 1rem;">Discord Welcome Card</h3>
                    <img src="/api/preview/discord-welcome" alt="Discord Welcome Card Preview" class="preview-image" id="discordPreviewImage">
                    <button class="refresh-btn" onclick="refreshDiscordPreview()">🔄 Refresh Discord Preview</button>
                </div>
                
                <div style="margin-bottom: 2rem;">
                    <h3 style="margin-bottom: 1rem;">Portfolio Card</h3>
                    <img src="/api/preview/portfolio" alt="Portfolio Card Preview" class="preview-image" id="portfolioPreviewImage">
                    <button class="refresh-btn" onclick="refreshPortfolioPreview()">🔄 Refresh Portfolio Preview</button>
                </div>
                
                <div class="template-info">
                    <h3>📊 Template Details</h3>
                    <pre>Both templates use the same clean design:

Discord Welcome Card: 500 x 320 pixels
- Clean white background with subtle border
- Square profile placeholder
- Left column: Name, Role, Timezone, Welcome message
- Right sections: Skills, Projects/Social, Info

Portfolio Card: 500 x 320 pixels  
- Clean white background with subtle border
- Square profile placeholder
- Left column: Name, Location, Title, Social handle
- Right sections: Description, Projects, Skills (bullet points)</pre>
                </div>
            </div>
            
            <div class="json-section">
                <h2>📋 Template Structures</h2>
                <div style="margin-bottom: 1rem;">
                    <button class="refresh-btn" onclick="loadDiscordTemplate()" style="margin-right: 1rem;">Load Discord Template</button>
                    <button class="refresh-btn" onclick="loadPortfolioTemplate()">Load Portfolio Template</button>
                </div>
                <div id="templateData" class="loading">Click a button above to load template data...</div>
            </div>
        </div>
    </div>

    <script>
        async function loadDiscordTemplate() {
            try {
                const response = await fetch('/api/templates/discord-welcome');
                const data = await response.json();
                
                document.getElementById('templateData').innerHTML = 
                    '<h4 style="color: #ffd700; margin-bottom: 1rem;">Discord Welcome Card Template</h4><pre>' + JSON.stringify(data, null, 2) + '</pre>';
            } catch (error) {
                document.getElementById('templateData').innerHTML = 
                    '<div class="error">Error loading Discord template data: ' + error.message + '</div>';
            }
        }
        
        async function loadPortfolioTemplate() {
            try {
                const response = await fetch('/api/templates/portfolio');
                const data = await response.json();
                
                document.getElementById('templateData').innerHTML = 
                    '<h4 style="color: #ffd700; margin-bottom: 1rem;">Portfolio Card Template</h4><pre>' + JSON.stringify(data, null, 2) + '</pre>';
            } catch (error) {
                document.getElementById('templateData').innerHTML = 
                    '<div class="error">Error loading Portfolio template data: ' + error.message + '</div>';
            }
        }
        
        function refreshDiscordPreview() {
            const img = document.getElementById('discordPreviewImage');
            const timestamp = new Date().getTime();
            img.src = '/api/preview/discord-welcome?' + timestamp;
        }
        
        function refreshPortfolioPreview() {
            const img = document.getElementById('portfolioPreviewImage');
            const timestamp = new Date().getTime();
            img.src = '/api/preview/portfolio?' + timestamp;
        }
        
        // Load Discord template data on page load by default
        loadDiscordTemplate();
    </script>
</body>
</html>
  `;
  
  res.setHeader('Content-Type', 'text/html');
  res.send(html);
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
      'GET /api/templates/discord-welcome': {
        description: 'Get Discord welcome card template structure with sample data',
        response: {
          template: 'object - template configuration',
          sampleData: 'object - sample data used in preview',
          description: 'string - template description'
        }
      },
      'GET /api/templates/portfolio': {
        description: 'Get Portfolio card template structure with sample data',
        response: {
          template: 'object - template configuration',
          sampleData: 'object - sample data used in preview',
          description: 'string - template description'
        }
      },
      'GET /api/preview/discord-welcome': {
        description: 'Generate a preview image of the Discord welcome card template',
        response: {
          type: 'image/png',
          description: 'Preview PNG image with sample data'
        }
      },
      'GET /api/preview/portfolio': {
        description: 'Generate a preview image of the Portfolio card template',
        response: {
          type: 'image/png',
          description: 'Preview PNG image with sample data'
        }
      },
      'GET /preview': {
        description: 'Interactive HTML preview interface for templates',
        response: {
          type: 'text/html',
          description: 'HTML page with template preview and structure viewer'
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
    health: '/api/health',
    preview: '/preview',
    endpoints: {
      'Template Preview': '/preview',
      'Discord Template': '/api/templates/discord-welcome',
      'Portfolio Template': '/api/templates/portfolio',
      'Discord Preview': '/api/preview/discord-welcome',
      'Portfolio Preview': '/api/preview/portfolio'
    }
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Image Generator API running on port ${PORT}`);
  console.log(`📚 API Documentation: http://localhost:${PORT}/api/docs`);
  console.log(`❤️  Health Check: http://localhost:${PORT}/api/health`);
  console.log(`🎨 Template Preview: http://localhost:${PORT}/preview`);
});
