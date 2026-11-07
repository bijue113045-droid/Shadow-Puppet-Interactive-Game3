import React, { useState } from 'react';
import { PuppetId, PerformanceRecording } from './types/puppet';
import { HomeMenu } from './components/HomeMenu';
import { TutorialMode } from './components/TutorialMode';
import { ChallengeMode } from './components/ChallengeMode';
import { FreeTheaterMode } from './components/FreeTheaterMode';
import { CharacterSelectModal } from './components/CharacterSelectModal';
import { RecordsModal } from './components/RecordsModal';
import { LoreModal } from './components/LoreModal';

type AppMode = 'home' | 'tutorial' | 'challenge' | 'theater';

export default function App() {
  const [mode, setMode] = useState<AppMode>('home');
  const [puppetId, setPuppetId] = useState<PuppetId>('warrior');

  // Modals
  const [showCharacterSelect, setShowCharacterSelect] = useState(false);
  const [showRecords, setShowRecords] = useState(false);
  const [showLore, setShowLore] = useState(false);

  const handlePlayRecording = (rec: PerformanceRecording) => {
    setPuppetId(rec.character);
    setMode('theater');
  };

  return (
    <div className="min-h-screen bg-[#0d0704] text-[#faecd5] flex flex-col items-center justify-start antialiased selection:bg-[#d4af37]/30 selection:text-white">
      {/* GLOBAL TOP NAVIGATION ACCORDING TO DESIGN CONSTITUTION */}
      <header className="w-full border-b border-[#3d2410] bg-[#140b05]/95 backdrop-blur-md sticky top-0 z-40 px-4 sm:px-8 py-3 flex items-center justify-between gap-8">
        {/* Zone 1: Wordmark */}
        <button
          onClick={() => setMode('home')}
          className="text-lg sm:text-xl font-bold font-serif-tc text-[#faecd5] hover:text-[#d4af37] transition-colors whitespace-nowrap shrink-0 flex items-center gap-2 cursor-pointer"
        >
          <span className="w-2.5 h-2.5 rounded-full bg-[#d4af37]" />
          影偶之間
        </button>

        {/* Zone 2: Navigation Links */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-[#c4a984]">
          <button
            onClick={() => setMode('home')}
            className={`hover:text-[#faecd5] transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              mode === 'home' ? 'text-[#d4af37] font-semibold' : ''
            }`}
          >
            首頁大廳
          </button>
          <button
            onClick={() => setMode('tutorial')}
            className={`hover:text-[#faecd5] transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              mode === 'tutorial' ? 'text-[#d4af37] font-semibold' : ''
            }`}
          >
            操偶教學
          </button>
          <button
            onClick={() => setMode('challenge')}
            className={`hover:text-[#faecd5] transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              mode === 'challenge' ? 'text-[#d4af37] font-semibold' : ''
            }`}
          >
            挑戰模式
          </button>
          <button
            onClick={() => setMode('theater')}
            className={`hover:text-[#faecd5] transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              mode === 'theater' ? 'text-[#d4af37] font-semibold' : ''
            }`}
          >
            自由劇場
          </button>
          <button
            onClick={() => setShowLore(true)}
            className="hover:text-[#faecd5] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            文化典故
          </button>
        </nav>

        {/* Zone 3: Primary Action */}
        <div className="flex items-center gap-2.5 shrink-0">
          <button
            onClick={() => setShowCharacterSelect(true)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-[#2b1709] border border-[#7a4e23] text-[#f5ebd9] hover:bg-[#3d220f] transition-colors whitespace-nowrap cursor-pointer"
          >
            <span>角：{puppetId === 'warrior' ? '武將' : '文生'}</span>
          </button>

          {mode !== 'theater' ? (
            <button
              onClick={() => setMode('theater')}
              className="px-4 py-1.5 text-xs font-semibold text-[#1a0f05] bg-gradient-to-r from-[#d4af37] to-[#e67e22] rounded-lg hover:opacity-95 transition-opacity whitespace-nowrap shadow-sm cursor-pointer"
            >
              登臺操偶
            </button>
          ) : (
            <button
              onClick={() => setShowRecords(true)}
              className="px-4 py-1.5 text-xs font-semibold text-[#1a0f05] bg-[#d4af37] rounded-lg hover:opacity-95 transition-opacity whitespace-nowrap shadow-sm cursor-pointer"
            >
              查看收藏
            </button>
          )}
        </div>
      </header>

      {/* MAIN VIEW CONTROLLER */}
      <main className="w-full flex-1 flex flex-col items-center">
        {mode === 'home' && (
          <HomeMenu
            onSelectMode={(selected) => setMode(selected)}
            onOpenCharacterSelect={() => setShowCharacterSelect(true)}
            onOpenRecords={() => setShowRecords(true)}
            onOpenLore={() => setShowLore(true)}
            currentPuppet={puppetId}
          />
        )}

        {mode === 'tutorial' && (
          <TutorialMode
            puppetId={puppetId}
            onFinishTutorial={() => setMode('challenge')}
            onGoHome={() => setMode('home')}
          />
        )}

        {mode === 'challenge' && (
          <ChallengeMode
            puppetId={puppetId}
            onGoHome={() => setMode('home')}
            onGoToFreeTheater={() => setMode('theater')}
          />
        )}

        {mode === 'theater' && (
          <FreeTheaterMode
            puppetId={puppetId}
            onChangePuppet={(id) => setPuppetId(id)}
            onGoHome={() => setMode('home')}
          />
        )}
      </main>

      {/* MODALS */}
      {showCharacterSelect && (
        <CharacterSelectModal
          currentPuppet={puppetId}
          onSelectPuppet={(id) => setPuppetId(id)}
          onClose={() => setShowCharacterSelect(false)}
        />
      )}

      {showRecords && (
        <RecordsModal
          onClose={() => setShowRecords(false)}
          onPlayRecording={handlePlayRecording}
        />
      )}

      {showLore && (
        <LoreModal onClose={() => setShowLore(false)} />
      )}
    </div>
  );
}
