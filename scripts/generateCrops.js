import fs from 'fs';
import jpeg from 'jpeg-js';

const rrBuf = fs.readFileSync('src/assets/images/reading_room_scene_1787642650497.jpg');
const arBuf = fs.readFileSync('src/assets/images/archive_room_scene_1787642666139.jpg');

const rr = jpeg.decode(rrBuf, { useTArray: true });
const ar = jpeg.decode(arBuf, { useTArray: true });

function crop(img, xPct, yPct, wPct, hPct) {
  const sx = Math.floor((xPct / 100) * img.width);
  const sy = Math.floor((yPct / 100) * img.height);
  const sw = Math.floor((wPct / 100) * img.width);
  const sh = Math.floor((hPct / 100) * img.height);

  const out = {
    width: sw,
    height: sh,
    data: new Uint8Array(sw * sh * 4),
  };

  for (let y = 0; y < sh; y++) {
    for (let x = 0; x < sw; x++) {
      const srcIdx = ((sy + y) * img.width + (sx + x)) * 4;
      const dstIdx = (y * sw + x) * 4;
      out.data[dstIdx] = img.data[srcIdx];
      out.data[dstIdx + 1] = img.data[srcIdx + 1];
      out.data[dstIdx + 2] = img.data[srcIdx + 2];
      out.data[dstIdx + 3] = 255;
    }
  }
  return jpeg.encode(out, 85).data;
}

if (!fs.existsSync('public/debug')) {
  fs.mkdirSync('public/debug', { recursive: true });
}

// Let's divide reading room into a 3x3 grid of crops to see what is where
for (let row = 0; row < 3; row++) {
  for (let col = 0; col < 3; col++) {
    const x = col * 33.33;
    const y = row * 33.33;
    const cData = crop(rr, x, y, 33.33, 33.33);
    fs.writeFileSync(`public/debug/rr_r${row}_c${col}.jpg`, cData);
  }
}

// Also 3x3 for archive room
for (let row = 0; row < 3; row++) {
  for (let col = 0; col < 3; col++) {
    const x = col * 33.33;
    const y = row * 33.33;
    const cData = crop(ar, x, y, 33.33, 33.33);
    fs.writeFileSync(`public/debug/ar_r${row}_c${col}.jpg`, cData);
  }
}

console.log('Crops generated in public/debug');
