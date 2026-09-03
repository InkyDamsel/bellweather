import React, { useState } from 'react';
import { PlayerSettings, savePlayerSettings, clearPlayerSave } from '../utils/saveState';
import { sounds } from '../utils/audio';
import {
  Settings,
  X,
  Volume2,
  VolumeX,
  Music,
  Vibrate,
  Eye,
  RotateCcw,
  Sparkles,
  Check,
  AlertTriangle,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: PlayerSettings;
  onUpdateSettings: (newSettings: PlayerSettings) => void;
  onResetCaseProgress: () => void;
  onOpenCalibration?: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onUpdateSettings,
  onResetCaseProgress,
  onOpenCalibration,
}) => {
  const [showConfirmReset, setShowConfirmReset] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleToggle = (key: keyof PlayerSettings) => {
    sounds.playTapSound();
    const updated = { ...settings, [key]: !settings[key] };
    onUpdateSettings(updated);
    savePlayerSettings(updated);
    sounds.applySettings(updated);
  };

  const handleConfirmReset = () => {
    sounds.playWrongSound();
    clearPlayerSave();
    onResetCaseProgress();
    setShowConfirmReset(false);
    onClose();
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="absolute inset-0 z-50 bg-stone-950/85 backdrop-blur-md p-4 sm:p-6 flex flex-col justify-between overflow-y-auto"
    >
      <div className="space-y-4 my-auto max-w-sm mx-auto w-full">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-amber-900/50 pb-3">
          <div className="flex items-center space-x-2">
            <Settings className="w-5 h-5 text-amber-400" />
            <div>
              <h3 className="text-sm font-serif font-bold text-amber-100">
                Investigation Settings
              </h3>
              <p className="text-[10px] text-amber-200/60 font-serif">
                Audio, Haptics & Accessibility
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              sounds.playTapSound();
              onClose();
            }}
            className="p-1.5 rounded-full text-stone-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Audio Controls */}
        <div className="p-3.5 rounded-2xl bg-stone-900/80 border border-amber-900/40 space-y-3">
          <p className="text-[10px] font-mono uppercase tracking-widest text-amber-400 font-bold">
            Audio Settings
          </p>

          <div className="space-y-2">
            {/* Sound Effects */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2.5">
                <Volume2 className="w-4 h-4 text-amber-300" />
                <div>
                  <p className="text-xs font-serif font-semibold text-stone-200">
                    Sound Effects
                  </p>
                  <p className="text-[10px] text-stone-400">
                    Object discovery, chimes, paper rustles
                  </p>
                </div>
              </div>
              <button
                onClick={() => handleToggle('soundEnabled')}
                className={`w-11 h-6 rounded-full transition-colors relative p-0.5 ${
                  settings.soundEnabled ? 'bg-amber-600' : 'bg-stone-800'
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full bg-white transition-transform ${
                    settings.soundEnabled ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* Cozy Music */}
            <div className="flex items-center justify-between pt-2 border-t border-stone-800">
              <div className="flex items-center space-x-2.5">
                <Music className="w-4 h-4 text-amber-300" />
                <div>
                  <p className="text-xs font-serif font-semibold text-stone-200">
                    Atmospheric Music
                  </p>
                  <p className="text-[10px] text-stone-400">
                    Subtle cozy mystery instrumental chords
                  </p>
                </div>
              </div>
              <button
                onClick={() => handleToggle('musicEnabled')}
                className={`w-11 h-6 rounded-full transition-colors relative p-0.5 ${
                  settings.musicEnabled ? 'bg-amber-600' : 'bg-stone-800'
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full bg-white transition-transform ${
                    settings.musicEnabled ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* Room Ambience */}
            <div className="flex items-center justify-between pt-2 border-t border-stone-800">
              <div className="flex items-center space-x-2.5">
                <Sparkles className="w-4 h-4 text-amber-300" />
                <div>
                  <p className="text-xs font-serif font-semibold text-stone-200">
                    Room Ambience
                  </p>
                  <p className="text-[10px] text-stone-400">
                    Old clock ticking & library soundscape
                  </p>
                </div>
              </div>
              <button
                onClick={() => handleToggle('ambienceEnabled')}
                className={`w-11 h-6 rounded-full transition-colors relative p-0.5 ${
                  settings.ambienceEnabled ? 'bg-amber-600' : 'bg-stone-800'
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full bg-white transition-transform ${
                    settings.ambienceEnabled ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          </div>
        </div>

        {/* Gameplay & Accessibility */}
        <div className="p-3.5 rounded-2xl bg-stone-900/80 border border-amber-900/40 space-y-3">
          <p className="text-[10px] font-mono uppercase tracking-widest text-amber-400 font-bold">
            Gameplay & Accessibility
          </p>

          <div className="space-y-2">
            {/* Haptics */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2.5">
                <Vibrate className="w-4 h-4 text-amber-300" />
                <div>
                  <p className="text-xs font-serif font-semibold text-stone-200">
                    Haptic Feedback
                  </p>
                  <p className="text-[10px] text-stone-400">
                    Subtle vibration on supported mobile devices
                  </p>
                </div>
              </div>
              <button
                onClick={() => handleToggle('hapticsEnabled')}
                className={`w-11 h-6 rounded-full transition-colors relative p-0.5 ${
                  settings.hapticsEnabled ? 'bg-amber-600' : 'bg-stone-800'
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full bg-white transition-transform ${
                    settings.hapticsEnabled ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* Reduced Motion */}
            <div className="flex items-center justify-between pt-2 border-t border-stone-800">
              <div className="flex items-center space-x-2.5">
                <Eye className="w-4 h-4 text-amber-300" />
                <div>
                  <p className="text-xs font-serif font-semibold text-stone-200">
                    Reduced Motion
                  </p>
                  <p className="text-[10px] text-stone-400">
                    Minimize UI movement and screen transitions
                  </p>
                </div>
              </div>
              <button
                onClick={() => handleToggle('reducedMotion')}
                className={`w-11 h-6 rounded-full transition-colors relative p-0.5 ${
                  settings.reducedMotion ? 'bg-amber-600' : 'bg-stone-800'
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full bg-white transition-transform ${
                    settings.reducedMotion ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          </div>
        </div>

        {/* Reset Progress Section */}
        <div className="p-3 rounded-2xl bg-stone-950/60 border border-stone-800 space-y-2">
          {!showConfirmReset ? (
            <button
              onClick={() => {
                sounds.playTapSound();
                setShowConfirmReset(true);
              }}
              className="w-full py-2 px-3 rounded-xl bg-stone-900 hover:bg-stone-800 text-stone-300 text-xs font-serif flex items-center justify-center space-x-2 border border-stone-800 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5 text-stone-400" />
              <span>Reset Case 01 Progress</span>
            </button>
          ) : (
            <div className="p-2 space-y-2 text-center">
              <p className="text-[11px] font-serif text-amber-200">
                Are you sure? This restarts your current investigation.
              </p>
              <div className="flex space-x-2">
                <button
                  onClick={handleConfirmReset}
                  className="flex-1 py-1.5 rounded-lg bg-red-700 hover:bg-red-600 text-white font-serif text-xs font-bold"
                >
                  Yes, Reset
                </button>
                <button
                  onClick={() => setShowConfirmReset(false)}
                  className="flex-1 py-1.5 rounded-lg bg-stone-800 text-stone-300 hover:text-white font-serif text-xs"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {onOpenCalibration && (
            <button
              onClick={() => {
                sounds.playTapSound();
                onClose();
                onOpenCalibration();
              }}
              className="w-full py-2 px-3 rounded-xl bg-stone-900/60 hover:bg-amber-950/40 text-amber-300/80 text-[11px] font-mono flex items-center justify-center space-x-1.5 border border-amber-900/30 transition-colors"
            >
              <span>⚙ Open Hotspot Calibration Workspace</span>
            </button>
          )}
        </div>
      </div>

      <button
        onClick={() => {
          sounds.playTapSound();
          onClose();
        }}
        className="w-full py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-stone-950 font-serif font-bold text-xs shadow-md shrink-0 mt-3"
      >
        Done
      </button>
    </motion.div>
  );
};
