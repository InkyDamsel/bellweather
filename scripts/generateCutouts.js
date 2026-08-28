import fs from 'fs';
import jpeg from 'jpeg-js';

const rrBuf = fs.readFileSync('src/assets/images/reading_room_scene_1787642650497.jpg');
const arBuf = fs.readFileSync('src/assets/images/archive_room_scene_1787642666139.jpg');

const rr = jpeg.decode(rrBuf, { useTArray: true });
const ar = jpeg.decode(arBuf, { useTArray: true });

function makeCutout(img, xPct, yPct, wPct, hPct) {
  const cx = Math.floor((xPct / 100) * img.width);
  const cy = Math.floor((yPct / 100) * img.height);
  const w = Math.floor((wPct / 100) * img.width);
  const h = Math.floor((hPct / 100) * img.height);
  const sx = Math.max(0, cx - Math.floor(w / 2));
  const sy = Math.max(0, cy - Math.floor(h / 2));

  const out = { width: w, height: h, data: new Uint8Array(w * h * 4) };
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const srcIdx = ((sy + y) * img.width + (sx + x)) * 4;
      const dstIdx = (y * w + x) * 4;
      out.data[dstIdx] = img.data[srcIdx];
      out.data[dstIdx + 1] = img.data[srcIdx + 1];
      out.data[dstIdx + 2] = img.data[srcIdx + 2];
      out.data[dstIdx + 3] = 255;
    }
  }
  return 'data:image/jpeg;base64,' + Buffer.from(jpeg.encode(out, 90).data).toString('base64');
}

// Generate candidate coordinates
const rrCandidates = [
  { id: 'brass_key', name: 'Brass Key', x: 47.5, y: 77.0, w: 10, h: 9 },
  { id: 'reading_glasses', name: 'Reading Glasses', x: 35.0, y: 78.5, w: 12, h: 9 },
  { id: 'pocket_watch', name: 'Pocket Watch', x: 24.5, y: 78.0, w: 11, h: 10 },
  { id: 'fountain_pen', name: 'Fountain Pen', x: 62.5, y: 79.5, w: 13, h: 8 },
  { id: 'teacup', name: 'Teacup', x: 74.0, y: 81.0, w: 12, h: 11 },
  { id: 'red_ribbon', name: 'Red Ribbon', x: 50.5, y: 52.0, w: 12, h: 10 },
  { id: 'sealed_envelope', name: 'Sealed Envelope', x: 19.5, y: 44.0, w: 13, h: 10 },
  { id: 'pressed_flower', name: 'Pressed Flower', x: 83.0, y: 48.0, w: 11, h: 10 },
];

const arCandidates = [
  { id: 'auth_report', name: 'Authentication Report', x: 52.0, y: 75.0, w: 14, h: 11 },
  { id: 'festival_ledger', name: 'Festival Ledger', x: 31.5, y: 65.5, w: 14, h: 11 },
  { id: 'torn_note', name: 'Torn Note', x: 16.5, y: 67.0, w: 12, h: 9 },
  { id: 'vintage_magnifier', name: 'Vintage Magnifier', x: 42.0, y: 73.5, w: 13, h: 10 },
  { id: 'brass_compass', name: 'Brass Compass', x: 62.0, y: 64.0, w: 12, h: 10 },
  { id: 'old_keyring', name: 'Old Key Ring', x: 23.5, y: 49.0, w: 12, h: 10 },
  { id: 'wax_seal', name: 'Wax Seal Stamp', x: 78.5, y: 72.0, w: 11, h: 10 },
  { id: 'antique_lantern', name: 'Antique Lantern', x: 68.5, y: 55.0, w: 14, h: 15 },
];

let html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Target Cutouts</title>
  <style>
    body { background: #1a1410; color: #fff; font-family: sans-serif; padding: 20px; }
    .grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-bottom: 30px; }
    .card { background: #261a12; border: 1px solid #78350f; border-radius: 8px; padding: 10px; text-align: center; }
    .card img { max-width: 100%; border: 1px solid #d97706; border-radius: 4px; }
    .id-tag { font-family: monospace; font-size: 11px; color: #fbbf24; }
  </style>
</head>
<body>
  <h1>Reading Room Target Visual Check</h1>
  <div class="grid">`;

for (const c of rrCandidates) {
  const dataUri = makeCutout(rr, c.x, c.y, c.w, c.h);
  html += `
    <div class="card">
      <img src="${dataUri}" />
      <h3>${c.name}</h3>
      <div class="id-tag">ID: ${c.id}</div>
      <div style="font-size: 12px; color: #a8a29e;">x: ${c.x}%, y: ${c.y}%</div>
    </div>
  `;
}

html += `</div><h1>Archive Room Target Visual Check</h1><div class="grid">`;

for (const c of arCandidates) {
  const dataUri = makeCutout(ar, c.x, c.y, c.w, c.h);
  html += `
    <div class="card">
      <img src="${dataUri}" />
      <h3>${c.name}</h3>
      <div class="id-tag">ID: ${c.id}</div>
      <div style="font-size: 12px; color: #a8a29e;">x: ${c.x}%, y: ${c.y}%</div>
    </div>
  `;
}

html += `</div></body></html>`;

fs.writeFileSync('public/cutouts.html', html);
console.log('Cutouts visual written to public/cutouts.html');
