const fs = require('fs');
const path = require('path');

// Simple script to generate PNG icons from SVG
// Requires: npm install sharp

const sizes = [72, 96, 128, 144, 152, 192, 384, 512];

async function generateIcons() {
  try {
    const sharp = require('sharp');
    const svgPath = path.join(__dirname, '../public/icons/icon.svg');
    const svgBuffer = fs.readFileSync(svgPath);

    for (const size of sizes) {
      const outputPath = path.join(__dirname, `../public/icons/icon-${size}x${size}.png`);

      await sharp(svgBuffer)
        .resize(size, size)
        .png()
        .toFile(outputPath);

      console.log(`Generated: icon-${size}x${size}.png`);
    }

    // Generate apple-touch-icon
    await sharp(svgBuffer)
      .resize(180, 180)
      .png()
      .toFile(path.join(__dirname, '../public/apple-touch-icon.png'));

    console.log('Generated: apple-touch-icon.png');

    // Generate favicon.ico (32x32)
    await sharp(svgBuffer)
      .resize(32, 32)
      .png()
      .toFile(path.join(__dirname, '../public/favicon.png'));

    console.log('Generated: favicon.png');
    console.log('\nAll icons generated successfully!');
  } catch (error) {
    if (error.code === 'MODULE_NOT_FOUND') {
      console.log('Sharp not installed. Installing...');
      console.log('Run: npm install sharp --save-dev');
      console.log('Then run this script again: node scripts/generate-icons.js');
    } else {
      console.error('Error:', error);
    }
  }
}

generateIcons();
