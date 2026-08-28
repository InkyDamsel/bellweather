export interface HiddenObject {
  id: string;
  name: string;
  category: 'evidence' | 'regular';
  x: number; // percentage (0-100)
  y: number; // percentage (0-100)
  width: number; // percentage (approx touch width)
  height: number; // percentage (approx touch height)
  iconName: string;
  found: boolean;
  clueTitle?: string;
  clueDescription?: string;
  evidenceId?: string;
  svgShape: 'key' | 'pen' | 'ribbon' | 'watch' | 'clock' | 'teacup' | 'glasses' | 'envelope' | 'flower' | 'report' | 'ledger' | 'torn_note' | 'magnifier' | 'compass' | 'keyring' | 'seal' | 'lantern';
}

export interface EvidenceItem {
  id: string;
  name: string;
  icon: string;
  sceneDiscovered: 'reading_room' | 'archive_room';
  tagline: string;
  fullDescription: string;
  suspectConnection: string;
  clueDetails: string[];
  imagePath?: string;
}

export interface DialogueOption {
  id: string;
  text: string;
  requiresEvidenceId?: string;
  requiresClueId?: string;
  response: string;
  suspectEmotion: 'neutral' | 'defensive' | 'nervous' | 'surprised' | 'thoughtful';
  unlockedClue?: string;
}

export interface Suspect {
  id: string;
  name: string;
  role: string;
  age: number;
  avatar: string;
  bio: string;
  initialAlibi: string;
  dialogueTree: DialogueOption[];
  isGuilty: boolean;
  contradictionHint: string;
}

export interface DeductionQuestion {
  id: string;
  prompt: string;
  subtitle: string;
  options: {
    id: string;
    text: string;
    isCorrect: boolean;
    explanation: string;
  }[];
}

export type GameScreen =
  | 'title'
  | 'cases_menu'
  | 'intro'
  | 'scene_reading_room'
  | 'scene_archive_room'
  | 'suspects'
  | 'evidence'
  | 'deductions'
  | 'accusation'
  | 'case_solved';

export interface GameStats {
  objectsFoundCount: number;
  totalObjectsCount: number;
  evidenceFoundCount: number;
  totalEvidenceCount: number;
  hintsUsedCount: number;
  incorrectAccusationsCount: number;
  startTime: number;
  endTime?: number;
}
