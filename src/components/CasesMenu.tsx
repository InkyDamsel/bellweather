import React from 'react';
import { ASSETS } from '../data/caseData';
import { sounds } from '../utils/audio';
import { ArrowLeft, Play, Lock, CheckCircle2, Sparkles, Clock, MapPin } from 'lucide-react';
import { motion } from 'motion/react';

interface CasesMenuProps {
  onBack: () => void;
  onSelectCase1: () => void;
  case1Complete: boolean;
}

export const CasesMenu: React.FC<CasesMenuProps> = ({
  onBack,
  onSelectCase1,
  case1Complete,
}) => {
  return (
    <div className="relative w-full h-full flex flex-col justify-between p-5 bg-[#1a110a] text-stone-100 select-none overflow-y-auto">
      {/* Header */}
      <div className="flex items-center space-x-3 border-b border-amber-900/40 pb-3">
        <button
          id="btn-cases-back"
          onClick={() => {
            sounds.playTapSound();
            onBack();
          }}
          className="p-2 rounded-full bg-stone-900/80 hover:bg-stone-800 text-amber-200 border border-amber-800/40 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div>
          <h2 className="text-base font-serif font-bold text-amber-200">Investigator Case Files</h2>
          <p className="text-[11px] text-amber-100/60 font-serif">Bellweather Constabulary Archives</p>
        </div>
      </div>

      {/* Case List */}
      <div className="my-auto space-y-4 py-4">
        {/* Case 01 */}
        <motion.div
          whileHover={{ scale: 1.01 }}
          className="rounded-2xl bg-stone-900/90 border border-amber-600/50 p-4 shadow-xl relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 px-3 py-1 bg-amber-600/30 border-b border-l border-amber-500/40 text-[10px] font-mono text-amber-200 rounded-bl-lg">
            CASE 01
          </div>

          <div className="flex space-x-3.5 items-start">
            <img
              src={ASSETS.readingRoomScene}
              alt="Reading Room"
              referrerPolicy="no-referrer"
              className="w-20 h-24 object-cover rounded-lg border border-amber-800/60 shrink-0"
            />
            <div className="space-y-1.5 flex-1 min-w-0">
              <div className="flex items-center space-x-1.5">
                <h3 className="font-serif font-bold text-amber-100 text-base leading-tight">
                  The Vanishing Manuscript
                </h3>
              </div>

              <div className="flex items-center space-x-2 text-[11px] text-amber-300/80">
                <span className="flex items-center space-x-1">
                  <MapPin className="w-3 h-3 text-amber-400" />
                  <span>Historic Library</span>
                </span>
                <span>•</span>
                <span className="flex items-center space-x-1">
                  <Clock className="w-3 h-3 text-amber-400" />
                  <span>~15 min</span>
                </span>
              </div>

              <p className="text-xs text-stone-300/80 line-clamp-2 leading-relaxed">
                Eleanor Vale’s final unpublished manuscript vanishes from a locked reading room on the eve of the festival.
              </p>

              <div className="pt-2 flex items-center justify-between">
                {case1Complete ? (
                  <span className="inline-flex items-center space-x-1 text-[11px] text-emerald-400 font-serif font-semibold">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Case Solved!</span>
                  </span>
                ) : (
                  <span className="text-[11px] text-amber-400/90 font-mono">3 Suspects • 6 Clues</span>
                )}

                <button
                  id="btn-play-case-1"
                  onClick={() => {
                    sounds.playTapSound();
                    onSelectCase1();
                  }}
                  className="px-3.5 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-stone-950 font-serif font-bold text-xs shadow flex items-center space-x-1 transition-all"
                >
                  <Play className="w-3.5 h-3.5 fill-stone-950" />
                  <span>{case1Complete ? 'Replay' : 'Play Now'}</span>
                </button>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Case 02 (Teaser) */}
        <div className="rounded-2xl bg-stone-950/60 border border-stone-800 p-4 opacity-75 relative overflow-hidden">
          <div className="absolute top-0 right-0 px-3 py-1 bg-stone-800/80 text-[10px] font-mono text-stone-400 rounded-bl-lg flex items-center space-x-1">
            <Lock className="w-3 h-3" />
            <span>CASE 02</span>
          </div>

          <div className="flex space-x-3.5 items-start">
            <div className="w-20 h-24 bg-stone-900 rounded-lg border border-stone-800 flex items-center justify-center text-stone-600 shrink-0">
              <Lock className="w-6 h-6" />
            </div>
            <div className="space-y-1.5 flex-1 min-w-0">
              <h3 className="font-serif font-bold text-stone-400 text-base">
                The Secret of Blackthorn House
              </h3>
              <p className="text-[11px] text-stone-500 flex items-center space-x-1">
                <MapPin className="w-3 h-3" />
                <span>Blackthorn Cliff Manor</span>
              </p>
              <p className="text-xs text-stone-500 line-clamp-2">
                A locked clocktower, a missing pocket compass, and an eccentric clockmaker’s will.
              </p>
              <div className="pt-2">
                <span className="inline-flex items-center space-x-1 text-[11px] text-amber-500/80 font-serif">
                  <Sparkles className="w-3 h-3" />
                  <span>Coming in Next Update</span>
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <button
        onClick={() => {
          sounds.playTapSound();
          onBack();
        }}
        className="w-full py-2.5 rounded-xl bg-stone-900 text-amber-200 font-serif text-xs border border-amber-900/40 text-center"
      >
        Return to Title Screen
      </button>
    </div>
  );
};
