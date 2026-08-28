import React, { useState, useRef } from 'react';
import { HiddenObject } from '../types';

interface SceneObjectProps {
  object: HiddenObject;
  index: number;
  showHitbox?: boolean;
  isCalibrationMode?: boolean;
  isSelectedInCalibration?: boolean;
  isHinted: boolean;
  onSelect: (obj: HiddenObject, e: React.MouseEvent) => void;
  onSelectForCalibration?: (obj: HiddenObject) => void;
  onUpdateCoordinates?: (id: string, newCoords: { x: number; y: number; width: number; height: number }) => void;
  canvasBounds: { width: number; height: number };
  zoom?: number;
}

export const SceneObject: React.FC<SceneObjectProps> = ({
  object,
  index,
  showHitbox = false,
  isCalibrationMode = false,
  isSelectedInCalibration = false,
  isHinted,
  onSelect,
  onSelectForCalibration,
  onUpdateCoordinates,
  canvasBounds,
  zoom = 1,
}) => {
  const [isJustTapped, setIsJustTapped] = useState(false);
  const isDraggingRef = useRef(false);
  const isResizingRef = useRef(false);
  const dragStartRef = useRef<{ clientX: number; clientY: number; startX: number; startY: number; startW: number; startH: number }>({
    clientX: 0,
    clientY: 0,
    startX: object.x,
    startY: object.y,
    startW: object.width,
    startH: object.height,
  });

  // Normal game click or calibration select
  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isCalibrationMode) {
      if (onSelectForCalibration) {
        onSelectForCalibration(object);
      }
      return;
    }

    if (object.found) return;

    setIsJustTapped(true);
    onSelect(object, e);
    setTimeout(() => {
      setIsJustTapped(false);
    }, 400);
  };

  // Calibration drag handling
  const handleMouseDownDrag = (e: React.MouseEvent) => {
    if (!isCalibrationMode) return;
    e.stopPropagation();
    isDraggingRef.current = true;
    dragStartRef.current = {
      clientX: e.clientX,
      clientY: e.clientY,
      startX: object.x,
      startY: object.y,
      startW: object.width,
      startH: object.height,
    };
    if (onSelectForCalibration) {
      onSelectForCalibration(object);
    }

    const currentZoom = Math.max(0.5, zoom || 1);

    const handleMouseMove = (moveEvent: MouseEvent) => {
      if (!isDraggingRef.current || !onUpdateCoordinates) return;
      const dxPx = (moveEvent.clientX - dragStartRef.current.clientX) / currentZoom;
      const dyPx = (moveEvent.clientY - dragStartRef.current.clientY) / currentZoom;

      const dxPct = (dxPx / canvasBounds.width) * 100;
      const dyPct = (dyPx / canvasBounds.height) * 100;

      const newX = Math.max(0, Math.min(100, +(dragStartRef.current.startX + dxPct).toFixed(1)));
      const newY = Math.max(0, Math.min(100, +(dragStartRef.current.startY + dyPct).toFixed(1)));

      onUpdateCoordinates(object.id, {
        x: newX,
        y: newY,
        width: object.width,
        height: object.height,
      });
    };

    const handleMouseUp = () => {
      isDraggingRef.current = false;
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
  };

  // Calibration resize handling
  const handleMouseDownResize = (e: React.MouseEvent) => {
    if (!isCalibrationMode) return;
    e.stopPropagation();
    isResizingRef.current = true;
    dragStartRef.current = {
      clientX: e.clientX,
      clientY: e.clientY,
      startX: object.x,
      startY: object.y,
      startW: object.width,
      startH: object.height,
    };

    const currentZoom = Math.max(0.5, zoom || 1);

    const handleMouseMove = (moveEvent: MouseEvent) => {
      if (!isResizingRef.current || !onUpdateCoordinates) return;
      const dxPx = (moveEvent.clientX - dragStartRef.current.clientX) / currentZoom;
      const dyPx = (moveEvent.clientY - dragStartRef.current.clientY) / currentZoom;

      const dwPct = (dxPx / canvasBounds.width) * 200; // * 2 because box is centered
      const dhPct = (dyPx / canvasBounds.height) * 200;

      const newW = Math.max(2, Math.min(50, +(dragStartRef.current.startW + dwPct).toFixed(1)));
      const newH = Math.max(2, Math.min(50, +(dragStartRef.current.startH + dhPct).toFixed(1)));

      onUpdateCoordinates(object.id, {
        x: object.x,
        y: object.y,
        width: newW,
        height: newH,
      });
    };

    const handleMouseUp = () => {
      isResizingRef.current = false;
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
  };

  const showBox = isCalibrationMode || showHitbox;

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
        zIndex: isSelectedInCalibration ? 60 : 20 + index,
      }}
      className={`absolute flex items-center justify-center select-none touch-manipulation pointer-events-auto transition-colors ${
        isCalibrationMode
          ? isSelectedInCalibration
            ? 'bg-amber-400/35 border-2 border-amber-300 shadow-[0_0_20px_rgba(251,191,36,0.95)] cursor-move rounded-md ring-2 ring-amber-300 ring-offset-2 ring-offset-black'
            : 'bg-cyan-500/10 border border-dashed border-cyan-400/50 hover:border-cyan-300 hover:bg-cyan-500/25 cursor-pointer rounded-md'
          : showHitbox
          ? 'bg-amber-400/25 border-2 border-amber-300 shadow-[0_0_10px_rgba(251,191,36,0.6)] cursor-pointer rounded-md'
          : 'bg-transparent border-0 outline-none cursor-pointer'
      }`}
      onClick={handleClick}
      onMouseDown={isCalibrationMode ? handleMouseDownDrag : undefined}
      aria-label={`Target area: ${object.name} (${object.id})`}
    >
      {/* Visual Center Crosshair / Dot */}
      {showBox && (
        <div className="relative flex items-center justify-center pointer-events-none">
          <div className={`rounded-full border border-white shadow-md z-30 ${
            isSelectedInCalibration ? 'w-3 h-3 bg-amber-400 ring-2 ring-stone-950 animate-pulse' : 'w-2 h-2 bg-red-500'
          }`} />
          {isSelectedInCalibration && (
            <>
              <div className="absolute w-6 h-[1px] bg-amber-300/80 pointer-events-none" />
              <div className="absolute h-6 w-[1px] bg-amber-300/80 pointer-events-none" />
            </>
          )}
        </div>
      )}

      {/* Resize handle in Calibration Mode (Selected Object Only) */}
      {isCalibrationMode && isSelectedInCalibration && (
        <div
          onMouseDown={handleMouseDownResize}
          className="absolute -bottom-2.5 -right-2.5 w-5 h-5 bg-amber-400 border-2 border-stone-950 rounded shadow-xl cursor-se-resize flex items-center justify-center z-50 hover:scale-125 transition-transform"
          title="Drag to resize hotspot width & height"
        >
          <div className="w-1.5 h-1.5 bg-stone-950 rounded-xs" />
        </div>
      )}

      {/* Tag Label with Name, ID, and Coords */}
      {showBox && (
        <div
          className={`absolute -bottom-8.5 px-2 py-0.5 rounded text-[10px] font-mono leading-tight flex flex-col items-center whitespace-nowrap shadow-2xl z-30 pointer-events-none ${
            isSelectedInCalibration
              ? 'bg-stone-950 text-amber-300 border border-amber-400 font-bold scale-105 shadow-[0_4px_14px_rgba(0,0,0,0.8)]'
              : 'bg-stone-950/85 text-stone-300 border border-stone-700 text-[9px]'
          }`}
        >
          <div className="flex items-center space-x-1">
            <span className={`px-1 rounded-xs text-[8px] font-bold ${
              isSelectedInCalibration ? 'bg-amber-400 text-stone-950' : 'bg-cyan-500/30 text-cyan-200'
            }`}>
              #{index + 1}
            </span>
            <span className="font-bold">{object.name}</span>
          </div>
          {isSelectedInCalibration && (
            <div className="text-[8px] text-amber-200/90 flex items-center space-x-1">
              <span>({object.x}%, {object.y}%)</span>
              <span>[{object.width}×{object.height}%]</span>
            </div>
          )}
        </div>
      )}

      {/* Hint Spotlight Effect */}
      {isHinted && !object.found && !isCalibrationMode && (
        <div className="absolute inset-0 -m-3 border-2 border-amber-300 rounded-full animate-ping pointer-events-none bg-amber-400/20 shadow-[0_0_20px_rgba(251,191,36,0.8)]" />
      )}

      {/* Success Animation Pulse */}
      {isJustTapped && (
        <div className="absolute inset-0 bg-amber-300/60 rounded-full animate-ping pointer-events-none" />
      )}
    </div>
  );
};

