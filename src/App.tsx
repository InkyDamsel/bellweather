/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import { GameScreen, HiddenObject, EvidenceItem, GameStats } from './types';
import {
  ASSETS,
  INITIAL_READING_ROOM_OBJECTS,
  INITIAL_ARCHIVE_ROOM_OBJECTS,
  EVIDENCE_ITEMS,
} from './data/caseData';
import {
  loadPlayerSettings,
  loadPlayerSave,
  savePlayerProgress,
  savePlayerSettings,
  clearPlayerSave,
  PlayerSettings,
} from './utils/saveState';
import { sounds } from './utils/audio';
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
import { SettingsModal } from './components/SettingsModal';
import { motion, AnimatePresence } from 'motion/react';

// Helper to load authoritative scene objects merged with saved manual calibration and saved found status
const getAuthoritativeSceneObjects = (
  sceneId: 'reading_room' | 'archive_room',
  defaultObjects: HiddenObject[],
  foundIds: string[] = []
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
              found: foundIds.includes(obj.id),
            }
          : { ...obj, found: foundIds.includes(obj.id) };
      });
    }
  } catch {}
  return defaultObjects.map((obj) => ({ ...obj, found: foundIds.includes(obj.id) }));
};

export default function App() {
  const initialSave = loadPlayerSave();

  const [settings, setSettings] = useState<PlayerSettings>(() => loadPlayerSettings());
  const [currentScreen, setCurrentScreen] = useState<GameScreen>(
    initialSave?.hasStarted && initialSave.currentScreen !== 'case_solved'
      ? 'title' // start at title with "Continue Case" available
      : 'title'
  );

  const [readingRoomObjects, setReadingRoomObjects] = useState<HiddenObject[]>(() =>
    getAuthoritativeSceneObjects(
      'reading_room',
      INITIAL_READING_ROOM_OBJECTS,
      initialSave?.readingRoomFoundIds || []
    )
  );

  const [archiveRoomObjects, setArchiveRoomObjects] = useState<HiddenObject[]>(() =>
    getAuthoritativeSceneObjects(
      'archive_room',
      INITIAL_ARCHIVE_ROOM_OBJECTS,
      initialSave?.archiveRoomFoundIds || []
    )
  );

  const [discoveredEvidenceIds, setDiscoveredEvidenceIds] = useState<string[]>(
    initialSave?.discoveredEvidenceIds || []
  );
  const [askedDialogueIds, setAskedDialogueIds] = useState<string[]>(
    initialSave?.askedDialogueIds || []
  );
  const [unlockedArchive, setUnlockedArchive] = useState<boolean>(
    initialSave?.unlockedArchive || false
  );
  const [case1Complete, setCase1Complete] = useState<boolean>(
    initialSave?.case1Complete || false
  );
  const [hasUnreadJournal, setHasUnreadJournal] = useState<boolean>(
    initialSave?.journalHasUnread || false
  );

  // Modals
  const [isJournalOpen, setIsJournalOpen] = useState<boolean>(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);

  // Developer Hotspot Calibration Workspace (Renders outside MobileFrame)
  const [activeCalibrationScene, setActiveCalibrationScene] = useState<
    'reading_room' | 'archive_room' | null
  >(null);

  // Stats
  const [stats, setStats] = useState<GameStats>(
    initialSave?.stats || {
      objectsFoundCount:
        (initialSave?.readingRoomFoundIds?.length || 0) +
        (initialSave?.archiveRoomFoundIds?.length || 0),
      totalObjectsCount:
        INITIAL_READING_ROOM_OBJECTS.length + INITIAL_ARCHIVE_ROOM_OBJECTS.length,
      evidenceFoundCount: initialSave?.discoveredEvidenceIds?.length || 0,
      totalEvidenceCount: EVIDENCE_ITEMS.length,
      hintsUsedCount: 0,
      incorrectAccusationsCount: 0,
      startTime: Date.now(),
    }
  );

  // Synchronize audio engine with player settings
  useEffect(() => {
    sounds.applySettings(settings);
  }, [settings]);

  // Persist game state automatically
  const persistState = useCallback(
    (override?: { screen?: GameScreen; hasUnread?: boolean }) => {
      savePlayerProgress({
        hasStarted: true,
        currentScreen: override?.screen || currentScreen,
        readingRoomFoundIds: readingRoomObjects.filter((o) => o.found).map((o) => o.id),
        archiveRoomFoundIds: archiveRoomObjects.filter((o) => o.found).map((o) => o.id),
        discoveredEvidenceIds,
        askedDialogueIds,
        unlockedArchive,
        case1Complete,
        journalHasUnread:
          typeof override?.hasUnread === 'boolean' ? override.hasUnread : hasUnreadJournal,
        stats,
      });
    },
    [
      currentScreen,
      readingRoomObjects,
      archiveRoomObjects,
      discoveredEvidenceIds,
      askedDialogueIds,
      unlockedArchive,
      case1Complete,
      hasUnreadJournal,
      stats,
    ]
  );

  useEffect(() => {
    persistState();
  }, [persistState]);

  // Developer keyboard shortcut listener: Alt+C or Ctrl+Shift+C opens Hotspot Editor
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        (e.altKey && e.key.toLowerCase() === 'c') ||
        (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === 'c')
      ) {
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
    setReadingRoomObjects((prev) => {
      const updated = prev.map((obj) => (obj.id === objectId ? { ...obj, found: true } : obj));
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
    setArchiveRoomObjects((prev) => {
      const updated = prev.map((obj) => (obj.id === objectId ? { ...obj, found: true } : obj));
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
      setHasUnreadJournal(true);
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
    clearPlayerSave();
    setReadingRoomObjects((prev) => prev.map((obj) => ({ ...obj, found: false })));
    setArchiveRoomObjects((prev) => prev.map((obj) => ({ ...obj, found: false })));
    setDiscoveredEvidenceIds([]);
    setAskedDialogueIds([]);
    setUnlockedArchive(false);
    setHasUnreadJournal(false);
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

  // Resume or start investigation from title screen
  const handleContinueOrStart = () => {
    if (initialSave?.hasStarted && initialSave.currentScreen && initialSave.currentScreen !== 'title' && initialSave.currentScreen !== 'case_solved') {
      setCurrentScreen(initialSave.currentScreen);
    } else if (discoveredEvidenceIds.length > 0) {
      if (unlockedArchive && archiveRoomObjects.some((o) => !o.found)) {
        setCurrentScreen('scene_archive_room');
      } else if (readingRoomObjects.some((o) => !o.found)) {
        setCurrentScreen('scene_reading_room');
      } else {
        setCurrentScreen('suspects');
      }
    } else {
      setCurrentScreen('intro');
    }
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

  const hasSavedProgress =
    discoveredEvidenceIds.length > 0 ||
    readingRoomObjects.some((o) => o.found) ||
    askedDialogueIds.length > 0;

  return (
    <MobileFrame
      currentScreen={currentScreen}
      onNavigate={setCurrentScreen}
      evidenceCount={discoveredEvidenceIds.length}
      totalEvidence={EVIDENCE_ITEMS.length}
      canDeduce={canDeduce}
      canAccuse={canAccuse}
      onOpenSettings={() => setIsSettingsOpen(true)}
      onOpenJournal={() => {
        setHasUnreadJournal(false);
        setIsJournalOpen(true);
      }}
      unlockedArchive={unlockedArchive}
      hasUnreadJournal={hasUnreadJournal}
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={currentScreen}
          initial={settings.reducedMotion ? { opacity: 0 } : { opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={settings.reducedMotion ? { opacity: 0 } : { opacity: 0, scale: 1.01 }}
          transition={{ duration: settings.reducedMotion ? 0.15 : 0.25, ease: 'easeInOut' }}
          className="w-full h-full flex flex-col overflow-hidden"
        >
          {/* Title Screen */}
          {currentScreen === 'title' && (
            <TitleScreen
              onStartCase={handleContinueOrStart}
              onOpenCasesMenu={() => setCurrentScreen('cases_menu')}
              onOpenSettings={() => setIsSettingsOpen(true)}
              onOpenCalibration={() => setActiveCalibrationScene('reading_room')}
              hasSavedProgress={hasSavedProgress}
              onNewGame={handleReplayCase}
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
        </motion.div>
      </AnimatePresence>

      {/* Persistent Journal / Clues Notebook Modal */}
      <AnimatePresence>
        {isJournalOpen && (
          <JournalModal
            onClose={() => setIsJournalOpen(false)}
            discoveredEvidenceIds={discoveredEvidenceIds}
            askedDialogueIds={askedDialogueIds}
            unlockedArchive={unlockedArchive}
          />
        )}
      </AnimatePresence>

      {/* Settings Modal */}
      <AnimatePresence>
        {isSettingsOpen && (
          <SettingsModal
            isOpen={isSettingsOpen}
            onClose={() => setIsSettingsOpen(false)}
            settings={settings}
            onUpdateSettings={setSettings}
            onResetCaseProgress={handleReplayCase}
            onOpenCalibration={() => setActiveCalibrationScene('reading_room')}
          />
        )}
      </AnimatePresence>
    </MobileFrame>
  );
}
