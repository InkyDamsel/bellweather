import fs from 'fs';
import path from 'path';

// Let's create an html test file to inspect coordinates if needed
const html = `
<!DOCTYPE html>
<html>
<head>
  <title>Scene Coordinate Inspector</title>
  <style>
    body { font-family: sans-serif; background: #222; color: #fff; margin: 0; padding: 20px; }
    .container { position: relative; display: inline-block; }
    img { display: block; max-width: 1000px; }
    .coords { position: fixed; top: 10px; right: 10px; background: rgba(0,0,0,0.8); padding: 10px; border-radius: 6px; font-family: monospace; font-size: 14px; z-index: 1000; }
  </style>
</head>
<body>
  <h2>Scene Inspector</h2>
  <div id="info" class="coords">Hover over image</div>
  <h3>Reading Room</h3>
  <div class="container" id="rr-wrap">
    <img id="rr-img" src="/src/assets/images/reading_room_scene_1787642650497.jpg" />
  </div>
  <h3>Archive Room</h3>
  <div class="container" id="ar-wrap">
    <img id="ar-img" src="/src/assets/images/archive_room_scene_1787642666139.jpg" />
  </div>
  <script>
    function setup(id) {
      const img = document.getElementById(id);
      img.addEventListener('mousemove', (e) => {
        const rect = img.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * 100;
        const y = ((e.clientY - rect.top) / rect.height) * 100;
        document.getElementById('info').innerText = id + ' -> x: ' + x.toFixed(1) + '%, y: ' + y.toFixed(1) + '%';
      });
    }
    setup('rr-img');
    setup('ar-img');
  </script>
</body>
</html>
`;

fs.writeFileSync('public/inspector.html', html);
console.log('Inspector created');
