import React, { useState } from 'react';
import { EvidenceItem } from '../types';
import { EVIDENCE_ITEMS } from '../data/caseData';
import { sounds } from '../utils/audio';
import {
  Key,
  Mail,
  Bookmark,
  FileSearch,
  BookOpen,
  FileText,
  Lock,
  Sparkles,
  Info,
  X,
  ArrowRight,
  BrainCircuit,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface EvidenceBoardProps {
  discoveredEvidenceIds: string[];
  onNavigateToDeductions: () => void;
  canDeduce: boolean;
}

export const EvidenceBoard: React.FC<EvidenceBoardProps> = ({
  discoveredEvidenceIds,
  onNavigateToDeductions,
  canDeduce,
}) => {
  const [selectedEvidence, setSelectedEvidence] = useState<EvidenceItem | null>(null);

  const getEvidenceIcon = (icon: string) => {
    switch (icon) {
      case 'Key':
        return <Key className="w-5 h-5 text-amber-400" />;
      case 'Mail':
        return <Mail className="w-5 h-5 text-amber-300" />;
      case 'Bookmark':
        return <Bookmark className="w-5 h-5 text-red-400" />;
      case 'FileSearch':
        return <FileSearch className="w-5 h-5 text-amber-300" />;
      case 'BookOpen':
        return <BookOpen className="w-5 h-5 text-amber-400" />;
      case 'FileText':
        return <FileText className="w-5 h-5 text-purple-300" />;
      default:
        return <Sparkles className="w-5 h-5 text-amber-400" />;
    }
  };

  return (
    <div className="relative w-full h-full flex flex-col justify-between bg-[#1b120c] text-stone-100 select-none overflow-hidden">
      {/* Header */}
      <header className="px-4 py-2.5 bg-[#271810] border-b border-amber-900/40 flex items-center justify-between shrink-0">
        <div>
          <h2 className="text-xs font-serif font-bold text-amber-200">Investigator’s Evidence Board</h2>
          <p className="text-[10px] text-amber-100/60 font-serif">
            {discoveredEvidenceIds.length} of {EVIDENCE_ITEMS.length} Clues Collected
          </p>
        </div>

        {canDeduce && (
          <button
            id="btn-evidence-to-deductions"
            onClick={() => {
              sounds.playTapSound();
              onNavigateToDeductions();
            }}
            className="px-2.5 py-1 rounded-lg bg-amber-600 hover:bg-amber-500 text-stone-950 font-serif font-bold text-xs flex items-center space-x-1 shadow animate-pulse"
          >
            <BrainCircuit className="w-3.5 h-3.5" />
            <span>Deductions</span>
          </button>
        )}
      </header>

      {/* Main Corkboard Grid */}
      <main
        id="evidence-corkboard"
        className="flex-1 overflow-y-auto p-4 space-y-3"
        style={{
          backgroundColor: '#23160e',
          backgroundImage: `radial-gradient(#3a2417 1px, transparent 1px)`,
          backgroundSize: '16px 16px',
        }}
      >
        <div className="grid grid-cols-2 gap-3">
          {EVIDENCE_ITEMS.map((item, index) => {
            const isDiscovered = discoveredEvidenceIds.includes(item.id);

            return (
              <motion.button
                key={item.id}
                id={`evidence-card-${item.id}`}
                disabled={!isDiscovered}
                whileHover={isDiscovered ? { scale: 1.02, y: -2 } : {}}
                whileTap={isDiscovered ? { scale: 0.98 } : {}}
                onClick={() => {
                  if (isDiscovered) {
                    sounds.playPageTurnSound();
                    setSelectedEvidence(item);
                  }
                }}
                className={`text-left p-3 rounded-xl border relative flex flex-col justify-between transition-all shadow-md min-h-[140px] ${
                  isDiscovered
                    ? 'bg-[#2a1b12] border-amber-600/60 hover:border-amber-400 text-stone-100'
                    : 'bg-stone-950/60 border-stone-900 text-stone-600 cursor-not-allowed opacity-60'
                }`}
              >
                {/* Visual Pushpin */}
                <div
                  className={`absolute -top-1.5 left-1/2 -translate-x-1/2 w-3 h-3 rounded-full shadow-sm border ${
                    isDiscovered
                      ? index % 2 === 0
                        ? 'bg-red-600 border-red-400'
                        : 'bg-amber-500 border-amber-300'
                      : 'bg-stone-700 border-stone-600'
                  }`}
                />

                {isDiscovered ? (
                  <>
                    <div className="pt-2">
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="p-1.5 rounded-lg bg-amber-950/80 border border-amber-700/50">
                          {getEvidenceIcon(item.icon)}
                        </div>
                        <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-800/40 uppercase">
                          {item.sceneDiscovered === 'reading_room' ? 'Reading Rm' : 'Archive'}
                        </span>
                      </div>
                      <h3 className="font-serif font-bold text-amber-100 text-xs line-clamp-2 leading-tight">
                        {item.name}
                      </h3>
                    </div>

                    <p className="text-[10px] text-stone-300/80 font-serif line-clamp-2 italic mt-1">
                      “{item.tagline}”
                    </p>
                  </>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-center space-y-1 py-4">
                    <Lock className="w-5 h-5 text-stone-600" />
                    <span className="text-[10px] font-mono text-stone-500">
                      Undiscovered Evidence
                    </span>
                    <span className="text-[9px] text-stone-600 font-serif">
                      {item.sceneDiscovered === 'reading_room' ? 'In Reading Room' : 'In Archive Room'}
                    </span>
                  </div>
                )}
              </motion.button>
            );
          })}
        </div>

        {/* Informational Footer Note */}
        <div className="p-2.5 rounded-xl bg-stone-950/80 border border-amber-900/40 text-[11px] text-stone-300 font-serif flex items-start space-x-2">
          <Info className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <span>
            Tap any discovered evidence card to inspect forensic observations, paper forensics, and suspect links.
          </span>
        </div>
      </main>

      {/* Bottom Button to Deductions */}
      {canDeduce && (
        <footer className="p-3 bg-[#20140e] border-t border-amber-900/40 shrink-0">
          <button
            id="btn-evidence-deduce-footer"
            onClick={() => {
              sounds.playTapSound();
              onNavigateToDeductions();
            }}
            className="w-full py-2.5 rounded-xl bg-gradient-to-r from-amber-600 to-amber-500 text-stone-950 font-serif font-bold text-xs shadow-md flex items-center justify-center space-x-1.5"
          >
            <span>Proceed to Deduction & Case Resolution</span>
            <ArrowRight className="w-4 h-4 text-stone-950" />
          </button>
        </footer>
      )}

      {/* Evidence Inspection Modal */}
      <AnimatePresence>
        {selectedEvidence && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-50 bg-stone-950/90 backdrop-blur-md p-5 flex flex-col justify-center items-center"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="w-full max-w-sm bg-gradient-to-b from-[#2d1e15] to-[#1a100a] rounded-2xl border-2 border-amber-500/70 p-5 shadow-2xl space-y-3.5 text-stone-100 relative max-h-[90vh] overflow-y-auto"
            >
              <button
                onClick={() => setSelectedEvidence(null)}
                className="absolute top-4 right-4 p-1.5 rounded-full bg-stone-900 text-stone-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="flex items-center space-x-3">
                <div className="p-2.5 rounded-xl bg-amber-950 border border-amber-600/50">
                  {getEvidenceIcon(selectedEvidence.icon)}
                </div>
                <div>
                  <span className="text-[10px] font-mono text-amber-400 uppercase tracking-widest">
                    Evidence File
                  </span>
                  <h3 className="text-base font-serif font-bold text-amber-100">
                    {selectedEvidence.name}
                  </h3>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-stone-950/80 border border-amber-900/50 space-y-2 text-xs font-serif leading-relaxed">
                <p className="text-amber-300 font-semibold italic">
                  “{selectedEvidence.tagline}”
                </p>
                <p className="text-stone-300">
                  {selectedEvidence.fullDescription}
                </p>
              </div>

              {/* Forensic Clue Bullet Points */}
              <div className="space-y-1.5 text-xs font-serif">
                <p className="text-amber-400 font-mono text-[10px] uppercase font-bold tracking-wider">
                  Investigator Notes
                </p>
                <ul className="space-y-1 pl-1">
                  {selectedEvidence.clueDetails.map((detail, i) => (
                    <li key={i} className="text-stone-300 flex items-start space-x-1.5">
                      <span className="text-amber-400 font-bold">•</span>
                      <span>{detail}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="p-2.5 rounded-lg bg-amber-950/40 border border-amber-800/40 text-[11px] text-amber-200 font-serif">
                <strong>Suspect Impact: </strong>
                <span>{selectedEvidence.suspectConnection}</span>
              </div>

              <button
                onClick={() => setSelectedEvidence(null)}
                className="w-full py-2.5 rounded-xl bg-amber-600 text-stone-950 font-serif font-bold text-xs shadow-md"
              >
                Close Evidence File
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
