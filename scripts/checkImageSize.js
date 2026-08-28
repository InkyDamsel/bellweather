import fs from 'fs';
import jpeg from 'jpeg-js';

const rrBuf = fs.readFileSync('src/assets/images/reading_room_scene_1787642650497.jpg');
const arBuf = fs.readFileSync('src/assets/images/archive_room_scene_1787642666139.jpg');

const rr = jpeg.decode(rrBuf, { useTArray: true });
const ar = jpeg.decode(arBuf, { useTArray: true });

console.log(`Reading room image size: ${rr.width} x ${rr.height} (aspect: ${(rr.width/rr.height).toFixed(4)})`);
console.log(`Archive room image size: ${ar.width} x ${ar.height} (aspect: ${(ar.width/ar.height).toFixed(4)})`);

// Check if there are black rows at top/bottom of Reading room image
function checkBorders(img, name) {
  console.log(`\n=== Checking Borders of ${name} ===`);
  // Top rows
  for (let y = 0; y < 30; y++) {
    let lumSum = 0;
    for (let x = 0; x < img.width; x++) {
      const idx = (y * img.width + x) * 4;
      lumSum += (img.data[idx] + img.data[idx+1] + img.data[idx+2]) / 3;
    }
    const avgLum = lumSum / img.width;
    if (avgLum < 10) console.log(`Row y=${y}: pure black (avgLum=${avgLum.toFixed(1)})`);
  }
  // Bottom rows
  for (let y = img.height - 30; y < img.height; y++) {
    let lumSum = 0;
    for (let x = 0; x < img.width; x++) {
      const idx = (y * img.width + x) * 4;
      lumSum += (img.data[idx] + img.data[idx+1] + img.data[idx+2]) / 3;
    }
    const avgLum = lumSum / img.width;
    if (avgLum < 10) console.log(`Row y=${y}: pure black (avgLum=${avgLum.toFixed(1)})`);
  }
}

checkBorders(rr, 'Reading Room');
checkBorders(ar, 'Archive Room');
