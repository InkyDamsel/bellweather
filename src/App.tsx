/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
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
import { DesktopCalibrationWorkspace } from './components/DesktopCalibrationWorkspace';
import { SuspectsView } from './components/SuspectsView';
import { EvidenceBoard } from './components/EvidenceBoard';
import { DeductionView } from './components/DeductionView';
import { AccusationModal } from './components/AccusationModal';
import { CaseSolved } from './components/CaseSolved';
import { JournalModal } from './components/JournalModal';

// Helper to load authoritative scene objects merged with saved manual calibration
const getAuthoritativeSceneObjects = (
  sceneId: 'reading_room' | 'archive_room',
  defaultObjects: HiddenObject[]
): HiddenObject[] => {
  try {
    const saved =
      localStorage.getItem(`bellweather_calibration_case01_${sceneId}`) ||
      localStorage.getItem(`authoritative_coords_${sceneId}`);
    if (saved) {
      const parsed = JSON.parse(saved);
      return defaultObjects.map((obj) => {
        const match = parsed.find((p: any) => p.id === obj.id || p.objectId === obj.id);
        return match
          ? {
              ...obj,
              x: typeof match.x === 'number' ? match.x : obj.x,
              y: typeof match.y === 'number' ? match.y : obj.y,
              width: typeof match.width === 'number' ? match.width : obj.width,
              height: typeof match.height === 'number' ? match.height : obj.height,
              found: false,
            }
          : { ...obj, found: false };
      });
    }
  } catch {}
  return defaultObjects.map((obj) => ({ ...obj, found: false }));
};

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<GameScreen>('title');
  const [readingRoomObjects, setReadingRoomObjects] = useState<HiddenObject[]>(() =>
    getAuthoritativeSceneObjects('reading_room', INITIAL_READING_ROOM_OBJECTS)
  );
  const [archiveRoomObjects, setArchiveRoomObjects] = useState<HiddenObject[]>(() =>
    getAuthoritativeSceneObjects('archive_room', INITIAL_ARCHIVE_ROOM_OBJECTS)
  );
  const [discoveredEvidenceIds, setDiscoveredEvidenceIds] = useState<string[]>([]);
  const [askedDialogueIds, setAskedDialogueIds] = useState<string[]>([]);
  const [unlockedArchive, setUnlockedArchive] = useState<boolean>(false);
  const [case1Complete, setCase1Complete] = useState<boolean>(false);

  // Developer Hotspot Calibration Workspace (Renders outside MobileFrame)
  const [activeCalibrationScene, setActiveCalibrationScene] = useState<
    'reading_room' | 'archive_room' | null
  >(null);

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

  // Developer keyboard shortcut listener: Alt+C or Ctrl+Shift+C opens Hotspot Editor
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.altKey && e.key.toLowerCase() === 'c') || (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === 'c')) {
        e.preventDefault();
        setActiveCalibrationScene((prev) => (prev ? null : 'reading_room'));
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Calculate deductions readiness
  const canDeduce = discoveredEvidenceIds.length >= 3;
  const canAccuse = discoveredEvidenceIds.length >= 5;

  // Handle Finding Objects in Reading Room
  const handleReadingRoomObjectFound = (objectId: string) => {
    console.log(`[STEP 4: App.tsx Received findObject ID] "${objectId}"`);
    setReadingRoomObjects((prev) => {
      const updated = prev.map((obj) => (obj.id === objectId ? { ...obj, found: true } : obj));
      const target = updated.find((o) => o.id === objectId);
      console.log(`[STEP 5 & 6: State Updated] Object "${target?.name}" (ID: "${target?.id}") is now marked found=true`);
      return updated;
    });
    setStats((prev) => ({
      ...prev,
      objectsFoundCount: prev.objectsFoundCount + 1,
    }));
  };

  // Handle Resetting Reading Room Scene (Gameplay discovery only — calibration coords strictly preserved!)
  const handleResetReadingRoom = () => {
    setReadingRoomObjects((prev) => prev.map((obj) => ({ ...obj, found: false })));
  };

  // Handle Finding Objects in Archive Room
  const handleArchiveRoomObjectFound = (objectId: string) => {
    console.log(`[STEP 4: App.tsx Received findObject ID (Archive)] "${objectId}"`);
    setArchiveRoomObjects((prev) => {
      const updated = prev.map((obj) => (obj.id === objectId ? { ...obj, found: true } : obj));
      const target = updated.find((o) => o.id === objectId);
      console.log(`[STEP 5 & 6: State Updated (Archive)] Object "${target?.name}" (ID: "${target?.id}") is now marked found=true`);
      return updated;
    });
    setStats((prev) => ({
      ...prev,
      objectsFoundCount: prev.objectsFoundCount + 1,
    }));
  };

  // Handle Resetting Archive Room Scene (Gameplay discovery only — calibration coords strictly preserved!)
  const handleResetArchiveRoom = () => {
    setArchiveRoomObjects((prev) => prev.map((obj) => ({ ...obj, found: false })));
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

  // Reset/Replay Case (Gameplay state only — never resets calibration data!)
  const handleReplayCase = () => {
    setReadingRoomObjects((prev) => prev.map((obj) => ({ ...obj, found: false })));
    setArchiveRoomObjects((prev) => prev.map((obj) => ({ ...obj, found: false })));
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

  // If Calibration Mode is active, render DesktopCalibrationWorkspace directly
  // COMPLETELY replacing the MobileGameShell and all mobile UI.
  if (activeCalibrationScene) {
    const isReadingRoom = activeCalibrationScene === 'reading_room';
    return (
      <DesktopCalibrationWorkspace
        sceneId={activeCalibrationScene}
        sceneTitle={isReadingRoom ? 'Bellweather Library' : 'Library Basement Archive'}
        imageSrc={isReadingRoom ? ASSETS.readingRoomScene : ASSETS.archiveRoomScene}
        objects={isReadingRoom ? readingRoomObjects : archiveRoomObjects}
        onSave={(updated) => {
          if (isReadingRoom) {
            setReadingRoomObjects(updated);
          } else {
            setArchiveRoomObjects(updated);
          }
        }}
        onExit={() => setActiveCalibrationScene(null)}
        onChangeScene={(newScene) => setActiveCalibrationScene(newScene)}
      />
    );
  }

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
          onOpenCalibration={() => setActiveCalibrationScene('reading_room')}
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
          onResetScene={handleResetReadingRoom}
          hintsUsed={stats.hintsUsedCount}
          onIncrementHint={handleIncrementHint}
          onOpenCalibration={() => setActiveCalibrationScene('reading_room')}
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
          onResetScene={handleResetArchiveRoom}
          hintsUsed={stats.hintsUsedCount}
          onIncrementHint={handleIncrementHint}
          onOpenCalibration={() => setActiveCalibrationScene('archive_room')}
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
