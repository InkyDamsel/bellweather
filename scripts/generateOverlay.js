import fs from 'fs';
import jpeg from 'jpeg-js';

const rrBuf = fs.readFileSync('src/assets/images/reading_room_scene_1787642650497.jpg');
const arBuf = fs.readFileSync('src/assets/images/archive_room_scene_1787642666139.jpg');

const rr = jpeg.decode(rrBuf, { useTArray: true });
const ar = jpeg.decode(arBuf, { useTArray: true });

function drawOverlay(img, objects, outName) {
  const copy = {
    width: img.width,
    height: img.height,
    data: new Uint8Array(img.data)
  };

  for (let idx = 0; idx < objects.length; idx++) {
    const o = objects[idx];
    const cx = Math.floor((o.x / 100) * img.width);
    const cy = Math.floor((o.y / 100) * img.height);
    const w = Math.floor((o.width / 100) * img.width);
    const h = Math.floor((o.height / 100) * img.height);
    const x0 = Math.max(0, cx - Math.floor(w / 2));
    const y0 = Math.max(0, cy - Math.floor(h / 2));
    const x1 = Math.min(img.width - 1, x0 + w);
    const y1 = Math.min(img.height - 1, y0 + h);

    // Draw box border (bright green or yellow)
    for (let x = x0; x <= x1; x++) {
      for (let t = 0; t < 3; t++) {
        if (y0 + t < img.height) {
          const i1 = ((y0 + t) * img.width + x) * 4;
          copy.data[i1] = 0; copy.data[i1+1] = 255; copy.data[i1+2] = 0;
        }
        if (y1 - t >= 0) {
          const i2 = ((y1 - t) * img.width + x) * 4;
          copy.data[i2] = 0; copy.data[i2+1] = 255; copy.data[i2+2] = 0;
        }
      }
    }
    for (let y = y0; y <= y1; y++) {
      for (let t = 0; t < 3; t++) {
        if (x0 + t < img.width) {
          const i1 = (y * img.width + (x0 + t)) * 4;
          copy.data[i1] = 0; copy.data[i1+1] = 255; copy.data[i1+2] = 0;
        }
        if (x1 - t >= 0) {
          const i2 = (y * img.width + (x1 - t)) * 4;
          copy.data[i2] = 0; copy.data[i2+1] = 255; copy.data[i2+2] = 0;
        }
      }
    }

    // Draw center cross in red
    for (let d = -6; d <= 6; d++) {
      if (cx + d >= 0 && cx + d < img.width && cy >= 0 && cy < img.height) {
        const i = (cy * img.width + (cx + d)) * 4;
        copy.data[i] = 255; copy.data[i+1] = 0; copy.data[i+2] = 0;
      }
      if (cy + d >= 0 && cy + d < img.height && cx >= 0 && cx < img.width) {
        const i = ((cy + d) * img.width + cx) * 4;
        copy.data[i] = 255; copy.data[i+1] = 0; copy.data[i+2] = 0;
      }
    }
  }

  const encoded = jpeg.encode(copy, 90);
  fs.writeFileSync(`public/${outName}.jpg`, encoded.data);
  console.log(`Saved public/${outName}.jpg`);
}

const rrObjs = [
  { id: 'brass_key', name: 'Brass Key', x: 48.0, y: 77.0, width: 9.5, height: 8.0 },
  { id: 'fountain_pen', name: 'Fountain Pen', x: 61.5, y: 79.5, width: 10.5, height: 7.5 },
  { id: 'red_ribbon', name: 'Red Ribbon', x: 50.5, y: 52.0, width: 10.0, height: 8.5 },
  { id: 'pocket_watch', name: 'Pocket Watch', x: 23.0, y: 77.0, width: 9.5, height: 8.5 },
  { id: 'teacup', name: 'Teacup', x: 75.0, y: 80.5, width: 10.0, height: 9.5 },
  { id: 'reading_glasses', name: 'Reading Glasses', x: 35.5, y: 78.5, width: 10.0, height: 8.0 },
  { id: 'sealed_envelope', name: 'Sealed Envelope', x: 19.0, y: 44.0, width: 10.0, height: 9.0 },
  { id: 'pressed_flower', name: 'Pressed Flower', x: 84.5, y: 36.5, width: 9.5, height: 8.5 },
];

const arObjs = [
  { id: 'auth_report', name: 'Authentication Report', x: 54.0, y: 75.0, width: 11.5, height: 9.5 },
  { id: 'festival_ledger', name: 'Festival Ledger', x: 30.5, y: 65.5, width: 11.0, height: 9.5 },
  { id: 'torn_note', name: 'Torn Note', x: 16.5, y: 67.0, width: 9.5, height: 8.5 },
  { id: 'vintage_magnifier', name: 'Vintage Magnifier', x: 42.0, y: 75.0, width: 10.0, height: 8.5 },
  { id: 'brass_compass', name: 'Brass Compass', x: 59.0, y: 64.0, width: 9.5, height: 9.0 },
  { id: 'old_keyring', name: 'Old Key Ring', x: 23.5, y: 49.0, width: 10.0, height: 9.0 },
  { id: 'wax_seal', name: 'Wax Seal Stamp', x: 78.5, y: 72.0, width: 9.5, height: 9.0 },
  { id: 'antique_lantern', name: 'Antique Lantern', x: 72.0, y: 53.0, width: 11.0, height: 12.0 },
];

drawOverlay(rr, rrObjs, 'debug_reading_room_overlay');
drawOverlay(ar, arObjs, 'debug_archive_room_overlay');
