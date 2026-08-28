import fs from 'fs';
import jpeg from 'jpeg-js';

const rrBuf = fs.readFileSync('src/assets/images/reading_room_scene_1787642650497.jpg');
const arBuf = fs.readFileSync('src/assets/images/archive_room_scene_1787642666139.jpg');

const rr = jpeg.decode(rrBuf, { useTArray: true });
const ar = jpeg.decode(arBuf, { useTArray: true });

function cropRegion(img, name, xPct, yPct, wPct, hPct) {
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
  const encoded = jpeg.encode(out, 95);
  fs.writeFileSync(`public/debug_${name}.jpg`, encoded.data);
  return 'data:image/jpeg;base64,' + Buffer.from(encoded.data).toString('base64');
}

// Let's generate fine-grained crops across the desk and shelves
const slices = [
  { room: 'rr', name: 'rr_desk_x20_y77', x: 23, y: 77, w: 14, h: 14, desc: 'Left Desk: Watch / Papers' },
  { room: 'rr', name: 'rr_desk_x35_y78', x: 35.5, y: 78.5, w: 14, h: 14, desc: 'Mid-Left Desk: Glasses / Notebook' },
  { room: 'rr', name: 'rr_desk_x48_y77', x: 48, y: 77, w: 14, h: 14, desc: 'Center Desk: Key / Book' },
  { room: 'rr', name: 'rr_desk_x61_y79', x: 61.5, y: 79.5, w: 14, h: 14, desc: 'Mid-Right Desk: Pen / Papers' },
  { room: 'rr', name: 'rr_desk_x75_y80', x: 75, y: 80.5, w: 14, h: 14, desc: 'Far-Right Desk: Teacup / Saucer' },
  { room: 'rr', name: 'rr_pedestal_x50_y52', x: 50.5, y: 52, w: 14, h: 14, desc: 'Pedestal Base: Red Ribbon' },
  { room: 'rr', name: 'rr_shelf_x19_y44', x: 19, y: 44, w: 14, h: 14, desc: 'Left Bookshelf: Envelope' },
  { room: 'rr', name: 'rr_shelf_x84_y36', x: 84.5, y: 36.5, w: 14, h: 14, desc: 'Right Bookshelf: Pressed Flower / Plant' },
];

let html = `<!DOCTYPE html><html><head><style>body{background:#111;color:#eee;font-family:sans-serif;padding:20px;}.grid{display:grid;grid-template-columns:repeat(4,1fr);gap:15px;}.card{background:#222;border:1px solid #444;padding:10px;text-align:center;border-radius:8px;}img{max-width:100%;border-radius:4px;}</style></head><body><h1>Artwork Crops</h1><div class="grid">`;

for (const s of slices) {
  const img = s.room === 'rr' ? rr : ar;
  const b64 = cropRegion(img, s.name, s.x, s.y, s.w, s.h);
  html += `<div class="card"><img src="${b64}"><h4>${s.desc}</h4><p>pos: (${s.x}%, ${s.y}%) size: ${s.w}x${s.h}%</p></div>`;
}

html += `</div></body></html>`;
fs.writeFileSync('public/debug_crops.html', html);
console.log('Done creating crops.');
