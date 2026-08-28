import fs from 'fs';
import jpeg from 'jpeg-js';

const rrBuf = fs.readFileSync('src/assets/images/reading_room_scene_1787642650497.jpg');
const arBuf = fs.readFileSync('src/assets/images/archive_room_scene_1787642666139.jpg');

const rr = jpeg.decode(rrBuf, { useTArray: true });
const ar = jpeg.decode(arBuf, { useTArray: true });

function getPixel(img, xPct, yPct) {
  const px = Math.min(img.width - 1, Math.max(0, Math.floor((xPct / 100) * img.width)));
  const py = Math.min(img.height - 1, Math.max(0, Math.floor((yPct / 100) * img.height)));
  const idx = (py * img.width + px) * 4;
  return { r: img.data[idx], g: img.data[idx+1], b: img.data[idx+2] };
}

// Sample points across reading room
console.log('--- Reading Room sampling ---');
const points = [
  { name: 'Top Left Bookcase', x: 20, y: 30 },
  { name: 'Top Center Display case', x: 50, y: 35 },
  { name: 'Top Right Bookcase / Lamp / Clock', x: 80, y: 35 },
  { name: 'Desk Left', x: 25, y: 75 },
  { name: 'Desk Center', x: 50, y: 75 },
  { name: 'Desk Right', x: 75, y: 75 },
  { name: 'Desk Far Right (Teacup area)', x: 80, y: 65 },
];

for (const p of points) {
  const col = getPixel(rr, p.x, p.y);
  console.log(p.name, 'x:', p.x, 'y:', p.y, 'RGB:', col.r, col.g, col.b);
}
