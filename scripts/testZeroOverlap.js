const readingRoom = [
  // Upper bookshelf & pedestal
  { id: 'sealed_envelope', name: 'Sealed Envelope', x: 19.0, y: 44.0, width: 10.0, height: 9.0 },
  { id: 'red_ribbon', name: 'Red Ribbon', x: 50.5, y: 52.0, width: 10.0, height: 8.5 },
  { id: 'pressed_flower', name: 'Pressed Flower', x: 84.5, y: 36.5, width: 9.5, height: 8.5 },
  // Desk row (from left to right)
  { id: 'pocket_watch', name: 'Pocket Watch', x: 23.0, y: 77.0, width: 9.5, height: 8.5 },
  { id: 'reading_glasses', name: 'Reading Glasses', x: 35.5, y: 78.5, width: 10.0, height: 8.0 },
  { id: 'brass_key', name: 'Brass Key', x: 48.0, y: 77.0, width: 9.5, height: 8.0 },
  { id: 'fountain_pen', name: 'Fountain Pen', x: 61.5, y: 79.5, width: 10.5, height: 7.5 },
  { id: 'teacup', name: 'Teacup', x: 75.0, y: 80.5, width: 10.0, height: 9.5 },
];

const archiveRoom = [
  // Upper & mid archive
  { id: 'old_keyring', name: 'Old Key Ring', x: 23.5, y: 49.0, width: 10.0, height: 9.0 },
  { id: 'antique_lantern', name: 'Antique Lantern', x: 72.0, y: 53.0, width: 11.0, height: 12.0 },
  { id: 'brass_compass', name: 'Brass Compass', x: 59.0, y: 64.0, width: 9.5, height: 9.0 },
  // Desk & Lower archive
  { id: 'torn_note', name: 'Torn Note', x: 16.5, y: 67.0, width: 9.5, height: 8.5 },
  { id: 'festival_ledger', name: 'Festival Ledger', x: 30.5, y: 65.5, width: 11.0, height: 9.5 },
  { id: 'vintage_magnifier', name: 'Vintage Magnifier', x: 42.0, y: 75.0, width: 10.0, height: 8.5 },
  { id: 'auth_report', name: 'Authentication Report', x: 54.0, y: 75.0, width: 11.5, height: 9.5 },
  { id: 'wax_seal', name: 'Wax Seal Stamp', x: 78.5, y: 72.0, width: 9.5, height: 9.0 },
];

function checkCollisions(list, name) {
  let overlaps = 0;
  console.log(`\n=== Collision check for ${name} ===`);
  for (let i = 0; i < list.length; i++) {
    for (let j = i + 1; j < list.length; j++) {
      const a = list[i];
      const b = list[j];
      const dx = Math.abs(a.x - b.x);
      const dy = Math.abs(a.y - b.y);
      const minXDist = (a.width + b.width) / 2;
      const minYDist = (a.height + b.height) / 2;
      const overlapX = dx < minXDist;
      const overlapY = dy < minYDist;
      if (overlapX && overlapY) {
        console.warn(`WARNING: Overlap between ${a.name} (${a.id}) and ${b.name} (${b.id})! dx=${dx.toFixed(1)}, dy=${dy.toFixed(1)}`);
        overlaps++;
      }
    }
  }
  if (overlaps === 0) {
    console.log(`✓ 100% PERFECT: 0 overlaps among all ${list.length} objects in ${name}!`);
  }
}

checkCollisions(readingRoom, 'Reading Room');
checkCollisions(archiveRoom, 'Archive Room');
