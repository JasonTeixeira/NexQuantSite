// 🎨 ICON GENERATOR - Create placeholder PWA icons
// Generates simple Nexural Trading icons for PWA functionality

const fs = require('fs');
const path = require('path');

// Create icons directory
const iconsDir = path.join(__dirname, '../public/icons');
if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
}

// Icon sizes needed
const iconSizes = [16, 32, 72, 96, 128, 144, 152, 192, 384, 512];

// Create SVG icon template
const createSVG = (size) => `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
  <rect width="${size}" height="${size}" rx="${size * 0.15}" fill="#0066CC"/>
  <circle cx="${size * 0.5}" cy="${size * 0.35}" r="${size * 0.15}" fill="#00BBFF"/>
  <rect x="${size * 0.25}" y="${size * 0.55}" width="${size * 0.5}" height="${size * 0.1}" rx="${size * 0.05}" fill="#00BBFF"/>
  <rect x="${size * 0.3}" y="${size * 0.7}" width="${size * 0.4}" height="${size * 0.08}" rx="${size * 0.04}" fill="#00BBFF"/>
  <text x="${size * 0.5}" y="${size * 0.9}" font-family="Arial, sans-serif" font-size="${size * 0.08}" text-anchor="middle" fill="white">N</text>
</svg>`;

// Generate all icon sizes
iconSizes.forEach(size => {
  const svg = createSVG(size);
  const filename = `icon-${size}x${size}.png`;
  
  // For now, create SVG versions (browsers can use SVGs as icons too)
  fs.writeFileSync(
    path.join(iconsDir, `icon-${size}x${size}.svg`),
    svg
  );
  
  // Create a basic HTML file that can be used as a fallback icon
  const htmlIcon = `data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}`;
  
  console.log(`✅ Generated icon-${size}x${size}.svg`);
});

// Create apple touch icons
fs.writeFileSync(
  path.join(iconsDir, 'apple-touch-icon.svg'),
  createSVG(180)
);

// Create favicon
fs.writeFileSync(
  path.join(__dirname, '../public/favicon.svg'),
  createSVG(32)
);

// Create shortcut icons for manifest
const shortcuts = ['dashboard', 'community', 'marketplace', 'learning'];
shortcuts.forEach(shortcut => {
  const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="192" height="192" viewBox="0 0 192 192" xmlns="http://www.w3.org/2000/svg">
  <rect width="192" height="192" rx="28" fill="#0066CC"/>
  <circle cx="96" cy="67" r="28" fill="#00BBFF"/>
  <rect x="48" y="106" width="96" height="19" rx="9" fill="#00BBFF"/>
  <rect x="58" y="135" width="76" height="15" rx="7" fill="#00BBFF"/>
  <text x="96" y="175" font-family="Arial, sans-serif" font-size="12" text-anchor="middle" fill="white">${shortcut.charAt(0).toUpperCase()}</text>
</svg>`;
  
  fs.writeFileSync(
    path.join(iconsDir, `shortcut-${shortcut}.svg`),
    svg
  );
  
  console.log(`✅ Generated shortcut-${shortcut}.svg`);
});

console.log('🎉 All PWA icons generated successfully!');
console.log('💡 Note: These are SVG placeholders. For production, replace with proper PNG icons.');

