import fs from 'fs';
import jpeg from 'jpeg-js';

const rrBuf = fs.readFileSync('src/assets/images/reading_room_scene_1787642650497.jpg');
const arBuf = fs.readFileSync('src/assets/images/archive_room_scene_1787642666139.jpg');

const rr = jpeg.decode(rrBuf, { useTArray: true });
const ar = jpeg.decode(arBuf, { useTArray: true });

function cropCenter(img, name, xPct, yPct, wPct, hPct) {
  const w = Math.floor((wPct / 100) * img.width);
  const h = Math.floor((hPct / 100) * img.height);
  const cx = Math.floor((xPct / 100) * img.width);
  const cy = Math.floor((yPct / 100) * img.height);
  const sx = Math.max(0, cx - Math.floor(w / 2));
  const sy = Math.max(0, cy - Math.floor(h / 2));

  const out = {
    width: w,
    height: h,
    data: new Uint8Array(w * h * 4)
  };

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
  fs.writeFileSync(`public/debug/${name}.jpg`, jpeg.encode(out, 90).data);
}

// Let's crop candidate regions in reading room
cropCenter(rr, 'rr_desk_left_20_75', 20, 75, 15, 15);
cropCenter(rr, 'rr_desk_midleft_37_75', 37, 75, 15, 15);
cropCenter(rr, 'rr_desk_center_48_74', 48, 74, 15, 15);
cropCenter(rr, 'rr_desk_midright_68_72', 68, 72, 15, 15);
cropCenter(rr, 'rr_desk_farright_78_67', 78, 67, 15, 15);

cropCenter(rr, 'rr_shelf_left_18_45', 18, 45, 15, 15);
cropCenter(rr, 'rr_pedestal_ribbon_50_52', 50, 52, 15, 15);
cropCenter(rr, 'rr_shelf_right_flower_82_47', 82, 47, 15, 15);
cropCenter(rr, 'rr_lamp_72_40', 72, 40, 15, 15);
cropCenter(rr, 'rr_clock_84_36', 84, 36, 15, 15);

// Archive Room
cropCenter(ar, 'ar_center_auth_report_52_75', 52, 75, 15, 15);
cropCenter(ar, 'ar_left_ledger_31_65', 31, 65, 15, 15);
cropCenter(ar, 'ar_farleft_torn_note_16_67', 16, 67, 15, 15);
cropCenter(ar, 'ar_magnifier_42_73', 42, 73, 15, 15);
cropCenter(ar, 'ar_compass_62_64', 62, 64, 15, 15);
cropCenter(ar, 'ar_keyring_23_49', 23, 49, 15, 15);
cropCenter(ar, 'ar_wax_seal_78_72', 78, 72, 15, 15);
cropCenter(ar, 'ar_lantern_68_55', 68, 55, 15, 15);

console.log('Detailed crops generated');
