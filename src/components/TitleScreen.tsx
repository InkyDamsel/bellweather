import React, { useState } from 'react';
import { ASSETS } from '../data/caseData';
import { sounds } from '../utils/audio';
import { Play, BookOpen, Settings, Sparkles, HelpCircle, ChevronRight, X, Volume2, VolumeX, Music } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface TitleScreenProps {
  onStartCase: () => void;
  onOpenCasesMenu: () => void;
}

export const TitleScreen: React.FC<TitleScreenProps> = ({
  onStartCase,
  onOpenCasesMenu,
}) => {
  const [showSettings, setShowSettings] = useState(false);
  const [showHowToPlay, setShowHowToPlay] = useState(false);
  const [soundOn, setSoundOn] = useState(sounds.soundEnabled);
  const [musicOn, setMusicOn] = useState(sounds.musicEnabled);

  const handleStart = () => {
    sounds.playTapSound();
    sounds.startAmbientLoop();
    onStartCase();
  };

  return (
    <div className="relative w-full h-full flex flex-col justify-between p-6 select-none overflow-hidden">
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
      <header className="relative z-20 flex justify-between items-center pt-3">
        <div className="flex items-center space-x-1.5 px-3 py-1 rounded-full bg-amber-950/70 border border-amber-500/30 text-amber-200 text-xs font-serif shadow-md backdrop-blur-sm">
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span>Cozy Mystery Prototype</span>
        </div>

        <button
          id="btn-title-help"
          onClick={() => {
            sounds.playTapSound();
            setShowHowToPlay(true);
          }}
          className="p-2 rounded-full bg-stone-900/60 hover:bg-amber-900/60 text-amber-200 border border-amber-800/40 backdrop-blur-sm transition-colors"
          title="How to Play"
        >
          <HelpCircle className="w-4 h-4" />
        </button>
      </header>

      {/* Main Title Section */}
      <section className="relative z-20 my-auto text-center space-y-3">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <div className="inline-block mb-1">
            <span className="text-[11px] font-mono tracking-[0.25em] text-amber-400/90 uppercase font-semibold">
              An Amateur Investigator Mystery
            </span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-serif font-extrabold text-stone-100 tracking-tight leading-tight drop-shadow-[0_4px_12px_rgba(0,0,0,0.9)]">
            Hidden in <span className="text-amber-300">Bellweather</span>
          </h1>

          <div className="w-24 h-0.5 bg-gradient-to-r from-transparent via-amber-400/80 to-transparent mx-auto my-2.5" />

          <p className="text-sm font-serif italic text-amber-100/80 tracking-wide drop-shadow-md">
            “Every object tells a story.”
          </p>
        </motion.div>

        {/* Current Active Case Banner */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3, duration: 0.6 }}
          className="mx-auto max-w-xs p-3 rounded-xl bg-stone-950/70 border border-amber-800/50 backdrop-blur-md text-left shadow-xl"
        >
          <div className="flex items-center justify-between text-xs text-amber-400 font-mono mb-0.5">
            <span>CASE 01</span>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800/50">
              READY TO PLAY
            </span>
          </div>
          <h2 className="text-base font-serif font-bold text-amber-100">
            The Vanishing Manuscript
          </h2>
          <p className="text-xs text-stone-300/80 line-clamp-2 mt-0.5">
            A priceless Eleanor Vale handwritten draft disappears from a locked library room...
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
          <span>Continue Case</span>
          <ChevronRight className="w-4 h-4 text-stone-900" />
        </motion.button>

        <div className="grid grid-cols-2 gap-2.5">
          <button
            id="btn-title-cases"
            onClick={() => {
              sounds.playTapSound();
              onOpenCasesMenu();
            }}
            className="py-2.5 px-4 rounded-xl bg-stone-900/80 hover:bg-stone-850 text-amber-200 font-serif text-xs border border-amber-900/50 backdrop-blur-md flex items-center justify-center space-x-1.5 transition-all shadow-md"
          >
            <BookOpen className="w-4 h-4 text-amber-400" />
            <span>Cases Archive</span>
          </button>

          <button
            id="btn-title-settings"
            onClick={() => {
              sounds.playTapSound();
              setShowSettings(true);
            }}
            className="py-2.5 px-4 rounded-xl bg-stone-900/80 hover:bg-stone-850 text-amber-200 font-serif text-xs border border-amber-900/50 backdrop-blur-md flex items-center justify-center space-x-1.5 transition-all shadow-md"
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
            className="absolute inset-0 z-50 bg-stone-950/90 backdrop-blur-md p-6 flex flex-col justify-between"
          >
            <div>
              <div className="flex justify-between items-center border-b border-amber-900/50 pb-3 mb-4">
                <h3 className="text-lg font-serif font-bold text-amber-200 flex items-center space-x-2">
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

              <div className="space-y-3.5 text-xs text-stone-200">
                <div className="p-3 rounded-lg bg-stone-900/80 border border-amber-900/40">
                  <p className="font-bold text-amber-300 font-serif text-sm mb-1">🔍 1. Search Illustrated Scenes</p>
                  <p className="text-stone-300 leading-relaxed">
                    Inspect the Reading Room and Archive. Pinch or tap zoom buttons to look closely. Tap hidden items from your checklist.
                  </p>
                </div>

                <div className="p-3 rounded-lg bg-stone-900/80 border border-amber-900/40">
                  <p className="font-bold text-amber-300 font-serif text-sm mb-1">🗝️ 2. Collect Real Clues</p>
                  <p className="text-stone-300 leading-relaxed">
                    Certain items are key evidence (stamped keys, letters, ribbons). Discovering them unlocks new areas and suspect questions.
                  </p>
                </div>

                <div className="p-3 rounded-lg bg-stone-900/80 border border-amber-900/40">
                  <p className="font-bold text-amber-300 font-serif text-sm mb-1">🗣️ 3. Interrogate Suspects</p>
                  <p className="text-stone-300 leading-relaxed">
                    Question Clara, Julian, and Evelyn. Use your evidence to break alibis and uncover hidden motives.
                  </p>
                </div>

                <div className="p-3 rounded-lg bg-stone-900/80 border border-amber-900/40">
                  <p className="font-bold text-amber-300 font-serif text-sm mb-1">⚖️ 4. Make Deductions & Accuse</p>
                  <p className="text-stone-300 leading-relaxed">
                    Piece the facts together on the Evidence Board and make the final accusation to solve the mystery!
                  </p>
                </div>
              </div>
            </div>

            <button
              onClick={() => setShowHowToPlay(false)}
              className="w-full py-3 rounded-xl bg-amber-600 text-stone-950 font-serif font-bold text-sm shadow-md"
            >
              Understood, Detective
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Settings Modal */}
      <AnimatePresence>
        {showSettings && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-50 bg-stone-950/90 backdrop-blur-md p-6 flex flex-col justify-between"
          >
            <div>
              <div className="flex justify-between items-center border-b border-amber-900/50 pb-3 mb-4">
                <h3 className="text-lg font-serif font-bold text-amber-200 flex items-center space-x-2">
                  <Settings className="w-5 h-5 text-amber-400" />
                  <span>Game Settings</span>
                </h3>
                <button
                  onClick={() => setShowSettings(false)}
                  className="p-1 rounded-full text-stone-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between p-3.5 rounded-xl bg-stone-900/80 border border-amber-900/40">
                  <div className="flex items-center space-x-3">
                    {soundOn ? <Volume2 className="w-5 h-5 text-amber-400" /> : <VolumeX className="w-5 h-5 text-stone-500" />}
                    <div>
                      <p className="font-serif font-bold text-sm text-stone-200">Sound Effects (SFX)</p>
                      <p className="text-[11px] text-stone-400">Object chimes, paper rustles, hints</p>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      const s = sounds.toggleSound();
                      setSoundOn(s);
                    }}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                      soundOn ? 'bg-amber-600 text-stone-950' : 'bg-stone-800 text-stone-400'
                    }`}
                  >
                    {soundOn ? 'ON' : 'OFF'}
                  </button>
                </div>

                <div className="flex items-center justify-between p-3.5 rounded-xl bg-stone-900/80 border border-amber-900/40">
                  <div className="flex items-center space-x-3">
                    <Music className={`w-5 h-5 ${musicOn ? 'text-amber-400' : 'text-stone-500'}`} />
                    <div>
                      <p className="font-serif font-bold text-sm text-stone-200">Cozy Music Chords</p>
                      <p className="text-[11px] text-stone-400">Warm ambient acoustic tones</p>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      const m = sounds.toggleMusic();
                      setMusicOn(m);
                    }}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                      musicOn ? 'bg-amber-600 text-stone-950' : 'bg-stone-800 text-stone-400'
                    }`}
                  >
                    {musicOn ? 'ON' : 'OFF'}
                  </button>
                </div>

                <div className="p-3.5 rounded-xl bg-stone-900/80 border border-amber-900/40 space-y-1">
                  <p className="font-serif font-bold text-xs text-amber-300">Prototype Version</p>
                  <p className="text-[11px] text-stone-300">
                    Hidden in Bellweather • v1.0.0 (Web Audio Synth & Illustrated Canvas)
                  </p>
                </div>
              </div>
            </div>

            <button
              onClick={() => setShowSettings(false)}
              className="w-full py-3 rounded-xl bg-amber-600 text-stone-950 font-serif font-bold text-sm shadow-md"
            >
              Done
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
