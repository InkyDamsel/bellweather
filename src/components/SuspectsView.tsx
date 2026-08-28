import React, { useState } from 'react';
import { Suspect, EvidenceItem, DialogueOption } from '../types';
import { SUSPECTS } from '../data/caseData';
import { sounds } from '../utils/audio';
import {
  MessageSquare,
  Lock,
  Sparkles,
  Award,
  BookMarked,
  ArrowRight,
  BrainCircuit,
  HelpCircle,
  Smile,
  Frown,
  Meh,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface SuspectsViewProps {
  discoveredEvidenceIds: string[];
  askedDialogueIds: string[];
  onAskQuestion: (dialogueId: string, unlockedClue?: string) => void;
  onNavigateToDeductions: () => void;
  canDeduce: boolean;
  canAccuse: boolean;
}

export const SuspectsView: React.FC<SuspectsViewProps> = ({
  discoveredEvidenceIds,
  askedDialogueIds,
  onAskQuestion,
  onNavigateToDeductions,
  canDeduce,
  canAccuse,
}) => {
  const [selectedSuspectId, setSelectedSuspectId] = useState<string>('clara');
  const [activeDialogue, setActiveDialogue] = useState<DialogueOption | null>(null);

  const selectedSuspect = SUSPECTS.find((s) => s.id === selectedSuspectId) || SUSPECTS[0];

  const handleSelectQuestion = (option: DialogueOption) => {
    sounds.playTapSound();
    setActiveDialogue(option);
    onAskQuestion(option.id, option.unlockedClue);
  };

  const getEmotionIcon = (emotion: DialogueOption['suspectEmotion']) => {
    switch (emotion) {
      case 'nervous':
      case 'defensive':
        return <Frown className="w-4 h-4 text-amber-400" />;
      case 'surprised':
      case 'thoughtful':
        return <Meh className="w-4 h-4 text-amber-300" />;
      default:
        return <Smile className="w-4 h-4 text-stone-300" />;
    }
  };

  return (
    <div className="relative w-full h-full flex flex-col justify-between bg-[#19110b] text-stone-100 select-none overflow-hidden">
      {/* Top Header */}
      <header className="px-4 py-2.5 bg-[#261810] border-b border-amber-900/40 flex items-center justify-between shrink-0">
        <div>
          <h2 className="text-xs font-serif font-bold text-amber-200">Persons of Interest</h2>
          <p className="text-[10px] text-amber-100/60 font-serif">Select a suspect to cross-examine</p>
        </div>

        {canDeduce && (
          <button
            id="btn-suspects-to-deductions"
            onClick={() => {
              sounds.playTapSound();
              onNavigateToDeductions();
            }}
            className="px-2.5 py-1 rounded-lg bg-amber-600 hover:bg-amber-500 text-stone-950 font-serif font-bold text-xs flex items-center space-x-1 shadow animate-pulse"
          >
            <BrainCircuit className="w-3.5 h-3.5" />
            <span>Make Deduction</span>
          </button>
        )}
      </header>

      {/* Suspect Avatars Row */}
      <div className="px-3 py-2 bg-[#20130c] border-b border-amber-950 flex items-center justify-around shrink-0">
        {SUSPECTS.map((suspect) => {
          const isSelected = suspect.id === selectedSuspectId;
          return (
            <button
              key={suspect.id}
              id={`suspect-tab-${suspect.id}`}
              onClick={() => {
                sounds.playTapSound();
                setSelectedSuspectId(suspect.id);
                setActiveDialogue(null);
              }}
              className={`flex items-center space-x-2 p-1.5 rounded-xl transition-all ${
                isSelected
                  ? 'bg-amber-950/70 border border-amber-500/60 scale-102 shadow-md'
                  : 'opacity-70 hover:opacity-100'
              }`}
            >
              <img
                src={suspect.avatar}
                alt={suspect.name}
                referrerPolicy="no-referrer"
                className={`w-10 h-10 rounded-lg object-cover border ${
                  isSelected ? 'border-amber-400' : 'border-stone-700'
                }`}
              />
              <div className="text-left hidden sm:block">
                <p className="text-xs font-serif font-bold text-amber-100">{suspect.name}</p>
                <p className="text-[9px] text-stone-400 font-mono">{suspect.role}</p>
              </div>
            </button>
          );
        })}
      </div>

      {/* Main Interrogation Area */}
      <main className="flex-1 overflow-y-auto p-4 space-y-3.5">
        {/* Suspect Profile Card */}
        <div className="p-3.5 rounded-2xl bg-stone-950/80 border border-amber-900/50 backdrop-blur-sm flex space-x-3.5 items-start">
          <img
            src={selectedSuspect.avatar}
            alt={selectedSuspect.name}
            referrerPolicy="no-referrer"
            className="w-16 h-16 rounded-xl object-cover border border-amber-600/50 shrink-0 shadow-md"
          />
          <div className="space-y-1 min-w-0 flex-1">
            <div className="flex items-center justify-between">
              <h3 className="font-serif font-bold text-amber-200 text-sm">
                {selectedSuspect.name}
              </h3>
              <span className="text-[10px] text-stone-400 font-mono">
                Age {selectedSuspect.age} • {selectedSuspect.role}
              </span>
            </div>
            <p className="text-xs text-stone-300 font-serif leading-relaxed">
              {selectedSuspect.bio}
            </p>
            <div className="pt-1 text-[11px] text-amber-300/90 font-serif italic">
              <strong>Stated Alibi: </strong>{selectedSuspect.initialAlibi}
            </div>
          </div>
        </div>

        {/* Current Active Response Bubble */}
        <AnimatePresence mode="wait">
          {activeDialogue ? (
            <motion.div
              key={activeDialogue.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="p-3.5 rounded-2xl bg-gradient-to-br from-amber-950/60 to-stone-950/80 border border-amber-600/40 space-y-2 shadow-lg"
            >
              <div className="flex items-center justify-between text-xs text-amber-300 font-mono">
                <span className="flex items-center space-x-1.5">
                  <MessageSquare className="w-3.5 h-3.5 text-amber-400" />
                  <span>{selectedSuspect.name}’s Statement</span>
                </span>
                <span className="flex items-center space-x-1 text-[11px] text-amber-400">
                  {getEmotionIcon(activeDialogue.suspectEmotion)}
                  <span className="capitalize">{activeDialogue.suspectEmotion}</span>
                </span>
              </div>

              <p className="text-xs text-stone-200 font-serif italic leading-relaxed">
                {activeDialogue.response}
              </p>

              {activeDialogue.unlockedClue && (
                <div className="p-2 rounded-lg bg-amber-500/10 border border-amber-400/40 flex items-start space-x-2 text-[11px] text-amber-200">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                  <span>
                    <strong>New Clue Unlocked: </strong> {activeDialogue.unlockedClue}
                  </span>
                </div>
              )}
            </motion.div>
          ) : (
            <div className="p-3 rounded-xl bg-stone-950/40 border border-stone-800 text-center text-xs text-stone-400 font-serif">
              Select an inquiry below to question {selectedSuspect.name.split(' ')[0]}.
            </div>
          )}
        </AnimatePresence>

        {/* Dialogue Options List */}
        <div className="space-y-2">
          <p className="text-[11px] font-mono uppercase tracking-wider text-amber-400 font-semibold px-1">
            Questions & Evidence Confrontations
          </p>

          {selectedSuspect.dialogueTree.map((option) => {
            const isEvidenceQuestion = !!option.requiresEvidenceId;
            const isUnlocked = !option.requiresEvidenceId || discoveredEvidenceIds.includes(option.requiresEvidenceId);
            const isAlreadyAsked = askedDialogueIds.includes(option.id);

            return (
              <button
                key={option.id}
                id={`btn-question-${option.id}`}
                disabled={!isUnlocked}
                onClick={() => handleSelectQuestion(option)}
                className={`w-full text-left p-3 rounded-xl border text-xs font-serif transition-all flex items-start justify-between space-x-2 ${
                  !isUnlocked
                    ? 'bg-stone-950/40 border-stone-800 text-stone-600 cursor-not-allowed'
                    : isAlreadyAsked
                    ? 'bg-stone-900/60 border-stone-800 text-stone-300 hover:border-amber-700/60'
                    : isEvidenceQuestion
                    ? 'bg-amber-950/50 border-amber-500/60 text-amber-200 hover:bg-amber-900/60 shadow-sm'
                    : 'bg-stone-950/80 border-amber-900/40 text-stone-200 hover:border-amber-700/60'
                }`}
              >
                <div className="flex items-start space-x-2">
                  {isEvidenceQuestion ? (
                    <Sparkles className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  ) : (
                    <MessageSquare className="w-4 h-4 text-stone-400 shrink-0 mt-0.5" />
                  )}
                  <span className="leading-snug">{option.text}</span>
                </div>

                {!isUnlocked && (
                  <span className="flex items-center space-x-1 text-[10px] text-stone-500 font-mono shrink-0">
                    <Lock className="w-3 h-3" />
                    <span>Locked Clue</span>
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </main>

      {/* Bottom CTA to Deduction */}
      {canDeduce && (
        <footer className="p-3 bg-[#20140e] border-t border-amber-900/40 shrink-0">
          <button
            id="btn-suspects-deduce-footer"
            onClick={() => {
              sounds.playTapSound();
              onNavigateToDeductions();
            }}
            className="w-full py-2.5 rounded-xl bg-gradient-to-r from-amber-600 to-amber-500 text-stone-950 font-serif font-bold text-xs shadow-md flex items-center justify-center space-x-1.5"
          >
            <span>Review Evidence & Make Deductions</span>
            <ArrowRight className="w-4 h-4 text-stone-950" />
          </button>
        </footer>
      )}
    </div>
  );
};
