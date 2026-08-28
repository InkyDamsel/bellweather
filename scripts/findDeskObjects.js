import fs from 'fs';
import jpeg from 'jpeg-js';

const rrBuf = fs.readFileSync('src/assets/images/reading_room_scene_1787642650497.jpg');
const arBuf = fs.readFileSync('src/assets/images/archive_room_scene_1787642666139.jpg');

const rr = jpeg.decode(rrBuf, { useTArray: true });
const ar = jpeg.decode(arBuf, { useTArray: true });

function findObjectsOnDesk(img) {
  console.log('--- Analyzing Desk Area ---');
  // Desk is roughly y: 65% to 85%, x: 10% to 90%
  for (let xPct = 15; xPct <= 85; xPct += 5) {
    for (let yPct = 65; yPct <= 85; yPct += 5) {
      const cx = Math.floor((xPct / 100) * img.width);
      const cy = Math.floor((yPct / 100) * img.height);
      const w = 40, h = 40;
      let rSum = 0, gSum = 0, bSum = 0;
      let count = 0;
      let maxBright = 0;
      for (let dy = -h/2; dy < h/2; dy++) {
        for (let dx = -w/2; dx < w/2; dx++) {
          const px = Math.min(img.width-1, Math.max(0, cx + dx));
          const py = Math.min(img.height-1, Math.max(0, cy + dy));
          const idx = (py * img.width + px) * 4;
          const r = img.data[idx];
          const g = img.data[idx+1];
          const b = img.data[idx+2];
          rSum += r; gSum += g; bSum += b;
          const lum = (r+g+b)/3;
          if (lum > maxBright) maxBright = lum;
          count++;
        }
      }
      const avgLum = Math.round((rSum + gSum + bSum) / (3 * count));
      const avgR = Math.round(rSum / count);
      const avgG = Math.round(gSum / count);
      const avgB = Math.round(bSum / count);
      if (avgLum > 60 || maxBright > 200) {
        console.log(`Desk Spot (${xPct}%, ${yPct}%): AvgLum=${avgLum} RGB=(${avgR},${avgG},${avgB}) MaxLum=${Math.round(maxBright)}`);
      }
    }
  }
}

findObjectsOnDesk(rr);
