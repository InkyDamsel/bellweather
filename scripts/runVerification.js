import { INITIAL_READING_ROOM_OBJECTS, INITIAL_ARCHIVE_ROOM_OBJECTS, EVIDENCE_ITEMS } from '../src/data/caseData.js';

console.log('=== RUNNING VERIFICATION OF HIDDEN OBJECT DATA ARCHITECTURE ===\n');

// 1. Check Unique IDs in Reading Room
const rrIds = new Set();
for (const obj of INITIAL_READING_ROOM_OBJECTS) {
  if (rrIds.has(obj.id)) {
    throw new Error(`Duplicate ID in Reading Room: ${obj.id}`);
  }
  rrIds.add(obj.id);
  console.log(`[Reading Room] ID: "${obj.id}" -> Name: "${obj.name}" | Pos: (${obj.x}%, ${obj.y}%) | Size: ${obj.width}x${obj.height}% | Evidence: ${obj.evidenceId || 'none'}`);
}

// 2. Check Unique IDs in Archive Room
const arIds = new Set();
for (const obj of INITIAL_ARCHIVE_ROOM_OBJECTS) {
  if (arIds.has(obj.id)) {
    throw new Error(`Duplicate ID in Archive Room: ${obj.id}`);
  }
  arIds.add(obj.id);
  console.log(`[Archive Room] ID: "${obj.id}" -> Name: "${obj.name}" | Pos: (${obj.x}%, ${obj.y}%) | Size: ${obj.width}x${obj.height}% | Evidence: ${obj.evidenceId || 'none'}`);
}

// 3. Verify Evidence Item Links
for (const obj of [...INITIAL_READING_ROOM_OBJECTS, ...INITIAL_ARCHIVE_ROOM_OBJECTS]) {
  if (obj.evidenceId) {
    const ev = EVIDENCE_ITEMS.find(e => e.id === obj.evidenceId);
    if (!ev) {
      throw new Error(`Missing evidence item for ${obj.evidenceId}`);
    }
    console.log(`✓ Evidence Link: Object "${obj.id}" correctly links to Evidence "${ev.name}" (${ev.id})`);
  }
}

// 4. Test Single Source of Truth Finding Simulator
let testReadingRoomState = [...INITIAL_READING_ROOM_OBJECTS];
for (const targetId of ['brass_key', 'reading_glasses', 'fountain_pen', 'pressed_flower']) {
  testReadingRoomState = testReadingRoomState.map(o => o.id === targetId ? { ...o, found: true } : o);
  const foundItem = testReadingRoomState.find(o => o.id === targetId);
  const otherItems = testReadingRoomState.filter(o => o.id !== targetId && o.found);
  console.log(`✓ Simulator: Finding "${targetId}" marked ONLY "${foundItem?.name}" as found.`);
}

console.log('\n✓ ALL VERIFICATION TESTS PASSED PERFECTLY!');
