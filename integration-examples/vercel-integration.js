// 🚀 PRODUCTION READY - Integration with Your Vercel Domain
// template-maker-pro-4upiasdasd.vercel.app

// ✅ TESTED AND WORKING API CALL
async function generateWelcomeCard(name, role, timezone, skills, projects) {
  const response = await fetch('https://template-maker-pro-4upiasdasd.vercel.app/api/generate-image', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      data: { name, role, timezone, skills, projects }
    })
  });
  
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`API Error: ${response.status} - ${errorText}`);
  }
  
  return await response.buffer(); // Returns PNG image buffer
}

// 🤖 DISCORD BOT INTEGRATION
async function sendWelcomeToDiscord(channel, userData) {
  try {
    const imageBuffer = await generateWelcomeCard(
      userData.name,
      userData.role,
      userData.timezone,
      userData.skills,
      userData.projects
    );
    
    const { AttachmentBuilder, EmbedBuilder } = require('discord.js');
    const attachment = new AttachmentBuilder(imageBuffer, { name: 'welcome-card.png' });
    
    const embed = new EmbedBuilder()
      .setTitle(`👋 Welcome ${userData.name}!`)
      .setDescription('Here\'s your personalized welcome card')
      .setImage('attachment://welcome-card.png')
      .setColor('#ffd700')
      .setTimestamp();

    await channel.send({
      embeds: [embed],
      files: [attachment]
    });
    
    console.log('✅ Welcome card sent to Discord');
  } catch (error) {
    console.error('❌ Error sending welcome card:', error);
    throw error;
  }
}

// 📱 TELEGRAM BOT INTEGRATION
async function sendWelcomeToTelegram(bot, chatId, userData) {
  try {
    const imageBuffer = await generateWelcomeCard(
      userData.name,
      userData.role,
      userData.timezone,
      userData.skills,
      userData.projects
    );
    
    await bot.sendPhoto(chatId, imageBuffer, {
      caption: `👋 Welcome ${userData.name}!\n\nHere's your personalized welcome card 🎨`,
      parse_mode: 'HTML'
    });
    
    console.log('✅ Welcome card sent to Telegram');
  } catch (error) {
    console.error('❌ Error sending welcome card:', error);
    throw error;
  }
}

// 🌐 DISCORD WEBHOOK INTEGRATION
async function sendWelcomeToWebhook(webhookUrl, userData) {
  try {
    const imageBuffer = await generateWelcomeCard(
      userData.name,
      userData.role,
      userData.timezone,
      userData.skills,
      userData.projects
    );
    
    const FormData = require('form-data');
    const form = new FormData();
    
    form.append('content', `👋 Welcome ${userData.name}!`);
    form.append('file', imageBuffer, 'welcome-card.png');
    
    const response = await fetch(webhookUrl, {
      method: 'POST',
      body: form
    });
    
    if (response.ok) {
      console.log('✅ Welcome card sent via webhook');
    } else {
      throw new Error(`Webhook error: ${response.status}`);
    }
  } catch (error) {
    console.error('❌ Error sending via webhook:', error);
    throw error;
  }
}

// 📝 EXAMPLE USAGE

// Example 1: Discord command handler
async function handleDiscordWelcome(interaction) {
  const userData = {
    name: interaction.options.getString('name') || interaction.user.displayName,
    role: interaction.options.getString('role') || "Community member",
    timezone: interaction.options.getString('timezone') || "Unknown",
    skills: interaction.options.getString('skills') || "Getting started",
    projects: interaction.options.getString('projects') || "Welcome to the community!"
  };
  
  await sendWelcomeToDiscord(interaction.channel, userData);
}

// Example 2: Telegram command handler
async function handleTelegramWelcome(bot, msg) {
  const userData = {
    name: msg.from.first_name || msg.from.username,
    role: "New member",
    timezone: "Unknown",
    skills: "Getting started",
    projects: "Welcome to our community!"
  };
  
  await sendWelcomeToTelegram(bot, msg.chat.id, userData);
}

// Example 3: Auto-welcome new Discord members
async function handleNewDiscordMember(member) {
  const welcomeChannel = member.guild.channels.cache.find(ch => ch.name === 'welcome');
  if (!welcomeChannel) return;
  
  const userData = {
    name: member.displayName || member.user.username,
    role: "New member",
    timezone: "Unknown",
    skills: "Getting started",
    projects: "Welcome to the server!"
  };
  
  await sendWelcomeToDiscord(welcomeChannel, userData);
}

// 🧪 TEST FUNCTION
async function testAPI() {
  try {
    console.log('🧪 Testing Vercel API...');
    
    const testData = {
      name: 'Guillem',
      role: "I'm a builder",
      timezone: 'Spain/Barcelona',
      skills: 'JavaScript, Node.js, React, TypeScript',
      projects: 'Image Generator API, Discord Bots, Telegram Integrations'
    };
    
    const imageBuffer = await generateWelcomeCard(
      testData.name,
      testData.role,
      testData.timezone,
      testData.skills,
      testData.projects
    );
    
    console.log(`✅ API Test Successful! Generated ${imageBuffer.length} bytes`);
    console.log('🎯 Ready for production use!');
  } catch (error) {
    console.error('❌ API Test Failed:', error);
  }
}

// Export functions for use in your bot
module.exports = {
  generateWelcomeCard,
  sendWelcomeToDiscord,
  sendWelcomeToTelegram,
  sendWelcomeToWebhook,
  handleDiscordWelcome,
  handleTelegramWelcome,
  handleNewDiscordMember,
  testAPI
};

// Run test if this file is executed directly
if (require.main === module) {
  testAPI();
}
