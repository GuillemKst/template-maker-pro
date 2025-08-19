// API Integration Examples for Your Existing Bot
// Copy these functions into your existing Discord/Telegram bot

import fetch from 'node-fetch';

const IMAGE_API_URL = 'http://localhost:3000'; // Change to your deployed API URL

/**
 * Generate Welcome Card - Main Function
 * Use this in your existing bot to generate welcome cards
 */
async function generateWelcomeCard(userData) {
  try {
    const response = await fetch(`${IMAGE_API_URL}/api/generate-image`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        data: {
          name: userData.name,
          role: userData.role,
          timezone: userData.timezone,
          skills: userData.skills,
          projects: userData.projects,
          profileImage: 'placeholder' // Optional
        }
      })
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }

    // Return the image as a buffer - ready to send to Discord/Telegram
    return await response.buffer();
  } catch (error) {
    console.error('Error generating welcome card:', error);
    throw error;
  }
}

/**
 * Discord Integration Example
 * Add this to your existing Discord bot
 */
async function sendWelcomeCardToDiscord(channel, userData) {
  try {
    // Generate the image
    const imageBuffer = await generateWelcomeCard(userData);
    
    // Create Discord attachment
    const { AttachmentBuilder, EmbedBuilder } = require('discord.js');
    const attachment = new AttachmentBuilder(imageBuffer, { name: 'welcome-card.png' });
    
    const embed = new EmbedBuilder()
      .setTitle(`👋 Welcome ${userData.name}!`)
      .setDescription('Here\'s your personalized welcome card')
      .setImage('attachment://welcome-card.png')
      .setColor('#ffd700')
      .setTimestamp();

    // Send to Discord channel
    await channel.send({
      embeds: [embed],
      files: [attachment]
    });
    
    console.log('✅ Welcome card sent to Discord');
  } catch (error) {
    console.error('❌ Error sending welcome card:', error);
  }
}

/**
 * Telegram Integration Example  
 * Add this to your existing Telegram bot
 */
async function sendWelcomeCardToTelegram(bot, chatId, userData) {
  try {
    // Generate the image
    const imageBuffer = await generateWelcomeCard(userData);
    
    // Send to Telegram
    await bot.sendPhoto(chatId, imageBuffer, {
      caption: `👋 Welcome ${userData.name}!\n\nHere's your personalized welcome card 🎨`,
      parse_mode: 'HTML'
    });
    
    console.log('✅ Welcome card sent to Telegram');
  } catch (error) {
    console.error('❌ Error sending welcome card:', error);
  }
}

/**
 * Discord Webhook Integration
 * If you're using webhooks instead of a bot
 */
async function sendWelcomeCardToWebhook(webhookUrl, userData) {
  try {
    const imageBuffer = await generateWelcomeCard(userData);
    
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
    }
  } catch (error) {
    console.error('❌ Error sending via webhook:', error);
  }
}

/**
 * Example Usage in Your Bot Commands
 */

// Example: Discord slash command handler
async function handleWelcomeCommand(interaction) {
  const userData = {
    name: interaction.options.getString('name') || interaction.user.displayName,
    role: interaction.options.getString('role') || "Community member",
    timezone: interaction.options.getString('timezone') || "Unknown",
    skills: interaction.options.getString('skills') || "Getting started",
    projects: interaction.options.getString('projects') || "Welcome to the community!"
  };
  
  await sendWelcomeCardToDiscord(interaction.channel, userData);
}

// Example: Telegram command handler  
async function handleTelegramWelcome(bot, msg) {
  const chatId = msg.chat.id;
  const userData = {
    name: msg.from.first_name || msg.from.username,
    role: "New member",
    timezone: "Unknown", 
    skills: "Getting started",
    projects: "Welcome to our community!"
  };
  
  await sendWelcomeCardToTelegram(bot, chatId, userData);
}

// Example: Auto-welcome new Discord members
async function handleNewMember(member) {
  const welcomeChannel = member.guild.channels.cache.find(ch => ch.name === 'welcome');
  if (!welcomeChannel) return;
  
  const userData = {
    name: member.displayName || member.user.username,
    role: "New member",
    timezone: "Unknown",
    skills: "Getting started", 
    projects: "Welcome to the server!"
  };
  
  await sendWelcomeCardToDiscord(welcomeChannel, userData);
}

// Export functions for use in your bot
export {
  generateWelcomeCard,
  sendWelcomeCardToDiscord,
  sendWelcomeCardToTelegram,
  sendWelcomeCardToWebhook,
  handleWelcomeCommand,
  handleTelegramWelcome,
  handleNewMember
};
