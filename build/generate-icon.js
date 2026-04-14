const fs = require('fs');
const path = require('path');

// Create a simple SVG duck icon
const svgIcon = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="512" height="512" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
  <!-- Background -->
  <rect width="512" height="512" fill="#4A90E2"/>
  
  <!-- Duck Body -->
  <ellipse cx="256" cy="300" rx="120" ry="80" fill="#FFD700"/>
  
  <!-- Duck Head -->
  <circle cx="340" cy="220" r="60" fill="#FFD700"/>
  
  <!-- Beak -->
  <ellipse cx="390" cy="220" rx="30" ry="15" fill="#FF8C00"/>
  
  <!-- Eye -->
  <circle cx="360" cy="210" r="8" fill="#000000"/>
  <circle cx="362" cy="208" r="3" fill="#FFFFFF"/>
  
  <!-- Wing -->
  <ellipse cx="220" cy="300" rx="50" ry="30" fill="#FFA500"/>
  
  <!-- Water -->
  <path d="M0 400 Q128 380 256 400 T512 400 L512 512 L0 512 Z" fill="#1E90FF"/>
  <path d="M0 440 Q128 420 256 440 T512 440 L512 512 L0 512 Z" fill="#5BA0F2" opacity="0.5"/>
  
  <!-- Racing Flag -->
  <rect x="80" y="100" width="10" height="150" fill="#8B4513"/>
  <rect x="90" y="100" width="60" height="40" fill="#FF0000"/>
  <rect x="90" y="140" width="60" height="40" fill="#FFFFFF"/>
  <rect x="90" y="180" width="60" height="40" fill="#FF0000"/>
</svg>`;

fs.writeFileSync(path.join(__dirname, 'icon.svg'), svgIcon);
console.log('SVG icon created: build/icon.svg');
console.log('Please convert this to .ico (Windows) and .icns (Mac) format');
console.log('You can use online converters like:');
console.log('- https://convertio.co/svg-ico/');
console.log('- https://cloudconvert.com/svg-to-ico');
