import React, { useState } from 'react';
import { HiddenObject } from '../types';
import { motion, AnimatePresence } from 'motion/react';

interface SceneObjectProps {
  object: HiddenObject;
  index: number;
  showHitbox?: boolean;
  isHinted: boolean;
  onSelect: (obj: HiddenObject, e: React.MouseEvent) => void;
}

export const SceneObject: React.FC<SceneObjectProps> = ({
  object,
  index,
  showHitbox = false,
  isHinted,
  onSelect,
}) => {
  const [isJustTapped, setIsJustTapped] = useState(false);

  // If already found and not animating tap, don't intercept clicks
  if (object.found && !isJustTapped) return null;

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (object.found) return;

    // STEP 1 & 2 & 3: Direct hitbox click logging
    console.log(`[STEP 1: Hitbox Element Clicked] #hitbox-${object.id} | Name: "${object.name}" | Target ID: "${object.id}" | Pos: (${object.x}%, ${object.y}%)`);
    console.log(`[STEP 2: Target Object Record]`, { id: object.id, name: object.name, category: object.category, evidenceId: object.evidenceId });
    console.log(`[STEP 3: ID Passed to Click Handler] "${object.id}"`);

    setIsJustTapped(true);
    onSelect(object, e);
    setTimeout(() => {
      setIsJustTapped(false);
    }, 450);
  };

  return (
    <div
      id={`hitbox-${object.id}`}
      data-object-id={object.id}
      data-object-name={object.name}
      data-hitbox-index={index + 1}
      style={{
        left: `${object.x}%`,
        top: `${object.y}%`,
        width: `${object.width}%`,
        height: `${object.height}%`,
        transform: 'translate(-50%, -50%)',
        zIndex: 20 + index,
      }}
      className={`absolute flex items-center justify-center cursor-pointer select-none touch-manipulation pointer-events-auto transition-colors ${
        showHitbox
          ? 'bg-amber-400/25 border-2 border-amber-300 shadow-[0_0_10px_rgba(251,191,36,0.6)] rounded-md'
          : 'bg-transparent border-0 outline-none'
      }`}
      onClick={handleClick}
      aria-label={`Searchable area: ${object.name} (${object.id})`}
    >
      {/* Debug Mode Overlay (Only rendered when SHOW_HITBOXES is true) */}
      {showHitbox && (
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          {/* Center point marker */}
          <div className="w-2.5 h-2.5 rounded-full bg-red-500 border border-white shadow-md z-30 pointer-events-none" />
          
          {/* Label with Index, Object name, Internal ID, and Coords */}
          <div className="absolute -bottom-9 px-1.5 py-0.5 rounded bg-black/95 text-amber-300 font-mono text-[9px] leading-tight flex flex-col items-center whitespace-nowrap shadow-xl border border-amber-500/70 z-30 pointer-events-none">
            <div className="flex items-center space-x-1">
              <span className="bg-amber-500 text-stone-950 font-bold px-1 rounded-xs text-[8px]">#{index + 1}</span>
              <span className="font-bold text-amber-200">{object.name}</span>
            </div>
            <div className="text-[8px] text-amber-400/90 font-mono flex items-center space-x-1">
              <span>id: {object.id}</span>
              <span className="text-stone-400">({object.x}%, {object.y}%)</span>
            </div>
          </div>
        </div>
      )}

      {/* Discovery Feedback & Hint Spotlights */}
      <AnimatePresence>
        {/* Momentary discovery flash on tap only (disappears after 450ms) */}
        {isJustTapped && (
          <motion.div
            initial={{ scale: 0.8, opacity: 0.95 }}
            animate={{ scale: 1.4, opacity: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.45, ease: 'easeOut' }}
            className="absolute inset-0 rounded-full pointer-events-none z-30"
            style={{
              background:
                'radial-gradient(circle, rgba(251, 191, 36, 0.85) 0%, rgba(217, 119, 6, 0.4) 50%, transparent 75%)',
            }}
          />
        )}

        {/* Temporary Hint Radar Glow (pulsing spotlight that fades away after 4.5 seconds) */}
        {isHinted && !object.found && (
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{
              opacity: [0, 0.85, 0.3, 0.85, 0],
              scale: [0.7, 1.4, 1.0, 1.5, 1.7],
            }}
            exit={{ opacity: 0 }}
            transition={{ duration: 4.5, ease: 'easeInOut' }}
            className="absolute inset-[-16px] rounded-full pointer-events-none z-30"
            style={{
              background:
                'radial-gradient(circle, rgba(251, 191, 36, 0.7) 0%, rgba(217, 119, 6, 0.3) 50%, transparent 75%)',
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

