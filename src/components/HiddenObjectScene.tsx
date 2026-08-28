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
  Wrench,
  Save,
  Copy,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  Eye,
  EyeOff,
  LogOut,
  Sliders,
  Maximize,
  Minimize2,
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
  onCompleteScene?: () => void;
  onNavigateToSuspects: () => void;
  onNavigateToArchive?: () => void;
  onResetScene?: () => void;
  hintsUsed: number;
  onIncrementHint: () => void;
  onOpenCalibration?: () => void;
}

interface TouchRipple {
  id: number;
  x: number;
  y: number;
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
  onOpenCalibration,
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

  // Local object coordinates state: authoritative source loaded from localStorage (if previously saved) or props
  const [sceneObjects, setSceneObjects] = useState<HiddenObject[]>(() => {
    try {
      const saved =
        localStorage.getItem(`bellweather_calibration_case01_${sceneId}`) ||
        localStorage.getItem(`authoritative_coords_${sceneId}`);
      if (saved) {
        const parsed = JSON.parse(saved);
        return objects.map((obj) => {
          const match = parsed.find((p: any) => p.id === obj.id || p.objectId === obj.id);
          return match
            ? {
                ...obj,
                x: typeof match.x === 'number' ? match.x : obj.x,
                y: typeof match.y === 'number' ? match.y : obj.y,
                width: typeof match.width === 'number' ? match.width : obj.width,
                height: typeof match.height === 'number' ? match.height : obj.height,
              }
            : obj;
        });
      }
    } catch {
      // fallback to initial
    }
    return objects;
  });

  // Keep found status AND coordinates synced with prop updates
  useEffect(() => {
    try {
      const saved =
        localStorage.getItem(`bellweather_calibration_case01_${sceneId}`) ||
        localStorage.getItem(`authoritative_coords_${sceneId}`);
      if (saved) {
        const parsed = JSON.parse(saved);
        setSceneObjects(
          objects.map((obj) => {
            const match = parsed.find((p: any) => p.id === obj.id || p.objectId === obj.id);
            return match
              ? {
                  ...obj,
                  x: typeof match.x === 'number' ? match.x : obj.x,
                  y: typeof match.y === 'number' ? match.y : obj.y,
                  width: typeof match.width === 'number' ? match.width : obj.width,
                  height: typeof match.height === 'number' ? match.height : obj.height,
                }
              : obj;
          })
        );
        return;
      }
    } catch {}

    setSceneObjects(objects);
  }, [objects, sceneId]);

  // Zoom & Pan state
  const [zoom, setZoom] = useState<number>(1);
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const dragStartRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  // ==========================================
  // CALIBRATION WORKSPACE STATE
  // ==========================================
  const [isCalibrationMode, setIsCalibrationMode] = useState<boolean>(false);
  const [selectedCalibrationObjId, setSelectedCalibrationObjId] = useState<string>('reading_glasses');
  const [showAllBoxes, setShowAllBoxes] = useState<boolean>(false);
  const [isToolbarCollapsed, setIsToolbarCollapsed] = useState<boolean>(false);
  const [showInspectorPanel, setShowInspectorPanel] = useState<boolean>(false);
  const [calibrationSaveToast, setCalibrationSaveToast] = useState<string | null>(null);
  const [showConfirmResetModal, setShowConfirmResetModal] = useState<boolean>(false);

  // Loupe / Magnifier tool state
  const [isLoupeEnabled, setIsLoupeEnabled] = useState<boolean>(false);
  const [loupePos, setLoupePos] = useState<{ screenX: number; screenY: number; normX: number; normY: number } | null>(null);

  // Debug Hitbox visualization in normal play
  const [showHitboxesInPlay, setShowHitboxesInPlay] = useState<boolean>(false);

  // Hint state
  const [hintedObjectId, setHintedObjectId] = useState<string | null>(null);
  const [hintCooldown, setHintCooldown] = useState<number>(0);

  // Evidence modal state
  const [activeEvidenceModal, setActiveEvidenceModal] = useState<EvidenceItem | null>(null);

  // Sparkle feedback position
  const [sparklePos, setSparklePos] = useState<{ x: number; y: number; name: string } | null>(null);

  // Touch miss ripples
  const [ripples, setRipples] = useState<TouchRipple[]>([]);

  // Selected object index in calibration mode
  const selectedCalibrationIndex = sceneObjects.findIndex((o) => o.id === selectedCalibrationObjId);
  const selectedCalibrationObj =
    selectedCalibrationIndex >= 0 ? sceneObjects[selectedCalibrationIndex] : sceneObjects[0];

  // Completion state
  const remainingCount = sceneObjects.filter((o) => !o.found).length;
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
      targetH = cHeight;
      targetW = cHeight * imgAspect;
    } else {
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
  }, [updateCanvasDimensions, isCalibrationMode]);

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

  // Toggle Calibration Mode
  const handleToggleCalibrationMode = (enable?: boolean) => {
    const nextState = typeof enable === 'boolean' ? enable : !isCalibrationMode;
    setIsCalibrationMode(nextState);
    if (nextState) {
      // In calibration mode, default to 1.5x zoom or 1x with centered pan
      setZoom(1);
      setPan({ x: 0, y: 0 });
      sounds.playPageTurnSound();
    } else {
      // Exiting calibration mode: restore standard 1x zoom
      setZoom(1);
      setPan({ x: 0, y: 0 });
      setIsLoupeEnabled(false);
      setShowInspectorPanel(false);
      sounds.playTapSound();
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

  // Target Placement: Click / Tap on Canvas
  const handleCanvasClick = (e: React.MouseEvent) => {
    const canvasRect = canvasRef.current?.getBoundingClientRect();
    if (!canvasRect) return;

    const scenePixelX = e.clientX - canvasRect.left;
    const scenePixelY = e.clientY - canvasRect.top;

    // Strict artwork-relative percentage (0.0% to 100.0%)
    const normalizedX = Math.max(0, Math.min(100, +((scenePixelX / canvasRect.width) * 100).toFixed(1)));
    const normalizedY = Math.max(0, Math.min(100, +((scenePixelY / canvasRect.height) * 100).toFixed(1)));

    if (isCalibrationMode) {
      // DIRECT TAP-TO-PLACE WORKFLOW:
      // Tapping on the artwork directly moves the selected target's center right to that spot!
      if (!selectedCalibrationObj) return;

      setSceneObjects((prev) =>
        prev.map((obj) =>
          obj.id === selectedCalibrationObj.id
            ? { ...obj, x: normalizedX, y: normalizedY }
            : obj
        )
      );
      sounds.playFindSound();
      setCalibrationSaveToast(`Moved "${selectedCalibrationObj.name}" to (${normalizedX}%, ${normalizedY}%)`);
      setTimeout(() => setCalibrationSaveToast(null), 2200);
      return;
    }

    // Normal play: soft miss sound and ripple
    sounds.playSoftMissSound();
    triggerRipple(e.clientX, e.clientY);
  };

  // Loupe pointer tracking
  const handleCanvasMouseMoveForLoupe = (e: React.MouseEvent) => {
    if (!isCalibrationMode) return;
    const canvasRect = canvasRef.current?.getBoundingClientRect();
    if (!canvasRect) return;

    const scenePixelX = e.clientX - canvasRect.left;
    const scenePixelY = e.clientY - canvasRect.top;

    const normX = Math.max(0, Math.min(100, +((scenePixelX / canvasRect.width) * 100).toFixed(1)));
    const normY = Math.max(0, Math.min(100, +((scenePixelY / canvasRect.height) * 100).toFixed(1)));

    setLoupePos({
      screenX: e.clientX,
      screenY: e.clientY,
      normX,
      normY,
    });
  };

  // Live coordinate update during Calibration Drag/Resize or input
  const handleUpdateCoordinates = (
    id: string,
    newCoords: { x: number; y: number; width: number; height: number }
  ) => {
    setSceneObjects((prev) =>
      prev.map((obj) => (obj.id === id ? { ...obj, ...newCoords } : obj))
    );
  };

  // Next / Previous Target selection in calibration
  const handleSelectPreviousTarget = () => {
    sounds.playTapSound();
    const prevIdx = (selectedCalibrationIndex - 1 + sceneObjects.length) % sceneObjects.length;
    setSelectedCalibrationObjId(sceneObjects[prevIdx].id);
  };

  const handleSelectNextTarget = () => {
    sounds.playTapSound();
    const nextIdx = (selectedCalibrationIndex + 1) % sceneObjects.length;
    setSelectedCalibrationObjId(sceneObjects[nextIdx].id);
  };

  // SAVE CALIBRATION: Authoritatively persist manually adjusted coordinates to LocalStorage
  const handleSaveCalibration = () => {
    try {
      const payload = sceneObjects.map((o) => ({
        id: o.id,
        name: o.name,
        x: o.x,
        y: o.y,
        width: o.width,
        height: o.height,
      }));
      localStorage.setItem(`authoritative_coords_${sceneId}`, JSON.stringify(payload));
      sounds.playEvidenceSound();
      setCalibrationSaveToast('★ CALIBRATION SAVED! Hotspot coordinates permanently stored.');
      setTimeout(() => setCalibrationSaveToast(null), 3500);
    } catch (err) {
      console.error('Failed to save calibration:', err);
    }
  };

  // Copy JSON Code Snippet for direct backup
  const handleCopyCalibrationJson = () => {
    const json = JSON.stringify(
      sceneObjects.map((o) => ({
        id: o.id,
        name: o.name,
        x: o.x,
        y: o.y,
        width: o.width,
        height: o.height,
      })),
      null,
      2
    );
    navigator.clipboard?.writeText(json);
    setCalibrationSaveToast('Copied Calibrated Coordinates JSON to Clipboard!');
    setTimeout(() => setCalibrationSaveToast(null), 3000);
  };

  // Reset Calibration (Restores default coordinates ONLY after explicit modal confirmation)
  const handleConfirmResetCalibration = () => {
    try {
      localStorage.removeItem(`authoritative_coords_${sceneId}`);
    } catch {}
    setSceneObjects(objects);
    setShowConfirmResetModal(false);
    sounds.playTapSound();
    setCalibrationSaveToast('Reverted coordinates to original defaults');
    setTimeout(() => setCalibrationSaveToast(null), 2500);
  };

  // Use Hint in normal play
  const handleUseHint = () => {
    if (hintCooldown > 0) return;
    const undiscovered = sceneObjects.filter((o) => !o.found);
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

  // Zoom controls (Supports 1x to 4x/5x)
  const setExactZoom = (newZoom: number) => {
    sounds.playTapSound();
    const clamped = Math.max(1, Math.min(5, newZoom));
    setZoom(clamped);
    if (clamped === 1) {
      setPan({ x: 0, y: 0 });
    }
  };

  const handleZoomIn = () => {
    sounds.playTapSound();
    setZoom((prev) => Math.min(5, +(prev + 0.5).toFixed(1)));
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
    const maxPanX = (canvasBounds.width * (currentZoom - 1)) / 2 + 100;
    const maxPanY = (canvasBounds.height * (currentZoom - 1)) / 2 + 100;
    return {
      x: Math.max(-maxPanX, Math.min(maxPanX, newX)),
      y: Math.max(-maxPanY, Math.min(maxPanY, newY)),
    };
  };

  // Pan dragging (Mouse)
  const handleMouseDown = (e: React.MouseEvent) => {
    if (zoom <= 1) return;
    // Don't initiate canvas pan if user is clicking on a hitbox handle or buttons
    const target = e.target as HTMLElement;
    if (target.closest('.cursor-move') || target.closest('.cursor-se-resize') || target.closest('button') || target.closest('input')) {
      return;
    }
    setIsDragging(true);
    dragStartRef.current = { x: e.clientX - pan.x, y: e.clientY - pan.y };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    handleCanvasMouseMoveForLoupe(e);
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
    const target = e.target as HTMLElement;
    if (target.closest('.cursor-move') || target.closest('.cursor-se-resize') || target.closest('button') || target.closest('input')) {
      return;
    }
    setIsDragging(true);
    dragStartRef.current = {
      x: e.touches[0].clientX - pan.x,
      y: e.touches[0].clientY - pan.y,
    };
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || zoom <= 1) return;
    const rawX = e.touches[0].clientX - dragStartRef.current.x;
    const rawY = e.touches[0].clientY - dragStartRef.current.y;
    setPan(clampPan(rawX, rawY, zoom));
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  // On item clicked in scene during gameplay
  const handleSelectObject = (obj: HiddenObject, e: React.MouseEvent) => {
    e.stopPropagation();
    if (isCalibrationMode) return;
    if (obj.found) return;

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

    // Mark as found in App state
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

  // Hitboxes to render
  const objectsToRender = isCalibrationMode
    ? showAllBoxes
      ? sceneObjects
      : sceneObjects.filter((o) => o.id === selectedCalibrationObjId)
    : sceneObjects;

  return (
    <div
      className={`relative w-full h-full flex flex-col justify-between select-none overflow-hidden ${
        isCalibrationMode
          ? 'fixed inset-0 z-50 bg-[#0d0704] w-screen h-screen'
          : 'bg-[#19110b]'
      }`}
    >
      {/* 
        ========================================================================
        NORMAL GAMEPLAY HEADER (Polished Bellweather Interface)
        ========================================================================
      */}
      {!isCalibrationMode && (
        <header
          id="scene-header"
          className="px-3.5 py-2 bg-[#23170f]/95 border-b border-amber-900/40 flex items-center justify-between z-30 shrink-0 shadow-sm"
        >
          <div>
            <h2 className="text-xs font-serif font-bold text-amber-200">{sceneTitle}</h2>
            <p className="text-[10px] text-amber-100/60 flex items-center space-x-1">
              <span>{sceneLocation}</span>
            </p>
          </div>

          <div className="flex items-center space-x-2">
            {/* Zoom controls */}
            <div className="flex items-center bg-stone-950/80 rounded-lg border border-amber-900/50 p-0.5">
              <button
                id="btn-zoom-in"
                onClick={handleZoomIn}
                disabled={zoom >= 3}
                className="p-1 text-amber-300 hover:text-amber-100 disabled:opacity-30 cursor-pointer"
                title="Zoom In"
              >
                <ZoomIn className="w-3.5 h-3.5" />
              </button>
              <span className="text-[10px] font-mono px-1.5 text-amber-200/80">{zoom}x</span>
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
              className={`px-3 py-1 rounded-lg border text-xs font-serif font-bold flex items-center space-x-1 shadow transition-all cursor-pointer ${
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
      )}

      {/* 
        ========================================================================
        FULL-SCREEN CALIBRATION FLOATING TOOLBAR
        Occupies minimal space and allows 85–90% of screen for the artwork!
        ========================================================================
      */}
      {isCalibrationMode && (
        <div className="absolute top-3 left-1/2 -translate-x-1/2 z-40 w-11/12 max-w-4xl pointer-events-none">
          <div className="bg-[#180e08]/95 backdrop-blur-md border border-amber-500/70 rounded-2xl p-2 shadow-[0_10px_35px_rgba(0,0,0,0.85)] pointer-events-auto flex flex-col space-y-2">
            
            {/* Top Row: Target Navigation, Presets, Save & Exit */}
            <div className="flex flex-wrap items-center justify-between gap-2">
              
              {/* Target Selector with Prev/Next Controls */}
              <div className="flex items-center space-x-1 bg-stone-950/90 px-2 py-1 rounded-xl border border-amber-500/50">
                <button
                  id="btn-calib-prev-target"
                  onClick={handleSelectPreviousTarget}
                  className="p-1 rounded hover:bg-amber-500/20 text-amber-300 cursor-pointer"
                  title="Previous Target"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>

                <div className="flex items-center space-x-1.5 px-1">
                  <span className="px-1.5 py-0.5 rounded bg-amber-400 text-stone-950 font-mono text-[10px] font-bold">
                    #{selectedCalibrationIndex + 1}/{sceneObjects.length}
                  </span>
                  
                  {/* Select Dropdown for direct selection */}
                  <select
                    id="calib-target-select"
                    value={selectedCalibrationObjId}
                    onChange={(e) => {
                      setSelectedCalibrationObjId(e.target.value);
                      sounds.playTapSound();
                    }}
                    className="bg-transparent text-amber-200 font-serif font-bold text-xs outline-none cursor-pointer pr-1"
                  >
                    {sceneObjects.map((obj, i) => (
                      <option key={obj.id} value={obj.id} className="bg-stone-900 text-stone-100">
                        #{i + 1} {obj.name}
                      </option>
                    ))}
                  </select>
                </div>

                <button
                  id="btn-calib-next-target"
                  onClick={handleSelectNextTarget}
                  className="p-1 rounded hover:bg-amber-500/20 text-amber-300 cursor-pointer"
                  title="Next Target"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              {/* Zoom Preset Chips & Loupe */}
              <div className="flex items-center space-x-1 bg-stone-950/90 px-1.5 py-1 rounded-xl border border-stone-800">
                <span className="text-[10px] text-stone-400 font-mono pl-1 hidden sm:inline">Zoom:</span>
                {[1, 1.5, 2, 3, 4].map((lvl) => (
                  <button
                    key={lvl}
                    onClick={() => setExactZoom(lvl)}
                    className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold cursor-pointer transition-all ${
                      zoom === lvl
                        ? 'bg-amber-400 text-stone-950 shadow-sm'
                        : 'text-stone-300 hover:text-amber-200 hover:bg-stone-800'
                    }`}
                  >
                    {lvl}x
                  </button>
                ))}

                <button
                  onClick={handleResetZoom}
                  className="p-1 text-stone-400 hover:text-stone-200 cursor-pointer"
                  title="Reset Zoom & Pan"
                >
                  <Maximize2 className="w-3.5 h-3.5" />
                </button>

                {/* Magnifier / Precision Loupe Toggle */}
                <button
                  onClick={() => {
                    setIsLoupeEnabled((prev) => !prev);
                    sounds.playTapSound();
                  }}
                  className={`px-2 py-0.5 rounded text-[10px] font-mono border flex items-center space-x-1 cursor-pointer transition-all ${
                    isLoupeEnabled
                      ? 'bg-cyan-500 text-stone-950 border-cyan-300 font-bold'
                      : 'bg-stone-900 text-cyan-300 border-cyan-800/60 hover:text-cyan-100'
                  }`}
                  title="Toggle Precision Magnifying Loupe"
                >
                  <Crosshair className="w-3 h-3" />
                  <span className="hidden md:inline">Loupe</span>
                </button>
              </div>

              {/* Show All Boxes Toggle */}
              <button
                id="btn-calib-show-all-boxes"
                onClick={() => {
                  setShowAllBoxes((prev) => !prev);
                  sounds.playTapSound();
                }}
                className={`px-2.5 py-1 rounded-xl text-xs font-mono border flex items-center space-x-1.5 cursor-pointer transition-all ${
                  showAllBoxes
                    ? 'bg-cyan-950/70 border-cyan-400 text-cyan-200 font-bold'
                    : 'bg-stone-950/90 border-stone-800 text-stone-400 hover:text-stone-200'
                }`}
                title="Show all hotspot boxes or only the currently selected one"
              >
                {showAllBoxes ? <Eye className="w-3.5 h-3.5 text-cyan-300" /> : <EyeOff className="w-3.5 h-3.5" />}
                <span>{showAllBoxes ? 'All Boxes: ON' : 'Selected Only'}</span>
              </button>

              {/* Inspector Toggle */}
              <button
                onClick={() => setShowInspectorPanel((prev) => !prev)}
                className={`p-1.5 rounded-xl border text-xs cursor-pointer ${
                  showInspectorPanel
                    ? 'bg-amber-500/30 text-amber-300 border-amber-400'
                    : 'bg-stone-950/90 text-stone-400 hover:text-stone-200 border-stone-800'
                }`}
                title="Toggle Fine-Tune Numeric Inspector"
              >
                <Sliders className="w-4 h-4" />
              </button>

              {/* Action Buttons: Save & Exit */}
              <div className="flex items-center space-x-1.5 ml-auto">
                <button
                  id="btn-save-calibration"
                  onClick={handleSaveCalibration}
                  className="px-3 py-1 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-stone-950 font-bold text-xs flex items-center space-x-1.5 shadow-lg active:scale-95 transition-all cursor-pointer"
                  title="Save Calibrated Coordinates Permanently"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>SAVE</span>
                </button>

                <button
                  id="btn-exit-calibration"
                  onClick={() => handleToggleCalibrationMode(false)}
                  className="px-3 py-1 rounded-xl bg-rose-950/80 hover:bg-rose-900 border border-rose-700/60 text-rose-200 font-bold text-xs flex items-center space-x-1 cursor-pointer transition-all"
                  title="Exit Calibration Workspace & Return to Game"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>EXIT</span>
                </button>
              </div>
            </div>

            {/* Direct Tap-to-Place Instruction Bar */}
            <div className="flex items-center justify-between text-[11px] font-mono text-stone-300 px-1 border-t border-amber-900/40 pt-1.5">
              <span className="flex items-center space-x-1.5 text-amber-300">
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping inline-block" />
                <span>
                  <strong>TAP TO PLACE:</strong> Tap on the artwork where <strong>“{selectedCalibrationObj?.name}”</strong> is located to position it instantly!
                </span>
              </span>
              <span className="text-[10px] text-stone-400 hidden sm:inline">
                Drag center to nudge • Drag corner handle to resize
              </span>
            </div>

            {/* Collapsible Numeric Inspector & Options Drawer */}
            <AnimatePresence>
              {showInspectorPanel && selectedCalibrationObj && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="pt-2 border-t border-stone-800 grid grid-cols-1 md:grid-cols-12 gap-2 items-center text-[10px] font-mono"
                >
                  <div className="md:col-span-3 text-stone-300">
                    <span className="text-amber-300 font-bold block">{selectedCalibrationObj.name}</span>
                    <span className="text-stone-400">ID: {selectedCalibrationObj.id}</span>
                  </div>

                  <div className="md:col-span-5 grid grid-cols-4 gap-1 text-center">
                    <div className="bg-stone-900 p-1 rounded border border-stone-800">
                      <span className="text-stone-400 block text-[9px]">X (%)</span>
                      <input
                        type="number"
                        step="0.5"
                        min="0"
                        max="100"
                        value={selectedCalibrationObj.x}
                        onChange={(e) => handleUpdateCoordinates(selectedCalibrationObj.id, {
                          x: parseFloat(e.target.value) || 0,
                          y: selectedCalibrationObj.y,
                          width: selectedCalibrationObj.width,
                          height: selectedCalibrationObj.height,
                        })}
                        className="w-full bg-stone-950 border border-amber-500/60 rounded px-1 py-0.5 text-amber-300 font-bold text-center text-xs"
                      />
                    </div>

                    <div className="bg-stone-900 p-1 rounded border border-stone-800">
                      <span className="text-stone-400 block text-[9px]">Y (%)</span>
                      <input
                        type="number"
                        step="0.5"
                        min="0"
                        max="100"
                        value={selectedCalibrationObj.y}
                        onChange={(e) => handleUpdateCoordinates(selectedCalibrationObj.id, {
                          x: selectedCalibrationObj.x,
                          y: parseFloat(e.target.value) || 0,
                          width: selectedCalibrationObj.width,
                          height: selectedCalibrationObj.height,
                        })}
                        className="w-full bg-stone-950 border border-amber-500/60 rounded px-1 py-0.5 text-amber-300 font-bold text-center text-xs"
                      />
                    </div>

                    <div className="bg-stone-900 p-1 rounded border border-stone-800">
                      <span className="text-stone-400 block text-[9px]">Width (%)</span>
                      <input
                        type="number"
                        step="0.5"
                        min="2"
                        max="50"
                        value={selectedCalibrationObj.width}
                        onChange={(e) => handleUpdateCoordinates(selectedCalibrationObj.id, {
                          x: selectedCalibrationObj.x,
                          y: selectedCalibrationObj.y,
                          width: parseFloat(e.target.value) || 2,
                          height: selectedCalibrationObj.height,
                        })}
                        className="w-full bg-stone-950 border border-cyan-500/60 rounded px-1 py-0.5 text-cyan-300 font-bold text-center text-xs"
                      />
                    </div>

                    <div className="bg-stone-900 p-1 rounded border border-stone-800">
                      <span className="text-stone-400 block text-[9px]">Height (%)</span>
                      <input
                        type="number"
                        step="0.5"
                        min="2"
                        max="50"
                        value={selectedCalibrationObj.height}
                        onChange={(e) => handleUpdateCoordinates(selectedCalibrationObj.id, {
                          x: selectedCalibrationObj.x,
                          y: selectedCalibrationObj.y,
                          width: selectedCalibrationObj.width,
                          height: parseFloat(e.target.value) || 2,
                        })}
                        className="w-full bg-stone-950 border border-cyan-500/60 rounded px-1 py-0.5 text-cyan-300 font-bold text-center text-xs"
                      />
                    </div>
                  </div>

                  <div className="md:col-span-4 flex items-center justify-end space-x-1.5">
                    <button
                      onClick={handleCopyCalibrationJson}
                      className="px-2 py-1 rounded bg-stone-800 hover:bg-stone-700 text-amber-300 border border-amber-900/60 flex items-center space-x-1 cursor-pointer"
                      title="Copy JSON coordinates"
                    >
                      <Copy className="w-3 h-3" />
                      <span>Copy JSON</span>
                    </button>

                    <button
                      onClick={() => setShowConfirmResetModal(true)}
                      className="px-2 py-1 rounded bg-rose-950/60 hover:bg-rose-900 text-rose-300 border border-rose-800/60 flex items-center space-x-1 cursor-pointer"
                      title="Restore template default coordinates"
                    >
                      <RotateCcw className="w-3 h-3" />
                      <span>Defaults</span>
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      )}

      {/* Save Notification Toast */}
      {calibrationSaveToast && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 bg-emerald-500 text-stone-950 font-bold px-5 py-2 rounded-full text-xs text-center z-50 animate-bounce shadow-2xl border border-emerald-300">
          {calibrationSaveToast}
        </div>
      )}

      {/* 
        ========================================================================
        SCENE VIEWPORT: Dedicated Artwork Workspace (Fills 85–90%+ of screen!)
        ========================================================================
      */}
      <section
        id="scene-canvas-container"
        ref={containerRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        className={`relative flex-1 w-full h-full overflow-hidden flex items-center justify-center ${
          isCalibrationMode ? 'bg-[#0a0503]' : 'bg-[#120b07]'
        } ${zoom > 1 ? 'cursor-grab active:cursor-grabbing' : 'cursor-crosshair'}`}
      >
        {/* 
          TRANSFORMABLE SCENE WRAPPER: Single parent with transform translate + scale.
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
            SCENE CANVAS: Strict aspect-ratio canvas where image & hitbox layer have IDENTICAL bounds.
            Artwork origin (0%, 0%) = Canvas top-left
            Artwork (100%, 100%) = Canvas bottom-right
          */}
          <div
            id="scene-canvas"
            ref={canvasRef}
            onClick={handleCanvasClick}
            className="relative select-none shadow-[0_0_50px_rgba(0,0,0,0.9)] overflow-hidden pointer-events-auto cursor-crosshair border border-amber-950/40"
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
              {objectsToRender.map((obj, index) => (
                <SceneObject
                  key={obj.id}
                  object={obj}
                  index={index}
                  showHitbox={showHitboxesInPlay}
                  isCalibrationMode={isCalibrationMode}
                  isSelectedInCalibration={selectedCalibrationObjId === obj.id}
                  isHinted={hintedObjectId === obj.id}
                  onSelect={handleSelectObject}
                  onSelectForCalibration={(o) => {
                    setSelectedCalibrationObjId(o.id);
                  }}
                  onUpdateCoordinates={handleUpdateCoordinates}
                  canvasBounds={canvasBounds}
                  zoom={zoom}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Dynamic Precision Magnifying Loupe */}
        {isCalibrationMode && isLoupeEnabled && loupePos && (
          <div
            style={{
              left: loupePos.screenX + 25,
              top: loupePos.screenY - 70,
            }}
            className="fixed pointer-events-none z-50 w-36 h-36 rounded-full border-3 border-amber-400 shadow-[0_0_30px_rgba(0,0,0,0.9)] overflow-hidden bg-black flex flex-col items-center justify-center"
          >
            {/* Magnified Image Slice */}
            <div
              className="absolute inset-0 w-full h-full"
              style={{
                backgroundImage: `url(${imageSrc})`,
                backgroundPosition: `${loupePos.normX}% ${loupePos.normY}%`,
                backgroundSize: `${canvasBounds.width * 3}px ${canvasBounds.height * 3}px`,
                backgroundRepeat: 'no-repeat',
              }}
            />
            {/* Loupe Crosshair */}
            <div className="absolute w-full h-[1px] bg-amber-400/70" />
            <div className="absolute h-full w-[1px] bg-amber-400/70" />
            <div className="absolute w-2 h-2 rounded-full border border-amber-300 bg-amber-400/40" />

            {/* Coordinates label at bottom of loupe */}
            <div className="absolute bottom-1 bg-stone-950/90 text-amber-300 font-mono text-[8px] font-bold px-1.5 py-0.5 rounded-full border border-amber-500/50">
              ({loupePos.normX}%, {loupePos.normY}%)
            </div>
          </div>
        )}

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
        {sceneId === 'reading_room' && !isCalibrationMode && (
          <div className="absolute top-3 left-3 px-2 py-1 rounded-md bg-stone-950/75 border border-amber-800/40 text-[10px] text-amber-300 font-serif backdrop-blur-xs flex items-center space-x-1 pointer-events-none z-10">
            <Info className="w-3 h-3 text-amber-400" />
            <span>Display case is visibly empty!</span>
          </div>
        )}
      </section>

      {/* 
        ========================================================================
        NORMAL GAMEPLAY BOTTOM FIND LIST BAR (Hidden during Calibration Mode)
        ========================================================================
      */}
      {!isCalibrationMode && (
        <footer
          id="scene-find-bar"
          className="bg-[#20140e] border-t border-amber-900/50 p-2.5 shrink-0 z-20"
        >
          <div className="flex items-center justify-between mb-1.5 px-1">
            <span className="text-[11px] font-serif font-semibold text-amber-300 tracking-wider">
              ITEMS TO FIND ({sceneObjects.filter((o) => o.found).length}/{sceneObjects.length})
            </span>
            <span className="text-[10px] font-mono text-stone-400">
              {remainingCount === 0 ? 'All Found!' : `${remainingCount} remaining`}
            </span>
          </div>

          {/* Objects Grid */}
          <div className="grid grid-cols-4 gap-1.5">
            {sceneObjects.map((obj, idx) => (
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
                  {showHitboxesInPlay && (
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
                {showHitboxesInPlay && (
                  <span className="text-[8px] text-stone-400 font-mono truncate w-full">
                    ({obj.x}%, {obj.y}%)
                  </span>
                )}
              </div>
            ))}
          </div>
        </footer>
      )}

      {/* Explicit Confirmation Modal for "Reset Calibration" */}
      <AnimatePresence>
        {showConfirmResetModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-stone-950/90 backdrop-blur-md p-5 flex flex-col justify-center items-center"
          >
            <div className="w-full max-w-sm bg-[#241710] border-2 border-rose-500/80 rounded-2xl p-5 shadow-2xl space-y-4 text-stone-100">
              <div className="flex items-center space-x-2 text-rose-400 font-bold text-sm">
                <AlertTriangle className="w-5 h-5" />
                <span>Confirm Reset Calibration</span>
              </div>
              <p className="text-xs text-stone-300 leading-relaxed font-serif">
                Are you sure you want to discard your custom hotspot coordinates and revert to the default template positions?
              </p>
              <div className="flex items-center justify-end space-x-2 pt-2">
                <button
                  onClick={() => setShowConfirmResetModal(false)}
                  className="px-3 py-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-300 text-xs font-mono cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmResetCalibration}
                  className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-stone-950 font-bold text-xs font-mono cursor-pointer shadow"
                >
                  Yes, Reset Coordinates
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

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
        {isSceneCompleted && !activeEvidenceModal && !isCalibrationMode && (
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
