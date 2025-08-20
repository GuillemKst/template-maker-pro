/**
 * Test Discord WebP Profile Image Support
 * 
 * This tests the updated API with a Discord WebP profile URL
 */

const API_URL = 'https://template-maker-pro.onrender.com';

async function testDiscordWebP() {
  try {
    console.log('🧪 Testing Discord WebP profile image support...');
    
    const testData = {
      data: {
        name: "Test User",
        role: "Member", 
        timezone: "Europe/London",
        skills: "JavaScript, Node.js, React",
        projects: "Getting Started",
        profilePicUrl: "https://cdn.discordapp.com/avatars/678243063549919253/ac5a5ea8aad73497c50144a46809b970.webp?size=512"
      }
    };

    console.log('📤 Sending request with WebP profile URL...');
    
    const response = await fetch(`${API_URL}/api/generate-image`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testData)
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.status} - ${response.statusText}`);
    }

    const buffer = await response.arrayBuffer();
    console.log('✅ Success! Image generated with size:', buffer.byteLength, 'bytes');
    
    // Save the test image
    const fs = require('fs');
    fs.writeFileSync('test-discord-webp-result.png', Buffer.from(buffer));
    console.log('💾 Test image saved as test-discord-webp-result.png');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

// Run the test
testDiscordWebP();

