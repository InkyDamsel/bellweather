import fs from 'fs';
import jpeg from 'jpeg-js';

const rrBuf = fs.readFileSync('src/assets/images/reading_room_scene_1787642650497.jpg');
const arBuf = fs.readFileSync('src/assets/images/archive_room_scene_1787642666139.jpg');

const rrData = jpeg.decode(rrBuf, { useTArray: true });
const arData = jpeg.decode(arBuf, { useTArray: true });

console.log('RR size:', rrData.width, 'x', rrData.height);
console.log('AR size:', arData.width, 'x', arData.height);

// Generate an interactive calibration tool in public/calibrator.html
const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Bellweather Coordinate Calibrator</title>
  <style>
    body { background: #1a1410; color: #f5eedb; font-family: sans-serif; margin: 20px; }
    .scene-wrap { position: relative; display: inline-block; border: 2px solid #b45309; }
    img { display: block; max-width: 900px; height: auto; }
    .hitbox { position: absolute; border: 2px solid #3b82f6; background: rgba(59, 130, 246, 0.3); transform: translate(-50%, -50%); display: flex; flex-direction: column; align-items: center; justify-content: center; color: white; font-size: 10px; font-weight: bold; text-shadow: 1px 1px 2px black; pointer-events: none; }
    .crosshair { width: 6px; height: 6px; background: red; border-radius: 50%; }
    .coords-bar { position: sticky; top: 10px; z-index: 100; background: #291c13; padding: 12px; border: 1px solid #78350f; border-radius: 8px; margin-bottom: 20px; font-family: monospace; font-size: 14px; }
  </style>
</head>
<body>
  <h1>Coordinate Calibrator</h1>
  <div id="info" class="coords-bar">Hover over image to get x%, y%</div>

  <h2>1. Reading Room (1200x896)</h2>
  <div class="scene-wrap" id="rr-wrap">
    <img id="rr-img" src="/src/assets/images/reading_room_scene_1787642650497.jpg" />
  </div>

  <h2>2. Archive Room (1200x896)</h2>
  <div class="scene-wrap" id="ar-wrap">
    <img id="ar-img" src="/src/assets/images/archive_room_scene_1787642666139.jpg" />
  </div>

  <script>
    function setup(imgId, wrapId) {
      const img = document.getElementById(imgId);
      const wrap = document.getElementById(wrapId);
      wrap.addEventListener('mousemove', (e) => {
        const rect = img.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * 100;
        const y = ((e.clientY - rect.top) / rect.height) * 100;
        document.getElementById('info').innerHTML = 
          '<strong>' + imgId + '</strong> &nbsp;&nbsp; ' +
          '<strong>x: ' + x.toFixed(1) + '%</strong> &nbsp;&nbsp; ' +
          '<strong>y: ' + y.toFixed(1) + '%</strong>';
      });
    }
    setup('rr-img', 'rr-wrap');
    setup('ar-img', 'ar-wrap');
  </script>
</body>
</html>
`;

fs.writeFileSync('public/calibrator.html', html);
console.log('Calibrator written to public/calibrator.html');
