import { createCanvas } from 'canvas';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Create a 512x512 canvas
const canvas = createCanvas(512, 512);
const ctx = canvas.getContext('2d');

// Background
ctx.fillStyle = '#4A90E2';
ctx.fillRect(0, 0, 512, 512);

// Duck body
ctx.fillStyle = '#FFD700';
ctx.beginPath();
ctx.ellipse(256, 300, 120, 80, 0, 0, Math.PI * 2);
ctx.fill();

// Duck head
ctx.beginPath();
ctx.arc(340, 220, 60, 0, Math.PI * 2);
ctx.fill();

// Beak
ctx.fillStyle = '#FF8C00';
ctx.beginPath();
ctx.ellipse(390, 220, 30, 15, 0, 0, Math.PI * 2);
ctx.fill();

// Eye
ctx.fillStyle = '#000000';
ctx.beginPath();
ctx.arc(360, 210, 8, 0, Math.PI * 2);
ctx.fill();

// Wing
ctx.fillStyle = '#FFA500';
ctx.beginPath();
ctx.ellipse(220, 300, 50, 30, 0, 0, Math.PI * 2);
ctx.fill();

// Water
ctx.fillStyle = '#1E90FF';
ctx.beginPath();
ctx.moveTo(0, 400);
ctx.quadraticCurveTo(128, 380, 256, 400);
ctx.quadraticCurveTo(384, 420, 512, 400);
ctx.lineTo(512, 512);
ctx.lineTo(0, 512);
ctx.fill();

// Save as PNG
const buffer = canvas.toBuffer('image/png');
fs.writeFileSync(path.join(__dirname, 'icon.png'), buffer);

console.log('✅ PNG icon created: build/icon.png');
