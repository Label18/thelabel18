#!/usr/bin/env node
/**
 * Convert all PNG frames in public/frames-final-client/ to WebP using sharp.
 * Originals are preserved in public/frames-final-client-png-backup/
 */
const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const SRC_DIR = path.join(__dirname, '..', 'public', 'frames-final-client');
const BACKUP_DIR = path.join(__dirname, '..', 'public', 'frames-final-client-png-backup');

async function main() {
  const files = fs.readdirSync(SRC_DIR).filter(f => f.endsWith('.png')).sort();
  console.log(`Found ${files.length} PNG files to convert`);

  if (files.length === 0) {
    console.log('No PNG files found. Already converted?');
    return;
  }

  // Create backup directory
  if (!fs.existsSync(BACKUP_DIR)) {
    fs.mkdirSync(BACKUP_DIR, { recursive: true });
  }

  let converted = 0;
  let totalSavedBytes = 0;

  for (const file of files) {
    const srcPath = path.join(SRC_DIR, file);
    const webpName = file.replace('.png', '.webp');
    const destPath = path.join(SRC_DIR, webpName);
    const backupPath = path.join(BACKUP_DIR, file);

    try {
      const originalSize = fs.statSync(srcPath).size;

      await sharp(srcPath)
        .webp({ quality: 80, effort: 4 })
        .toFile(destPath);

      const newSize = fs.statSync(destPath).size;
      const saved = originalSize - newSize;
      totalSavedBytes += saved;

      // Move original to backup
      fs.renameSync(srcPath, backupPath);

      converted++;
      if (converted % 20 === 0 || converted === files.length) {
        const pct = ((saved / originalSize) * 100).toFixed(1);
        console.log(`[${converted}/${files.length}] ${file} → ${webpName} (${(originalSize/1024).toFixed(0)}KB → ${(newSize/1024).toFixed(0)}KB, -${pct}%)`);
      }
    } catch (err) {
      console.error(`Failed to convert ${file}:`, err.message);
    }
  }

  console.log(`\nDone! Converted ${converted}/${files.length} files.`);
  console.log(`Total saved: ${(totalSavedBytes / 1024 / 1024).toFixed(1)} MB`);
  console.log(`Originals backed up to: ${BACKUP_DIR}`);
}

main().catch(console.error);
