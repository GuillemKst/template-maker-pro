/**
 * Discord Bot Endpoint Function
 * 
 * Add this function to your existing Discord bot to generate welcome cards
 */

// Your Render.com API URL
const API_URL = 'https://template-maker-pro.onrender.com';

/**
 * Generate and send welcome card image
 * @param {Object} channel - Discord channel to send to
 * @param {Object} userData - User data for the welcome card
 * @param {string} userData.name - User's name
 * @param {string} userData.role - User's role/description  
 * @param {string} userData.timezone - User's timezone
 * @param {string} userData.skills - User's skills
 * @param {string} userData.projects - User's projects
 * @returns {Promise<void>}
 */
async function sendWelcomeCard(channel, userData) {
  try {
    // Call your Render API
    const response = await fetch(`${API_URL}/api/generate-image`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ data: userData }),
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`);
    }

    // Get image buffer
    const arrayBuffer = await response.arrayBuffer();
    const imageBuffer = Buffer.from(arrayBuffer);
    
    // Create Discord attachment
    const { AttachmentBuilder } = require('discord.js');
    const attachment = new AttachmentBuilder(imageBuffer, { 
      name: 'welcome-card.png' 
    });
    
    // Send to Discord
    await channel.send({
      content: `🎉 Welcome ${userData.name}! 🎉`,
      files: [attachment]
    });
    
    console.log('✅ Welcome card sent successfully!');
    
  } catch (error) {
    console.error('❌ Error generating welcome card:', error);
    
    // Fallback message
    await channel.send(`🎉 Welcome ${userData.name}! 🎉`);
  }
}

module.exports = { sendWelcomeCard };
