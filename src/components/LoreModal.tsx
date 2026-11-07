import React from 'react';
import { X, BookOpen, Sparkles, Scroll, Lightbulb } from 'lucide-react';

interface LoreModalProps {
  onClose: () => void;
}

export const LoreModal: React.FC<LoreModalProps> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-2xl bg-[#1f1207] border-2 border-[#d4af37]/70 rounded-3xl p-6 sm:p-8 shadow-2xl relative max-h-[90vh] overflow-y-auto">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full bg-black/40 border border-[#73471f] text-[#d4af37] hover:text-white transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 rounded-2xl bg-amber-500/10 border border-[#d4af37]/40 text-[#d4af37]">
            <BookOpen className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-bold font-serif-tc text-[#faecd5]">
              臺灣皮影戲文化與操偶指南
            </h2>
            <p className="text-xs text-[#a8824f]">
              三百年高雄皮影戲脈絡 · 掌上光影乾坤
            </p>
          </div>
        </div>

        <div className="space-y-5 text-xs sm:text-sm text-[#e0cfb8] leading-relaxed">
          {/* Section 1 */}
          <div className="bg-[#2a170a] border border-[#5c3718] rounded-2xl p-4">
            <h3 className="text-base font-bold font-serif-tc text-amber-300 mb-2 flex items-center gap-1.5">
              <Scroll className="w-4 h-4 text-amber-400" />
              一、臺灣皮影戲傳承源流
            </h3>
            <p>
              皮影戲在臺灣又俗稱「皮猴戲」，明末清初由閩粵一帶傳入，全臺唯一的保存發祥地集中在高雄大社、岡山、路竹、彌陀一帶，如著名的「東華皮影劇團」、「宏興閣皮影劇團」等，是臺灣現存最古老的偶戲劇種之一。
            </p>
          </div>

          {/* Section 2 */}
          <div className="bg-[#2a170a] border border-[#5c3718] rounded-2xl p-4">
            <h3 className="text-base font-bold font-serif-tc text-amber-300 mb-2 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-amber-400" />
              二、皮影戲偶之精湛工藝
            </h3>
            <ul className="space-y-2 text-xs list-disc list-inside text-[#cfbaa0]">
              <li>
                <strong className="text-[#f5d799]">選材透光：</strong>多精選上等黃牛皮或水牛皮，經浸泡、刮薄、打磨至半透明質地。
              </li>
              <li>
                <strong className="text-[#f5d799]">陽刻與陰刻：</strong>以特製皮雕刀雕鑿出鱗甲、雲紋、花鳥等繁複鏤空花樣。
              </li>
              <li>
                <strong className="text-[#f5d799]">五彩敷色：</strong>以紅、黃、青、綠、黑等傳統礦植物顏料敷染，在燈光背投下晶瑩剔透。
              </li>
              <li>
                <strong className="text-[#f5d799]">連環扣綴結：</strong>頭部、軀幹、手臂、小臂、大腿與小腿拆分成十餘件，關節處以牛皮繩或黃銅釘牢固穿接。
              </li>
            </ul>
          </div>

          {/* Section 3 */}
          <div className="bg-[#2a170a] border border-[#5c3718] rounded-2xl p-4">
            <h3 className="text-base font-bold font-serif-tc text-amber-300 mb-2 flex items-center gap-1.5">
              <Lightbulb className="w-4 h-4 text-amber-400" />
              三、操偶心法與遊戲技巧
            </h3>
            <p className="mb-2">
              「一口道盡千古事，雙手對舞百萬兵。」在《影偶之間》遊戲中：
            </p>
            <ul className="space-y-1.5 text-xs text-[#cfbaa0]">
              <li>✦ <strong>拖曳關節：</strong>點擊戲偶的頭、肩、肘、腰、髖、膝任何發光點，以圓心角度轉動。</li>
              <li>✦ <strong>中心位移：</strong>點擊軀幹中心腰部金扣，可拖曳移動整尊戲偶在舞臺上的位置。</li>
              <li>✦ <strong>自創好戲：</strong>在「自由劇場」開啟錄製，隨心舞動手臂雙腿，還能伴奏傳統鑼鼓點！</li>
            </ul>
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#d4af37] to-[#e67e22] text-[#1c0f05] font-semibold text-xs shadow-lg hover:opacity-95 transition-opacity cursor-pointer"
          >
            領悟心法，開始操偶
          </button>
        </div>
      </div>
    </div>
  );
};
