#!/bin/bash

# Example: How your Telegram bot should call the API
# This generates a welcome card for Guillem

echo "🤖 Generating welcome card for Telegram bot..."

curl -X POST http://localhost:3000/api/generate-image \
  -H "Content-Type: application/json" \
  -d '{
    "data": {
      "name": "Guillem",
      "role": "I'\''m a builder",
      "timezone": "Spain/Barcelona", 
      "skills": "JavaScript, Node.js, React, TypeScript, MongoDB, Express, API Development, Telegram Bots",
      "projects": "Image Generator API, Discord Integrations, Full-stack Applications, Open Source Tools",
      "profileImage": "placeholder"
    }
  }' \
  --output examples/guillem-welcome.png

echo "✅ Welcome card generated: examples/guillem-welcome.png"
echo ""
echo "📱 For your Telegram bot, the equivalent JavaScript code would be:"
echo ""
echo "const response = await fetch('http://your-api-domain.com/api/generate-image', {"
echo "  method: 'POST',"
echo "  headers: { 'Content-Type': 'application/json' },"
echo "  body: JSON.stringify({"
echo "    data: {"
echo "      name: userInput.name,"
echo "      role: userInput.role,"
echo "      timezone: userInput.timezone,"
echo "      skills: userInput.skills,"
echo "      projects: userInput.projects"
echo "    }"
echo "  })"
echo "});"
echo ""
echo "const imageBuffer = await response.buffer();"
echo "// Now send imageBuffer directly to Discord or back to Telegram"
