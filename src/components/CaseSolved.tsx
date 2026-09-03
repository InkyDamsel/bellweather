import React from 'react';
import { GameStats } from '../types';
import { ASSETS } from '../data/caseData';
import { sounds } from '../utils/audio';
import {
  Award,
  Sparkles,
  CheckCircle2,
  ArrowRight,
  RotateCcw,
  BookOpen,
  MapPin,
  Clock,
} from 'lucide-react';
import { motion } from 'motion/react';

interface CaseSolvedProps {
  stats: GameStats;
  onReplayCase: () => void;
  onReturnTitle: () => void;
}

export const CaseSolved: React.FC<CaseSolvedProps> = ({
  stats,
  onReplayCase,
  onReturnTitle,
}) => {
  return (
    <div className="relative w-full h-full flex flex-col justify-between p-5 bg-[#140c07] text-stone-100 select-none overflow-y-auto">
      {/* Background artwork */}
      <div className="absolute inset-0 z-0">
        <img
          src={ASSETS.titleCover}
          alt="Case Solved"
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover brightness-[0.25] blur-xs scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#140c07]/90 via-[#18100a]/80 to-[#140c07]/95" />
      </div>

      {/* Main Content */}
      <div className="relative z-10 space-y-4 my-auto py-2">
        {/* Victory Header */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
          className="text-center space-y-1"
        >
          <div className="w-16 h-16 rounded-full bg-amber-500/20 border-2 border-amber-400 mx-auto flex items-center justify-center text-amber-300 shadow-[0_0_25px_rgba(251,191,36,0.6)]">
            <Award className="w-9 h-9" />
          </div>

          <span className="text-[11px] font-mono uppercase tracking-[0.25em] text-amber-400 font-bold block pt-2">
            Investigation Closed
          </span>
          <h1 className="text-2xl sm:text-3xl font-serif font-extrabold text-amber-100">
            CASE SOLVED
          </h1>
          <p className="text-xs font-serif italic text-amber-200/80">
            The Vanishing Manuscript
          </p>
        </motion.div>

        {/* Narrative Epilogue */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="p-3.5 rounded-2xl bg-stone-950/85 border border-amber-900/60 text-xs font-serif leading-relaxed text-stone-200 space-y-1.5 backdrop-blur-md shadow-xl"
        >
          <p>
            Thanks to your sharp detective work, the Eleanor Vale manuscript was recovered unharmed from archive locker B-17.
          </p>
          <p className="text-stone-300">
            Evelyn Hart cooperated with town officials and arranged an honest historical retrospective on literary provenance, turning a potential disaster into a triumphant festival opening.
          </p>
        </motion.div>

        {/* Stats Grid */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="grid grid-cols-3 gap-2"
        >
          <div className="p-2.5 rounded-xl bg-stone-900/80 border border-amber-900/40 text-center">
            <p className="text-[10px] text-stone-400 font-mono">Evidence</p>
            <p className="text-base font-serif font-bold text-amber-300 mt-0.5">
              {stats.evidenceFoundCount} / {stats.totalEvidenceCount}
            </p>
          </div>

          <div className="p-2.5 rounded-xl bg-stone-900/80 border border-amber-900/40 text-center">
            <p className="text-[10px] text-stone-400 font-mono">Hidden Items</p>
            <p className="text-base font-serif font-bold text-amber-300 mt-0.5">
              {stats.objectsFoundCount} / {stats.totalObjectsCount}
            </p>
          </div>

          <div className="p-2.5 rounded-xl bg-stone-900/80 border border-amber-900/40 text-center">
            <p className="text-[10px] text-stone-400 font-mono">Hints Used</p>
            <p className="text-base font-serif font-bold text-amber-300 mt-0.5">
              {stats.hintsUsedCount}
            </p>
          </div>
        </motion.div>

        {/* Case 02 Teaser Card */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          className="p-3.5 rounded-2xl bg-gradient-to-r from-stone-950 to-amber-950/40 border border-amber-500/40 space-y-1.5 shadow-lg"
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono text-amber-400 font-bold uppercase">
              NEXT UP: CASE 02
            </span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 font-serif">
              Coming Soon
            </span>
          </div>

          <h3 className="font-serif font-bold text-amber-100 text-sm">
            The Secret of Blackthorn House
          </h3>
          <p className="text-[11px] text-stone-300 font-serif line-clamp-2">
            A locked clocktower on Blackthorn cliff, a missing pocket compass, and an eccentric clockmaker’s will.
          </p>
        </motion.div>
      </div>

      {/* Footer Navigation */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="relative z-10 space-y-2 pt-2"
      >
        <button
          id="btn-replay-case"
          onClick={() => {
            sounds.playTapSound();
            onReplayCase();
          }}
          className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-stone-950 font-serif font-bold text-xs shadow-lg flex items-center justify-center space-x-1.5 transition-transform active:scale-98"
        >
          <RotateCcw className="w-3.5 h-3.5 text-stone-950" />
          <span>Replay Case 01</span>
        </button>

        <button
          id="btn-return-cases-menu"
          onClick={() => {
            sounds.playTapSound();
            onReturnTitle();
          }}
          className="w-full py-2.5 rounded-xl bg-stone-950/70 hover:bg-stone-900 border border-amber-900/40 text-stone-300 hover:text-amber-200 font-serif text-xs transition-colors"
        >
          Return to Case Files
        </button>
      </motion.div>
    </div>
  );
};
