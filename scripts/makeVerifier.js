import fs from 'fs';
import jpeg from 'jpeg-js';

const rrBuf = fs.readFileSync('src/assets/images/reading_room_scene_1787642650497.jpg');
const arBuf = fs.readFileSync('src/assets/images/archive_room_scene_1787642666139.jpg');

// Let's create an html file that displays the crops and allows clicking to log exact coordinates
const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Scene Visual Verifier</title>
  <style>
    body { background: #18120c; color: #f5eedb; font-family: system-ui, sans-serif; padding: 20px; }
    .stage { position: relative; width: 1000px; height: 747px; border: 2px solid #d97706; margin-bottom: 30px; }
    img { width: 100%; height: 100%; object-fit: contain; }
    .box { position: absolute; border: 2px solid #ef4444; background: rgba(239, 68, 68, 0.25); transform: translate(-50%, -50%); display: flex; flex-direction: column; align-items: center; justify-content: center; font-size: 11px; font-weight: bold; color: #fff; text-shadow: 1px 1px 2px #000; }
    .box span { background: rgba(0,0,0,0.8); padding: 2px 4px; border-radius: 3px; }
    .coords { font-family: monospace; font-size: 16px; background: #26160d; padding: 10px; border-radius: 6px; border: 1px solid #78350f; position: fixed; top: 10px; right: 10px; z-index: 1000; }
  </style>
</head>
<body>
  <div class="coords" id="coords">Click or hover to inspect coordinates</div>

  <h2>1. Reading Room</h2>
  <div class="stage" id="rr-stage">
    <img id="rr-img" src="/src/assets/images/reading_room_scene_1787642650497.jpg" />
  </div>

  <h2>2. Archive Room</h2>
  <div class="stage" id="ar-stage">
    <img id="ar-img" src="/src/assets/images/archive_room_scene_1787642666139.jpg" />
  </div>

  <script>
    function attach(stageId, imgId) {
      const stage = document.getElementById(stageId);
      const img = document.getElementById(imgId);
      stage.addEventListener('mousemove', (e) => {
        const rect = img.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * 100;
        const y = ((e.clientY - rect.top) / rect.height) * 100;
        document.getElementById('coords').innerText = imgId + ' -> x: ' + x.toFixed(1) + '%, y: ' + y.toFixed(1) + '%';
      });
      stage.addEventListener('click', (e) => {
        const rect = img.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * 100;
        const y = ((e.clientY - rect.top) / rect.height) * 100;
        console.log(imgId + ' clicked at: x: ' + x.toFixed(1) + ', y: ' + y.toFixed(1));
        alert(imgId + ' -> x: ' + x.toFixed(1) + '%, y: ' + y.toFixed(1) + '%');
      });
    }
    attach('rr-stage', 'rr-img');
    attach('ar-stage', 'ar-img');
  </script>
</body>
</html>
`;

fs.writeFileSync('public/verifier.html', html);
console.log('Verifier written');
