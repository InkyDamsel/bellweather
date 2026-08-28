import fs from 'fs';
import jpeg from 'jpeg-js';

const rrBuf = fs.readFileSync('src/assets/images/reading_room_scene_1787642650497.jpg');
const rr = jpeg.decode(rrBuf, { useTArray: true });

function sampleRegion(name, xPct, yPct, wPct, hPct) {
  const sx = Math.floor((xPct / 100) * rr.width);
  const sy = Math.floor((yPct / 100) * rr.height);
  const sw = Math.floor((wPct / 100) * rr.width);
  const sh = Math.floor((hPct / 100) * rr.height);

  let totalR = 0, totalG = 0, totalB = 0;
  let maxR = 0, maxG = 0, maxB = 0;
  let count = sw * sh;

  for (let y = 0; y < sh; y++) {
    for (let x = 0; x < sw; x++) {
      const idx = ((sy + y) * rr.width + (sx + x)) * 4;
      const r = rr.data[idx];
      const g = rr.data[idx+1];
      const b = rr.data[idx+2];
      totalR += r; totalG += g; totalB += b;
      if (r > maxR) maxR = r;
      if (g > maxG) maxG = g;
      if (b > maxB) maxB = b;
    }
  }
  console.log(`${name.padEnd(28)} @ (${xPct}%, ${yPct}%): Avg RGB=(${Math.round(totalR/count)}, ${Math.round(totalG/count)}, ${Math.round(totalB/count)}) Max RGB=(${maxR}, ${maxG}, ${maxB})`);
}

console.log('=== READING ROOM DESK SAMPLES ===');
// Left of desk
sampleRegion('Desk Far Left (20, 75)', 15, 70, 10, 10);
// Glasses area (around 30-40% x, 70-80% y)
sampleRegion('Desk Mid-Left (35, 75)', 30, 70, 10, 10);
// Center desk (key / paper)
sampleRegion('Desk Center (50, 75)', 45, 70, 10, 10);
// Desk Mid-Right (Pen / blotter)
sampleRegion('Desk Mid-Right (65, 75)', 60, 70, 10, 10);
// Desk Far Right (Teacup / Lamp)
sampleRegion('Desk Far Right (80, 70)', 75, 65, 10, 10);

console.log('\n=== READING ROOM UPPER/SHELF SAMPLES ===');
// Top Left Bookcase (Envelope / books)
sampleRegion('Bookshelf Left (20, 45)', 15, 40, 10, 10);
// Center Pedestal & Display Case
sampleRegion('Center Pedestal (50, 45)', 45, 40, 10, 10);
// Center Red Ribbon area
sampleRegion('Center Ribbon (50, 55)', 45, 50, 10, 10);
// Upper Right (Lamp)
sampleRegion('Upper Right Lamp (75, 40)', 70, 35, 10, 10);
// Upper Right Shelf (Clock / Flower)
sampleRegion('Upper Right Clock (85, 40)', 80, 35, 10, 10);
sampleRegion('Upper Right Shelf (85, 50)', 80, 45, 10, 10);
