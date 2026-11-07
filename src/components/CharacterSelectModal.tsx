import React from 'react';
import { PuppetId, DEFAULT_WARRIOR_POSE, DEFAULT_SCHOLAR_POSE } from '../types/puppet';
import { PuppetRenderer } from './PuppetRenderer';
import { puppetAudio } from '../utils/audio';
import { X, CheckCircle, Shield, Feather, Sparkles } from 'lucide-react';

interface CharacterSelectModalProps {
  currentPuppet: PuppetId;
  onSelectPuppet: (id: PuppetId) => void;
  onClose: () => void;
}

export const CharacterSelectModal: React.FC<CharacterSelectModalProps> = ({
  currentPuppet,
  onSelectPuppet,
  onClose,
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-4xl bg-[#1f1207] border-2 border-[#d4af37]/70 rounded-3xl p-6 sm:p-8 shadow-2xl relative max-h-[92vh] overflow-y-auto">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full bg-black/40 border border-[#73471f] text-[#d4af37] hover:text-white transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center mb-6">
          <span className="text-xs uppercase tracking-widest text-[#d4af37] font-semibold">CHARACTER GALLERY</span>
          <h2 className="text-2xl sm:text-3xl font-bold font-serif-tc text-[#faecd5] mt-1">
            戲偶角色閣
          </h2>
          <p className="text-xs sm:text-sm text-[#bda380] mt-1 max-w-lg mx-auto">
            傳統皮影戲角色依行當分為生、旦、淨、末、丑。目前開放兩位經典主角供操偶師自由選擇。
          </p>
        </div>

        {/* Character Comparison Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* WARRIOR CARD */}
          <div
            onClick={() => {
              onSelectPuppet('warrior');
              puppetAudio.playGong(220, 1.2);
            }}
            className={`flex flex-col rounded-2xl p-5 border-2 transition-all cursor-pointer relative overflow-hidden ${
              currentPuppet === 'warrior'
                ? 'bg-gradient-to-b from-[#38160e] via-[#2a110a] to-[#1c0c07] border-[#e67e22] shadow-xl shadow-red-950/40'
                : 'bg-[#221308] border-[#573516] hover:border-[#8f5724]'
            }`}
          >
            {/* Active Check Badge */}
            {currentPuppet === 'warrior' && (
              <div className="absolute top-4 right-4 flex items-center gap-1 bg-[#a8241b] text-white text-[11px] font-bold px-2.5 py-1 rounded-full shadow-sm">
                <CheckCircle className="w-3.5 h-3.5" /> 已選取
              </div>
            )}

            {/* Character Title */}
            <div className="flex items-center gap-2 mb-3">
              <div className="p-2 rounded-xl bg-red-900/40 border border-red-700/60 text-red-400">
                <Shield className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-xl font-bold font-serif-tc text-[#faecd5]">
                  武將 (Warrior General)
                </h3>
                <span className="text-xs text-amber-400">行當：淨行 / 紅淨戰將</span>
              </div>
            </div>

            {/* Puppet Preview Box */}
            <div className="w-full h-64 bg-gradient-to-b from-[#fff2cf]/95 to-[#e6bd67]/90 rounded-xl overflow-hidden flex items-center justify-center p-2 mb-4 border border-[#7a4e23] relative">
              <div className="absolute inset-0 parchment-texture pointer-events-none" />
              <div className="w-full h-full scale-[0.6] flex items-center justify-center pointer-events-none">
                <PuppetRenderer
                  puppetId="warrior"
                  pose={DEFAULT_WARRIOR_POSE}
                  interactive={false}
                  showRods={true}
                  showJointHelpers={false}
                />
              </div>
            </div>

            {/* Stats & Description */}
            <p className="text-xs text-[#d4c1a5] leading-relaxed mb-3">
              頭戴傳統鳳翎赤金盔，面如重棗，美髯飄拂。身披鏤空魚鱗金鎖甲，外罩猩紅戰袍。手擎偃月長槍，擅長翻騰打鬥與威猛亮相。
            </p>

            <div className="grid grid-cols-2 gap-2 text-[11px] text-[#a8824f] border-t border-[#4a2e16] pt-3">
              <div>配賦道具：<strong>青龍偃月槍</strong></div>
              <div>操偶特色：<strong>剛勁威猛、武打翻飛</strong></div>
              <div>主要色彩：<strong>朱紅、金黃、墨黑</strong></div>
              <div>關節靈敏度：<strong>高段四肢連動</strong></div>
            </div>
          </div>

          {/* SCHOLAR CARD */}
          <div
            onClick={() => {
              onSelectPuppet('scholar');
              puppetAudio.playCymbal(0.8);
            }}
            className={`flex flex-col rounded-2xl p-5 border-2 transition-all cursor-pointer relative overflow-hidden ${
              currentPuppet === 'scholar'
                ? 'bg-gradient-to-b from-[#142938] via-[#0e1d28] to-[#08121a] border-[#2d7a6e] shadow-xl shadow-teal-950/40'
                : 'bg-[#221308] border-[#573516] hover:border-[#8f5724]'
            }`}
          >
            {/* Active Check Badge */}
            {currentPuppet === 'scholar' && (
              <div className="absolute top-4 right-4 flex items-center gap-1 bg-[#1d486c] text-white text-[11px] font-bold px-2.5 py-1 rounded-full shadow-sm">
                <CheckCircle className="w-3.5 h-3.5" /> 已選取
              </div>
            )}

            {/* Character Title */}
            <div className="flex items-center gap-2 mb-3">
              <div className="p-2 rounded-xl bg-teal-900/40 border border-teal-700/60 text-teal-400">
                <Feather className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-xl font-bold font-serif-tc text-[#faecd5]">
                  文生 (Scholar)
                </h3>
                <span className="text-xs text-teal-400">行當：小生 / 儒雅書生</span>
              </div>
            </div>

            {/* Puppet Preview Box */}
            <div className="w-full h-64 bg-gradient-to-b from-[#fff2cf]/95 to-[#e6bd67]/90 rounded-xl overflow-hidden flex items-center justify-center p-2 mb-4 border border-[#7a4e23] relative">
              <div className="absolute inset-0 parchment-texture pointer-events-none" />
              <div className="w-full h-full scale-[0.6] flex items-center justify-center pointer-events-none">
                <PuppetRenderer
                  puppetId="scholar"
                  pose={DEFAULT_SCHOLAR_POSE}
                  interactive={false}
                  showRods={true}
                  showJointHelpers={false}
                />
              </div>
            </div>

            {/* Stats & Description */}
            <p className="text-xs text-[#d4c1a5] leading-relaxed mb-3">
              頭戴鑲玉儒生綸巾，五官清雅俊朗。身著寶藍與湖水綠水雲寬袖大袍，下裾飾以繁複花草鏤雕。手持泥金彩繪摺扇，舉手投足溫潤如玉。
            </p>

            <div className="grid grid-cols-2 gap-2 text-[11px] text-[#a8824f] border-t border-[#4a2e16] pt-3">
              <div>配賦道具：<strong>泥金梅花摺扇</strong></div>
              <div>操偶特色：<strong>斯文禮敬、大袖飄逸</strong></div>
              <div>主要色彩：<strong>靛藍、青碧、象牙白</strong></div>
              <div>關節靈敏度：<strong>細膩弧度微操</strong></div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#d4af37] to-[#e67e22] text-[#1c0f05] font-semibold text-xs shadow-lg hover:opacity-95 transition-opacity cursor-pointer"
          >
            確認選角並返回
          </button>
        </div>
      </div>
    </div>
  );
};
