/**
 * Discord Bot Integration for Welcome Card Image Generation
 * 
 * This code shows how to integrate the Canvas-based image generation API
 * into your Discord bot to create beautiful welcome cards.
 */

const { Client, GatewayIntentBits, AttachmentBuilder } = require('discord.js');

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
    console.log('🎨 Generating welcome card for:', data.name);
    
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

    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    
    console.log('✅ Welcome card generated successfully! Size:', buffer.length, 'bytes');
    return buffer;
    
  } catch (error) {
    console.error('❌ Error generating welcome card:', error);
    throw error;
  }
}

/**
 * Send welcome card to Discord channel
 * @param {Object} channel - Discord channel object
 * @param {Object} member - Discord member object
 * @param {Object} userData - Custom user data for the card
 */
async function sendWelcomeCard(channel, member, userData = {}) {
  try {
    // Default user data with fallbacks
    const welcomeData = {
      name: userData.name || member.displayName || member.user.username,
      role: userData.role || "New Member",
      timezone: userData.timezone || "Unknown",
      skills: userData.skills || "Getting Started",
      projects: userData.projects || "First Steps"
    };

    console.log('🚀 Creating welcome card for:', welcomeData.name);

    // Generate the image
    const imageBuffer = await generateWelcomeCard(welcomeData);
    
    // Create Discord attachment
    const attachment = new AttachmentBuilder(imageBuffer, { 
      name: 'welcome-card.png' 
    });
    
    // Send the welcome message with image
    await channel.send({
      content: `🎉 Welcome to the server, ${welcomeData.name}! 🎉`,
      files: [attachment]
    });
    
    console.log('✅ Welcome card sent successfully!');
    
  } catch (error) {
    console.error('❌ Failed to send welcome card:', error);
    
    // Fallback to text-only welcome
    await channel.send({
      content: `🎉 Welcome to the server, ${member.displayName || member.user.username}! 🎉\n*(Welcome card temporarily unavailable)*`
    });
  }
}

// Initialize Discord client
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

// Bot ready event
client.once('ready', () => {
  console.log('🤖 Discord bot is ready!');
  console.log(`👋 Logged in as ${client.user.tag}`);
  console.log('🎨 Welcome card API:', API_URL);
});

// Welcome new members
client.on('guildMemberAdd', async (member) => {
  console.log('👋 New member joined:', member.user.username);
  
  // Find welcome channel (adjust channel name as needed)
  const welcomeChannel = member.guild.channels.cache.find(
    channel => channel.name === 'welcome' || channel.name === 'general'
  );
  
  if (!welcomeChannel) {
    console.log('⚠️ No welcome channel found');
    return;
  }

  // You can customize this data based on your server's needs
  const customUserData = {
    name: member.displayName || member.user.username,
    role: "New Developer", // Customize based on your server
    timezone: "Ask them!", 
    skills: "Learning & Growing",
    projects: "Getting Started"
  };

  await sendWelcomeCard(welcomeChannel, member, customUserData);
});

// Command to test welcome card (optional)
client.on('messageCreate', async (message) => {
  if (message.author.bot) return;
  
  // Test command: !testwelcome
  if (message.content.startsWith('!testwelcome')) {
    console.log('🧪 Testing welcome card command');
    
    const testData = {
      name: message.author.displayName || message.author.username,
      role: "Test User",
      timezone: "Test/Timezone",
      skills: "JavaScript, Node.js, Discord.js",
      projects: "Discord Bots, APIs"
    };

    await sendWelcomeCard(message.channel, message.member, testData);
  }
  
  // Admin command to welcome specific user: !welcome @user
  if (message.content.startsWith('!welcome') && message.mentions.members.size > 0) {
    if (!message.member.permissions.has('MANAGE_MESSAGES')) {
      return message.reply('❌ You need Manage Messages permission to use this command.');
    }
    
    const targetMember = message.mentions.members.first();
    const customData = {
      name: targetMember.displayName || targetMember.user.username,
      role: "Welcome!",
      timezone: "Ask them!",
      skills: "Awesome Skills",
      projects: "Cool Projects"
    };
    
    await sendWelcomeCard(message.channel, targetMember, customData);
  }
});

// Error handling
client.on('error', (error) => {
  console.error('🚨 Discord client error:', error);
});

process.on('unhandledRejection', (error) => {
  console.error('🚨 Unhandled promise rejection:', error);
});

// Export for use in other files
module.exports = {
  client,
  generateWelcomeCard,
  sendWelcomeCard
};

// If running this file directly, start the bot
if (require.main === module) {
  // Replace with your bot token
  const BOT_TOKEN = process.env.DISCORD_BOT_TOKEN || 'YOUR_BOT_TOKEN_HERE';
  
  if (BOT_TOKEN === 'YOUR_BOT_TOKEN_HERE') {
    console.error('❌ Please set your Discord bot token in DISCORD_BOT_TOKEN environment variable');
    process.exit(1);
  }
  
  client.login(BOT_TOKEN);
}
