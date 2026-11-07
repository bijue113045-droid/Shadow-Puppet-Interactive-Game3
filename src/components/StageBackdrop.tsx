import React from 'react';

export type BackdropType = 'temple' | 'cloud' | 'ink' | 'moon';

interface StageBackdropProps {
  type: BackdropType;
  lightWarmth?: number; // 0 (dim/cool) to 100 (warm golden)
  children: React.ReactNode;
}

export const StageBackdrop: React.FC<StageBackdropProps> = ({
  type,
  lightWarmth = 85,
  children,
}) => {
  // Compute warmth color
  const warmthHue = 35 + (lightWarmth - 50) * 0.15; // yellowish amber
  const screenBg = `radial-gradient(ellipse at 50% 48%, rgba(255, 246, 217, 0.98) 0%, rgba(250, 222, 160, 0.94) 40%, rgba(220, 175, 95, 0.88) 75%, rgba(130, 85, 30, 0.95) 100%)`;

  return (
    <div className="relative w-full aspect-[4/3] max-w-4xl mx-auto rounded-2xl overflow-hidden shadow-2xl border-4 border-[#3d2410] bg-[#1a0f07]">
      {/* TRADITIONAL CHINESE THEATER FRAME (Stage Roof & Curtains) */}
      
      {/* Top Stage Header (橫額 / 雕花額枋) */}
      <div className="absolute top-0 left-0 right-0 h-11 bg-gradient-to-b from-[#2b1608] via-[#3d220f] to-[#251206] z-20 flex items-center justify-between px-6 border-b-2 border-[#d4af37]/40">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-[#d4af37]/80 inline-block" />
          <span className="text-xs font-serif-tc tracking-widest text-[#f5d799]">高雄傳統皮影戲社 · 光影台</span>
        </div>
        <div className="text-xs font-serif-tc tracking-[0.3em] font-semibold text-[#f5d799]/90">
          一口道盡千古事 · 雙手對舞百萬兵
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-serif-tc tracking-widest text-[#f5d799]/70">影窗照明</span>
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400/80 inline-block" />
        </div>
      </div>

      {/* Left Dragon Pillar / Stage Border */}
      <div className="absolute left-0 top-11 bottom-0 w-8 bg-gradient-to-r from-[#1c0d05] via-[#2f1709] to-[#120803] z-20 border-r border-[#d4af37]/30 flex flex-col items-center justify-center pointer-events-none">
        <div className="writing-vertical text-[10px] tracking-widest text-[#d4af37]/50 font-serif-tc select-none">
          雲開見月 · 弄影成趣
        </div>
      </div>

      {/* Right Dragon Pillar / Stage Border */}
      <div className="absolute right-0 top-11 bottom-0 w-8 bg-gradient-to-l from-[#1c0d05] via-[#2f1709] to-[#120803] z-20 border-l border-[#d4af37]/30 flex flex-col items-center justify-center pointer-events-none">
        <div className="writing-vertical text-[10px] tracking-widest text-[#d4af37]/50 font-serif-tc select-none">
          紅氍毹下 · 掌上乾坤
        </div>
      </div>

      {/* CENTRAL ILLUMINATED SHADOW WINDOW (影窗) */}
      <div
        className="absolute inset-0 pt-11 px-8 pb-3 flex items-center justify-center overflow-hidden"
        style={{
          background: screenBg,
        }}
      >
        {/* PARCHMENT / GOAT LEATHER GRAIN TEXTURE */}
        <div className="absolute inset-0 parchment-texture pointer-events-none" />

        {/* BACKDROP ARTWORK SCENERY (According to selected type) */}
        {type === 'temple' && (
          <div className="absolute inset-0 opacity-25 pointer-events-none flex items-end justify-between px-12 pb-6">
            {/* Traditional Temple Gate silhouette */}
            <svg viewBox="0 0 800 400" className="w-full h-full object-contain">
              <path
                d="M 50,400 L 50,220 Q 200,200 400,160 Q 600,200 750,220 L 750,400 Z"
                fill="#4a2e15"
                opacity="0.3"
              />
              <path
                d="M 120,400 L 120,240 Q 250,220 400,190 Q 550,220 680,240 L 680,400 Z"
                fill="#2e1a0b"
                opacity="0.4"
              />
              {/* Eaves & Pavilion roof */}
              <path
                d="M 280,180 Q 400,130 520,180 L 500,210 Q 400,160 300,210 Z"
                fill="#361f0d"
              />
            </svg>
          </div>
        )}

        {type === 'cloud' && (
          <div className="absolute inset-0 opacity-30 pointer-events-none">
            <svg viewBox="0 0 800 500" className="w-full h-full">
              <path
                d="M 0,380 C 120,330 200,380 320,350 C 440,320 540,370 660,340 C 740,320 800,360 800,420 L 800,500 L 0,500 Z"
                fill="#a37632"
                opacity="0.4"
              />
              <path
                d="M 50,420 C 180,380 280,430 420,390 C 560,360 680,420 800,400 L 800,500 L 0,500 Z"
                fill="#543715"
                opacity="0.5"
              />
            </svg>
          </div>
        )}

        {type === 'ink' && (
          <div className="absolute inset-0 opacity-20 pointer-events-none">
            <svg viewBox="0 0 800 500" className="w-full h-full">
              {/* Layered mountain ridges */}
              <path
                d="M 0,280 Q 150,160 300,240 T 600,190 T 800,260 L 800,500 L 0,500 Z"
                fill="#3d2814"
              />
              <path
                d="M 0,340 Q 200,260 400,320 T 800,310 L 800,500 L 0,500 Z"
                fill="#241508"
              />
            </svg>
          </div>
        )}

        {type === 'moon' && (
          <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
            {/* Bright Backlit Full Moon */}
            <div className="w-64 h-64 rounded-full bg-gradient-to-br from-amber-100 via-amber-200/90 to-transparent blur-md opacity-40 -translate-y-8" />
            {/* Bamboo Silhouettes on edges */}
            <div className="absolute left-6 bottom-4 opacity-25">
              <svg width="120" height="260" viewBox="0 0 120 260">
                <line x1="20" y1="260" x2="35" y2="20" stroke="#3d2410" strokeWidth="4" />
                <line x1="50" y1="260" x2="70" y2="60" stroke="#3d2410" strokeWidth="3" />
                <path d="M 28,120 Q 50,110 70,125 Q 50,128 28,120 Z" fill="#3d2410" />
                <path d="M 32,80 Q 60,65 85,82 Q 60,86 32,80 Z" fill="#3d2410" />
                <path d="M 25,160 Q 45,150 65,165 Q 45,168 25,160 Z" fill="#3d2410" />
              </svg>
            </div>
          </div>
        )}

        {/* LANTERN LIGHT BEAM VIGNETTE */}
        <div className="absolute inset-0 shadow-[inset_0_0_120px_rgba(40,20,5,0.6)] pointer-events-none" />

        {/* STAGE FLOOR BOARD (戲臺下台板) */}
        <div className="absolute bottom-0 left-0 right-0 h-4 bg-gradient-to-t from-[#201005] to-[#452811] z-10 border-t border-[#73471f]/50" />

        {/* THE INTERACTIVE PUPPET CONTENT */}
        <div className="relative z-10 w-full h-full flex items-center justify-center">
          {children}
        </div>
      </div>
    </div>
  );
};
