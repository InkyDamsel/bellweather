import React from 'react';
import { EvidenceItem } from '../types';
import { EVIDENCE_ITEMS, SUSPECTS } from '../data/caseData';
import { sounds } from '../utils/audio';
import { BookMarked, X, Sparkles, Key, Bookmark, Mail, FileSearch, BookOpen, FileText } from 'lucide-react';
import { motion } from 'motion/react';

interface JournalModalProps {
  onClose: () => void;
  discoveredEvidenceIds: string[];
  askedDialogueIds: string[];
}

export const JournalModal: React.FC<JournalModalProps> = ({
  onClose,
  discoveredEvidenceIds,
  askedDialogueIds,
}) => {
  const discoveredEvidence = EVIDENCE_ITEMS.filter((e) =>
    discoveredEvidenceIds.includes(e.id)
  );

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="absolute inset-0 z-50 bg-stone-950/90 backdrop-blur-md p-5 flex flex-col justify-between"
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b border-amber-900/50 pb-3 shrink-0">
        <div className="flex items-center space-x-2">
          <BookMarked className="w-5 h-5 text-amber-400" />
          <div>
            <h3 className="text-base font-serif font-bold text-amber-200">Investigator’s Notebook</h3>
            <p className="text-[10px] text-amber-100/60 font-serif">Case 01 Log & Evidence Summary</p>
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

      {/* Notebook Scroll Content */}
      <div className="flex-1 overflow-y-auto my-3 space-y-4 pr-1">
        {/* Discovered Clues Section */}
        <div className="space-y-2">
          <p className="text-[11px] font-mono text-amber-400 uppercase tracking-wider font-bold">
            Recorded Evidence ({discoveredEvidence.length}/{EVIDENCE_ITEMS.length})
          </p>

          {discoveredEvidence.length === 0 ? (
            <p className="text-xs text-stone-400 font-serif italic p-3 rounded-lg bg-stone-900/60 border border-stone-800">
              No evidence recorded yet. Explore the Reading Room to begin logging items.
            </p>
          ) : (
            <div className="space-y-2">
              {discoveredEvidence.map((ev) => (
                <div
                  key={ev.id}
                  className="p-3 rounded-xl bg-stone-900/80 border border-amber-900/50 space-y-1 text-xs font-serif"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-amber-200">{ev.name}</span>
                    <span className="text-[9px] font-mono text-amber-400 uppercase px-1.5 py-0.5 rounded bg-amber-950">
                      {ev.sceneDiscovered === 'reading_room' ? 'Reading Rm' : 'Archive'}
                    </span>
                  </div>
                  <p className="text-stone-300 text-[11px] leading-relaxed">{ev.fullDescription}</p>
                  <p className="text-[10px] text-amber-300/80 italic pt-1">
                    <strong>Note: </strong>{ev.suspectConnection}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Suspect Interviews Section */}
        <div className="space-y-2">
          <p className="text-[11px] font-mono text-amber-400 uppercase tracking-wider font-bold">
            Interrogation Notes
          </p>

          <div className="space-y-2">
            {SUSPECTS.map((suspect) => {
              const asked = suspect.dialogueTree.filter((d) =>
                askedDialogueIds.includes(d.id)
              );

              return (
                <div
                  key={suspect.id}
                  className="p-3 rounded-xl bg-stone-900/80 border border-stone-800 space-y-1.5 text-xs font-serif"
                >
                  <div className="flex items-center space-x-2">
                    <img
                      src={suspect.avatar}
                      alt={suspect.name}
                      referrerPolicy="no-referrer"
                      className="w-7 h-7 rounded-md object-cover border border-amber-800/40"
                    />
                    <div>
                      <span className="font-bold text-amber-100">{suspect.name}</span>
                      <span className="text-[10px] text-stone-400 font-mono ml-2">({suspect.role})</span>
                    </div>
                  </div>

                  {asked.length === 0 ? (
                    <p className="text-[11px] text-stone-500 italic pl-9">
                      No questions asked yet.
                    </p>
                  ) : (
                    <div className="space-y-1 pl-2 border-l border-amber-900/40 mt-1">
                      {asked.map((q) => (
                        <div key={q.id} className="text-[11px] text-stone-300">
                          <p className="text-amber-200/90 font-medium">Q: {q.text}</p>
                          <p className="text-stone-400 italic">“{q.response.slice(0, 75)}...”</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Footer */}
      <button
        onClick={() => {
          sounds.playTapSound();
          onClose();
        }}
        className="w-full py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-stone-950 font-serif font-bold text-xs shadow-md shrink-0"
      >
        Close Journal
      </button>
    </motion.div>
  );
};
