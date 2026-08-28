import fs from 'fs';
import jpeg from 'jpeg-js';

const rrBuf = fs.readFileSync('src/assets/images/reading_room_scene_1787642650497.jpg');
const arBuf = fs.readFileSync('src/assets/images/archive_room_scene_1787642666139.jpg');

const rr = jpeg.decode(rrBuf, { useTArray: true });
const ar = jpeg.decode(arBuf, { useTArray: true });

function findColorClusters(img, name, predicate) {
  console.log(`=== Searching in ${name} ===`);
  const matches = [];
  const step = 4;
  for (let y = 0; y < img.height; y += step) {
    for (let x = 0; x < img.width; x += step) {
      const idx = (y * img.width + x) * 4;
      const r = img.data[idx];
      const g = img.data[idx+1];
      const b = img.data[idx+2];
      if (predicate(r, g, b, x / img.width, y / img.height)) {
        matches.push({ xPct: (x / img.width) * 100, yPct: (y / img.height) * 100, r, g, b });
      }
    }
  }
  console.log(`Found ${matches.length} matching pixels`);
  if (matches.length > 0) {
    // Cluster into bounding boxes or average centers
    const avgX = matches.reduce((s, m) => s + m.xPct, 0) / matches.length;
    const avgY = matches.reduce((s, m) => s + m.yPct, 0) / matches.length;
    console.log(`Average center: x=${avgX.toFixed(1)}%, y=${avgY.toFixed(1)}%`);
    // Min max bounds
    const minX = Math.min(...matches.map(m => m.xPct));
    const maxX = Math.max(...matches.map(m => m.xPct));
    const minY = Math.min(...matches.map(m => m.yPct));
    const maxY = Math.max(...matches.map(m => m.yPct));
    console.log(`Bounds: x=[${minX.toFixed(1)}% - ${maxX.toFixed(1)}%], y=[${minY.toFixed(1)}% - ${maxY.toFixed(1)}%]`);
  }
}

// 1. Red ribbon in Reading Room: intense red
findColorClusters(rr, 'RR Red Ribbon (r > 140, g < 60, b < 60)', (r, g, b, x, y) => {
  return r > 140 && g < 50 && b < 50 && y > 0.4 && y < 0.65;
});

// 2. Bright white/cream teacup or paper
findColorClusters(rr, 'RR Bright White/Cream on Desk', (r, g, b, x, y) => {
  return r > 180 && g > 170 && b > 140 && y > 0.55;
});

// 3. Glowing Lamp
findColorClusters(rr, 'RR Glowing Lamp', (r, g, b, x, y) => {
  return r > 220 && g > 180 && b < 100 && y < 0.6;
});

// 4. Archive Room - Red seal wax / red details
findColorClusters(ar, 'AR Red Ribbon / Wax Seal', (r, g, b, x, y) => {
  return r > 150 && g < 70 && b < 70;
});

// 5. Archive Room - Lantern glow
findColorClusters(ar, 'AR Lantern / Bright Light', (r, g, b, x, y) => {
  return r > 220 && g > 180 && b < 120 && y < 0.7;
});
