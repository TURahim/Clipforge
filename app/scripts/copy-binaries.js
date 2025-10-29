#!/usr/bin/env node
/**
 * Copy FFmpeg binaries for electron-builder packaging
 * This script copies the platform-specific binaries to a resources folder
 * that electron-builder can then include in the packaged app.
 */

const fs = require('fs');
const path = require('path');

// Get binary paths from the installer packages
const ffmpegPath = require('@ffmpeg-installer/ffmpeg').path;
const ffprobePath = require('@ffprobe-installer/ffprobe').path;

// Create resources directory if it doesn't exist
const resourcesDir = path.join(__dirname, '..', 'resources');
if (!fs.existsSync(resourcesDir)) {
  fs.mkdirSync(resourcesDir, { recursive: true });
}

// Determine output file names based on platform
const platform = process.platform;
const ffmpegDest = path.join(resourcesDir, platform === 'win32' ? 'ffmpeg.exe' : 'ffmpeg');
const ffprobeDest = path.join(resourcesDir, platform === 'win32' ? 'ffprobe.exe' : 'ffprobe');

// Copy binaries
console.log(`Copying FFmpeg from: ${ffmpegPath}`);
console.log(`          to: ${ffmpegDest}`);
fs.copyFileSync(ffmpegPath, ffmpegDest);
fs.chmodSync(ffmpegDest, 0o755);

console.log(`Copying FFprobe from: ${ffprobePath}`);
console.log(`           to: ${ffprobeDest}`);
fs.copyFileSync(ffprobePath, ffprobeDest);
fs.chmodSync(ffprobeDest, 0o755);

console.log('✓ Binaries copied successfully');


