import fs from 'fs';
import jpeg from 'jpeg-js';

const rrBuf = fs.readFileSync('src/assets/images/reading_room_scene_1787642650497.jpg');
const arBuf = fs.readFileSync('src/assets/images/archive_room_scene_1787642666139.jpg');

const rr = jpeg.decode(rrBuf, { useTArray: true });
const ar = jpeg.decode(arBuf, { useTArray: true });

function inspectGrid(img, name, cols, rows) {
  console.log(`\n=================== ${name} ===================`);
  const cellW = img.width / cols;
  const cellH = img.height / rows;

  for (let r = 0; r < rows; r++) {
    let rowStr = `Row ${r} (y ${(r/rows*100).toFixed(0)}%-${((r+1)/rows*100).toFixed(0)}%): `;
    for (let c = 0; c < cols; c++) {
      const sx = Math.floor(c * cellW);
      const sy = Math.floor(r * cellH);
      const sw = Math.floor(cellW);
      const sh = Math.floor(cellH);

      let rSum = 0, gSum = 0, bSum = 0;
      let count = sw * sh;
      for (let y = 0; y < sh; y++) {
        for (let x = 0; x < sw; x++) {
          const idx = ((sy + y) * img.width + (sx + x)) * 4;
          rSum += img.data[idx];
          gSum += img.data[idx+1];
          bSum += img.data[idx+2];
        }
      }
      const avgLum = Math.round((rSum + gSum + bSum) / (3 * count));
      rowStr += `[c${c}:${avgLum}] `;
    }
    console.log(rowStr);
  }
}

inspectGrid(rr, 'Reading Room 8x8', 8, 8);
inspectGrid(ar, 'Archive Room 8x8', 8, 8);
