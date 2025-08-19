/**
 * Simple Discord Bot Example - Welcome Card Generation
 * 
 * Just the essential code to generate and send welcome cards
 */

const { AttachmentBuilder } = require('discord.js');

// Your Render.com API URL
const API_URL = 'https://template-maker-pro.onrender.com';

/**
 * Generate welcome card image
 */
async function generateWelcomeCard(userData) {
  const response = await fetch(`${API_URL}/api/generate-image`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ data: userData })
  });

  if (!response.ok) {
    throw new Error(`API Error: ${response.status}`);
  }

  const arrayBuffer = await response.arrayBuffer();
  return Buffer.from(arrayBuffer);
}

/**
 * Send welcome card to Discord
 */
async function sendWelcomeCard(channel, memberName) {
  try {
    // Prepare user data
    const userData = {
      name: memberName,
      role: "New Member",
      timezone: "Ask them!",
      skills: "Learning & Growing", 
      projects: "Getting Started"
    };

    // Generate image
    console.log('🎨 Generating welcome card...');
    const imageBuffer = await generateWelcomeCard(userData);
    
    // Create attachment
    const attachment = new AttachmentBuilder(imageBuffer, { 
      name: 'welcome-card.png' 
    });
    
    // Send message
    await channel.send({
      content: `🎉 Welcome ${memberName}! 🎉`,
      files: [attachment]
    });
    
    console.log('✅ Welcome card sent!');
    
  } catch (error) {
    console.error('❌ Error:', error);
    // Fallback message
    await channel.send(`🎉 Welcome ${memberName}! 🎉`);
  }
}

// Example usage in your bot:
/*
client.on('guildMemberAdd', async (member) => {
  const welcomeChannel = member.guild.channels.cache.find(ch => ch.name === 'welcome');
  if (welcomeChannel) {
    await sendWelcomeCard(welcomeChannel, member.displayName || member.user.username);
  }
});
*/

module.exports = { generateWelcomeCard, sendWelcomeCard };
