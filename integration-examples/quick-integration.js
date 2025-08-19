// 🚀 QUICK COPY-PASTE INTEGRATION
// Add these functions to your existing bot

// 1. MAIN API CALL FUNCTION (Required)
async function generateWelcomeCard(name, role, timezone, skills, projects) {
  // Use your deployed Vercel URL or localhost for development
  const API_URL = process.env.API_URL || 'https://your-app.vercel.app' || 'http://localhost:3000';
  
  const response = await fetch(`${API_URL}/api/generate-image`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      data: { name, role, timezone, skills, projects }
    })
  });
  
  if (!response.ok) throw new Error(`API Error: ${response.status}`);
  return await response.buffer(); // Returns image buffer
}

// 2. DISCORD INTEGRATION (if you have Discord bot)
async function sendToDiscord(channel, imageBuffer, userName) {
  const { AttachmentBuilder } = require('discord.js');
  const attachment = new AttachmentBuilder(imageBuffer, { name: 'welcome.png' });
  
  await channel.send({
    content: `👋 Welcome ${userName}!`,
    files: [attachment]
  });
}

// 3. TELEGRAM INTEGRATION (if you have Telegram bot)
async function sendToTelegram(bot, chatId, imageBuffer, userName) {
  await bot.sendPhoto(chatId, imageBuffer, {
    caption: `👋 Welcome ${userName}!`
  });
}

// 4. DISCORD WEBHOOK (if you use webhooks)
async function sendToWebhook(webhookUrl, imageBuffer, userName) {
  const FormData = require('form-data');
  const form = new FormData();
  form.append('content', `👋 Welcome ${userName}!`);
  form.append('file', imageBuffer, 'welcome.png');
  
  await fetch(webhookUrl, { method: 'POST', body: form });
}

// 📝 EXAMPLE USAGE IN YOUR BOT:

// Example 1: Discord command
bot.on('messageCreate', async (message) => {
  if (message.content === '!welcome') {
    try {
      const imageBuffer = await generateWelcomeCard(
        'Guillem',                    // name
        "I'm a builder",             // role  
        'Spain/Barcelona',           // timezone
        'JavaScript, Node.js',       // skills
        'Discord Bots, APIs'         // projects
      );
      
      await sendToDiscord(message.channel, imageBuffer, 'Guillem');
    } catch (error) {
      message.reply('❌ Error generating welcome card');
    }
  }
});

// Example 2: Telegram command
bot.onText(/\/welcome/, async (msg) => {
  try {
    const imageBuffer = await generateWelcomeCard(
      msg.from.first_name,         // name
      'Community member',          // role
      'Unknown',                   // timezone  
      'Getting started',           // skills
      'Welcome!'                   // projects
    );
    
    await sendToTelegram(bot, msg.chat.id, imageBuffer, msg.from.first_name);
  } catch (error) {
    bot.sendMessage(msg.chat.id, '❌ Error generating welcome card');
  }
});

// Example 3: Auto-welcome new Discord members
bot.on('guildMemberAdd', async (member) => {
  const welcomeChannel = member.guild.channels.cache.find(ch => ch.name === 'welcome');
  if (!welcomeChannel) return;
  
  try {
    const imageBuffer = await generateWelcomeCard(
      member.displayName,          // name
      'New member',               // role
      'Unknown',                  // timezone
      'Getting started',          // skills
      'Welcome to the server!'    // projects
    );
    
    await sendToDiscord(welcomeChannel, imageBuffer, member.displayName);
  } catch (error) {
    console.error('Welcome card error:', error);
  }
});

// 🎯 THAT'S IT! 
// Just change the API URL from localhost to your deployed API when ready.
