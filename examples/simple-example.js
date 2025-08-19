// Simple example of using the Image Generator API
// Run this with: node examples/simple-example.js

import fetch from 'node-fetch';
import fs from 'fs';

const API_URL = 'http://localhost:3000';

async function generateSimpleImage() {
  const response = await fetch(`${API_URL}/api/generate-image`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      data: {
        name: 'Alice Johnson',
        email: 'alice@example.com',
        date: new Date().toISOString().split('T')[0],
        title: 'Employee of the Month'
      }
    })
  });

  if (response.ok) {
    const buffer = await response.buffer();
    fs.writeFileSync('examples/simple-output.png', buffer);
    console.log('✅ Simple image generated: examples/simple-output.png');
  } else {
    console.error('❌ Error:', response.statusText);
  }
}

async function generateCustomImage() {
  const response = await fetch(`${API_URL}/api/generate-image`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      data: {
        title: 'Achievement Certificate',
        recipient: 'Sarah Wilson',
        achievement: 'Outstanding Performance',
        date: 'December 2024',
        signature: 'Director of Operations'
      },
      template: {
        width: 1000,
        height: 700,
        backgroundColor: '#ffffff',
        layout: [
          {
            key: 'title',
            x: 500,
            y: 80,
            fontSize: 32,
            color: '#2c3e50',
            align: 'center'
          },
          {
            key: 'recipient',
            x: 500,
            y: 250,
            fontSize: 28,
            color: '#e74c3c',
            align: 'center'
          },
          {
            key: 'achievement',
            x: 500,
            y: 350,
            fontSize: 20,
            align: 'center'
          },
          {
            key: 'date',
            x: 200,
            y: 550,
            fontSize: 16,
            align: 'left'
          },
          {
            key: 'signature',
            x: 800,
            y: 550,
            fontSize: 16,
            align: 'right'
          }
        ]
      }
    })
  });

  if (response.ok) {
    const buffer = await response.buffer();
    fs.writeFileSync('examples/custom-output.png', buffer);
    console.log('✅ Custom image generated: examples/custom-output.png');
  } else {
    console.error('❌ Error:', response.statusText);
  }
}

async function main() {
  console.log('🎨 Image Generator API Examples\n');
  
  try {
    await generateSimpleImage();
    await generateCustomImage();
    console.log('\n🎉 All examples completed successfully!');
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.log('\n💡 Make sure the API server is running: npm run dev');
  }
}

main();
