/**
 * Updated Discord Bot Integration
 * 
 * This uses the exact data structure expected by your updated API endpoint
 */

const { AttachmentBuilder } = require('discord.js');

// Your Render.com API URL
const API_URL = 'https://template-maker-pro.onrender.com';

/**
 * Generate Discord welcome card with profile picture
 * @param {Object} channel - Discord channel to send to
 * @param {Object} member - Discord member object
 * @param {Object} formData - Data from Discord introduction form
 * @param {string} formData.name - User's actual name from form
 * @param {string} formData.timezone - User's timezone (e.g., Europe/London)
 * @param {string} formData.skills - User's skills as comma-separated string
 * @param {string} formData.projects - User's X/Twitter profile URL or 'Getting Started'
 */
async function generateDiscordWelcomeCard(channel, member, formData) {
  try {
    console.log('🎨 Generating Discord welcome card for:', formData.name);
    
    // Prepare the exact data structure your API expects
    const requestData = {
      data: {
        name: formData.name,
        role: "Member",
        timezone: formData.timezone,
        skills: formData.skills,
        projects: formData.projects,
        profilePicUrl: member.user.displayAvatarURL({ format: 'png', size: 256 })
      }
    };

    console.log('📤 Sending request to API:', JSON.stringify(requestData, null, 2));

    // Call your updated API endpoint
    const response = await fetch(`${API_URL}/api/generate-image`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestData),
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.status} - ${response.statusText}`);
    }

    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('image/png')) {
      const errorText = await response.text();
      throw new Error(`Expected image/png, got: ${contentType}. Response: ${errorText}`);
    }

    // Get the image buffer
    const arrayBuffer = await response.arrayBuffer();
    const imageBuffer = Buffer.from(arrayBuffer);
    
    console.log('✅ Welcome card generated! Size:', imageBuffer.length, 'bytes');

    // Create Discord attachment
    const attachment = new AttachmentBuilder(imageBuffer, { 
      name: 'welcome-card.png' 
    });
    
    // Send to Discord
    await channel.send({
      content: `🎉 Welcome to the server, ${formData.name}! 🎉`,
      files: [attachment]
    });
    
    console.log('✅ Welcome card sent successfully!');
    
  } catch (error) {
    console.error('❌ Error generating welcome card:', error);
    
    // Fallback message
    await channel.send({
      content: `🎉 Welcome to the server, ${formData.name}! 🎉\n*(Welcome card temporarily unavailable)*`
    });
  }
}

/**
 * Example usage in your Discord bot when user completes introduction form
 */
function exampleUsage() {
  // Example: When user completes their Discord introduction
  client.on('interactionCreate', async (interaction) => {
    if (!interaction.isModalSubmit()) return;
    if (interaction.customId !== 'introduction-form') return;

    // Get form data
    const formData = {
      name: interaction.fields.getTextInputValue('name-input'),
      timezone: interaction.fields.getTextInputValue('timezone-input'), // e.g., "Europe/London"
      skills: interaction.fields.getTextInputValue('skills-input'),     // e.g., "JavaScript, Node.js, React"
      projects: interaction.fields.getTextInputValue('projects-input')  // Twitter URL or "Getting Started"
    };

    // Find welcome channel
    const welcomeChannel = interaction.guild.channels.cache.find(
      ch => ch.name === 'welcome' || ch.name === 'introductions'
    );

    if (welcomeChannel) {
      await generateDiscordWelcomeCard(welcomeChannel, interaction.member, formData);
    }

    await interaction.reply({ 
      content: 'Thanks for your introduction! Check out the welcome channel! 🎉', 
      ephemeral: true 
    });
  });
}

/**
 * Simple test function
 */
async function testWelcomeCard(channel, member) {
  const testData = {
    name: member.displayName || member.user.username,
    timezone: "Europe/London",
    skills: "JavaScript, Node.js, Discord.js",
    projects: "Getting Started"
  };

  await generateDiscordWelcomeCard(channel, member, testData);
}

module.exports = {
  generateDiscordWelcomeCard,
  testWelcomeCard
};
