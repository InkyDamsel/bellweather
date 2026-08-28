import fs from 'fs';
import path from 'path';

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    const full = path.join(dir, file);
    const stat = fs.statSync(full);
    if (stat && stat.isDirectory()) {
      results = results.concat(walk(full));
    } else if (file.endsWith('.ts') || file.endsWith('.tsx')) {
      results.push(full);
    }
  });
  return results;
}

const files = walk('src');
for (const f of files) {
  const content = fs.readFileSync(f, 'utf8');
  if (content.includes('rr_') || content.includes('ar_')) {
    console.log(`Found references in ${f}:`);
    const lines = content.split('\n');
    lines.forEach((line, i) => {
      if (line.includes('rr_') || line.includes('ar_')) {
        console.log(`  L${i+1}: ${line.trim()}`);
      }
    });
  }
}
console.log('Search complete.');
