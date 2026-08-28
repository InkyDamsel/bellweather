import React, { useState } from 'react';
import { SUSPECTS } from '../data/caseData';
import { Suspect } from '../types';
import { sounds } from '../utils/audio';
import {
  Award,
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  Sparkles,
  ShieldAlert,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface AccusationModalProps {
  onBackToEvidence: () => void;
  onCorrectAccusation: () => void;
  onIncrementWrongAccusation: () => void;
}

export const AccusationModal: React.FC<AccusationModalProps> = ({
  onBackToEvidence,
  onCorrectAccusation,
  onIncrementWrongAccusation,
}) => {
  const [selectedSuspect, setSelectedSuspect] = useState<Suspect | null>(null);
  const [wrongFeedback, setWrongFeedback] = useState<string | null>(null);
  const [isConfronting, setIsConfronting] = useState<boolean>(false);

  const handleAccuse = () => {
    if (!selectedSuspect) return;

    if (selectedSuspect.isGuilty) {
      sounds.playVictoryFanfare();
      setIsConfronting(true);
    } else {
      sounds.playWrongSound();
      onIncrementWrongAccusation();
      setWrongFeedback(selectedSuspect.contradictionHint);
    }
  };

  return (
    <div className="relative w-full h-full flex flex-col justify-between bg-[#150e09] text-stone-100 select-none overflow-hidden">
      {/* Header */}
      <header className="px-4 py-2.5 bg-[#25160e] border-b border-amber-900/40 flex items-center justify-between shrink-0">
        <button
          id="btn-back-from-accusation"
          onClick={() => {
            sounds.playTapSound();
            onBackToEvidence();
          }}
          className="p-1.5 rounded-lg bg-stone-900 text-stone-400 hover:text-amber-200 border border-stone-800"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div className="text-center">
          <h2 className="text-xs font-serif font-bold text-amber-200 uppercase tracking-wider">
            Formal Accusation
          </h2>
          <p className="text-[10px] text-amber-100/60 font-serif">Who took the Eleanor Vale manuscript?</p>
        </div>
        <div className="w-8" />
      </header>

      {/* Main Accusation Choices */}
      <main className="flex-1 overflow-y-auto p-4 space-y-3.5 flex flex-col justify-center">
        <div className="text-center space-y-1">
          <span className="text-[10px] font-mono uppercase tracking-widest text-amber-400 font-bold">
            The Moment of Truth
          </span>
          <h3 className="text-xl font-serif font-bold text-amber-100">
            Identify the Culprit
          </h3>
          <p className="text-xs text-stone-300 font-serif max-w-xs mx-auto">
            Choose the person responsible for taking the manuscript from the reading room.
          </p>
        </div>

        {/* Suspect Choice Cards */}
        <div className="space-y-2.5 max-w-sm mx-auto w-full">
          {SUSPECTS.map((suspect) => {
            const isSelected = selectedSuspect?.id === suspect.id;

            return (
              <button
                key={suspect.id}
                id={`btn-accuse-suspect-${suspect.id}`}
                onClick={() => {
                  sounds.playTapSound();
                  setSelectedSuspect(suspect);
                  setWrongFeedback(null);
                }}
                className={`w-full p-3 rounded-2xl border text-left flex items-center space-x-3.5 transition-all ${
                  isSelected
                    ? 'bg-amber-950/80 border-amber-400 shadow-[0_0_15px_rgba(251,191,36,0.3)] scale-102'
                    : 'bg-stone-950/70 border-amber-900/40 hover:border-amber-700/60'
                }`}
              >
                <img
                  src={suspect.avatar}
                  alt={suspect.name}
                  referrerPolicy="no-referrer"
                  className="w-14 h-14 rounded-xl object-cover border border-amber-600/50 shrink-0"
                />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between">
                    <h4 className="font-serif font-bold text-amber-200 text-sm">
                      {suspect.name}
                    </h4>
                    <span className="text-[10px] text-stone-400 font-mono">
                      {suspect.role}
                    </span>
                  </div>
                  <p className="text-xs text-stone-300/80 line-clamp-1 font-serif mt-0.5">
                    {suspect.initialAlibi}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </main>

      {/* Action Footer */}
      <footer className="p-4 bg-[#1f130b] border-t border-amber-900/40 shrink-0">
        <button
          id="btn-confirm-accusation"
          disabled={!selectedSuspect}
          onClick={handleAccuse}
          className={`w-full py-3.5 rounded-xl font-serif font-bold text-xs shadow-lg flex items-center justify-center space-x-2 transition-all ${
            selectedSuspect
              ? 'bg-gradient-to-r from-red-700 via-amber-600 to-red-700 text-stone-100 hover:brightness-110 cursor-pointer border border-amber-400/60'
              : 'bg-stone-900 border border-stone-800 text-stone-600 cursor-not-allowed'
          }`}
        >
          <Award className="w-4 h-4" />
          <span>
            {selectedSuspect
              ? `Accuse ${selectedSuspect.name}`
              : 'Select a Suspect to Accuse'}
          </span>
        </button>
      </footer>

      {/* Wrong Accusation Contradiction Modal */}
      <AnimatePresence>
        {wrongFeedback && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-50 bg-stone-950/90 backdrop-blur-md p-5 flex flex-col justify-center items-center"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className="w-full max-w-sm bg-gradient-to-b from-[#2e1515] to-[#1a0a0a] rounded-2xl border-2 border-rose-600/80 p-5 shadow-2xl space-y-4 text-center"
            >
              <div className="w-14 h-14 rounded-full bg-rose-950/80 border border-rose-500/50 mx-auto flex items-center justify-center text-rose-400">
                <ShieldAlert className="w-8 h-8" />
              </div>

              <div className="space-y-1">
                <span className="text-[10px] font-mono text-rose-400 uppercase tracking-widest font-bold">
                  Contradiction Detected
                </span>
                <h3 className="text-lg font-serif font-bold text-stone-100">
                  Something doesn’t fit...
                </h3>
              </div>

              <div className="p-3.5 rounded-xl bg-stone-950/80 border border-rose-900/60 text-xs font-serif text-rose-200 leading-relaxed text-left">
                {wrongFeedback}
              </div>

              <div className="space-y-2 pt-1">
                <button
                  id="btn-return-evidence-rethink"
                  onClick={() => {
                    sounds.playPageTurnSound();
                    setWrongFeedback(null);
                    onBackToEvidence();
                  }}
                  className="w-full py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-stone-950 font-serif font-bold text-xs shadow-md"
                >
                  Return to Evidence Board & Reconsider
                </button>

                <button
                  onClick={() => {
                    sounds.playTapSound();
                    setWrongFeedback(null);
                  }}
                  className="w-full py-2 rounded-xl bg-stone-900 text-stone-400 hover:text-white text-xs font-serif"
                >
                  Try Another Suspect
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Climax Confrontation Sequence Modal */}
      <AnimatePresence>
        {isConfronting && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 z-50 bg-stone-950/95 backdrop-blur-md p-5 flex flex-col justify-between overflow-y-auto"
          >
            <div className="space-y-4 my-auto">
              <div className="text-center space-y-1">
                <span className="text-[10px] font-mono text-amber-400 uppercase tracking-widest font-bold">
                  The Confrontation
                </span>
                <h3 className="text-xl font-serif font-bold text-amber-100">
                  Evelyn Hart Confesses
                </h3>
              </div>

              <div className="flex items-center space-x-3.5 p-3 rounded-xl bg-stone-900/90 border border-amber-900/60">
                <img
                  src={selectedSuspect?.avatar}
                  alt="Evelyn Hart"
                  referrerPolicy="no-referrer"
                  className="w-16 h-16 rounded-lg object-cover border border-amber-500/60 shrink-0"
                />
                <div className="text-xs font-serif text-stone-300 leading-relaxed">
                  <p className="italic text-amber-200">
                    “Please... stop! You have everything right there in your hands...”
                  </p>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-stone-950/90 border border-amber-800/60 space-y-2.5 text-xs text-stone-200 font-serif leading-relaxed">
                <p>
                  Tears well in Evelyn’s eyes as you present the pieces of the puzzle:
                </p>
                <ul className="space-y-1.5 pl-2 text-[11px] text-amber-200/90">
                  <li>• The <strong>B-17 archive locker key</strong> issued to her.</li>
                  <li>• Her <strong>crimson VIP ribbon</strong> dropped by the plundered case.</li>
                  <li>• The <strong>lab authentication report</strong> proving the manuscript was a fake.</li>
                  <li>• The <strong>financial ledger</strong> showing her £25,000 personal guarantee.</li>
                </ul>
                <p className="italic text-stone-300 pt-1">
                  “I found out about the forgery report three days ago. If the press exposed the fake at tomorrow’s festival, my life savings and career were ruined. I only took it to stash it safely in locker B-17 until the festival ended... I never meant to steal it forever!”
                </p>
              </div>
            </div>

            <button
              id="btn-finish-case-resolution"
              onClick={() => {
                sounds.playVictoryFanfare();
                onCorrectAccusation();
              }}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-400 text-stone-950 font-serif font-bold text-sm shadow-xl flex items-center justify-center space-x-2"
            >
              <span>View Case Resolution</span>
              <ArrowRight className="w-4 h-4 text-stone-950" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
