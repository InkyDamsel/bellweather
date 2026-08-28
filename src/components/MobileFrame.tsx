import React from 'react';
import { GameScreen } from '../types';
import {
  Volume2,
  VolumeX,
  Music,
  BookMarked,
  Users,
  Search,
  BrainCircuit,
  Award,
} from 'lucide-react';
import { sounds } from '../utils/audio';

interface MobileFrameProps {
  children: React.ReactNode;
  currentScreen: GameScreen;
  onNavigate: (screen: GameScreen) => void;
  evidenceCount: number;
  totalEvidence: number;
  canDeduce: boolean;
  canAccuse: boolean;
  onOpenSettings: () => void;
  onOpenJournal: () => void;
  unlockedArchive: boolean;
}

export const MobileFrame: React.FC<MobileFrameProps> = ({
  children,
  currentScreen,
  onNavigate,
  evidenceCount,
  totalEvidence,
  canDeduce,
  canAccuse,
  onOpenSettings,
  onOpenJournal,
  unlockedArchive,
}) => {
  const [soundOn, setSoundOn] = React.useState(sounds.soundEnabled);
  const [musicOn, setMusicOn] = React.useState(sounds.musicEnabled);

  const toggleSound = () => {
    const state = sounds.toggleSound();
    setSoundOn(state);
  };

  const toggleMusic = () => {
    const state = sounds.toggleMusic();
    setMusicOn(state);
  };

  const isNavVisible =
    currentScreen !== 'title' &&
    currentScreen !== 'cases_menu' &&
    currentScreen !== 'intro' &&
    currentScreen !== 'case_solved';

  return (
    <div
      id="game-root-wrapper"
      className="w-full h-[100dvh] min-h-[100dvh] bg-[#18110c] text-stone-100 flex items-center justify-center p-0 md:p-4 lg:p-6 select-none overflow-hidden font-sans relative"
      style={{
        backgroundImage: `radial-gradient(circle at 50% 20%, #301f16 0%, #170d08 100%)`,
      }}
    >
      {/* 
        ========================================================================
        DESKTOP-ONLY ATMOSPHERIC BACKGROUND DECORATIONS
        Shown ONLY on large desktop browser screens (md: and above).
        Hidden completely on phones and mobile viewports.
        ========================================================================
      */}
      <div className="hidden lg:block absolute inset-0 pointer-events-none opacity-20">
        <div className="absolute left-8 top-12 max-w-xs text-xs text-amber-200/50 space-y-2 font-serif">
          <p className="text-amber-300 font-bold uppercase tracking-widest">Bellweather Gazette</p>
          <p>“Vale Manuscript Disappears on Eve of Annual Festival. Scotland Yard Liaison Alerted.”</p>
        </div>
        <div className="absolute right-8 bottom-12 max-w-xs text-right text-xs text-amber-200/50 space-y-1 font-mono">
          <p>CASE FILE #1892-BW</p>
          <p>EVIDENCE COLLECTED: {evidenceCount} / {totalEvidence}</p>
        </div>
      </div>

      {/* 
        ========================================================================
        BELLWEATHER GAME SHELL
        - On mobile/phone viewports: fills 100% of the physical device screen with
          no simulated bezel, no outer frame border, and respecting safe areas.
        - On desktop: centers as an elegant portrait device frame with realistic
          ambient drop shadows and bezel borders.
        ========================================================================
      */}
      <div
        id="mobile-phone-viewport"
        className="w-full h-full min-h-[100dvh] h-[100dvh] md:max-w-[424px] md:h-[860px] md:max-h-[94vh] md:min-h-0 bg-[#231710] rounded-none md:rounded-[36px] shadow-none md:shadow-[0_25px_60px_-15px_rgba(0,0,0,0.95),0_0_0_10px_#382417,0_0_0_12px_#1c120b] flex flex-col overflow-hidden relative border-0 md:border md:border-amber-900/40 pl-safe pr-safe"
      >
        {/* Mobile Header Bar (With top safe-area inset support) */}
        {currentScreen !== 'title' && (
          <header
            id="mobile-header"
            className="pt-safe bg-[#2c1d14]/95 backdrop-blur-md border-b border-amber-900/40 px-3.5 py-2 flex items-center justify-between shrink-0 z-30 min-h-[48px]"
          >
            <div className="flex items-center space-x-2">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
              <span className="text-xs font-serif font-semibold text-amber-200 tracking-wider">
                BELLWEATHER • CASE 01
              </span>
            </div>

            <div className="flex items-center space-x-1.5">
              <button
                id="btn-toggle-sound"
                onClick={toggleSound}
                className="p-1.5 rounded-full hover:bg-amber-950/60 text-amber-300/80 hover:text-amber-200 transition-colors"
                title={soundOn ? 'Mute SFX' : 'Enable SFX'}
              >
                {soundOn ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4 text-stone-500" />}
              </button>

              <button
                id="btn-toggle-music"
                onClick={toggleMusic}
                className={`p-1.5 rounded-full hover:bg-amber-950/60 transition-colors ${
                  musicOn ? 'text-amber-300' : 'text-stone-500'
                }`}
                title={musicOn ? 'Mute Music' : 'Enable Cozy Music'}
              >
                <Music className="w-4 h-4" />
              </button>

              <button
                id="btn-open-journal"
                onClick={() => {
                  sounds.playPageTurnSound();
                  onOpenJournal();
                }}
                className="px-2.5 py-1 rounded-md bg-amber-900/40 hover:bg-amber-800/60 text-amber-200 text-xs font-serif border border-amber-700/40 flex items-center space-x-1 transition-colors"
              >
                <BookMarked className="w-3.5 h-3.5 text-amber-300" />
                <span>Journal</span>
              </button>
            </div>
          </header>
        )}

        {/* Dynamic Game Viewport Content */}
        <main id="game-main-content" className="flex-1 relative overflow-hidden flex flex-col">
          {children}
        </main>

        {/* Mobile Game Bottom Navigation Bar (With bottom safe-area inset support) */}
        {isNavVisible && (
          <nav
            id="mobile-bottom-nav"
            className="pb-safe bg-[#1f140e]/95 backdrop-blur-md border-t border-amber-900/50 px-2 pt-1 flex items-center justify-around shrink-0 z-30 min-h-[60px]"
          >
            {/* Search Location Tab */}
            <button
              id="nav-tab-search"
              onClick={() => {
                sounds.playTapSound();
                if (currentScreen === 'scene_archive_room') {
                  onNavigate('scene_archive_room');
                } else {
                  onNavigate('scene_reading_room');
                }
              }}
              className={`flex flex-col items-center justify-center flex-1 py-1 transition-all ${
                currentScreen === 'scene_reading_room' || currentScreen === 'scene_archive_room'
                  ? 'text-amber-300 scale-105 font-bold'
                  : 'text-stone-400 hover:text-amber-200'
              }`}
            >
              <div className="relative">
                <Search className="w-5 h-5" />
                {unlockedArchive && currentScreen !== 'scene_archive_room' && (
                  <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-amber-400" />
                )}
              </div>
              <span className="text-[10px] mt-1 font-serif tracking-wide">
                {currentScreen === 'scene_archive_room' ? 'Archive' : 'Search'}
              </span>
            </button>

            {/* Suspects Tab */}
            <button
              id="nav-tab-suspects"
              onClick={() => {
                sounds.playTapSound();
                onNavigate('suspects');
              }}
              className={`flex flex-col items-center justify-center flex-1 py-1 transition-all ${
                currentScreen === 'suspects'
                  ? 'text-amber-300 scale-105 font-bold'
                  : 'text-stone-400 hover:text-amber-200'
              }`}
            >
              <div className="relative">
                <Users className="w-5 h-5" />
              </div>
              <span className="text-[10px] mt-1 font-serif tracking-wide">Suspects</span>
            </button>

            {/* Evidence Board Tab */}
            <button
              id="nav-tab-evidence"
              onClick={() => {
                sounds.playTapSound();
                onNavigate('evidence');
              }}
              className={`flex flex-col items-center justify-center flex-1 py-1 transition-all ${
                currentScreen === 'evidence'
                  ? 'text-amber-300 scale-105 font-bold'
                  : 'text-stone-400 hover:text-amber-200'
              }`}
            >
              <div className="relative">
                <BookMarked className="w-5 h-5" />
                <span className="absolute -top-1 -right-2 px-1 text-[9px] font-bold rounded-full bg-amber-600 text-amber-100">
                  {evidenceCount}/{totalEvidence}
                </span>
              </div>
              <span className="text-[10px] mt-1 font-serif tracking-wide">Evidence</span>
            </button>

            {/* Deductions / Solve Tab */}
            <button
              id="nav-tab-deduce"
              onClick={() => {
                sounds.playTapSound();
                onNavigate('deductions');
              }}
              className={`flex flex-col items-center justify-center flex-1 py-1 transition-all ${
                currentScreen === 'deductions' || currentScreen === 'accusation'
                  ? 'text-amber-300 scale-105 font-bold'
                  : canDeduce
                  ? 'text-amber-400 animate-pulse'
                  : 'text-stone-500 hover:text-stone-400'
              }`}
            >
              <div className="relative">
                {canAccuse ? (
                  <Award className="w-5 h-5 text-amber-400" />
                ) : (
                  <BrainCircuit className="w-5 h-5" />
                )}
                {canDeduce && (
                  <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-red-500 animate-ping" />
                )}
              </div>
              <span className="text-[10px] mt-1 font-serif tracking-wide">
                {canAccuse ? 'Solve Case' : 'Deductions'}
              </span>
            </button>
          </nav>
        )}
      </div>
    </div>
  );
};
