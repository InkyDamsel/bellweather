import fs from 'fs';
import jpeg from 'jpeg-js';

const rrBuf = fs.readFileSync('src/assets/images/reading_room_scene_1787642650497.jpg');
const arBuf = fs.readFileSync('src/assets/images/archive_room_scene_1787642666139.jpg');

const rr = jpeg.decode(rrBuf, { useTArray: true });
const ar = jpeg.decode(arBuf, { useTArray: true });

// Let's create an html file that shows a fine 10x10 grid with coordinates and labels over the image
const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Reading Room Grid</title>
  <style>
    body { background: #111; color: #fff; font-family: monospace; padding: 20px; }
    .container { position: relative; width: 1200px; height: 896px; border: 2px solid gold; margin-bottom: 40px; }
    img { position: absolute; left: 0; top: 0; width: 1200px; height: 896px; }
    .grid-line-x { position: absolute; top: 0; bottom: 0; width: 1px; background: rgba(255,255,255,0.2); }
    .grid-line-y { position: absolute; left: 0; right: 0; height: 1px; background: rgba(255,255,255,0.2); }
    .grid-label { position: absolute; color: yellow; font-size: 11px; background: rgba(0,0,0,0.6); padding: 1px 3px; }
    .target { position: absolute; border: 2px dashed lime; transform: translate(-50%, -50%); display: flex; flex-direction: column; align-items: center; justify-content: center; font-size: 11px; color: lime; background: rgba(0,255,0,0.15); }
    .target.ar { border-color: cyan; color: cyan; background: rgba(0,255,255,0.15); }
  </style>
</head>
<body>
  <h1>Reading Room Scene Analysis</h1>
  <div class="container" id="rr">
    <img src="/src/assets/images/reading_room_scene_1787642650497.jpg" />
  </div>

  <h1>Archive Room Scene Analysis</h1>
  <div class="container" id="ar">
    <img src="/src/assets/images/archive_room_scene_1787642666139.jpg" />
  </div>

  <script>
    function addGrid(containerId) {
      const c = document.getElementById(containerId);
      for (let x = 5; x < 100; x += 5) {
        const line = document.createElement('div');
        line.className = 'grid-line-x';
        line.style.left = x + '%';
        c.appendChild(line);
        const lbl = document.createElement('div');
        lbl.className = 'grid-label';
        lbl.style.left = x + '%';
        lbl.style.top = '2px';
        lbl.innerText = x + '%';
        c.appendChild(lbl);
      }
      for (let y = 5; y < 100; y += 5) {
        const line = document.createElement('div');
        line.className = 'grid-line-y';
        line.style.top = y + '%';
        c.appendChild(line);
        const lbl = document.createElement('div');
        lbl.className = 'grid-label';
        lbl.style.top = y + '%';
        lbl.style.left = '2px';
        lbl.innerText = y + '%';
        c.appendChild(lbl);
      }
    }
    addGrid('rr');
    addGrid('ar');
  </script>
</body>
</html>
`;

fs.writeFileSync('public/grid.html', html);
console.log('Grid html written to public/grid.html');
