import fs from 'fs';
import jpeg from 'jpeg-js';

const files = fs.readdirSync('public/debug').filter(f => f.endsWith('.jpg'));
for (const f of files) {
  const buf = fs.readFileSync(`public/debug/${f}`);
  const img = jpeg.decode(buf, { useTArray: true });
  // Find dominant colors and features
  let rSum = 0, gSum = 0, bSum = 0;
  let brightCount = 0, redCount = 0, goldCount = 0, darkCount = 0;
  const n = img.width * img.height;
  for (let i = 0; i < n; i++) {
    const r = img.data[i*4];
    const g = img.data[i*4+1];
    const b = img.data[i*4+2];
    rSum += r; gSum += g; bSum += b;
    const lum = 0.299*r + 0.587*g + 0.114*b;
    if (lum > 180) brightCount++;
    if (lum < 40) darkCount++;
    if (r > 120 && g < 60 && b < 60) redCount++;
    if (r > 150 && g > 110 && b < 80) goldCount++;
  }
  console.log(`${f.padEnd(35)}: size=${img.width}x${img.height} lumAvg=${Math.round((rSum+gSum+bSum)/(3*n))} bright=${Math.round((brightCount/n)*100)}% red=${Math.round((redCount/n)*100)}% gold=${Math.round((goldCount/n)*100)}% dark=${Math.round((darkCount/n)*100)}%`);
}
