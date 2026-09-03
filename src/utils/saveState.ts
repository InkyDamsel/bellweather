import { GameScreen, GameStats, HiddenObject } from '../types';

export interface PlayerSettings {
  soundEnabled: boolean;
  musicEnabled: boolean;
  ambienceEnabled: boolean;
  hapticsEnabled: boolean;
  reducedMotion: boolean;
}

export interface PlayerSaveData {
  version: number;
  hasStarted: boolean;
  currentScreen: GameScreen;
  readingRoomFoundIds: string[];
  archiveRoomFoundIds: string[];
  discoveredEvidenceIds: string[];
  askedDialogueIds: string[];
  unlockedArchive: boolean;
  completedDeductions: { [questionId: string]: string };
  stats: GameStats;
  case1Complete: boolean;
  journalHasUnread: boolean;
  lastSavedAt: number;
}

const SAVE_KEY = 'bellweather_player_save_case01';
const SETTINGS_KEY = 'bellweather_player_settings';

export const DEFAULT_SETTINGS: PlayerSettings = {
  soundEnabled: true,
  musicEnabled: true,
  ambienceEnabled: true,
  hapticsEnabled: true,
  reducedMotion: false,
};

export const loadPlayerSettings = (): PlayerSettings => {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (raw) {
      return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
    }
  } catch (err) {
    console.warn('Failed to load settings from storage:', err);
  }
  return DEFAULT_SETTINGS;
};

export const savePlayerSettings = (settings: PlayerSettings) => {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  } catch (err) {
    console.warn('Failed to save settings to storage:', err);
  }
};

export const loadPlayerSave = (): PlayerSaveData | null => {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (!raw) return null;
    const data = JSON.parse(raw);
    if (data && typeof data === 'object' && data.hasStarted) {
      return data as PlayerSaveData;
    }
  } catch (err) {
    console.warn('Failed to load player save data:', err);
  }
  return null;
};

export const savePlayerProgress = (data: Partial<PlayerSaveData>) => {
  try {
    const current = loadPlayerSave() || {
      version: 1,
      hasStarted: true,
      currentScreen: 'intro' as GameScreen,
      readingRoomFoundIds: [],
      archiveRoomFoundIds: [],
      discoveredEvidenceIds: [],
      askedDialogueIds: [],
      unlockedArchive: false,
      completedDeductions: {},
      stats: {
        objectsFoundCount: 0,
        totalObjectsCount: 16,
        evidenceFoundCount: 0,
        totalEvidenceCount: 5,
        hintsUsedCount: 0,
        incorrectAccusationsCount: 0,
        startTime: Date.now(),
      },
      case1Complete: false,
      journalHasUnread: false,
      lastSavedAt: Date.now(),
    };

    const updated: PlayerSaveData = {
      ...current,
      ...data,
      lastSavedAt: Date.now(),
    };

    localStorage.setItem(SAVE_KEY, JSON.stringify(updated));
  } catch (err) {
    console.warn('Failed to save player progress:', err);
  }
};

export const clearPlayerSave = () => {
  try {
    localStorage.removeItem(SAVE_KEY);
  } catch (err) {
    console.warn('Failed to clear player save:', err);
  }
};
