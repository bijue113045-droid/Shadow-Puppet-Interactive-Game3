import React, { useState, useEffect } from 'react';
import { PerformanceRecording } from '../types/puppet';
import { X, Trophy, Star, Film, Trash2, Award, Play } from 'lucide-react';
import { puppetAudio } from '../utils/audio';

interface RecordsModalProps {
  onClose: () => void;
  onPlayRecording: (rec: PerformanceRecording) => void;
}

export const RecordsModal: React.FC<RecordsModalProps> = ({
  onClose,
  onPlayRecording,
}) => {
  const [levelScores, setLevelScores] = useState<Record<number, number>>({});
  const [performances, setPerformances] = useState<PerformanceRecording[]>([]);

  useEffect(() => {
    // Read level scores
    const scores: Record<number, number> = {};
    [1, 2, 3].forEach((lvl) => {
      const s = localStorage.getItem(`shadow_puppet_level_${lvl}`);
      if (s) scores[lvl] = parseInt(s, 10);
    });
    setLevelScores(scores);

    // Read performances
    try {
      const p = localStorage.getItem('shadow_puppet_performances');
      if (p) setPerformances(JSON.parse(p));
    } catch {
      // ignore
    }
  }, []);

  const clearAllData = () => {
    if (window.confirm('確定要清除所有挑戰成績與錄影紀錄嗎？')) {
      [1, 2, 3].forEach((lvl) => localStorage.removeItem(`shadow_puppet_level_${lvl}`));
      localStorage.removeItem('shadow_puppet_performances');
      setLevelScores({});
      setPerformances([]);
      puppetAudio.playJointClick();
    }
  };

  const deletePerformance = (id: string) => {
    const next = performances.filter((p) => p.id !== id);
    setPerformances(next);
    try {
      localStorage.setItem('shadow_puppet_performances', JSON.stringify(next));
    } catch {
      // ignore
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-2xl bg-[#1f1207] border-2 border-[#d4af37]/70 rounded-3xl p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full bg-black/40 border border-[#73471f] text-[#d4af37] hover:text-white transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 rounded-2xl bg-amber-500/10 border border-[#d4af37]/40 text-[#d4af37]">
            <Trophy className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-bold font-serif-tc text-[#faecd5]">
              成績與表演收藏館
            </h2>
            <p className="text-xs text-[#a8824f]">
              回顧您的操偶挑戰戰績與自創折子戲紀錄
            </p>
          </div>
        </div>

        {/* Section 1: Challenge Level Scores */}
        <div className="mb-6">
          <h3 className="text-sm font-semibold font-serif-tc text-[#f5ebd9] mb-3 flex items-center gap-2">
            <Award className="w-4 h-4 text-amber-400" />
            <span>關卡最佳戰績</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[
              { id: 1, name: '第一關：揮手示範' },
              { id: 2, name: '第二關：虔誠鞠躬' },
              { id: 3, name: '第三關：昂首邁步' },
            ].map((lvl) => {
              const score = levelScores[lvl.id] || 0;
              const hasPassed = score > 0;
              return (
                <div
                  key={lvl.id}
                  className="bg-[#2a170a] border border-[#5c3718] rounded-xl p-3.5 flex flex-col justify-between"
                >
                  <div className="text-xs text-[#a8824f] font-medium">{lvl.name}</div>
                  <div className="my-2">
                    {hasPassed ? (
                      <div className="flex items-center gap-1 text-amber-400">
                        <Star className="w-4 h-4 fill-current" />
                        <span className="text-lg font-bold font-mono tabular-nums">{score}</span>
                        <span className="text-xs text-[#806346]">分</span>
                      </div>
                    ) : (
                      <span className="text-xs text-[#73502d]">尚無挑戰成績</span>
                    )}
                  </div>
                  <div className="text-[11px] text-[#c9aa7d]">
                    {hasPassed ? '狀態：已通過考驗' : '狀態：未通關'}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Section 2: Saved Performances */}
        <div className="mb-6">
          <h3 className="text-sm font-semibold font-serif-tc text-[#f5ebd9] mb-3 flex items-center gap-2">
            <Film className="w-4 h-4 text-amber-400" />
            <span>自編折子戲收藏 ({performances.length})</span>
          </h3>

          {performances.length === 0 ? (
            <div className="p-8 text-center bg-[#251408] rounded-2xl border border-dashed border-[#573516]">
              <p className="text-xs text-[#a8824f]">
                尚無保存的戲碼！前往「自由劇場」按下錄製按鈕，即可保存專屬皮影表演。
              </p>
            </div>
          ) : (
            <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
              {performances.map((rec) => (
                <div
                  key={rec.id}
                  className="flex items-center justify-between p-3 rounded-xl bg-[#281508] border border-[#523214] hover:border-[#d4af37] transition-all"
                >
                  <div>
                    <div className="text-xs font-semibold text-[#f5ebd9]">{rec.name}</div>
                    <div className="text-[11px] text-[#a8824f]">
                      錄製於 {rec.createdAt} · 角色：{rec.character === 'warrior' ? '武將' : '文生'}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        onPlayRecording(rec);
                        onClose();
                      }}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#d4af37] text-[#1c0f05] text-xs font-semibold hover:opacity-90 transition-opacity cursor-pointer"
                    >
                      <Play className="w-3 h-3 fill-current" />
                      觀賞回放
                    </button>
                    <button
                      onClick={() => deletePerformance(rec.id)}
                      className="p-1.5 rounded-lg text-[#7a4e23] hover:text-red-400 hover:bg-black/30 transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Section 3: Reset Storage */}
        <div className="flex items-center justify-between border-t border-[#4a2e16] pt-4">
          <button
            onClick={clearAllData}
            className="text-xs text-[#80502c] hover:text-red-400 transition-colors cursor-pointer"
          >
            清除本機遊戲進度與所有紀錄
          </button>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-[#361f0e] border border-[#7a4e23] text-[#f5ebd9] text-xs font-semibold hover:bg-[#4a2b13] transition-colors cursor-pointer"
          >
            關閉
          </button>
        </div>
      </div>
    </div>
  );
};
