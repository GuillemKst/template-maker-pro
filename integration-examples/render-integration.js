/**
 * Working Integration Example for Render.com Deployment
 * 
 * This example shows how to integrate with the Canvas-based image generation API
 * deployed on Render.com. Use this code in your Discord/Telegram bot.
 */

// Your Render.com API URL
const API_URL = 'https://template-maker-pro.onrender.com';

/**
 * Generate a welcome card image
 * @param {Object} data - Welcome card data
 * @param {string} data.name - User's name
 * @param {string} data.role - User's role/description
 * @param {string} data.timezone - User's timezone
 * @param {string} data.skills - User's skills
 * @param {string} data.projects - User's projects
 * @returns {Promise<Buffer>} - Image buffer
 */
async function generateWelcomeCard(data) {
  try {
    const response = await fetch(`${API_URL}/api/generate-image`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ data }),
    });

    if (!response.ok) {
      throw new Error(`API responded with status: ${response.status}`);
    }

    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('image/png')) {
      const errorText = await response.text();
      throw new Error(`Expected image/png, got: ${contentType}. Response: ${errorText}`);
    }

    return await response.buffer();
  } catch (error) {
    console.error('Error generating welcome card:', error);
    throw error;
  }
}

// Example usage for Discord.js
async function sendWelcomeCardDiscord(channel, userData) {
  try {
    const imageBuffer = await generateWelcomeCard(userData);
    
    await channel.send({
      files: [{
        attachment: imageBuffer,
        name: 'welcome-card.png'
      }]
    });
  } catch (error) {
    console.error('Failed to send welcome card:', error);
    await channel.send('Welcome! (Unable to generate welcome card)');
  }
}

// Example usage for Telegram Bot
async function sendWelcomeCardTelegram(bot, chatId, userData) {
  try {
    const imageBuffer = await generateWelcomeCard(userData);
    
    await bot.sendPhoto(chatId, imageBuffer, {
      caption: `Welcome ${userData.name}! 🎉`
    });
  } catch (error) {
    console.error('Failed to send welcome card:', error);
    await bot.sendMessage(chatId, `Welcome ${userData.name}! 🎉`);
  }
}

// Example data
const exampleWelcomeData = {
  name: "Guillem",
  role: "I'm a builder",
  timezone: "Spain/Barcelona", 
  skills: "JavaScript, Node.js, React, TypeScript, MongoDB",
  projects: "Image Generator API, Discord Bots, Telegram Integrations"
};

module.exports = {
  generateWelcomeCard,
  sendWelcomeCardDiscord,
  sendWelcomeCardTelegram,
  exampleWelcomeData
};
