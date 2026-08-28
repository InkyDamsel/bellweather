/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { GameScreen, HiddenObject, EvidenceItem, GameStats } from './types';
import {
  ASSETS,
  INITIAL_READING_ROOM_OBJECTS,
  INITIAL_ARCHIVE_ROOM_OBJECTS,
  EVIDENCE_ITEMS,
} from './data/caseData';
import { MobileFrame } from './components/MobileFrame';
import { TitleScreen } from './components/TitleScreen';
import { CasesMenu } from './components/CasesMenu';
import { CaseIntro } from './components/CaseIntro';
import { HiddenObjectScene } from './components/HiddenObjectScene';
import { SuspectsView } from './components/SuspectsView';
import { EvidenceBoard } from './components/EvidenceBoard';
import { DeductionView } from './components/DeductionView';
import { AccusationModal } from './components/AccusationModal';
import { CaseSolved } from './components/CaseSolved';
import { JournalModal } from './components/JournalModal';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<GameScreen>('title');
  const [readingRoomObjects, setReadingRoomObjects] = useState<HiddenObject[]>(
    INITIAL_READING_ROOM_OBJECTS
  );
  const [archiveRoomObjects, setArchiveRoomObjects] = useState<HiddenObject[]>(
    INITIAL_ARCHIVE_ROOM_OBJECTS
  );
  const [discoveredEvidenceIds, setDiscoveredEvidenceIds] = useState<string[]>([]);
  const [askedDialogueIds, setAskedDialogueIds] = useState<string[]>([]);
  const [unlockedArchive, setUnlockedArchive] = useState<boolean>(false);
  const [case1Complete, setCase1Complete] = useState<boolean>(false);

  // Modals
  const [isJournalOpen, setIsJournalOpen] = useState<boolean>(false);

  // Stats
  const [stats, setStats] = useState<GameStats>({
    objectsFoundCount: 0,
    totalObjectsCount: INITIAL_READING_ROOM_OBJECTS.length + INITIAL_ARCHIVE_ROOM_OBJECTS.length,
    evidenceFoundCount: 0,
    totalEvidenceCount: EVIDENCE_ITEMS.length,
    hintsUsedCount: 0,
    incorrectAccusationsCount: 0,
    startTime: Date.now(),
  });

  // Calculate deductions readiness
  const canDeduce = discoveredEvidenceIds.length >= 3;
  const canAccuse = discoveredEvidenceIds.length >= 5;

  // Handle Finding Objects in Reading Room
  const handleReadingRoomObjectFound = (objectId: string) => {
    setReadingRoomObjects((prev) =>
      prev.map((obj) => (obj.id === objectId ? { ...obj, found: true } : obj))
    );
    setStats((prev) => ({
      ...prev,
      objectsFoundCount: prev.objectsFoundCount + 1,
    }));
  };

  // Handle Finding Objects in Archive Room
  const handleArchiveRoomObjectFound = (objectId: string) => {
    setArchiveRoomObjects((prev) =>
      prev.map((obj) => (obj.id === objectId ? { ...obj, found: true } : obj))
    );
    setStats((prev) => ({
      ...prev,
      objectsFoundCount: prev.objectsFoundCount + 1,
    }));
  };

  // Handle Discovering Evidence
  const handleEvidenceDiscovered = (evidence: EvidenceItem) => {
    if (!discoveredEvidenceIds.includes(evidence.id)) {
      setDiscoveredEvidenceIds((prev) => [...prev, evidence.id]);
      setStats((prev) => ({
        ...prev,
        evidenceFoundCount: prev.evidenceFoundCount + 1,
      }));

      // If B-17 key found, unlock archive room
      if (evidence.id === 'ev_brass_key') {
        setUnlockedArchive(true);
      }
    }
  };

  // Handle Asking Dialogue Question
  const handleAskQuestion = (dialogueId: string) => {
    if (!askedDialogueIds.includes(dialogueId)) {
      setAskedDialogueIds((prev) => [...prev, dialogueId]);
    }
  };

  // Handle Incrementing Hint Counter
  const handleIncrementHint = () => {
    setStats((prev) => ({
      ...prev,
      hintsUsedCount: prev.hintsUsedCount + 1,
    }));
  };

  // Handle Incrementing Wrong Accusation Counter
  const handleIncrementWrongAccusation = () => {
    setStats((prev) => ({
      ...prev,
      incorrectAccusationsCount: prev.incorrectAccusationsCount + 1,
    }));
  };

  // Handle Correct Accusation Climax
  const handleCorrectAccusation = () => {
    setCase1Complete(true);
    setCurrentScreen('case_solved');
  };

  // Reset/Replay Case
  const handleReplayCase = () => {
    setReadingRoomObjects(INITIAL_READING_ROOM_OBJECTS);
    setArchiveRoomObjects(INITIAL_ARCHIVE_ROOM_OBJECTS);
    setDiscoveredEvidenceIds([]);
    setAskedDialogueIds([]);
    setUnlockedArchive(false);
    setStats({
      objectsFoundCount: 0,
      totalObjectsCount: INITIAL_READING_ROOM_OBJECTS.length + INITIAL_ARCHIVE_ROOM_OBJECTS.length,
      evidenceFoundCount: 0,
      totalEvidenceCount: EVIDENCE_ITEMS.length,
      hintsUsedCount: 0,
      incorrectAccusationsCount: 0,
      startTime: Date.now(),
    });
    setCurrentScreen('intro');
  };

  return (
    <MobileFrame
      currentScreen={currentScreen}
      onNavigate={setCurrentScreen}
      evidenceCount={discoveredEvidenceIds.length}
      totalEvidence={EVIDENCE_ITEMS.length}
      canDeduce={canDeduce}
      canAccuse={canAccuse}
      onOpenSettings={() => {}}
      onOpenJournal={() => setIsJournalOpen(true)}
      unlockedArchive={unlockedArchive}
    >
      {/* Title Screen */}
      {currentScreen === 'title' && (
        <TitleScreen
          onStartCase={() => setCurrentScreen('intro')}
          onOpenCasesMenu={() => setCurrentScreen('cases_menu')}
        />
      )}

      {/* Cases Selector Menu */}
      {currentScreen === 'cases_menu' && (
        <CasesMenu
          onBack={() => setCurrentScreen('title')}
          onSelectCase1={() => setCurrentScreen('intro')}
          case1Complete={case1Complete}
        />
      )}

      {/* Case 01 Cinematic Introduction */}
      {currentScreen === 'intro' && (
        <CaseIntro
          onEnterFirstScene={() => setCurrentScreen('scene_reading_room')}
        />
      )}

      {/* Scene 1: Reading Room */}
      {currentScreen === 'scene_reading_room' && (
        <HiddenObjectScene
          sceneId="reading_room"
          sceneTitle="Bellweather Library"
          sceneLocation="The Locked Reading Room"
          imageSrc={ASSETS.readingRoomScene}
          objects={readingRoomObjects}
          onObjectFound={handleReadingRoomObjectFound}
          onEvidenceDiscovered={handleEvidenceDiscovered}
          evidenceItems={EVIDENCE_ITEMS}
          onCompleteScene={() => {}}
          onNavigateToSuspects={() => setCurrentScreen('suspects')}
          onNavigateToArchive={
            unlockedArchive
              ? () => setCurrentScreen('scene_archive_room')
              : undefined
          }
          hintsUsed={stats.hintsUsedCount}
          onIncrementHint={handleIncrementHint}
        />
      )}

      {/* Scene 2: Archive Room */}
      {currentScreen === 'scene_archive_room' && (
        <HiddenObjectScene
          sceneId="archive_room"
          sceneTitle="Library Basement Archive"
          sceneLocation="Cabinet Locker B-17"
          imageSrc={ASSETS.archiveRoomScene}
          objects={archiveRoomObjects}
          onObjectFound={handleArchiveRoomObjectFound}
          onEvidenceDiscovered={handleEvidenceDiscovered}
          evidenceItems={EVIDENCE_ITEMS}
          onCompleteScene={() => {}}
          onNavigateToSuspects={() => setCurrentScreen('suspects')}
          hintsUsed={stats.hintsUsedCount}
          onIncrementHint={handleIncrementHint}
        />
      )}

      {/* Suspects & Interrogation */}
      {currentScreen === 'suspects' && (
        <SuspectsView
          discoveredEvidenceIds={discoveredEvidenceIds}
          askedDialogueIds={askedDialogueIds}
          onAskQuestion={handleAskQuestion}
          onNavigateToDeductions={() => setCurrentScreen('deductions')}
          canDeduce={canDeduce}
          canAccuse={canAccuse}
        />
      )}

      {/* Evidence Board */}
      {currentScreen === 'evidence' && (
        <EvidenceBoard
          discoveredEvidenceIds={discoveredEvidenceIds}
          onNavigateToDeductions={() => setCurrentScreen('deductions')}
          canDeduce={canDeduce}
        />
      )}

      {/* Deductions View */}
      {currentScreen === 'deductions' && (
        <DeductionView
          onProceedToAccusation={() => setCurrentScreen('accusation')}
        />
      )}

      {/* Accusation View */}
      {currentScreen === 'accusation' && (
        <AccusationModal
          onBackToEvidence={() => setCurrentScreen('evidence')}
          onCorrectAccusation={handleCorrectAccusation}
          onIncrementWrongAccusation={handleIncrementWrongAccusation}
        />
      )}

      {/* Case Solved Victory Screen */}
      {currentScreen === 'case_solved' && (
        <CaseSolved
          stats={stats}
          onReplayCase={handleReplayCase}
          onReturnTitle={() => setCurrentScreen('title')}
        />
      )}

      {/* Persistent Journal / Clues Notebook Modal */}
      {isJournalOpen && (
        <JournalModal
          onClose={() => setIsJournalOpen(false)}
          discoveredEvidenceIds={discoveredEvidenceIds}
          askedDialogueIds={askedDialogueIds}
        />
      )}
    </MobileFrame>
  );
}
