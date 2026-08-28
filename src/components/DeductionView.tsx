import React, { useState } from 'react';
import { DeductionQuestion } from '../types';
import { DEDUCTION_QUESTIONS } from '../data/caseData';
import { sounds } from '../utils/audio';
import {
  BrainCircuit,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  Sparkles,
  HelpCircle,
  Award,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface DeductionViewProps {
  onProceedToAccusation: () => void;
}

export const DeductionView: React.FC<DeductionViewProps> = ({
  onProceedToAccusation,
}) => {
  const [selectedOptions, setSelectedOptions] = useState<{ [qId: string]: string }>({});
  const [submitted, setSubmitted] = useState<{ [qId: string]: boolean }>({});

  const handleSelectOption = (questionId: string, optionId: string) => {
    sounds.playTapSound();
    setSelectedOptions((prev) => ({ ...prev, [questionId]: optionId }));
    setSubmitted((prev) => ({ ...prev, [questionId]: true }));

    const question = DEDUCTION_QUESTIONS.find((q) => q.id === questionId);
    const option = question?.options.find((o) => o.id === optionId);
    if (option?.isCorrect) {
      sounds.playSuccessDeductionSound();
    } else {
      sounds.playWrongSound();
    }
  };

  const isAllCorrect = DEDUCTION_QUESTIONS.every((q) => {
    const selected = selectedOptions[q.id];
    const option = q.options.find((o) => o.id === selected);
    return option?.isCorrect === true;
  });

  return (
    <div className="relative w-full h-full flex flex-col justify-between bg-[#19110b] text-stone-100 select-none overflow-hidden">
      {/* Header */}
      <header className="px-4 py-2.5 bg-[#261810] border-b border-amber-900/40 flex items-center justify-between shrink-0">
        <div>
          <h2 className="text-xs font-serif font-bold text-amber-200">Investigator’s Deductions</h2>
          <p className="text-[10px] text-amber-100/60 font-serif">Connect motives and physical clues</p>
        </div>
        <div className="flex items-center space-x-1.5 text-xs text-amber-400 font-mono">
          <BrainCircuit className="w-4 h-4" />
          <span>Case Logic</span>
        </div>
      </header>

      {/* Questions Scroll */}
      <main className="flex-1 overflow-y-auto p-4 space-y-4">
        {DEDUCTION_QUESTIONS.map((question, qIdx) => {
          const selectedId = selectedOptions[question.id];
          const isQSubmitted = submitted[question.id];
          const selectedOpt = question.options.find((o) => o.id === selectedId);

          return (
            <div
              key={question.id}
              className="p-4 rounded-2xl bg-stone-950/80 border border-amber-900/50 backdrop-blur-sm space-y-3 shadow-lg"
            >
              <div className="space-y-1">
                <span className="text-[10px] font-mono text-amber-400 uppercase tracking-widest font-bold">
                  Deduction Step 0{qIdx + 1}
                </span>
                <h3 className="font-serif font-bold text-amber-100 text-sm leading-snug">
                  {question.prompt}
                </h3>
                <p className="text-[11px] text-stone-400 font-serif">{question.subtitle}</p>
              </div>

              {/* Options */}
              <div className="space-y-2">
                {question.options.map((opt) => {
                  const isThisSelected = selectedId === opt.id;
                  const showResult = isQSubmitted && isThisSelected;

                  return (
                    <button
                      key={opt.id}
                      id={`btn-deduction-opt-${opt.id}`}
                      onClick={() => handleSelectOption(question.id, opt.id)}
                      className={`w-full text-left p-3 rounded-xl border text-xs font-serif transition-all ${
                        showResult
                          ? opt.isCorrect
                            ? 'bg-emerald-950/70 border-emerald-500 text-emerald-100 shadow-md'
                            : 'bg-rose-950/70 border-rose-600 text-rose-200 shadow-md'
                          : isThisSelected
                          ? 'bg-amber-950/70 border-amber-500 text-amber-200'
                          : 'bg-stone-900/70 border-stone-800 text-stone-300 hover:border-amber-700/60'
                      }`}
                    >
                      <div className="flex items-start justify-between space-x-2">
                        <span className="leading-snug flex-1">{opt.text}</span>
                        {showResult && (
                          <span className="shrink-0 mt-0.5">
                            {opt.isCorrect ? (
                              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                            ) : (
                              <AlertCircle className="w-4 h-4 text-rose-400" />
                            )}
                          </span>
                        )}
                      </div>

                      {/* Explanation if selected */}
                      {showResult && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          className={`mt-2 pt-2 border-t text-[11px] leading-relaxed ${
                            opt.isCorrect
                              ? 'border-emerald-800/60 text-emerald-200'
                              : 'border-rose-800/60 text-rose-300'
                          }`}
                        >
                          {opt.explanation}
                        </motion.div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </main>

      {/* Bottom Final Action Bar */}
      <footer className="p-3.5 bg-[#20140e] border-t border-amber-900/40 shrink-0">
        <button
          id="btn-proceed-accusation"
          disabled={!isAllCorrect}
          onClick={() => {
            sounds.playTapSound();
            onProceedToAccusation();
          }}
          className={`w-full py-3 rounded-xl font-serif font-bold text-xs shadow-lg flex items-center justify-center space-x-2 transition-all ${
            isAllCorrect
              ? 'bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 text-stone-950 animate-pulse cursor-pointer border border-amber-200'
              : 'bg-stone-900 border border-stone-800 text-stone-600 cursor-not-allowed'
          }`}
        >
          <Award className="w-4 h-4" />
          <span>{isAllCorrect ? 'Solve the Case: Make Accusation!' : 'Complete Deductions to Accuse'}</span>
          {isAllCorrect && <ArrowRight className="w-4 h-4" />}
        </button>
      </footer>
    </div>
  );
};
