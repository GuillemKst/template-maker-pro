# 🤖 Bot Integration Guide

## Quick Start

Copy this function into your existing bot:

```javascript
async function generateWelcomeCard(name, role, timezone, skills, projects) {
  const response = await fetch('http://localhost:3000/api/generate-image', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      data: { name, role, timezone, skills, projects }
    })
  });
  
  if (!response.ok) throw new Error(`API Error: ${response.status}`);
  return await response.buffer(); // Image ready to send!
}
```

## Integration Examples

### Discord Bot
```javascript
// Send welcome card to Discord channel
const imageBuffer = await generateWelcomeCard('Guillem', "I'm a builder", 'Spain/Barcelona', 'JavaScript', 'APIs');

const { AttachmentBuilder } = require('discord.js');
const attachment = new AttachmentBuilder(imageBuffer, { name: 'welcome.png' });

await channel.send({
  content: '👋 Welcome!',
  files: [attachment]
});
```

### Telegram Bot
```javascript
// Send welcome card to Telegram
const imageBuffer = await generateWelcomeCard('Guillem', "I'm a builder", 'Spain/Barcelona', 'JavaScript', 'APIs');

await bot.sendPhoto(chatId, imageBuffer, {
  caption: '👋 Welcome Guillem!'
});
```

### Discord Webhook
```javascript
// Send via webhook
const imageBuffer = await generateWelcomeCard('Guillem', "I'm a builder", 'Spain/Barcelona', 'JavaScript', 'APIs');

const FormData = require('form-data');
const form = new FormData();
form.append('content', '👋 Welcome!');
form.append('file', imageBuffer, 'welcome.png');

await fetch(webhookUrl, { method: 'POST', body: form });
```

## Parameters

| Parameter | Description | Example |
|-----------|-------------|---------|
| `name` | User's name | `"Guillem"` |
| `role` | User's role/description | `"I'm a builder"` |
| `timezone` | User's timezone | `"Spain/Barcelona"` |
| `skills` | User's skills (comma separated) | `"JavaScript, Node.js, React"` |
| `projects` | User's projects description | `"Discord Bots, APIs, Web Apps"` |

## What You Get

- **Beautiful dark themed welcome card**
- **PNG image buffer** ready to send
- **No file saving needed** - direct memory transfer
- **Perfect for Discord/Telegram** integration

## API URL

- **Development**: `http://localhost:3000`
- **Production**: Change to your deployed API URL

## Files

- `quick-integration.js` - Copy-paste examples
- `api-integration.js` - Complete integration functions

Just copy the functions you need into your existing bot! 🚀
