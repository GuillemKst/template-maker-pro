/**
 * Simple Endpoint Function for Existing Discord Bot
 * 
 * Copy this function into your existing bot code
 */

const { AttachmentBuilder } = require('discord.js');

async function generateWelcomeImage(channel, name, role = "New Member", timezone = "Unknown", skills = "Getting Started", projects = "First Steps") {
  try {
    // Call API
    const response = await fetch('https://template-maker-pro.onrender.com/api/generate-image', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        data: { name, role, timezone, skills, projects }
      })
    });

    // Get image
    const imageBuffer = Buffer.from(await response.arrayBuffer());
    
    // Send to Discord
    const attachment = new AttachmentBuilder(imageBuffer, { name: 'welcome.png' });
    await channel.send({
      content: `🎉 Welcome ${name}! 🎉`,
      files: [attachment]
    });
    
  } catch (error) {
    console.error('Welcome card error:', error);
    await channel.send(`🎉 Welcome ${name}! 🎉`);
  }
}

// Example usage in your existing bot:
// await generateWelcomeImage(channel, "Guillem", "Builder", "Spain/Barcelona", "JavaScript", "APIs");
