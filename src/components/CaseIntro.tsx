import React, { useState } from 'react';
import { ASSETS, SUSPECTS } from '../data/caseData';
import { sounds } from '../utils/audio';
import { ChevronRight, Search, FileText, Lock, Users, AlertCircle } from 'lucide-react';
import { motion } from 'motion/react';

interface CaseIntroProps {
  onEnterFirstScene: () => void;
}

export const CaseIntro: React.FC<CaseIntroProps> = ({ onEnterFirstScene }) => {
  const [step, setStep] = useState<number>(0);

  const nextStep = () => {
    sounds.playPageTurnSound();
    if (step < 2) {
      setStep(step + 1);
    } else {
      sounds.playTapSound();
      onEnterFirstScene();
    }
  };

  return (
    <div className="relative w-full h-full flex flex-col justify-between p-5 bg-[#17100b] text-stone-100 select-none overflow-hidden">
      {/* Background artwork */}
      <div className="absolute inset-0 z-0">
        <img
          src={ASSETS.readingRoomScene}
          alt="Historic Library"
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover brightness-[0.35] blur-xs scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#17100b]/90 via-[#17100b]/80 to-[#17100b]/95" />
      </div>

      {/* Case Header Badge */}
      <header className="relative z-10 flex items-center justify-between border-b border-amber-900/40 pb-3">
        <div className="flex items-center space-x-2">
          <span className="px-2 py-0.5 rounded bg-amber-900/60 border border-amber-700/50 text-[10px] font-mono text-amber-300">
            CASE BRIEF 01
          </span>
          <span className="text-xs font-serif text-amber-200/80">Bellweather Constabulary</span>
        </div>
        <div className="flex space-x-1">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className={`w-2 h-2 rounded-full transition-colors ${
                step === i ? 'bg-amber-400' : 'bg-stone-700'
              }`}
            />
          ))}
        </div>
      </header>

      {/* Narrative Card Steps */}
      <div className="relative z-10 my-auto">
        {step === 0 && (
          <motion.div
            key="step-0"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="space-y-4 text-center max-w-sm mx-auto"
          >
            <div className="w-16 h-16 rounded-2xl bg-amber-950/80 border border-amber-600/40 mx-auto flex items-center justify-center text-amber-400 shadow-xl">
              <FileText className="w-8 h-8" />
            </div>

            <div className="space-y-1.5">
              <p className="text-xs font-mono text-amber-400 uppercase tracking-widest">
                The Incident
              </p>
              <h1 className="text-2xl font-serif font-bold text-amber-100">
                The Vanishing Manuscript
              </h1>
            </div>

            <div className="p-4 rounded-xl bg-stone-950/80 border border-amber-900/50 backdrop-blur-md text-left text-xs text-stone-300 leading-relaxed space-y-2 font-serif">
              <p>
                Bellweather’s annual literary festival begins tomorrow morning.
              </p>
              <p>
                Its centerpiece — a rare handwritten manuscript believed to be the final unpublished work of novelist <strong className="text-amber-200">Eleanor Vale</strong> — has vanished from the locked reading room of the town’s historic library.
              </p>
            </div>
          </motion.div>
        )}

        {step === 1 && (
          <motion.div
            key="step-1"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="space-y-4 max-w-sm mx-auto"
          >
            <div className="flex items-center space-x-2 text-amber-400 text-xs font-mono">
              <Users className="w-4 h-4" />
              <span>THE THREE PERSONS OF INTEREST</span>
            </div>

            <div className="space-y-2.5">
              {SUSPECTS.map((suspect) => (
                <div
                  key={suspect.id}
                  className="flex items-center space-x-3 p-2.5 rounded-xl bg-stone-950/85 border border-amber-900/50 backdrop-blur-md"
                >
                  <img
                    src={suspect.avatar}
                    alt={suspect.name}
                    referrerPolicy="no-referrer"
                    className="w-12 h-12 rounded-lg object-cover border border-amber-700/50 shrink-0"
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between">
                      <h4 className="font-serif font-bold text-amber-200 text-sm">{suspect.name}</h4>
                      <span className="text-[10px] text-stone-400 font-mono">{suspect.role}</span>
                    </div>
                    <p className="text-[11px] text-stone-300/80 truncate font-serif mt-0.5">
                      {suspect.initialAlibi}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex items-center space-x-2 p-2.5 rounded-lg bg-amber-950/40 border border-amber-800/40 text-[11px] text-amber-200 font-serif">
              <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
              <span>Only three people had access to the room. Someone is lying.</span>
            </div>
          </motion.div>
        )}

        {step === 2 && (
          <motion.div
            key="step-2"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="space-y-4 text-center max-w-sm mx-auto"
          >
            <div className="w-16 h-16 rounded-2xl bg-amber-950/80 border border-amber-600/40 mx-auto flex items-center justify-center text-amber-400 shadow-xl">
              <Search className="w-8 h-8 animate-pulse" />
            </div>

            <div className="space-y-1">
              <h2 className="text-xl font-serif font-bold text-amber-100">
                First Scene: Reading Room
              </h2>
              <p className="text-xs text-amber-300/80 font-serif">
                Search for clues and missing items left in the room.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-stone-950/85 border border-amber-900/50 text-left text-xs text-stone-200 font-serif space-y-2 leading-relaxed">
              <p className="flex items-center space-x-2 text-amber-200">
                <Lock className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span>The glass display case stands opened and empty.</span>
              </p>
              <p className="text-stone-300">
                Examine the desks, bookshelves, and fireplace. Locate all 8 hidden items and collect critical evidence to unlock suspect interrogations!
              </p>
            </div>
          </motion.div>
        )}
      </div>

      {/* Bottom Button */}
      <footer className="relative z-10 pt-2">
        <motion.button
          id="btn-intro-next"
          onClick={nextStep}
          whileTap={{ scale: 0.98 }}
          className="w-full py-3.5 px-6 rounded-xl bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-stone-950 font-serif font-bold text-sm shadow-[0_4px_15px_rgba(217,119,6,0.4)] border border-amber-300/50 flex items-center justify-center space-x-2 transition-all cursor-pointer"
        >
          <span>{step < 2 ? 'Continue Briefing' : 'Enter Reading Room'}</span>
          <ChevronRight className="w-4 h-4 text-stone-950" />
        </motion.button>
      </footer>
    </div>
  );
};
