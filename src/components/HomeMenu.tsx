import React, { useState, useEffect } from 'react';
import { PuppetId, DEFAULT_WARRIOR_POSE, DEFAULT_SCHOLAR_POSE, PuppetPose } from '../types/puppet';
import { PuppetRenderer } from './PuppetRenderer';
import { StageBackdrop } from './StageBackdrop';
import { puppetAudio } from '../utils/audio';
import {
  GraduationCap,
  Gamepad2,
  Sparkles,
  Users,
  Trophy,
  BookOpen,
  Volume2,
  VolumeX,
  Play
} from 'lucide-react';

interface HomeMenuProps {
  onSelectMode: (mode: 'tutorial' | 'challenge' | 'theater') => void;
  onOpenCharacterSelect: () => void;
  onOpenRecords: () => void;
  onOpenLore: () => void;
  currentPuppet: PuppetId;
}

export const HomeMenu: React.FC<HomeMenuProps> = ({
  onSelectMode,
  onOpenCharacterSelect,
  onOpenRecords,
  onOpenLore,
  currentPuppet,
}) => {
  const [soundOn, setSoundOn] = useState(true);

  // Subtle animated idle motion for home screen preview
  const [animTick, setAnimTick] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setAnimTick((t) => (t + 1) % 360);
    }, 50);
    return () => clearInterval(timer);
  }, []);

  const idleWarriorPose: PuppetPose = {
    ...DEFAULT_WARRIOR_POSE,
    rightUpperArm: Math.sin((animTick * Math.PI) / 40) * 8,
    rightForearm: Math.cos((animTick * Math.PI) / 40) * 6,
    headAngle: Math.sin((animTick * Math.PI) / 60) * 4,
    torsoAngle: Math.sin((animTick * Math.PI) / 50) * 2,
    posX: 0,
    posY: 0,
  };

  const idleScholarPose: PuppetPose = {
    ...DEFAULT_SCHOLAR_POSE,
    rightUpperArm: Math.sin((animTick * Math.PI) / 35) * 8,
    rightForearm: Math.cos((animTick * Math.PI) / 35) * 6,
    headAngle: Math.cos((animTick * Math.PI) / 50) * 4,
    posX: 0,
    posY: 0,
  };

  const previewPose = currentPuppet === 'warrior' ? idleWarriorPose : idleScholarPose;

  const toggleSound = () => {
    const next = !soundOn;
    setSoundOn(next);
    puppetAudio.enabled = next;
    if (next) puppetAudio.playBangzi();
  };

  return (
    <div className="w-full max-w-4xl mx-auto flex flex-col items-center gap-6 py-4 px-3 sm:px-6">
      {/* BRAND & HEADER SECTION (Faithful recreation of User Attachment 3) */}
      <div className="text-center relative w-full flex flex-col items-center">
        {/* Sound toggle at top right */}
        <button
          onClick={toggleSound}
          className="absolute right-2 top-0 p-2 rounded-xl bg-[#281508] border border-[#573516] text-[#d4af37] hover:text-white transition-colors cursor-pointer"
          title={soundOn ? '關閉音效' : '開啟音效'}
        >
          {soundOn ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4 text-slate-500" />}
        </button>

        <h1 className="text-3xl sm:text-4xl font-extrabold font-serif-tc tracking-wider text-[#faecd5] drop-shadow-md">
          光影戲偶 · 影偶之間
        </h1>
        <p className="text-xs sm:text-sm font-cinzel tracking-[0.25em] text-[#d4af37] uppercase font-semibold mt-1">
          SHADOW PUPPET INTERACTIVE STUDIO
        </p>
      </div>

      {/* STAGE SHOWCASE PREVIEW */}
      <div className="w-full relative group">
        <StageBackdrop type="temple">
          <div className="relative w-full h-full flex items-center justify-center">
            {/* Animated Shadow Puppet on Home Stage */}
            <PuppetRenderer
              puppetId={currentPuppet}
              pose={previewPose}
              interactive={false}
              showRods={true}
              showJointHelpers={false}
            />

            {/* Stage Quick Start Action Overlay on hover/click */}
            <div className="absolute bottom-5 inset-x-0 flex justify-center pointer-events-auto">
              <button
                onClick={() => {
                  puppetAudio.playCelebration();
                  onSelectMode('challenge');
                }}
                className="flex items-center gap-2 px-6 py-2.5 rounded-full bg-gradient-to-r from-[#d4af37] via-[#e69830] to-[#a8241b] text-[#1a0f05] font-bold text-sm shadow-xl shadow-amber-500/30 hover:scale-105 active:scale-95 transition-all cursor-pointer"
              >
                <Play className="w-4 h-4 fill-current" />
                <span>立即登臺操偶</span>
              </button>
            </div>
          </div>
        </StageBackdrop>

        {/* Small subtitle tag at bottom of stage frame */}
        <div className="text-center mt-2 text-xs text-[#a8824f] font-serif-tc">
          主選單 · 點選下方卡片展開操偶體驗
        </div>
      </div>

      {/* 5+1 PRIMARY NAVIGATION MENU CARDS (Direct matching of User Attachment 3) */}
      <div className="w-full grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        {/* Card 1: 操偶教學 */}
        <button
          onClick={() => {
            puppetAudio.playGong(260, 1);
            onSelectMode('tutorial');
          }}
          className="flex items-start gap-4 p-4.5 rounded-2xl bg-[#1d1007] border border-[#523315] hover:border-[#d4af37] hover:bg-[#281508] transition-all text-left group shadow-lg cursor-pointer"
        >
          <div className="p-3 rounded-xl bg-amber-500/10 border border-[#d4af37]/40 text-[#d4af37] group-hover:scale-110 transition-transform">
            <GraduationCap className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-bold font-serif-tc text-[#faecd5] group-hover:text-amber-300 transition-colors">
              操偶教學
            </h3>
            <p className="text-xs text-[#b89569] mt-0.5">
              學習關節控制方式與傳統手眼身法
            </p>
          </div>
        </button>

        {/* Card 2: 挑戰模式 */}
        <button
          onClick={() => {
            puppetAudio.playDrum(120, 0.4);
            onSelectMode('challenge');
          }}
          className="flex items-start gap-4 p-4.5 rounded-2xl bg-[#1d1007] border border-[#523315] hover:border-[#d4af37] hover:bg-[#281508] transition-all text-left group shadow-lg cursor-pointer"
        >
          <div className="p-3 rounded-xl bg-amber-500/10 border border-[#d4af37]/40 text-[#d4af37] group-hover:scale-110 transition-transform">
            <Gamepad2 className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-bold font-serif-tc text-[#faecd5] group-hover:text-amber-300 transition-colors">
              挑戰模式
            </h3>
            <p className="text-xs text-[#b89569] mt-0.5">
              揮手、鞠躬、邁步等三關姿勢考核
            </p>
          </div>
        </button>

        {/* Card 3: 自由劇場 */}
        <button
          onClick={() => {
            puppetAudio.playCelebration();
            onSelectMode('theater');
          }}
          className="flex items-start gap-4 p-4.5 rounded-2xl bg-[#1d1007] border border-[#523315] hover:border-[#d4af37] hover:bg-[#281508] transition-all text-left group shadow-lg cursor-pointer"
        >
          <div className="p-3 rounded-xl bg-amber-500/10 border border-[#d4af37]/40 text-[#d4af37] group-hover:scale-110 transition-transform">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-bold font-serif-tc text-[#faecd5] group-hover:text-amber-300 transition-colors">
              自由劇場
            </h3>
            <p className="text-xs text-[#b89569] mt-0.5">
              自由拖曳、鑼鼓伴奏、錄製並重播折子戲
            </p>
          </div>
        </button>

        {/* Card 4: 角色選擇 */}
        <button
          onClick={() => {
            puppetAudio.playCymbal(0.8);
            onOpenCharacterSelect();
          }}
          className="flex items-start gap-4 p-4.5 rounded-2xl bg-[#1d1007] border border-[#523315] hover:border-[#d4af37] hover:bg-[#281508] transition-all text-left group shadow-lg cursor-pointer"
        >
          <div className="p-3 rounded-xl bg-amber-500/10 border border-[#d4af37]/40 text-[#d4af37] group-hover:scale-110 transition-transform">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold font-serif-tc text-[#faecd5] group-hover:text-amber-300 transition-colors">
                角色選擇
              </h3>
              <span className="text-[10px] px-2 py-0.5 rounded-md bg-[#381c0b] text-[#f5d799] border border-[#7a4e23]">
                目前：{currentPuppet === 'warrior' ? '武將' : '文生'}
              </span>
            </div>
            <p className="text-xs text-[#b89569] mt-0.5">
              切換武將（持長槍）或文生（執摺扇）
            </p>
          </div>
        </button>

        {/* Card 5: 成績與收藏 */}
        <button
          onClick={() => {
            puppetAudio.playBangzi();
            onOpenRecords();
          }}
          className="flex items-start gap-4 p-4.5 rounded-2xl bg-[#1d1007] border border-[#523315] hover:border-[#d4af37] hover:bg-[#281508] transition-all text-left group shadow-lg cursor-pointer"
        >
          <div className="p-3 rounded-xl bg-amber-500/10 border border-[#d4af37]/40 text-[#d4af37] group-hover:scale-110 transition-transform">
            <Trophy className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-bold font-serif-tc text-[#faecd5] group-hover:text-amber-300 transition-colors">
              成績與收藏
            </h3>
            <p className="text-xs text-[#b89569] mt-0.5">
              查看挑戰星級、已解鎖成就及自編折子戲
            </p>
          </div>
        </button>

        {/* Card 6: 影戲工藝與文化典故 */}
        <button
          onClick={() => {
            puppetAudio.playBangzi();
            onOpenLore();
          }}
          className="flex items-start gap-4 p-4.5 rounded-2xl bg-[#1d1007] border border-[#523315] hover:border-[#d4af37] hover:bg-[#281508] transition-all text-left group shadow-lg cursor-pointer"
        >
          <div className="p-3 rounded-xl bg-amber-500/10 border border-[#d4af37]/40 text-[#d4af37] group-hover:scale-110 transition-transform">
            <BookOpen className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-bold font-serif-tc text-[#faecd5] group-hover:text-amber-300 transition-colors">
              文化典故與心法
            </h3>
            <p className="text-xs text-[#b89569] mt-0.5">
              探索臺灣皮影戲皮雕技藝、鏤空雕工與操偶指南
            </p>
          </div>
        </button>
      </div>

      {/* Footer Info */}
      <div className="w-full flex items-center justify-between text-xs text-[#805e3b] border-t border-[#3d2410] pt-4 mt-2">
        <span>© 影偶之間 2D 線上皮影操偶互動遊戲 · 臺灣傳統文化推廣</span>
        <span>純前端單機運行 · 支援觸控與滑鼠拖曳</span>
      </div>
    </div>
  );
};
