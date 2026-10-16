const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const ASSETS_DIR = path.resolve(__dirname, '..', 'assets');
const IMAGE_EXTS = new Set(['.png', '.jpg', '.jpeg']);

function walkDir(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) files.push(...walkDir(full));
    else files.push(full);
  }
  return files;
}

async function optimizeImage(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  if (!IMAGE_EXTS.has(ext)) return { skipped: true };

  const before = fs.statSync(filePath).size;
  const img = sharp(filePath);
  try {
    let buffer;
    if (ext === '.png') {
      buffer = await img.png({ quality: 80, compressionLevel: 9, palette: true }).toBuffer();
    } else {
      buffer = await img.jpeg({ quality: 75, mozjpeg: true }).toBuffer();
    }
    fs.writeFileSync(filePath, buffer);
    const after = fs.statSync(filePath).size;
    return { before, after, saved: before - after, filePath };
  } catch (err) {
    console.error(`Failed to optimize ${filePath}:`, err.message);
    return { error: true, filePath };
  }
}

(async () => {
  console.log(`Optimizing images in: ${ASSETS_DIR}`);
  const files = walkDir(ASSETS_DIR);
  const imageFiles = files.filter(f => IMAGE_EXTS.has(path.extname(f).toLowerCase()));
  let totalSaved = 0;
  for (const file of imageFiles) {
    const res = await optimizeImage(file);
    if (res && !res.skipped && !res.error) {
      const savedKB = (res.saved / 1024).toFixed(1);
      console.log(`Optimized: ${path.relative(ASSETS_DIR, file)} (-${savedKB} KB)`);
      totalSaved += res.saved;
    }
  }
  console.log(`Total saved: ${(totalSaved / 1024).toFixed(1)} KB`);
})();
