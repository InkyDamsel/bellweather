import React, { useState } from 'react';
import { EvidenceItem } from '../types';
import { EVIDENCE_ITEMS, SUSPECTS, DEDUCTION_QUESTIONS } from '../data/caseData';
import { sounds } from '../utils/audio';
import {
  BookMarked,
  X,
  Sparkles,
  Key,
  Bookmark,
  Mail,
  FileSearch,
  BookOpen,
  FileText,
  Users,
  BrainCircuit,
  MapPin,
  CheckCircle2,
  Lock,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface JournalModalProps {
  onClose: () => void;
  discoveredEvidenceIds: string[];
  askedDialogueIds: string[];
  unlockedArchive: boolean;
  completedDeductionIds?: string[];
  activeTab?: 'case' | 'evidence' | 'suspects' | 'deductions';
}

export const JournalModal: React.FC<JournalModalProps> = ({
  onClose,
  discoveredEvidenceIds,
  askedDialogueIds,
  unlockedArchive,
  completedDeductionIds = [],
  activeTab: initialTab = 'evidence',
}) => {
  const [activeTab, setActiveTab] = useState<'case' | 'evidence' | 'suspects' | 'deductions'>(initialTab);

  const discoveredEvidence = EVIDENCE_ITEMS.filter((e) =>
    discoveredEvidenceIds.includes(e.id)
  );

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="absolute inset-0 z-50 bg-[#160f0a]/95 backdrop-blur-md p-4 sm:p-5 flex flex-col justify-between overflow-hidden"
    >
      {/* Top Header */}
      <div className="flex items-center justify-between border-b border-amber-900/50 pb-2.5 shrink-0">
        <div className="flex items-center space-x-2">
          <BookMarked className="w-5 h-5 text-amber-400" />
          <div>
            <h3 className="text-sm sm:text-base font-serif font-bold text-amber-100">
              Investigator’s Notebook
            </h3>
            <p className="text-[10px] text-amber-200/60 font-serif">
              The Bellweather Inquiry • Case 01
            </p>
          </div>
        </div>
        <button
          onClick={() => {
            sounds.playPageTurnSound();
            onClose();
          }}
          className="p-1.5 rounded-full text-stone-400 hover:text-white"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* 4 Clean Journal Tabs */}
      <div className="grid grid-cols-4 gap-1 py-2 border-b border-amber-950 shrink-0">
        <button
          onClick={() => {
            sounds.playPageTurnSound();
            setActiveTab('case');
          }}
          className={`py-1.5 text-center text-xs font-serif rounded-lg transition-colors flex items-center justify-center space-x-1 ${
            activeTab === 'case'
              ? 'bg-amber-900/60 text-amber-200 font-bold border border-amber-600/50'
              : 'text-stone-400 hover:text-stone-200'
          }`}
        >
          <BookOpen className="w-3.5 h-3.5" />
          <span>Case</span>
        </button>

        <button
          onClick={() => {
            sounds.playPageTurnSound();
            setActiveTab('evidence');
          }}
          className={`py-1.5 text-center text-xs font-serif rounded-lg transition-colors flex items-center justify-center space-x-1 ${
            activeTab === 'evidence'
              ? 'bg-amber-900/60 text-amber-200 font-bold border border-amber-600/50'
              : 'text-stone-400 hover:text-stone-200'
          }`}
        >
          <Bookmark className="w-3.5 h-3.5" />
          <span>Evidence</span>
        </button>

        <button
          onClick={() => {
            sounds.playPageTurnSound();
            setActiveTab('suspects');
          }}
          className={`py-1.5 text-center text-xs font-serif rounded-lg transition-colors flex items-center justify-center space-x-1 ${
            activeTab === 'suspects'
              ? 'bg-amber-900/60 text-amber-200 font-bold border border-amber-600/50'
              : 'text-stone-400 hover:text-stone-200'
          }`}
        >
          <Users className="w-3.5 h-3.5" />
          <span>Suspects</span>
        </button>

        <button
          onClick={() => {
            sounds.playPageTurnSound();
            setActiveTab('deductions');
          }}
          className={`py-1.5 text-center text-xs font-serif rounded-lg transition-colors flex items-center justify-center space-x-1 ${
            activeTab === 'deductions'
              ? 'bg-amber-900/60 text-amber-200 font-bold border border-amber-600/50'
              : 'text-stone-400 hover:text-stone-200'
          }`}
        >
          <BrainCircuit className="w-3.5 h-3.5" />
          <span>Deductions</span>
        </button>
      </div>

      {/* Tab Content Area */}
      <div className="flex-1 overflow-y-auto my-2 space-y-3 pr-1 text-xs font-serif">
        {/* TAB 1: CASE SUMMARY & OBJECTIVES */}
        {activeTab === 'case' && (
          <div className="space-y-3">
            <div className="p-3.5 rounded-2xl bg-stone-900/80 border border-amber-900/50 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono text-amber-400 uppercase font-bold tracking-widest">
                  Active Case Briefing
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-amber-950 text-amber-300 font-mono">
                  CASE 01
                </span>
              </div>
              <h4 className="text-sm font-bold text-amber-100 font-serif">
                The Vanishing Manuscript
              </h4>
              <p className="text-stone-300 leading-relaxed text-[11px]">
                On the eve of the Bellweather Coast Literary Festival, the irreplaceable Eleanor Vale manuscript vanished from the locked private reading room. No broken locks. No forced windows.
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-stone-900/80 border border-amber-900/40 space-y-2">
              <p className="text-[10px] font-mono uppercase tracking-widest text-amber-400 font-bold">
                Investigation Locations
              </p>
              <div className="space-y-2 text-[11px]">
                <div className="p-2 rounded-xl bg-stone-950/60 border border-stone-800 flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <MapPin className="w-3.5 h-3.5 text-amber-400" />
                    <span className="text-stone-200 font-semibold">The Reading Room</span>
                  </div>
                  <span className="text-[10px] text-emerald-400 font-mono">Accessible</span>
                </div>

                <div className="p-2 rounded-xl bg-stone-950/60 border border-stone-800 flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <MapPin className="w-3.5 h-3.5 text-amber-400" />
                    <span className="text-stone-200 font-semibold">Basement Archive (Locker B-17)</span>
                  </div>
                  <span className={`text-[10px] font-mono ${unlockedArchive ? 'text-emerald-400' : 'text-stone-500'}`}>
                    {unlockedArchive ? 'Unlocked (Key B-17)' : 'Locked'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: EVIDENCE */}
        {activeTab === 'evidence' && (
          <div className="space-y-2.5">
            <div className="flex items-center justify-between px-1">
              <span className="text-[10px] font-mono uppercase tracking-widest text-amber-400 font-bold">
                Collected Pieces of Evidence
              </span>
              <span className="text-[10px] font-mono text-amber-300">
                {discoveredEvidence.length} / {EVIDENCE_ITEMS.length} Found
              </span>
            </div>

            {discoveredEvidence.length === 0 ? (
              <div className="p-4 rounded-xl bg-stone-900/60 border border-stone-800 text-center text-stone-400 italic">
                No key evidence recorded yet. Explore the Reading Room to search for initial clues.
              </div>
            ) : (
              <div className="space-y-2">
                {discoveredEvidence.map((ev) => (
                  <div
                    key={ev.id}
                    className="p-3 rounded-2xl bg-stone-900/85 border border-amber-900/60 space-y-1.5 shadow-md"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                        <span className="font-bold text-amber-100 text-xs">{ev.name}</span>
                      </div>
                      <span className="text-[9px] font-mono text-amber-400 uppercase px-1.5 py-0.5 rounded bg-amber-950 border border-amber-800/40">
                        {ev.sceneDiscovered === 'reading_room' ? 'Reading Rm' : 'Archive Rm'}
                      </span>
                    </div>
                    <p className="text-stone-300 text-[11px] leading-relaxed italic">
                      “{ev.tagline}”
                    </p>
                    <p className="text-stone-300 text-[11px] leading-relaxed">
                      {ev.fullDescription}
                    </p>
                    <div className="pt-1 text-[10px] text-amber-300/90 font-serif border-t border-amber-950/80">
                      <strong>Deduction Value: </strong>{ev.suspectConnection}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 3: SUSPECTS */}
        {activeTab === 'suspects' && (
          <div className="space-y-2.5">
            <p className="text-[10px] font-mono uppercase tracking-widest text-amber-400 font-bold px-1">
              Persons of Interest Dossier
            </p>

            <div className="space-y-2.5">
              {SUSPECTS.map((suspect) => {
                const asked = suspect.dialogueTree.filter((d) =>
                  askedDialogueIds.includes(d.id)
                );

                return (
                  <div
                    key={suspect.id}
                    className="p-3.5 rounded-2xl bg-stone-900/85 border border-amber-900/50 space-y-2 shadow-md"
                  >
                    <div className="flex items-center space-x-3">
                      <img
                        src={suspect.avatar}
                        alt={suspect.name}
                        referrerPolicy="no-referrer"
                        className="w-10 h-10 rounded-xl object-cover border border-amber-600/50"
                      />
                      <div>
                        <h4 className="font-bold text-amber-100 text-xs">{suspect.name}</h4>
                        <p className="text-[10px] text-stone-400 font-mono">
                          Age {suspect.age} • {suspect.role}
                        </p>
                      </div>
                    </div>

                    <div className="text-[11px] text-stone-300 leading-relaxed">
                      <strong>Alibi: </strong>
                      <span className="italic text-stone-400">{suspect.initialAlibi}</span>
                    </div>

                    {asked.length > 0 ? (
                      <div className="space-y-1.5 pt-1 border-t border-stone-800 text-[11px]">
                        <p className="text-[10px] font-mono uppercase text-amber-400/80 font-bold">
                          Interview Log ({asked.length} questions asked):
                        </p>
                        {asked.map((q) => (
                          <div key={q.id} className="p-2 rounded-lg bg-stone-950/60 border border-stone-800/80 space-y-0.5">
                            <p className="text-amber-200/90 font-medium text-[11px]">Q: {q.text}</p>
                            <p className="text-stone-300 italic text-[11px]">“{q.response}”</p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-[10px] text-stone-500 italic">
                        No questions asked yet. Visit Suspects tab to question them.
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 4: DEDUCTIONS */}
        {activeTab === 'deductions' && (
          <div className="space-y-2.5">
            <p className="text-[10px] font-mono uppercase tracking-widest text-amber-400 font-bold px-1">
              Case Logic & Progress
            </p>

            <div className="space-y-2">
              {DEDUCTION_QUESTIONS.map((q, idx) => {
                const isSolved = completedDeductionIds.includes(q.id);
                return (
                  <div
                    key={q.id}
                    className="p-3 rounded-2xl bg-stone-900/85 border border-amber-900/50 space-y-1.5"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono text-amber-400 font-bold uppercase">
                        Step 0{idx + 1}
                      </span>
                      {isSolved ? (
                        <span className="flex items-center space-x-1 text-[10px] text-emerald-400 font-mono">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Deduction Solved</span>
                        </span>
                      ) : (
                        <span className="text-[10px] text-stone-500 font-mono">
                          Pending Logic
                        </span>
                      )}
                    </div>
                    <p className="text-xs font-bold text-amber-100 leading-snug">
                      {q.prompt}
                    </p>
                    <p className="text-[10px] text-stone-400">{q.subtitle}</p>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Footer Close Button */}
      <button
        onClick={() => {
          sounds.playPageTurnSound();
          onClose();
        }}
        className="w-full py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-stone-950 font-serif font-bold text-xs shadow-md shrink-0 mt-2"
      >
        Close Notebook
      </button>
    </motion.div>
  );
};
