import React, { useState } from 'react';
import { ASSETS } from '../data/caseData';
import { sounds } from '../utils/audio';
import { Play, BookOpen, Settings, Sparkles, HelpCircle, ChevronRight, X, RotateCcw } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface TitleScreenProps {
  onStartCase: () => void;
  onOpenCasesMenu: () => void;
  onOpenSettings: () => void;
  onOpenCalibration?: () => void;
  hasSavedProgress?: boolean;
  savedProgressSummary?: string;
  onNewGame?: () => void;
}

export const TitleScreen: React.FC<TitleScreenProps> = ({
  onStartCase,
  onOpenCasesMenu,
  onOpenSettings,
  onOpenCalibration,
  hasSavedProgress = false,
  savedProgressSummary = 'Case 01 • Reading Room',
  onNewGame,
}) => {
  const [showHowToPlay, setShowHowToPlay] = useState(false);

  const handleStart = () => {
    sounds.playTapSound();
    sounds.startAmbientLoop();
    onStartCase();
  };

  return (
    <div className="relative w-full h-full flex flex-col justify-between p-4 sm:p-6 pt-safe pb-safe select-none overflow-hidden">
      {/* Background artwork */}
      <div className="absolute inset-0 z-0">
        <img
          src={ASSETS.titleCover}
          alt="Bellweather Town"
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover brightness-[0.7] contrast-[1.08] scale-105 animate-pulse"
          style={{ animationDuration: '8s' }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#18100a] via-[#1c120b]/60 to-[#18100a]/70" />
      </div>

      {/* Floating cozy atmosphere specks */}
      <div className="absolute inset-0 pointer-events-none z-10 overflow-hidden">
        {[...Array(12)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1.5 h-1.5 rounded-full bg-amber-300/40 blur-[0.5px]"
            style={{
              left: `${15 + (i * 7) % 75}%`,
              top: `${20 + (i * 11) % 65}%`,
            }}
            animate={{
              y: [-10, -50, -10],
              opacity: [0.2, 0.8, 0.2],
            }}
            transition={{
              duration: 4 + (i % 3) * 2,
              repeat: Infinity,
              ease: 'easeInOut',
              delay: i * 0.4,
            }}
          />
        ))}
      </div>

      {/* Top Brand Tag & Badge */}
      <header className="relative z-20 flex justify-between items-center pt-2 sm:pt-3">
        <div className="flex items-center space-x-1.5 px-3 py-1 rounded-full bg-amber-950/75 border border-amber-500/30 text-amber-200 text-[11px] font-serif shadow-md backdrop-blur-sm">
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span>The Bellweather Mysteries • Secrets by the Sea</span>
        </div>

        <button
          id="btn-title-help"
          onClick={() => {
            sounds.playTapSound();
            setShowHowToPlay(true);
          }}
          className="p-2 rounded-full bg-stone-900/70 hover:bg-amber-900/60 text-amber-200 border border-amber-800/40 backdrop-blur-sm transition-colors cursor-pointer"
          title="How to Play"
        >
          <HelpCircle className="w-4 h-4" />
        </button>
      </header>

      {/* Main Title Section */}
      <section className="relative z-20 my-auto text-center space-y-3 px-2">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <div className="inline-block mb-1">
            <span className="text-[10px] sm:text-[11px] font-mono tracking-[0.25em] text-amber-400/90 uppercase font-semibold">
              An Amateur Investigator Mystery
            </span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-serif font-extrabold text-stone-100 tracking-tight leading-tight drop-shadow-[0_4px_12px_rgba(0,0,0,0.9)]">
            Hidden in <span className="text-amber-300">Bellweather</span>
          </h1>

          <div className="w-24 h-0.5 bg-gradient-to-r from-transparent via-amber-400/80 to-transparent mx-auto my-2.5" />

          <p className="text-xs sm:text-sm font-serif italic text-amber-100/80 tracking-wide drop-shadow-md">
            “Every object tells a story.”
          </p>
        </motion.div>

        {/* Current Active Case Banner */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3, duration: 0.6 }}
          className="mx-auto max-w-xs sm:max-w-sm p-3 rounded-xl bg-stone-950/75 border border-amber-800/50 backdrop-blur-md text-left shadow-xl"
        >
          <div className="flex items-center justify-between text-xs text-amber-400 font-mono mb-0.5">
            <span>CASE 01</span>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800/50 font-bold">
              {hasSavedProgress ? 'IN PROGRESS' : 'READY TO PLAY'}
            </span>
          </div>
          <h2 className="text-base font-serif font-bold text-amber-100">
            The Vanishing Manuscript
          </h2>
          <p className="text-xs text-stone-300/80 line-clamp-2 mt-0.5 font-serif">
            A priceless Eleanor Vale handwritten draft disappears from a locked library room on the eve of the festival...
          </p>
        </motion.div>
      </section>

      {/* Primary Action Buttons */}
      <footer className="relative z-20 space-y-2.5 pb-2">
        <motion.button
          id="btn-continue-case"
          onClick={handleStart}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="w-full py-3.5 px-6 rounded-xl bg-gradient-to-r from-amber-600 via-amber-500 to-amber-600 text-stone-950 font-serif font-bold text-base shadow-[0_4px_20px_rgba(217,119,6,0.5)] border border-amber-300/60 flex items-center justify-center space-x-2.5 transition-all cursor-pointer"
        >
          <Play className="w-5 h-5 fill-stone-950 text-stone-950" />
          <span>{hasSavedProgress ? 'Continue Investigation' : 'Begin Case 01'}</span>
          <ChevronRight className="w-4 h-4 text-stone-900" />
        </motion.button>

        <div className="grid grid-cols-2 gap-2.5">
          <button
            id="btn-title-cases"
            onClick={() => {
              sounds.playTapSound();
              onOpenCasesMenu();
            }}
            className="py-2.5 px-4 rounded-xl bg-stone-900/80 hover:bg-stone-850 text-amber-200 font-serif text-xs border border-amber-900/50 backdrop-blur-md flex items-center justify-center space-x-1.5 transition-all shadow-md cursor-pointer"
          >
            <BookOpen className="w-4 h-4 text-amber-400" />
            <span>Cases Archive</span>
          </button>

          <button
            id="btn-title-settings"
            onClick={() => {
              sounds.playTapSound();
              onOpenSettings();
            }}
            className="py-2.5 px-4 rounded-xl bg-stone-900/80 hover:bg-stone-850 text-amber-200 font-serif text-xs border border-amber-900/50 backdrop-blur-md flex items-center justify-center space-x-1.5 transition-all shadow-md cursor-pointer"
          >
            <Settings className="w-4 h-4 text-amber-400" />
            <span>Settings</span>
          </button>
        </div>
      </footer>

      {/* How to Play Modal */}
      <AnimatePresence>
        {showHowToPlay && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-50 bg-stone-950/90 backdrop-blur-md p-6 flex flex-col justify-between overflow-y-auto"
          >
            <div className="space-y-4 my-auto max-w-sm mx-auto w-full">
              <div className="flex justify-between items-center border-b border-amber-900/50 pb-3">
                <h3 className="text-base font-serif font-bold text-amber-200 flex items-center space-x-2">
                  <HelpCircle className="w-5 h-5 text-amber-400" />
                  <span>Investigator’s Guide</span>
                </h3>
                <button
                  onClick={() => setShowHowToPlay(false)}
                  className="p-1 rounded-full text-stone-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-2.5 text-xs text-stone-200">
                <div className="p-3 rounded-xl bg-stone-900/80 border border-amber-900/40">
                  <p className="font-bold text-amber-300 font-serif text-xs mb-0.5">🔍 1. Search Illustrated Scenes</p>
                  <p className="text-stone-300 leading-relaxed text-[11px]">
                    Inspect the Reading Room and Archive. Pinch or tap zoom buttons to look closely. Tap hidden items from your checklist.
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-stone-900/80 border border-amber-900/40">
                  <p className="font-bold text-amber-300 font-serif text-xs mb-0.5">🗝️ 2. Collect Real Clues</p>
                  <p className="text-stone-300 leading-relaxed text-[11px]">
                    Certain items are key evidence (keys, letters, ribbons). Discovering them unlocks new rooms and suspect inquiries.
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-stone-900/80 border border-amber-900/40">
                  <p className="font-bold text-amber-300 font-serif text-xs mb-0.5">🗣️ 3. Interrogate Suspects</p>
                  <p className="text-stone-300 leading-relaxed text-[11px]">
                    Question Clara, Julian, and Evelyn. Use your evidence to break alibis and uncover hidden motives.
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-stone-900/80 border border-amber-900/40">
                  <p className="font-bold text-amber-300 font-serif text-xs mb-0.5">⚖️ 4. Make Deductions & Accuse</p>
                  <p className="text-stone-300 leading-relaxed text-[11px]">
                    Piece the facts together in Deductions and make the final accusation to solve the mystery!
                  </p>
                </div>
              </div>
            </div>

            <button
              onClick={() => setShowHowToPlay(false)}
              className="w-full py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-stone-950 font-serif font-bold text-xs shadow-md shrink-0 mt-3"
            >
              Understood, Detective
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
