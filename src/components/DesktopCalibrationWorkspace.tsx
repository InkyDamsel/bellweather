import React, { useState, useRef, useEffect, useCallback } from 'react';
import { HiddenObject } from '../types';
import { sounds } from '../utils/audio';
import {
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Save,
  LogOut,
  Eye,
  EyeOff,
  Copy,
  RotateCcw,
  Sliders,
  Check,
  Crosshair,
  AlertTriangle,
  Move,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface DesktopCalibrationWorkspaceProps {
  sceneId: 'reading_room' | 'archive_room';
  sceneTitle: string;
  imageSrc: string;
  objects: HiddenObject[];
  onSave: (updatedObjects: HiddenObject[]) => void;
  onExit: () => void;
  onChangeScene?: (sceneId: 'reading_room' | 'archive_room') => void;
}

export const DesktopCalibrationWorkspace: React.FC<DesktopCalibrationWorkspaceProps> = ({
  sceneId,
  sceneTitle,
  imageSrc,
  objects,
  onSave,
  onExit,
  onChangeScene,
}) => {
  // Local objects state loaded from localStorage or props
  const [localObjects, setLocalObjects] = useState<HiddenObject[]>(() => {
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
    } catch {}
    return objects;
  });

  // Selected Target
  const [selectedId, setSelectedId] = useState<string>(
    localObjects[0]?.id || 'reading_glasses'
  );

  // Settings
  const [showAll, setShowAll] = useState<boolean>(true);
  const [showInspector, setShowInspector] = useState<boolean>(false);
  const [saveToast, setSaveToast] = useState<string | null>(null);
  const [showResetConfirm, setShowResetConfirm] = useState<boolean>(false);

  // Zoom & Pan
  // zoom = 1 means "Fit" (100% of contained artwork visible)
  const [zoom, setZoom] = useState<number>(1);
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState<boolean>(false);
  const panStartRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  // Container & Canvas bounds
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLDivElement>(null);
  const [canvasDimensions, setCanvasDimensions] = useState<{ width: number; height: number }>({
    width: 1000,
    height: 750,
  });

  // Natural image aspect ratio
  const [imgNaturalSize, setImgNaturalSize] = useState<{ width: number; height: number }>({
    width: 1200,
    height: 896,
  });

  const selectedIndex = localObjects.findIndex((o) => o.id === selectedId);
  const selectedObject = selectedIndex >= 0 ? localObjects[selectedIndex] : localObjects[0];

  // Drag & Resize state refs for hot-spots
  const isDraggingHitboxRef = useRef<boolean>(false);
  const isResizingHitboxRef = useRef<boolean>(false);
  const activeDragStartRef = useRef<{ clientX: number; clientY: number; startX: number; startY: number }>({
    clientX: 0,
    clientY: 0,
    startX: 0,
    startY: 0,
  });
  const activeResizeStartRef = useRef<{ clientX: number; clientY: number; startW: number; startH: number }>({
    clientX: 0,
    clientY: 0,
    startW: 0,
    startH: 0,
  });

  // Update canvas contain-fit dimensions on container resize
  const recalculateCanvasSize = useCallback(() => {
    if (!containerRef.current) return;
    const cw = containerRef.current.clientWidth;
    const ch = containerRef.current.clientHeight;
    if (cw <= 0 || ch <= 0) return;

    // Leave a small 16px buffer around image for clean margins
    const availableW = Math.max(100, cw - 32);
    const availableH = Math.max(100, ch - 32);

    const imgAspect = imgNaturalSize.width / imgNaturalSize.height;
    const containerAspect = availableW / availableH;

    let targetW: number;
    let targetH: number;

    if (containerAspect > imgAspect) {
      // Container is wider than image: fit to height
      targetH = availableH;
      targetW = availableH * imgAspect;
    } else {
      // Container is taller than image: fit to width
      targetW = availableW;
      targetH = availableW / imgAspect;
    }

    setCanvasDimensions({
      width: Math.round(targetW),
      height: Math.round(targetH),
    });
  }, [imgNaturalSize]);

  useEffect(() => {
    recalculateCanvasSize();
    const container = containerRef.current;
    if (!container) return;

    const observer = new ResizeObserver(() => {
      recalculateCanvasSize();
    });
    observer.observe(container);
    return () => observer.disconnect();
  }, [recalculateCanvasSize]);

  // Image load handler to get real aspect ratio
  const handleImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const img = e.currentTarget;
    if (img.naturalWidth > 0 && img.naturalHeight > 0) {
      setImgNaturalSize({
        width: img.naturalWidth,
        height: img.naturalHeight,
      });
    }
  };

  // Keyboard navigation shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLSelectElement) return;

      if (e.key === 'ArrowLeft' || e.key === '[') {
        e.preventDefault();
        const prevIdx = (selectedIndex - 1 + localObjects.length) % localObjects.length;
        setSelectedId(localObjects[prevIdx].id);
        sounds.playTapSound();
      } else if (e.key === 'ArrowRight' || e.key === ']') {
        e.preventDefault();
        const nextIdx = (selectedIndex + 1) % localObjects.length;
        setSelectedId(localObjects[nextIdx].id);
        sounds.playTapSound();
      } else if (e.key === 'Escape') {
        if (zoom > 1) {
          setZoom(1);
          setPan({ x: 0, y: 0 });
        } else {
          onExit();
        }
      } else if (e.key === 's' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        handleSave();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedIndex, localObjects, zoom, onExit]);

  // Target Navigation Handlers
  const handlePrevTarget = () => {
    sounds.playTapSound();
    const prevIdx = (selectedIndex - 1 + localObjects.length) % localObjects.length;
    setSelectedId(localObjects[prevIdx].id);
  };

  const handleNextTarget = () => {
    sounds.playTapSound();
    const nextIdx = (selectedIndex + 1) % localObjects.length;
    setSelectedId(localObjects[nextIdx].id);
  };

  // Zoom control helpers
  const handleSetZoom = (newZoom: number) => {
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

  // Canvas Pan Handlers
  const handleCanvasMouseDown = (e: React.MouseEvent) => {
    // If clicking on hitbox or handle, do not pan canvas
    const target = e.target as HTMLElement;
    if (
      target.closest('.hitbox-element') ||
      target.closest('.hitbox-resize-handle') ||
      target.closest('button') ||
      target.closest('input') ||
      target.closest('select')
    ) {
      return;
    }

    if (zoom > 1) {
      setIsPanning(true);
      panStartRef.current = { x: e.clientX - pan.x, y: e.clientY - pan.y };
    }
  };

  const handleCanvasMouseMove = (e: React.MouseEvent) => {
    if (!isPanning || zoom <= 1) return;
    const maxPanX = (canvasDimensions.width * (zoom - 1)) / 2 + 150;
    const maxPanY = (canvasDimensions.height * (zoom - 1)) / 2 + 150;
    const newX = Math.max(-maxPanX, Math.min(maxPanX, e.clientX - panStartRef.current.x));
    const newY = Math.max(-maxPanY, Math.min(maxPanY, e.clientY - panStartRef.current.y));
    setPan({ x: newX, y: newY });
  };

  const handleCanvasMouseUp = () => {
    setIsPanning(false);
  };

  // DIRECT TAP-TO-PLACE: Clicking on artwork moves selected target to that exact point
  const handleArtworkClick = (e: React.MouseEvent) => {
    if (isPanning) return;
    const canvasRect = canvasRef.current?.getBoundingClientRect();
    if (!canvasRect || !selectedObject) return;

    // Calculate click coordinates relative to the canvas
    const pxX = e.clientX - canvasRect.left;
    const pxY = e.clientY - canvasRect.top;

    // 0% to 100% normalized coordinates
    const normX = Math.max(0, Math.min(100, +((pxX / canvasRect.width) * 100).toFixed(1)));
    const normY = Math.max(0, Math.min(100, +((pxY / canvasRect.height) * 100).toFixed(1)));

    setLocalObjects((prev) =>
      prev.map((obj) =>
        obj.id === selectedObject.id ? { ...obj, x: normX, y: normY } : obj
      )
    );

    sounds.playFindSound();
    setSaveToast(`Moved "${selectedObject.name}" to (${normX}%, ${normY}%)`);
    setTimeout(() => setSaveToast(null), 2000);
  };

  // Nudge hitbox by dragging its center
  const handleHitboxMouseDownDrag = (e: React.MouseEvent, obj: HiddenObject) => {
    e.stopPropagation();
    setSelectedId(obj.id);
    isDraggingHitboxRef.current = true;
    activeDragStartRef.current = {
      clientX: e.clientX,
      clientY: e.clientY,
      startX: obj.x,
      startY: obj.y,
    };

    const currentZoom = Math.max(0.5, zoom);

    const handleMouseMove = (moveEvt: MouseEvent) => {
      if (!isDraggingHitboxRef.current) return;
      const dxPx = (moveEvt.clientX - activeDragStartRef.current.clientX) / currentZoom;
      const dyPx = (moveEvt.clientY - activeDragStartRef.current.clientY) / currentZoom;

      const dxPct = (dxPx / canvasDimensions.width) * 100;
      const dyPct = (dyPx / canvasDimensions.height) * 100;

      const nextX = Math.max(0, Math.min(100, +(activeDragStartRef.current.startX + dxPct).toFixed(1)));
      const nextY = Math.max(0, Math.min(100, +(activeDragStartRef.current.startY + dyPct).toFixed(1)));

      setLocalObjects((prev) =>
        prev.map((o) => (o.id === obj.id ? { ...o, x: nextX, y: nextY } : o))
      );
    };

    const handleMouseUp = () => {
      isDraggingHitboxRef.current = false;
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
  };

  // Resize hitbox by dragging the corner handle
  const handleHitboxMouseDownResize = (e: React.MouseEvent, obj: HiddenObject) => {
    e.stopPropagation();
    isResizingHitboxRef.current = true;
    activeResizeStartRef.current = {
      clientX: e.clientX,
      clientY: e.clientY,
      startW: obj.width,
      startH: obj.height,
    };

    const currentZoom = Math.max(0.5, zoom);

    const handleMouseMove = (moveEvt: MouseEvent) => {
      if (!isResizingHitboxRef.current) return;
      const dxPx = (moveEvt.clientX - activeResizeStartRef.current.clientX) / currentZoom;
      const dyPx = (moveEvt.clientY - activeResizeStartRef.current.clientY) / currentZoom;

      const dwPct = (dxPx / canvasDimensions.width) * 200; // * 2 because box is centered
      const dhPct = (dyPx / canvasDimensions.height) * 200;

      const nextW = Math.max(2, Math.min(60, +(activeResizeStartRef.current.startW + dwPct).toFixed(1)));
      const nextH = Math.max(2, Math.min(60, +(activeResizeStartRef.current.startH + dhPct).toFixed(1)));

      setLocalObjects((prev) =>
        prev.map((o) => (o.id === obj.id ? { ...o, width: nextW, height: nextH } : o))
      );
    };

    const handleMouseUp = () => {
      isResizingHitboxRef.current = false;
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
  };

  // Numeric coordinate input updates
  const handleUpdateNumeric = (field: 'x' | 'y' | 'width' | 'height', val: number) => {
    if (!selectedObject) return;
    setLocalObjects((prev) =>
      prev.map((o) => (o.id === selectedObject.id ? { ...o, [field]: val } : o))
    );
  };

  // Authoritative Save Action
  const handleSave = () => {
    try {
      const payload = localObjects.map((o) => ({
        caseId: 'case01',
        sceneId: sceneId,
        objectId: o.id,
        id: o.id,
        name: o.name,
        x: o.x,
        y: o.y,
        width: o.width,
        height: o.height,
      }));
      localStorage.setItem(`bellweather_calibration_case01_${sceneId}`, JSON.stringify(payload));
      localStorage.setItem(`authoritative_coords_${sceneId}`, JSON.stringify(payload));
      onSave(localObjects);
      sounds.playEvidenceSound();
      setSaveToast('★ Hotspot coordinates saved & locked successfully!');
      setTimeout(() => setSaveToast(null), 3000);
    } catch (err) {
      console.error('Failed to save calibration:', err);
    }
  };

  // Copy JSON
  const handleCopyJson = () => {
    const json = JSON.stringify(
      localObjects.map((o) => ({
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
    setSaveToast('Copied JSON coordinates to clipboard');
    setTimeout(() => setSaveToast(null), 2500);
  };

  // Reset to default coordinates
  const handleConfirmReset = () => {
    try {
      localStorage.removeItem(`authoritative_coords_${sceneId}`);
    } catch {}
    setLocalObjects(objects);
    setShowResetConfirm(false);
    sounds.playTapSound();
    setSaveToast('Reverted coordinates to default positions');
    setTimeout(() => setSaveToast(null), 2500);
  };

  return (
    <div
      id="desktop-calibration-workspace"
      className="fixed inset-0 w-screen h-screen z-[9999] bg-[#0c0704] text-stone-100 flex flex-col select-none overflow-hidden font-sans"
    >
      {/* 
        ========================================================================
        TOP TOOLBAR (50px–65px high, clean, professional, fully unconstrained)
        ========================================================================
      */}
      <header
        id="calib-top-toolbar"
        className="h-14 bg-[#1a0f0a] border-b border-amber-900/60 px-4 flex items-center justify-between shrink-0 z-40 gap-x-2"
      >
        {/* Left: App & Editor Title */}
        <div className="flex items-center space-x-3 shrink-0">
          <div className="flex items-center space-x-2">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse" />
            <h1 className="text-sm font-serif font-bold text-amber-200 tracking-wide whitespace-nowrap">
              {sceneTitle} — Hotspot Editor
            </h1>
          </div>

          {/* Optional Scene Switcher */}
          {onChangeScene && (
            <div className="hidden lg:flex items-center bg-stone-950/80 rounded-lg p-0.5 border border-stone-800 text-xs font-mono">
              <button
                onClick={() => onChangeScene('reading_room')}
                className={`px-2 py-0.5 rounded cursor-pointer ${
                  sceneId === 'reading_room'
                    ? 'bg-amber-500 text-stone-950 font-bold'
                    : 'text-stone-400 hover:text-amber-200'
                }`}
              >
                Reading Room
              </button>
              <button
                onClick={() => onChangeScene('archive_room')}
                className={`px-2 py-0.5 rounded cursor-pointer ${
                  sceneId === 'archive_room'
                    ? 'bg-amber-500 text-stone-950 font-bold'
                    : 'text-stone-400 hover:text-amber-200'
                }`}
              >
                Archive Room
              </button>
            </div>
          )}
        </div>

        {/* Center: Target Navigation & Selector */}
        <div className="flex items-center space-x-1.5 bg-stone-950/90 px-2.5 py-1 rounded-xl border border-amber-500/50 shadow-inner">
          <button
            id="btn-calib-prev"
            onClick={handlePrevTarget}
            className="p-1 rounded hover:bg-amber-500/20 text-amber-300 cursor-pointer transition-colors"
            title="Previous Target (or press [ or Left Arrow)"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <div className="flex items-center space-x-1.5 px-1">
            <span className="px-1.5 py-0.5 rounded bg-amber-400 text-stone-950 font-mono text-[11px] font-bold">
              #{selectedIndex + 1}/{localObjects.length}
            </span>
            <select
              id="calib-target-dropdown"
              value={selectedId}
              onChange={(e) => {
                setSelectedId(e.target.value);
                sounds.playTapSound();
              }}
              className="bg-transparent text-amber-200 font-serif font-bold text-xs outline-none cursor-pointer pr-1"
            >
              {localObjects.map((obj, i) => (
                <option key={obj.id} value={obj.id} className="bg-stone-900 text-stone-100">
                  Target: {obj.name} ({i + 1}/{localObjects.length})
                </option>
              ))}
            </select>
          </div>

          <button
            id="btn-calib-next"
            onClick={handleNextTarget}
            className="p-1 rounded hover:bg-amber-500/20 text-amber-300 cursor-pointer transition-colors"
            title="Next Target (or press ] or Right Arrow)"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Right: View Controls, Zoom, Save & Exit */}
        <div className="flex items-center space-x-2 shrink-0">
          {/* Show All Toggle */}
          <button
            id="btn-calib-toggle-show-all"
            onClick={() => {
              setShowAll((prev) => !prev);
              sounds.playTapSound();
            }}
            className={`px-2.5 py-1 rounded-lg text-xs font-mono border flex items-center space-x-1.5 cursor-pointer transition-all ${
              showAll
                ? 'bg-cyan-950/80 border-cyan-400 text-cyan-200 font-semibold'
                : 'bg-stone-900/80 border-stone-800 text-stone-400 hover:text-stone-200'
            }`}
            title="Toggle showing all hotspot boxes or only the selected target"
          >
            {showAll ? <Eye className="w-3.5 h-3.5 text-cyan-300" /> : <EyeOff className="w-3.5 h-3.5" />}
            <span className="hidden sm:inline">{showAll ? 'Show All: ON' : 'Show All: OFF'}</span>
          </button>

          {/* Zoom Buttons: Fit | 1x | 2x | 3x | 4x */}
          <div className="flex items-center bg-stone-950/90 rounded-lg p-0.5 border border-stone-800 text-xs font-mono">
            <button
              onClick={() => handleSetZoom(1)}
              className={`px-2 py-0.5 rounded cursor-pointer font-bold transition-all ${
                zoom === 1
                  ? 'bg-amber-400 text-stone-950'
                  : 'text-stone-300 hover:text-amber-200'
              }`}
              title="Fit entire artwork to workspace (Contain)"
            >
              Fit
            </button>
            <button
              onClick={() => handleSetZoom(1.5)}
              className={`px-1.5 py-0.5 rounded cursor-pointer transition-all ${
                zoom === 1.5
                  ? 'bg-amber-400 text-stone-950 font-bold'
                  : 'text-stone-400 hover:text-amber-200'
              }`}
            >
              1.5x
            </button>
            <button
              onClick={() => handleSetZoom(2)}
              className={`px-1.5 py-0.5 rounded cursor-pointer transition-all ${
                zoom === 2
                  ? 'bg-amber-400 text-stone-950 font-bold'
                  : 'text-stone-400 hover:text-amber-200'
              }`}
            >
              2x
            </button>
            <button
              onClick={() => handleSetZoom(3)}
              className={`px-1.5 py-0.5 rounded cursor-pointer transition-all ${
                zoom === 3
                  ? 'bg-amber-400 text-stone-950 font-bold'
                  : 'text-stone-400 hover:text-amber-200'
              }`}
            >
              3x
            </button>
            <button
              onClick={() => handleSetZoom(4)}
              className={`px-1.5 py-0.5 rounded cursor-pointer transition-all ${
                zoom === 4
                  ? 'bg-amber-400 text-stone-950 font-bold'
                  : 'text-stone-400 hover:text-amber-200'
              }`}
            >
              4x
            </button>
          </div>

          {/* Numeric Inspector Drawer Toggle */}
          <button
            id="btn-calib-toggle-inspector"
            onClick={() => setShowInspector((prev) => !prev)}
            className={`p-1.5 rounded-lg border text-xs cursor-pointer ${
              showInspector
                ? 'bg-amber-500/30 text-amber-300 border-amber-400'
                : 'bg-stone-900/80 text-stone-400 hover:text-stone-200 border-stone-800'
            }`}
            title="Fine-tune numeric percentage coordinates"
          >
            <Sliders className="w-4 h-4" />
          </button>

          {/* SAVE Action */}
          <button
            id="btn-calib-save"
            onClick={handleSave}
            className="px-3.5 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-stone-950 font-bold text-xs flex items-center space-x-1.5 shadow-lg active:scale-95 transition-all cursor-pointer"
            title="Authoritatively save calibrated coordinates"
          >
            <Save className="w-4 h-4" />
            <span>Save</span>
          </button>

          {/* EXIT Action */}
          <button
            id="btn-calib-exit"
            onClick={onExit}
            className="px-3 py-1.5 rounded-xl bg-rose-950/80 hover:bg-rose-900 border border-rose-700/60 text-rose-200 font-bold text-xs flex items-center space-x-1.5 cursor-pointer transition-all"
            title="Exit Calibration Workspace & Return to Game"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Exit</span>
          </button>
        </div>
      </header>

      {/* 
        ========================================================================
        COLLAPSIBLE NUMERIC INSPECTOR BAR (If toggled)
        ========================================================================
      */}
      <AnimatePresence>
        {showInspector && selectedObject && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-[#140b07] border-b border-stone-800 px-6 py-2 flex flex-wrap items-center justify-between gap-3 text-xs font-mono z-30"
          >
            <div className="flex items-center space-x-2">
              <span className="text-amber-300 font-bold font-serif">{selectedObject.name}</span>
              <span className="text-stone-400 text-[11px]">({selectedObject.id})</span>
            </div>

            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-1">
                <span className="text-stone-400">X:</span>
                <input
                  type="number"
                  step="0.5"
                  min="0"
                  max="100"
                  value={selectedObject.x}
                  onChange={(e) => handleUpdateNumeric('x', parseFloat(e.target.value) || 0)}
                  className="w-16 bg-stone-950 border border-amber-500/60 rounded px-1.5 py-0.5 text-amber-300 font-bold text-center"
                />
                <span className="text-stone-500">%</span>
              </div>

              <div className="flex items-center space-x-1">
                <span className="text-stone-400">Y:</span>
                <input
                  type="number"
                  step="0.5"
                  min="0"
                  max="100"
                  value={selectedObject.y}
                  onChange={(e) => handleUpdateNumeric('y', parseFloat(e.target.value) || 0)}
                  className="w-16 bg-stone-950 border border-amber-500/60 rounded px-1.5 py-0.5 text-amber-300 font-bold text-center"
                />
                <span className="text-stone-500">%</span>
              </div>

              <div className="flex items-center space-x-1">
                <span className="text-stone-400">Width:</span>
                <input
                  type="number"
                  step="0.5"
                  min="2"
                  max="60"
                  value={selectedObject.width}
                  onChange={(e) => handleUpdateNumeric('width', parseFloat(e.target.value) || 2)}
                  className="w-16 bg-stone-950 border border-cyan-500/60 rounded px-1.5 py-0.5 text-cyan-300 font-bold text-center"
                />
                <span className="text-stone-500">%</span>
              </div>

              <div className="flex items-center space-x-1">
                <span className="text-stone-400">Height:</span>
                <input
                  type="number"
                  step="0.5"
                  min="2"
                  max="60"
                  value={selectedObject.height}
                  onChange={(e) => handleUpdateNumeric('height', parseFloat(e.target.value) || 2)}
                  className="w-16 bg-stone-950 border border-cyan-500/60 rounded px-1.5 py-0.5 text-cyan-300 font-bold text-center"
                />
                <span className="text-stone-500">%</span>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={handleCopyJson}
                className="px-2.5 py-1 rounded bg-stone-900 hover:bg-stone-800 text-amber-300 border border-stone-700 flex items-center space-x-1 cursor-pointer"
                title="Copy coordinates JSON"
              >
                <Copy className="w-3 h-3" />
                <span>Copy JSON</span>
              </button>

              <button
                onClick={() => setShowResetConfirm(true)}
                className="px-2.5 py-1 rounded bg-rose-950/60 hover:bg-rose-900 text-rose-300 border border-rose-800/60 flex items-center space-x-1 cursor-pointer"
                title="Reset to default template coordinates"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset Defaults</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Direct Instruction Banner */}
      <div className="bg-[#120804] border-b border-amber-950/80 px-4 py-1 flex items-center justify-between text-xs font-mono text-stone-300">
        <div className="flex items-center space-x-2 text-amber-300">
          <Crosshair className="w-3.5 h-3.5 text-amber-400" />
          <span>
            <strong>DIRECT CLICK-TO-PLACE:</strong> Click anywhere on the illustrated{' '}
            <span className="underline decoration-amber-400 font-bold">
              {selectedObject?.name}
            </span>{' '}
            to position its center instantly!
          </span>
        </div>
        <div className="text-[11px] text-stone-400 hidden md:block">
          Drag box to nudge • Drag bottom-right handle to resize • [{selectedIndex + 1}/{localObjects.length}]
        </div>
      </div>

      {/* Save Notification Toast */}
      {saveToast && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 bg-emerald-500 text-stone-950 font-bold px-5 py-2 rounded-full text-xs text-center z-50 animate-bounce shadow-2xl border border-emerald-300">
          {saveToast}
        </div>
      )}

      {/* 
        ========================================================================
        MAIN ARTWORK CANVAS WORKSPACE (Fills 100% of available space below toolbar)
        Object-contain behavior: The entire scene is fully visible at Fit zoom!
        ========================================================================
      */}
      <main
        id="calib-canvas-container"
        ref={containerRef}
        onMouseDown={handleCanvasMouseDown}
        onMouseMove={handleCanvasMouseMove}
        onMouseUp={handleCanvasMouseUp}
        className={`flex-1 w-full h-full relative overflow-hidden bg-[#070402] flex items-center justify-center ${
          zoom > 1 ? 'cursor-grab active:cursor-grabbing' : 'cursor-crosshair'
        }`}
      >
        {/* Transformable Canvas Wrapper */}
        <div
          id="calib-transform-wrapper"
          className="relative transition-transform duration-75 ease-out flex items-center justify-center pointer-events-none"
          style={{
            transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
            transformOrigin: 'center center',
          }}
        >
          {/* 
            Strict Aspect-Ratio Canvas Container:
            Image & Hitbox layer share identical bounds (0%,0% top-left to 100%,100% bottom-right)
          */}
          <div
            id="calib-artwork-canvas"
            ref={canvasRef}
            onClick={handleArtworkClick}
            className="relative select-none shadow-[0_0_60px_rgba(0,0,0,0.95)] overflow-hidden pointer-events-auto cursor-crosshair border-2 border-amber-950/60 bg-black"
            style={{
              width: `${canvasDimensions.width}px`,
              height: `${canvasDimensions.height}px`,
            }}
          >
            {/* Source Illustrated Artwork (100% complete image, never cropped) */}
            <img
              src={imageSrc}
              alt={sceneTitle}
              onLoad={handleImageLoad}
              referrerPolicy="no-referrer"
              className="w-full h-full block object-fill select-none pointer-events-none filter brightness-100 contrast-105"
              draggable={false}
            />

            {/* Hitbox Overlay Layer */}
            <div
              id="calib-hitbox-layer"
              className="absolute inset-0 w-full h-full pointer-events-none"
            >
              {localObjects.map((obj, index) => {
                const isSelected = obj.id === selectedId;

                // If not showAll and not selected, don't render
                if (!showAll && !isSelected) return null;

                return (
                  <div
                    key={obj.id}
                    id={`calib-box-${obj.id}`}
                    style={{
                      left: `${obj.x}%`,
                      top: `${obj.y}%`,
                      width: `${obj.width}%`,
                      height: `${obj.height}%`,
                      transform: 'translate(-50%, -50%)',
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedId(obj.id);
                      sounds.playTapSound();
                    }}
                    onMouseDown={isSelected ? (e) => handleHitboxMouseDownDrag(e, obj) : undefined}
                    className={`hitbox-element absolute flex items-center justify-center select-none touch-manipulation pointer-events-auto transition-colors ${
                      isSelected
                        ? 'bg-amber-400/35 border-2 border-amber-300 shadow-[0_0_24px_rgba(251,191,36,0.95)] cursor-move rounded-md ring-2 ring-amber-300 ring-offset-2 ring-offset-black z-30'
                        : 'bg-cyan-500/10 border border-dashed border-cyan-400/50 hover:border-cyan-300 hover:bg-cyan-500/25 cursor-pointer rounded-md z-10'
                    }`}
                  >
                    {/* Center Crosshair / Dot */}
                    <div className="relative flex items-center justify-center pointer-events-none">
                      <div
                        className={`rounded-full border border-white shadow-md ${
                          isSelected
                            ? 'w-3 h-3 bg-amber-400 ring-2 ring-stone-950 animate-pulse'
                            : 'w-2 h-2 bg-red-500'
                        }`}
                      />
                      {isSelected && (
                        <>
                          <div className="absolute w-8 h-[1px] bg-amber-300 pointer-events-none" />
                          <div className="absolute h-8 w-[1px] bg-amber-300 pointer-events-none" />
                        </>
                      )}
                    </div>

                    {/* Resize Handle on Selected Object (Bottom-Right) */}
                    {isSelected && (
                      <div
                        onMouseDown={(e) => handleHitboxMouseDownResize(e, obj)}
                        className="hitbox-resize-handle absolute -bottom-2.5 -right-2.5 w-6 h-6 bg-amber-400 border-2 border-stone-950 rounded shadow-2xl cursor-se-resize flex items-center justify-center z-40 hover:scale-125 transition-transform"
                        title="Drag to resize hitbox width and height"
                      >
                        <div className="w-1.5 h-1.5 bg-stone-950 rounded-xs" />
                      </div>
                    )}

                    {/* Target Label Displayed directly beside/below rectangle */}
                    <div
                      className={`absolute -bottom-9 px-2.5 py-1 rounded text-xs font-mono leading-tight flex flex-col items-center whitespace-nowrap shadow-2xl pointer-events-none ${
                        isSelected
                          ? 'bg-stone-950 text-amber-300 border-2 border-amber-400 font-bold scale-105 shadow-[0_6px_18px_rgba(0,0,0,0.9)] z-40'
                          : 'bg-stone-950/85 text-stone-300 border border-stone-700 text-[10px] z-20'
                      }`}
                    >
                      <div className="flex items-center space-x-1">
                        <span className="text-amber-400 font-bold">#{index + 1}</span>
                        <span className="font-serif font-bold">{obj.name}</span>
                      </div>
                      <div className="text-[9px] text-stone-400 opacity-90 flex items-center space-x-1.5">
                        <span className="text-amber-200/90 font-mono">{obj.id}</span>
                        <span>({obj.x}%, {obj.y}%)</span>
                        <span>[{obj.width}×{obj.height}%]</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </main>

      {/* Reset Confirmation Modal */}
      <AnimatePresence>
        {showResetConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-stone-950/90 backdrop-blur-md p-5 flex flex-col justify-center items-center"
          >
            <div className="w-full max-w-sm bg-[#241710] border-2 border-rose-500/80 rounded-2xl p-5 shadow-2xl space-y-4 text-stone-100">
              <div className="flex items-center space-x-2 text-rose-400 font-bold text-sm">
                <AlertTriangle className="w-5 h-5" />
                <span>Confirm Reset Coordinates</span>
              </div>
              <p className="text-xs text-stone-300 leading-relaxed font-serif">
                Are you sure you want to discard your custom coordinates and restore original template positions?
              </p>
              <div className="flex items-center justify-end space-x-2 pt-2">
                <button
                  onClick={() => setShowResetConfirm(false)}
                  className="px-3 py-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-300 text-xs font-mono cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmReset}
                  className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-stone-950 font-bold text-xs font-mono cursor-pointer shadow-lg"
                >
                  Reset Defaults
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
