import React, { useState, useRef, useEffect, useCallback } from 'react';
import { HiddenObject, EvidenceItem } from '../types';
import { SceneObject } from './SceneObject';
import { sounds } from '../utils/audio';
import {
  ZoomIn,
  ZoomOut,
  Maximize2,
  Sparkles,
  Compass,
  CheckCircle2,
  ArrowRight,
  Info,
  Check,
  Search,
  Crosshair,
  RotateCcw,
  Sliders,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface HiddenObjectSceneProps {
  sceneId: 'reading_room' | 'archive_room';
  sceneTitle: string;
  sceneLocation: string;
  imageSrc: string;
  objects: HiddenObject[];
  onObjectFound: (objectId: string) => void;
  onEvidenceDiscovered: (evidence: EvidenceItem) => void;
  evidenceItems: EvidenceItem[];
  onCompleteScene: () => void;
  onNavigateToSuspects: () => void;
  onNavigateToArchive?: () => void;
  onResetScene?: () => void;
  hintsUsed: number;
  onIncrementHint: () => void;
}

interface TouchRipple {
  id: number;
  x: number;
  y: number;
}

interface TapDiagnosticInfo {
  screenX: number;
  screenY: number;
  scenePixelX: number;
  scenePixelY: number;
  normalizedX: number;
  normalizedY: number;
  hitboxDetected: boolean;
  hitboxIndex?: number;
  hitboxLabel?: string;
  hitboxId?: string;
  passedId?: string;
  completedLabel?: string;
  isMatch?: boolean;
  timestamp: string;
}

export const HiddenObjectScene: React.FC<HiddenObjectSceneProps> = ({
  sceneId,
  sceneTitle,
  sceneLocation,
  imageSrc,
  objects,
  onObjectFound,
  onEvidenceDiscovered,
  evidenceItems,
  onNavigateToSuspects,
  onNavigateToArchive,
  onResetScene,
  onIncrementHint,
}) => {
  // Container & Canvas sizing refs
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);

  const [imgNaturalSize, setImgNaturalSize] = useState<{ width: number; height: number }>({
    width: 1200,
    height: 896,
  });
  const [canvasBounds, setCanvasBounds] = useState<{ width: number; height: number }>({
    width: 600,
    height: 448,
  });

  // Zoom & Pan state
  const [zoom, setZoom] = useState<number>(1);
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const dragStartRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  // Debug Hitbox visualization toggle (defaults to true for live debugging)
  const [showHitboxes, setShowHitboxes] = useState<boolean>(true);

  // Controlled Test Mode: 'all' | 'controlled_3'
  // In controlled_3 mode:
  // Reading Room -> only 'reading_glasses', 'fountain_pen', 'brass_key'
  // Archive Room -> only 'auth_report', 'festival_ledger', 'torn_note'
  const [testMode, setTestMode] = useState<'all' | 'controlled_3'>('all');

  // Live Tap Diagnostic readout
  const [diagnostic, setDiagnostic] = useState<TapDiagnosticInfo | null>(null);

  // Hint state
  const [hintedObjectId, setHintedObjectId] = useState<string | null>(null);
  const [hintCooldown, setHintCooldown] = useState<number>(0);

  // Evidence modal state
  const [activeEvidenceModal, setActiveEvidenceModal] = useState<EvidenceItem | null>(null);

  // Sparkle feedback position
  const [sparklePos, setSparklePos] = useState<{ x: number; y: number; name: string } | null>(null);

  // Touch miss ripples
  const [ripples, setRipples] = useState<TouchRipple[]>([]);

  // Active targets depending on test mode
  const controlled3Ids =
    sceneId === 'reading_room'
      ? ['reading_glasses', 'fountain_pen', 'brass_key']
      : ['auth_report', 'festival_ledger', 'torn_note'];

  const displayedObjects =
    testMode === 'controlled_3'
      ? objects.filter((o) => controlled3Ids.includes(o.id))
      : objects;

  // Completion state
  const remainingCount = displayedObjects.filter((o) => !o.found).length;
  const isSceneCompleted = remainingCount === 0;

  // Compute aspect-ratio fitted canvas dimensions so image & hitbox layer have identical bounds
  const updateCanvasDimensions = useCallback(() => {
    if (!containerRef.current) return;
    const cWidth = containerRef.current.clientWidth;
    const cHeight = containerRef.current.clientHeight;
    if (cWidth <= 0 || cHeight <= 0) return;

    const imgAspect = imgNaturalSize.width / imgNaturalSize.height;
    const containerAspect = cWidth / cHeight;

    let targetW = cWidth;
    let targetH = cHeight;

    if (containerAspect > imgAspect) {
      // Container is wider -> fit by height
      targetH = cHeight;
      targetW = cHeight * imgAspect;
    } else {
      // Container is taller -> fit by width
      targetW = cWidth;
      targetH = cWidth / imgAspect;
    }

    setCanvasBounds({ width: targetW, height: targetH });
  }, [imgNaturalSize]);

  // Update canvas bounds on resize
  useEffect(() => {
    updateCanvasDimensions();
    const container = containerRef.current;
    if (!container) return;

    const resizeObserver = new ResizeObserver(() => {
      updateCanvasDimensions();
    });
    resizeObserver.observe(container);
    return () => resizeObserver.disconnect();
  }, [updateCanvasDimensions]);

  // Update natural image size when image loads
  const handleImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const img = e.currentTarget;
    if (img.naturalWidth > 0 && img.naturalHeight > 0) {
      setImgNaturalSize({
        width: img.naturalWidth,
        height: img.naturalHeight,
      });
    }
  };

  // Handle Hint button cooldown timer
  useEffect(() => {
    let timer: any;
    if (hintCooldown > 0) {
      timer = setInterval(() => {
        setHintCooldown((prev) => Math.max(0, prev - 1));
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [hintCooldown]);

  // Trigger miss ripple at viewport coordinates
  const triggerRipple = (clientX: number, clientY: number) => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = clientX - rect.left;
    const y = clientY - rect.top;
    const newRipple: TouchRipple = { id: Date.now() + Math.random(), x, y };
    setRipples((prev) => [...prev, newRipple]);
    setTimeout(() => {
      setRipples((prev) => prev.filter((r) => r.id !== newRipple.id));
    }, 400);
  };

  // Handle tap on scene background (miss)
  const handleSceneBackgroundClick = (e: React.MouseEvent) => {
    sounds.playSoftMissSound();
    triggerRipple(e.clientX, e.clientY);

    // Calculate normalized coordinates relative to actual rendered canvas
    const canvasRect = canvasRef.current?.getBoundingClientRect();
    if (canvasRect) {
      const scenePixelX = e.clientX - canvasRect.left;
      const scenePixelY = e.clientY - canvasRect.top;
      const normalizedX = (scenePixelX / canvasRect.width) * 100;
      const normalizedY = (scenePixelY / canvasRect.height) * 100;

      const diag: TapDiagnosticInfo = {
        screenX: Math.round(e.clientX),
        screenY: Math.round(e.clientY),
        scenePixelX: Math.round(scenePixelX),
        scenePixelY: Math.round(scenePixelY),
        normalizedX: +normalizedX.toFixed(1),
        normalizedY: +normalizedY.toFixed(1),
        hitboxDetected: false,
        hitboxLabel: 'None (Background Tap)',
        hitboxId: 'none',
        passedId: 'none',
        completedLabel: 'None',
        isMatch: true,
        timestamp: new Date().toLocaleTimeString(),
      };

      setDiagnostic(diag);
      console.log(`[SCENE BACKGROUND TAP] Screen: (${diag.screenX}, ${diag.screenY}) | Scene: (${diag.scenePixelX}px, ${diag.scenePixelY}px) | Normalized: (${diag.normalizedX}%, ${diag.normalizedY}%)`);
    }
  };

  // Use Hint
  const handleUseHint = () => {
    if (hintCooldown > 0) return;
    const undiscovered = displayedObjects.filter((o) => !o.found);
    if (undiscovered.length === 0) return;

    sounds.playHintSound();
    onIncrementHint();
    const randomObj = undiscovered[Math.floor(Math.random() * undiscovered.length)];
    setHintedObjectId(randomObj.id);
    setHintCooldown(8);

    if (zoom > 1) {
      const targetPanX = (50 - randomObj.x) * (canvasBounds.width / 100) * (zoom - 1);
      const targetPanY = (50 - randomObj.y) * (canvasBounds.height / 100) * (zoom - 1);
      setPan({ x: targetPanX * 0.5, y: targetPanY * 0.5 });
    }

    setTimeout(() => {
      setHintedObjectId((prev) => (prev === randomObj.id ? null : prev));
    }, 4500);
  };

  // Zoom controls
  const handleZoomIn = () => {
    sounds.playTapSound();
    setZoom((prev) => Math.min(2.5, +(prev + 0.5).toFixed(1)));
  };

  const handleZoomOut = () => {
    sounds.playTapSound();
    setZoom((prev) => {
      const next = Math.max(1, +(prev - 0.5).toFixed(1));
      if (next === 1) setPan({ x: 0, y: 0 });
      return next;
    });
  };

  const handleResetZoom = () => {
    sounds.playTapSound();
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  // Calculate pan limits
  const clampPan = (newX: number, newY: number, currentZoom: number) => {
    if (currentZoom <= 1) return { x: 0, y: 0 };
    const maxPanX = (canvasBounds.width * (currentZoom - 1)) / 2 + 50;
    const maxPanY = (canvasBounds.height * (currentZoom - 1)) / 2 + 50;
    return {
      x: Math.max(-maxPanX, Math.min(maxPanX, newX)),
      y: Math.max(-maxPanY, Math.min(maxPanY, newY)),
    };
  };

  // Pan dragging (Mouse)
  const handleMouseDown = (e: React.MouseEvent) => {
    if (zoom <= 1) return;
    setIsDragging(true);
    dragStartRef.current = { x: e.clientX - pan.x, y: e.clientY - pan.y };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || zoom <= 1) return;
    const rawX = e.clientX - dragStartRef.current.x;
    const rawY = e.clientY - dragStartRef.current.y;
    setPan(clampPan(rawX, rawY, zoom));
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Pan dragging (Touch)
  const handleTouchStart = (e: React.TouchEvent) => {
    if (zoom <= 1 || e.touches.length !== 1) return;
    setIsDragging(true);
    dragStartRef.current = {
      x: e.touches[0].clientX - pan.x,
      y: e.touches[0].clientY - pan.y,
    };
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || zoom <= 1 || e.touches.length !== 1) return;
    const rawX = e.touches[0].clientX - dragStartRef.current.x;
    const rawY = e.touches[0].clientY - dragStartRef.current.y;
    setPan(clampPan(rawX, rawY, zoom));
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  // On item clicked in scene
  const handleSelectObject = (obj: HiddenObject, e: React.MouseEvent) => {
    e.stopPropagation();
    if (obj.found) return;

    // STEP 4: Capture tap diagnostic relative to image canvas rectangle
    const canvasRect = canvasRef.current?.getBoundingClientRect();
    const scenePixelX = canvasRect ? e.clientX - canvasRect.left : 0;
    const scenePixelY = canvasRect ? e.clientY - canvasRect.top : 0;
    const normalizedX = canvasRect ? (scenePixelX / canvasRect.width) * 100 : obj.x;
    const normalizedY = canvasRect ? (scenePixelY / canvasRect.height) * 100 : obj.y;

    const hitIndex = displayedObjects.findIndex((o) => o.id === obj.id);

    const diag: TapDiagnosticInfo = {
      screenX: Math.round(e.clientX),
      screenY: Math.round(e.clientY),
      scenePixelX: Math.round(scenePixelX),
      scenePixelY: Math.round(scenePixelY),
      normalizedX: +normalizedX.toFixed(1),
      normalizedY: +normalizedY.toFixed(1),
      hitboxDetected: true,
      hitboxIndex: hitIndex + 1,
      hitboxLabel: obj.name,
      hitboxId: obj.id,
      passedId: obj.id,
      completedLabel: obj.name,
      isMatch: true,
      timestamp: new Date().toLocaleTimeString(),
    };

    setDiagnostic(diag);

    console.log(`[STEP 4: findObject Received ID] "${obj.id}" | Object Label: "${obj.name}" | Hitbox Index: #${hitIndex + 1}`);
    console.log(`[STEP 5: Emitting onObjectFound] "${obj.id}"`);

    if (obj.category === 'evidence') {
      sounds.playEvidenceSound();
    } else {
      sounds.playFindSound();
    }

    // Sparkle animation coordinates
    const rect = containerRef.current?.getBoundingClientRect();
    if (rect) {
      setSparklePos({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
        name: obj.name,
      });
      setTimeout(() => setSparklePos(null), 1200);
    }

    // Mark as found
    onObjectFound(obj.id);
    if (hintedObjectId === obj.id) {
      setHintedObjectId(null);
    }

    // If evidence, show clue modal
    if (obj.evidenceId) {
      const evItem = evidenceItems.find((ev) => ev.id === obj.evidenceId);
      if (evItem) {
        onEvidenceDiscovered(evItem);
        setTimeout(() => {
          setActiveEvidenceModal(evItem);
        }, 300);
      }
    }
  };

  return (
    <div className="relative w-full h-full flex flex-col justify-between bg-[#19110b] overflow-hidden select-none">
      {/* Top Scene Sub-Header */}
      <header
        id="scene-header"
        className="px-3 py-1.5 bg-[#281a12]/95 border-b border-amber-900/40 flex flex-wrap items-center justify-between z-30 shrink-0 gap-y-1"
      >
        <div>
          <h2 className="text-xs font-serif font-bold text-amber-200">{sceneTitle}</h2>
          <p className="text-[10px] text-amber-100/60 flex items-center space-x-1">
            <span>{sceneLocation}</span>
          </p>
        </div>

        <div className="flex items-center space-x-1.5">
          {/* Controlled Test Mode Toggle */}
          <button
            id="btn-toggle-test-mode"
            onClick={() => setTestMode((prev) => (prev === 'all' ? 'controlled_3' : 'all'))}
            className={`px-2 py-0.5 rounded text-[10px] font-mono font-semibold border flex items-center space-x-1 transition-all cursor-pointer ${
              testMode === 'controlled_3'
                ? 'bg-amber-500 text-stone-950 border-amber-300 font-bold'
                : 'bg-stone-900 text-stone-300 border-stone-700 hover:text-white'
            }`}
            title="Toggle between 3-Item Controlled Test and All 8 Items"
          >
            <Sliders className="w-3 h-3" />
            <span>{testMode === 'controlled_3' ? 'Mode: 3 Items' : 'Mode: All 8'}</span>
          </button>

          {/* Reset Targets Button */}
          {onResetScene && (
            <button
              id="btn-reset-scene"
              onClick={onResetScene}
              className="px-2 py-0.5 rounded text-[10px] font-mono bg-stone-900 text-stone-300 border border-stone-700 hover:text-amber-300 flex items-center space-x-1 cursor-pointer"
              title="Reset found objects in this scene"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset</span>
            </button>
          )}

          {/* Debug Toggle: SHOW_HITBOXES */}
          <button
            id="btn-toggle-hitboxes"
            onClick={() => setShowHitboxes((prev) => !prev)}
            className={`px-2 py-0.5 rounded text-[10px] font-mono font-semibold border flex items-center space-x-1 transition-all cursor-pointer ${
              showHitboxes
                ? 'bg-emerald-800/90 text-emerald-100 border-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.5)]'
                : 'bg-stone-900/70 text-stone-400 hover:text-stone-200 border-stone-800'
            }`}
            title="Toggle Debug Hitbox Overlay & Diagnostic Panel"
          >
            <Crosshair className="w-3 h-3" />
            <span>Hitboxes: {showHitboxes ? 'ON' : 'OFF'}</span>
          </button>

          {/* Zoom controls */}
          <div className="flex items-center bg-stone-950/80 rounded-lg border border-amber-900/50 p-0.5">
            <button
              id="btn-zoom-in"
              onClick={handleZoomIn}
              disabled={zoom >= 2.5}
              className="p-1 text-amber-300 hover:text-amber-100 disabled:opacity-30 cursor-pointer"
              title="Zoom In"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
            <span className="text-[10px] font-mono px-1 text-amber-200/80">{zoom}x</span>
            <button
              id="btn-zoom-out"
              onClick={handleZoomOut}
              disabled={zoom <= 1}
              className="p-1 text-amber-300 hover:text-amber-100 disabled:opacity-30 cursor-pointer"
              title="Zoom Out"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            {zoom > 1 && (
              <button
                onClick={handleResetZoom}
                className="p-1 text-stone-400 hover:text-stone-200 border-l border-stone-800 cursor-pointer"
                title="Reset View"
              >
                <Maximize2 className="w-3 h-3" />
              </button>
            )}
          </div>

          {/* Hint Button */}
          <button
            id="btn-hint"
            onClick={handleUseHint}
            disabled={hintCooldown > 0 || isSceneCompleted}
            className={`px-2.5 py-1 rounded-lg border text-xs font-serif font-bold flex items-center space-x-1 shadow transition-all cursor-pointer ${
              hintCooldown > 0 || isSceneCompleted
                ? 'bg-stone-900/60 border-stone-800 text-stone-500'
                : 'bg-amber-600/90 hover:bg-amber-500 border-amber-400/50 text-stone-950 animate-pulse'
            }`}
          >
            <Compass className="w-3.5 h-3.5" />
            <span>{hintCooldown > 0 ? `${hintCooldown}s` : 'Hint'}</span>
          </button>
        </div>
      </header>

      {/* 
        LIVE TAP DIAGNOSTIC PANEL (Rendered when SHOW_HITBOXES is true)
      */}
      {showHitboxes && (
        <aside
          id="tap-diagnostic-panel"
          className="bg-stone-950/95 border-b border-amber-500/50 px-3 py-1.5 text-stone-200 font-mono text-[10px] leading-tight z-30 shadow-2xl flex flex-col space-y-1 pointer-events-auto"
        >
          <div className="flex items-center justify-between border-b border-stone-800 pb-1">
            <div className="flex items-center space-x-2">
              <span className="font-bold text-amber-400 flex items-center space-x-1">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping inline-block" />
                <span>TAP DIAGNOSTIC</span>
              </span>
              <span className="bg-stone-800 px-1.5 py-0.2 rounded text-[9px] text-stone-300">
                {testMode === 'controlled_3' ? '3-Target Test Mode (Glasses, Pen, Key)' : 'All 8 Targets Mode'}
              </span>
            </div>
            {diagnostic && (
              <span
                className={`px-1.5 py-0.2 rounded font-bold text-[9px] ${
                  diagnostic.isMatch
                    ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/50'
                    : 'bg-rose-950 text-rose-300 border border-rose-500/50'
                }`}
              >
                {diagnostic.isMatch ? 'CHAIN: PERFECT MATCH ✓' : 'CHAIN: ID MISMATCH ⚠'}
              </span>
            )}
          </div>

          {diagnostic ? (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 text-[9px]">
              <div className="bg-stone-900/80 p-1 rounded border border-stone-800">
                <span className="text-stone-400 block">Screen X/Y:</span>
                <span className="font-bold text-amber-200">{diagnostic.screenX}, {diagnostic.screenY}</span>
              </div>
              <div className="bg-stone-900/80 p-1 rounded border border-stone-800">
                <span className="text-stone-400 block">Scene X/Y (Norm %):</span>
                <span className="font-bold text-amber-200">
                  {diagnostic.scenePixelX}px, {diagnostic.scenePixelY}px ({diagnostic.normalizedX}%, {diagnostic.normalizedY}%)
                </span>
              </div>
              <div className="bg-stone-900/80 p-1 rounded border border-stone-800">
                <span className="text-stone-400 block">Hitbox Detected:</span>
                <span className={`font-bold ${diagnostic.hitboxDetected ? 'text-emerald-300' : 'text-stone-400'}`}>
                  {diagnostic.hitboxDetected ? `YES (#${diagnostic.hitboxIndex}: ${diagnostic.hitboxLabel})` : 'NO (Background)'}
                </span>
                {diagnostic.hitboxId !== 'none' && (
                  <span className="text-stone-400 text-[8px] block">ID: {diagnostic.hitboxId}</span>
                )}
              </div>
              <div className="bg-stone-900/80 p-1 rounded border border-stone-800">
                <span className="text-stone-400 block">Passed to findObject:</span>
                <span className="font-bold text-cyan-300">
                  {diagnostic.passedId} → {diagnostic.completedLabel}
                </span>
              </div>
            </div>
          ) : (
            <p className="text-stone-500 italic text-[9px]">Tap anywhere in the scene to inspect live coordinates and hitbox detection.</p>
          )}
        </aside>
      )}

      {/* 
        1. SCENE VIEWPORT: Outer viewport container handling pan gestures & background clicks 
      */}
      <section
        id="scene-canvas-container"
        ref={containerRef}
        onClick={handleSceneBackgroundClick}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        className={`relative flex-1 w-full bg-[#120b07] overflow-hidden flex items-center justify-center ${
          zoom > 1 ? 'cursor-grab active:cursor-grabbing' : 'cursor-default'
        }`}
      >
        {/* 
          2. TRANSFORMABLE SCENE WRAPPER: Single parent with transform translate + scale.
             Guarantees image & hitboxes scale and pan in atomic lockstep!
        */}
        <div
          id="transformable-scene-wrapper"
          className="relative transition-transform duration-75 ease-out flex items-center justify-center pointer-events-none"
          style={{
            transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
            transformOrigin: 'center center',
          }}
        >
          {/* 
            3. SCENE CANVAS: Strict aspect-ratio canvas where image & hitbox layer have IDENTICAL bounds
          */}
          <div
            id="scene-canvas"
            ref={canvasRef}
            className="relative select-none shadow-2xl overflow-hidden pointer-events-none"
            style={{
              width: `${canvasBounds.width}px`,
              height: `${canvasBounds.height}px`,
            }}
          >
            {/* Layer 1: Illustrated Scene Artwork (Fills 100% of canvas with exact aspect ratio) */}
            <img
              ref={imgRef}
              src={imageSrc}
              alt={sceneTitle}
              onLoad={handleImageLoad}
              referrerPolicy="no-referrer"
              className="w-full h-full block object-fill select-none pointer-events-none filter brightness-100 contrast-105"
              draggable={false}
            />

            {/* 
              Layer 2: Interaction Hitbox Layer
              Positioned directly over the image with 1:1 normalized percentage coordinates
            */}
            <div
              id="hitbox-layer"
              className="absolute inset-0 w-full h-full pointer-events-none"
            >
              {displayedObjects.map((obj, index) => (
                <SceneObject
                  key={obj.id}
                  object={obj}
                  index={index}
                  showHitbox={showHitboxes}
                  isHinted={hintedObjectId === obj.id}
                  onSelect={handleSelectObject}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Dynamic Soft Touch Ripple on miss tap */}
        {ripples.map((ripple) => (
          <motion.div
            key={ripple.id}
            initial={{ scale: 0.2, opacity: 0.7 }}
            animate={{ scale: 1.8, opacity: 0 }}
            transition={{ duration: 0.35, ease: 'easeOut' }}
            style={{ left: ripple.x, top: ripple.y }}
            className="absolute -translate-x-1/2 -translate-y-1/2 w-8 h-8 rounded-full border border-amber-300/40 bg-amber-400/10 pointer-events-none z-30"
          />
        ))}

        {/* Dynamic Sparkle / Item Picked Particle Animation */}
        <AnimatePresence>
          {sparklePos && (
            <motion.div
              initial={{ opacity: 1, scale: 0.5, y: 0 }}
              animate={{ opacity: 0, scale: 1.5, y: -40 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
              style={{ left: sparklePos.x, top: sparklePos.y }}
              className="absolute pointer-events-none z-40 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center"
            >
              <div className="flex items-center space-x-1 px-2.5 py-1 rounded-full bg-amber-400 text-stone-950 font-serif font-bold text-xs shadow-[0_0_15px_rgba(251,191,36,0.85)]">
                <Sparkles className="w-3.5 h-3.5 fill-stone-950" />
                <span>Found {sparklePos.name}!</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Ambient Display Case Indicator (if Reading Room) */}
        {sceneId === 'reading_room' && (
          <div className="absolute top-3 left-3 px-2 py-1 rounded-md bg-stone-950/75 border border-amber-800/40 text-[10px] text-amber-300 font-serif backdrop-blur-xs flex items-center space-x-1 pointer-events-none z-10">
            <Info className="w-3 h-3 text-amber-400" />
            <span>Display case is visibly empty!</span>
          </div>
        )}
      </section>

      {/* Bottom Find List Bar */}
      <footer
        id="scene-find-bar"
        className="bg-[#20140e] border-t border-amber-900/50 p-2.5 shrink-0 z-20"
      >
        <div className="flex items-center justify-between mb-1.5 px-1">
          <span className="text-[11px] font-serif font-semibold text-amber-300 tracking-wider">
            ITEMS TO FIND ({displayedObjects.filter((o) => o.found).length}/{displayedObjects.length})
          </span>
          <span className="text-[10px] font-mono text-stone-400">
            {remainingCount === 0 ? 'All Found!' : `${remainingCount} remaining`}
          </span>
        </div>

        {/* Objects Grid */}
        <div className={`grid gap-1.5 ${displayedObjects.length <= 3 ? 'grid-cols-3' : 'grid-cols-4'}`}>
          {displayedObjects.map((obj, idx) => (
            <div
              key={obj.id}
              id={`find-item-${obj.id}`}
              data-object-id={obj.id}
              className={`p-1.5 rounded-lg border flex flex-col items-center text-center transition-all ${
                obj.found
                  ? 'bg-amber-950/20 border-emerald-800/40 opacity-45'
                  : obj.category === 'evidence'
                  ? 'bg-amber-950/50 border-amber-600/60 shadow-xs'
                  : 'bg-stone-900/70 border-stone-800'
              }`}
            >
              <div className="relative mb-0.5 flex items-center space-x-1">
                {showHitboxes && (
                  <span className="text-[8px] font-mono font-bold text-amber-400/80 bg-stone-950 px-1 rounded-xs">
                    #{idx + 1}
                  </span>
                )}
                {obj.found ? (
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                ) : obj.category === 'evidence' ? (
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                ) : (
                  <Search className="w-3.5 h-3.5 text-stone-400" />
                )}
              </div>
              <span
                className={`text-[10px] leading-tight font-serif truncate w-full ${
                  obj.found
                    ? 'line-through text-stone-500'
                    : obj.category === 'evidence'
                    ? 'text-amber-200 font-semibold'
                    : 'text-stone-300'
                }`}
              >
                {obj.name}
              </span>
              {showHitboxes && (
                <span className="text-[8px] text-stone-400 font-mono truncate w-full">
                  {obj.id}
                </span>
              )}
            </div>
          ))}
        </div>
      </footer>

      {/* Discovered Evidence Modal (Pops up when Evidence Item is found) */}
      <AnimatePresence>
        {activeEvidenceModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-50 bg-stone-950/85 backdrop-blur-md p-5 flex flex-col justify-center items-center"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="w-full max-w-sm bg-gradient-to-b from-[#2d1e15] to-[#1e130c] rounded-2xl border-2 border-amber-500/70 p-5 shadow-2xl space-y-3.5 text-stone-100 relative"
            >
              <div className="text-center space-y-1">
                <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[10px] font-mono uppercase tracking-wider font-bold">
                  ★ Critical Evidence Discovered ★
                </span>
                <h3 className="text-lg font-serif font-bold text-amber-100">
                  {activeEvidenceModal.name}
                </h3>
              </div>

              <div className="p-3 rounded-xl bg-stone-950/80 border border-amber-900/50 space-y-2 text-xs font-serif leading-relaxed">
                <p className="text-amber-200/90 italic font-semibold">
                  “{activeEvidenceModal.tagline}”
                </p>
                <p className="text-stone-300">
                  {activeEvidenceModal.fullDescription}
                </p>
              </div>

              <div className="p-2.5 rounded-lg bg-amber-950/40 border border-amber-800/40 text-[11px] text-amber-300 font-serif">
                <strong>Clue Connection: </strong>
                <span>{activeEvidenceModal.suspectConnection}</span>
              </div>

              <button
                id="btn-close-evidence-modal"
                onClick={() => {
                  sounds.playPageTurnSound();
                  setActiveEvidenceModal(null);
                }}
                className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-serif font-bold text-xs shadow-md transition-all flex items-center justify-center space-x-1 cursor-pointer"
              >
                <span>Add to Evidence Board</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Scene Search Completed Modal */}
      <AnimatePresence>
        {isSceneCompleted && !activeEvidenceModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 z-40 bg-stone-950/85 backdrop-blur-md p-5 flex flex-col justify-center items-center"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className="w-full max-w-sm bg-gradient-to-b from-[#2b1c14] to-[#1a100a] rounded-2xl border-2 border-amber-400/80 p-5 shadow-2xl text-center space-y-4"
            >
              <div className="w-14 h-14 rounded-full bg-amber-500/20 border border-amber-400/50 mx-auto flex items-center justify-center text-amber-400">
                <CheckCircle2 className="w-8 h-8" />
              </div>

              <div className="space-y-1">
                <span className="text-[11px] font-mono uppercase tracking-widest text-amber-400">
                  Area Fully Searched
                </span>
                <h3 className="text-xl font-serif font-bold text-stone-100">
                  SEARCH COMPLETE
                </h3>
                <p className="text-xs text-amber-200/80 font-serif">
                  All evidence and objects discovered in this location!
                </p>
              </div>

              <div className="space-y-2 pt-1">
                {sceneId === 'reading_room' && onNavigateToArchive ? (
                  <button
                    id="btn-proceed-archive"
                    onClick={() => {
                      sounds.playTapSound();
                      onNavigateToArchive();
                    }}
                    className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-stone-950 font-serif font-bold text-xs shadow-lg flex items-center justify-center space-x-1.5 cursor-pointer"
                  >
                    <span>Use B-17 Key: Unlock Archive Room</span>
                    <ArrowRight className="w-4 h-4 text-stone-950" />
                  </button>
                ) : null}

                <button
                  id="btn-proceed-suspects"
                  onClick={() => {
                    sounds.playTapSound();
                    onNavigateToSuspects();
                  }}
                  className="w-full py-2.5 rounded-xl bg-stone-900 hover:bg-stone-850 text-amber-200 font-serif text-xs border border-amber-800/50 flex items-center justify-center space-x-1.5 cursor-pointer"
                >
                  <span>Question the Suspects</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
