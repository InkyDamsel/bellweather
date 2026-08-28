import fs from 'fs';
import jpeg from 'jpeg-js';

const rrBuf = fs.readFileSync('src/assets/images/reading_room_scene_1787642650497.jpg');
const rr = jpeg.decode(rrBuf, { useTArray: true });

console.log('--- Finding Specific Objects on Desk ---');

// Let's test specific bounding boxes:
// 1. Where is the Brass Key? (Gold metallic object with bow and teeth)
// 2. Where are the Reading Glasses? (Wire frame with oval lenses)
// 3. Where is the Pocket Watch? (Round dial with chain/loop)
// 4. Where is the Fountain Pen? (Long slender black/gold pen)
// 5. Where is the Teacup? (Porcelain cup with handle and saucer)
// 6. Where is the Red Ribbon? (Red silk ribbon near pedestal base)
// 7. Where is the Sealed Envelope? (Paper envelope in bookshelf or desk)
// 8. Where is the Pressed Flower? (Violet/botanical press in book)

// Let's search for metallic gold pixels (r > 160, g > 110, b < 70)
const goldPixels = [];
for (let y = 0; y < rr.height; y += 2) {
  for (let x = 0; x < rr.width; x += 2) {
    const idx = (y * rr.width + x) * 4;
    const r = rr.data[idx];
    const g = rr.data[idx+1];
    const b = rr.data[idx+2];
    if (r > 160 && g > 110 && b < 70) {
      goldPixels.push({ x: (x / rr.width) * 100, y: (y / rr.height) * 100 });
    }
  }
}

console.log('Total gold pixels:', goldPixels.length);
// Group gold pixels into clusters
const deskGold = goldPixels.filter(p => p.y > 65);
console.log('Desk gold pixels count:', deskGold.length);

// Histogram along X for desk gold
const xBuckets = {};
for (const p of deskGold) {
  const b = Math.floor(p.x / 5) * 5;
  xBuckets[b] = (xBuckets[b] || 0) + 1;
}
console.log('Desk Gold X histogram:', xBuckets);

// Let's also check X histogram of all high luminance on desk (papers/porcelain)
const brightDesk = [];
for (let y = Math.floor(0.65 * rr.height); y < rr.height; y += 2) {
  for (let x = 0; x < rr.width; x += 2) {
    const idx = (y * rr.width + x) * 4;
    const r = rr.data[idx];
    const g = rr.data[idx+1];
    const b = rr.data[idx+2];
    if ((r+g+b)/3 > 170) {
      brightDesk.push({ x: (x / rr.width) * 100, y: (y / rr.height) * 100 });
    }
  }
}
const brightXBuckets = {};
for (const p of brightDesk) {
  const b = Math.floor(p.x / 5) * 5;
  brightXBuckets[b] = (brightXBuckets[b] || 0) + 1;
}
console.log('Bright Desk X histogram:', brightXBuckets);
