import React, { useState, useEffect, useRef } from 'react';
import { PuppetId, PuppetPose, DEFAULT_WARRIOR_POSE, DEFAULT_SCHOLAR_POSE, ChallengeLevel } from '../types/puppet';
import { PuppetRenderer } from './PuppetRenderer';
import { StageBackdrop } from './StageBackdrop';
import { puppetAudio } from '../utils/audio';
import { RotateCcw, Award, Star, ArrowRight, Eye, EyeOff, CheckCircle, Clock } from 'lucide-react';

interface ChallengeModeProps {
  puppetId: PuppetId;
  onGoHome: () => void;
  onGoToFreeTheater: () => void;
}

const CHALLENGE_LEVELS: ChallengeLevel[] = [
  {
    id: 1,
    title: '第一關：揮手示範',
    subtitle: '挑戰示範：揮手三次',
    description: '要求操偶師控制戲偶手臂，來回擺動小臂或大臂，完成三次標準的舞手致意動作。',
    targetPose: {
      ...DEFAULT_WARRIOR_POSE,
      rightUpperArm: 35,
      rightForearm: 25,
    },
    targetKeyJoints: ['rightUpperArm', 'rightForearm'],
    conditionText: '成功條件：手臂達到指定角度（大於 25°），並完成三次有效揮動。',
    type: 'wave',
    timeLimit: 40,
  },
  {
    id: 2,
    title: '第二關：虔誠鞠躬',
    subtitle: '挑戰示範：鞠躬致敬',
    description: '要求控制頭部與軀幹向前鞠躬傾斜，表現傳統戲曲中的長揖之禮。',
    targetPose: {
      ...DEFAULT_WARRIOR_POSE,
      torsoAngle: 16,
      headAngle: 14,
      rightUpperArm: 10,
      leftUpperArm: -10,
    },
    targetKeyJoints: ['torsoAngle', 'headAngle'],
    conditionText: '成功條件：身體前傾大於 14°，低頭大於 10°，並穩定保持 2 秒鐘。',
    type: 'bow',
    timeLimit: 35,
  },
  {
    id: 3,
    title: '第三關：昂首邁步',
    subtitle: '挑戰示範：行走步伐',
    description: '要求控制左右手臂與雙腿前後邁開，呈現皮影人物在舞臺上英氣凜然的邁步走相。',
    targetPose: {
      ...DEFAULT_WARRIOR_POSE,
      rightThigh: 25,
      rightShin: -20,
      leftThigh: -25,
      leftShin: 15,
      rightUpperArm: -20,
      leftUpperArm: 20,
    },
    targetKeyJoints: ['rightThigh', 'leftThigh', 'rightShin', 'leftShin'],
    conditionText: '成功條件：雙腿邁開跨度大於 40°，且四肢姿勢相似度達到 80% 以上。',
    type: 'walk',
    timeLimit: 45,
  },
];

export const ChallengeMode: React.FC<ChallengeModeProps> = ({
  puppetId,
  onGoHome,
  onGoToFreeTheater,
}) => {
  const [levelIndex, setLevelIndex] = useState(0);
  const currentLevel = CHALLENGE_LEVELS[levelIndex];

  const initialPose = puppetId === 'warrior' ? { ...DEFAULT_WARRIOR_POSE } : { ...DEFAULT_SCHOLAR_POSE };
  const [pose, setPose] = useState<PuppetPose>(initialPose);
  const [timeLeft, setTimeLeft] = useState(currentLevel.timeLimit);
  const [isPlaying, setIsPlaying] = useState(true);
  const [showGhost, setShowGhost] = useState(true);

  // Level 1: Wave tracking
  const [waveCount, setWaveCount] = useState(0);
  const [waveState, setWaveState] = useState<'high' | 'low'>('low');

  // Level 2: Bow hold tracking
  const [bowHoldTime, setBowHoldTime] = useState(0); // 0 to 2 seconds

  // Score & results
  const [showResultModal, setShowResultModal] = useState(false);
  const [finalScore, setFinalScore] = useState(0);
  const [starCount, setStarCount] = useState(0);

  // Compute similarity percentage
  const calculatePrecision = (): number => {
    let totalDiff = 0;
    const target = currentLevel.targetPose;
    const keys = currentLevel.targetKeyJoints;

    keys.forEach((key) => {
      const currentVal = (pose as unknown as Record<string, number>)[key];
      const targetVal = (target as unknown as Record<string, number>)[key];
      const diff = Math.abs(currentVal - targetVal);
      totalDiff += Math.min(diff, 90);
    });

    const maxDiff = keys.length * 90;
    const score = Math.max(0, Math.round((1 - totalDiff / maxDiff) * 100));
    return score;
  };

  const precision = calculatePrecision();

  // Reset for current level
  const resetLevel = () => {
    setPose(puppetId === 'warrior' ? { ...DEFAULT_WARRIOR_POSE } : { ...DEFAULT_SCHOLAR_POSE });
    setTimeLeft(currentLevel.timeLimit);
    setWaveCount(0);
    setWaveState('low');
    setBowHoldTime(0);
    setShowResultModal(false);
    setIsPlaying(true);
    puppetAudio.playBangzi();
  };

  // Timer countdown
  useEffect(() => {
    if (!isPlaying || showResultModal) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleGameOver(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isPlaying, showResultModal, levelIndex]);

  // Handle completion check on each pose change or tick
  useEffect(() => {
    if (!isPlaying || showResultModal) return;

    if (currentLevel.type === 'wave') {
      // Check arm waving oscillation
      const armAngle = Math.max(pose.rightUpperArm, pose.rightForearm);
      if (waveState === 'low' && armAngle > 22) {
        setWaveState('high');
        const newCount = waveCount + 1;
        setWaveCount(newCount);
        puppetAudio.playDrum(140, 0.2);
        if (newCount >= 3) {
          handleSuccess();
        }
      } else if (waveState === 'high' && armAngle < 8) {
        setWaveState('low');
      }
    } else if (currentLevel.type === 'bow') {
      // Check bow condition: torso >= 14 and head >= 10
      const isBowing = pose.torsoAngle >= 14 && pose.headAngle >= 10;
      if (isBowing) {
        setBowHoldTime((prev) => {
          const next = prev + 0.1;
          if (next >= 2.0) {
            handleSuccess();
          }
          return next;
        });
      } else {
        setBowHoldTime(0);
      }
    } else if (currentLevel.type === 'walk') {
      // Check walking stride condition
      const legStride = Math.abs(pose.rightThigh - pose.leftThigh) + Math.abs(pose.rightShin);
      if (legStride >= 40 && precision >= 75) {
        handleSuccess();
      }
    }
  }, [pose, waveState, waveCount, isPlaying, showResultModal, currentLevel]);

  const handleSuccess = () => {
    setIsPlaying(false);
    puppetAudio.playCelebration();

    // Calculate score
    const speedBonus = timeLeft * 10;
    const accuracyPoints = precision * 15;
    const total = 500 + speedBonus + accuracyPoints;
    setFinalScore(total);

    let stars = 1;
    if (total > 1200) stars = 3;
    else if (total > 850) stars = 2;
    setStarCount(stars);

    // Save high score to localStorage
    try {
      const storageKey = `shadow_puppet_level_${currentLevel.id}`;
      const existing = parseInt(localStorage.getItem(storageKey) || '0', 10);
      if (total > existing) {
        localStorage.setItem(storageKey, total.toString());
      }
    } catch {
      // ignore
    }

    setTimeout(() => {
      setShowResultModal(true);
    }, 400);
  };

  const handleGameOver = (success: boolean) => {
    if (!success) {
      puppetAudio.playGong(180, 1.2);
      setFinalScore(0);
      setStarCount(0);
      setShowResultModal(true);
      setIsPlaying(false);
    }
  };

  const handleNextLevel = () => {
    if (levelIndex < CHALLENGE_LEVELS.length - 1) {
      setLevelIndex((prev) => prev + 1);
      setPose(puppetId === 'warrior' ? { ...DEFAULT_WARRIOR_POSE } : { ...DEFAULT_SCHOLAR_POSE });
      setTimeLeft(CHALLENGE_LEVELS[levelIndex + 1].timeLimit);
      setWaveCount(0);
      setWaveState('low');
      setBowHoldTime(0);
      setShowResultModal(false);
      setIsPlaying(true);
    } else {
      onGoToFreeTheater();
    }
  };

  // Progress computation matching the user's attachment
  let progressText = '';
  let progressSegments = [false, false, false];

  if (currentLevel.type === 'wave') {
    progressText = `${Math.min(3, waveCount)} / 3`;
    progressSegments = [waveCount >= 1, waveCount >= 2, waveCount >= 3];
  } else if (currentLevel.type === 'bow') {
    const ratio = Math.min(1, bowHoldTime / 2.0);
    progressText = `${Math.round(ratio * 100)}% 禮成`;
    progressSegments = [ratio >= 0.33, ratio >= 0.66, ratio >= 1.0];
  } else {
    progressText = `${precision}% 姿態合度`;
    progressSegments = [precision >= 40, precision >= 70, precision >= 85];
  }

  return (
    <div className="w-full max-w-5xl mx-auto flex flex-col items-center gap-5 py-3 px-3 sm:px-6">
      {/* Top Bar with Level Info & Timer */}
      <div className="w-full flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs uppercase tracking-widest text-[#d4af37] font-semibold">CHALLENGE MODE</span>
            <span className="text-xs text-[#a8824f]">· {currentLevel.title}</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold font-serif-tc text-[#f5ebd9]">
            {currentLevel.subtitle}
          </h2>
        </div>

        <div className="flex items-center gap-3">
          {/* Timer Display */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#241308] border border-[#5c3718] text-[#f5d799] font-mono font-bold text-sm tabular-nums">
            <Clock className="w-4 h-4 text-amber-400" />
            <span>00:{timeLeft < 10 ? `0${timeLeft}` : timeLeft}</span>
          </div>

          {/* Toggle Target Ghost */}
          <button
            onClick={() => setShowGhost(!showGhost)}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-[#5c3718] bg-[#241308] text-[#e8dac1] hover:bg-[#3d220f] transition-colors text-xs cursor-pointer"
            title="開關目標影子參考"
          >
            {showGhost ? <Eye className="w-3.5 h-3.5 text-amber-400" /> : <EyeOff className="w-3.5 h-3.5 text-slate-400" />}
            <span className="hidden sm:inline">目標剪影</span>
          </button>

          <button
            onClick={resetLevel}
            className="p-1.5 rounded-lg border border-[#5c3718] bg-[#241308] text-[#e8dac1] hover:bg-[#3d220f] cursor-pointer"
            title="重設目前關卡"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          <button
            onClick={onGoHome}
            className="px-3 py-1.5 rounded-lg bg-black/40 border border-white/10 text-[#d4af37] hover:text-white transition-colors text-xs cursor-pointer"
          >
            選單
          </button>
        </div>
      </div>

      {/* CHALLENGE PROGRESS CARD (Faithful recreation of user's uploaded image UI) */}
      <div className="w-full bg-[#1b1007]/90 backdrop-blur border border-[#6b421d]/70 rounded-2xl p-5 shadow-2xl">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-base sm:text-lg font-bold font-serif-tc text-[#faecd5]">
            {currentLevel.subtitle}
          </h3>
          <div className="flex items-center gap-2">
            <span className="text-xs text-[#b89569]">任務進度</span>
            <span className="text-lg font-mono font-bold text-[#f5d799] tabular-nums">
              {progressText}
            </span>
          </div>
        </div>

        {/* 3-SEGMENT PROGRESS BAR */}
        <div className="grid grid-cols-3 gap-2 mb-3">
          {progressSegments.map((active, idx) => (
            <div
              key={idx}
              className={`h-2.5 rounded-full transition-all duration-300 ${
                active
                  ? 'bg-gradient-to-r from-[#c6923c] to-[#e6b04a] shadow-sm shadow-amber-500/30'
                  : 'bg-[#3b2311]/60'
              }`}
            />
          ))}
        </div>

        {/* Condition text */}
        <div className="text-xs sm:text-sm text-[#d4c1a5] flex items-center justify-between">
          <span>{currentLevel.conditionText}</span>
          <span className="text-xs text-[#a8824f] hidden md:inline">
            當前姿勢精準度：<strong className="text-[#f5d799]">{precision}%</strong>
          </span>
        </div>
      </div>

      {/* STAGE AREA */}
      <div className="w-full flex flex-col items-center">
        <StageBackdrop type="temple">
          <PuppetRenderer
            puppetId={puppetId}
            pose={pose}
            onPoseChange={(newPose) => setPose(newPose)}
            interactive={isPlaying}
            showRods={true}
            showJointHelpers={true}
            ghostPose={showGhost ? currentLevel.targetPose : null}
          />
        </StageBackdrop>
      </div>

      {/* LEVEL RESULT MODAL */}
      {showResultModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-[#241308] border-2 border-[#d4af37] rounded-2xl p-6 text-center shadow-2xl relative overflow-hidden">
            {/* Background filigree */}
            <div className="absolute inset-0 parchment-texture pointer-events-none" />

            {finalScore > 0 ? (
              <>
                <div className="w-16 h-16 rounded-full bg-amber-500/20 border-2 border-[#d4af37] mx-auto flex items-center justify-center text-[#d4af37] mb-3">
                  <Award className="w-8 h-8" />
                </div>
                <h3 className="text-2xl font-bold font-serif-tc text-[#faecd5] mb-1">
                  挑戰成功！功底深厚
                </h3>
                <p className="text-xs text-[#c9aa7d] mb-4">
                  {currentLevel.title} · 技藝過人，掌上翻飛
                </p>

                {/* Stars */}
                <div className="flex items-center justify-center gap-2 mb-4">
                  {[1, 2, 3].map((star) => (
                    <Star
                      key={star}
                      className={`w-7 h-7 transition-all ${
                        star <= starCount
                          ? 'fill-amber-400 text-amber-400 drop-shadow-md scale-110'
                          : 'text-[#4d2d14]'
                      }`}
                    />
                  ))}
                </div>

                <div className="bg-[#140b04] border border-[#4a2e16] rounded-xl p-3 mb-5 flex items-center justify-around text-xs">
                  <div>
                    <div className="text-[#a8824f]">剩餘時間</div>
                    <div className="text-base font-bold text-[#f5ebd9] font-mono">{timeLeft} 秒</div>
                  </div>
                  <div className="w-px h-8 bg-[#3d2410]" />
                  <div>
                    <div className="text-[#a8824f]">關卡得分</div>
                    <div className="text-base font-bold text-amber-400 font-mono">{finalScore} 分</div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={resetLevel}
                    className="flex-1 py-2.5 rounded-xl border border-[#7a4e23] bg-[#2b1709] text-[#f5ebd9] hover:bg-[#3d220f] transition-colors text-xs font-semibold cursor-pointer"
                  >
                    重新挑戰
                  </button>
                  <button
                    onClick={handleNextLevel}
                    className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-[#d4af37] to-[#e67e22] text-[#1c0f05] hover:opacity-95 font-semibold text-xs flex items-center justify-center gap-1.5 shadow-lg shadow-amber-500/20 cursor-pointer"
                  >
                    {levelIndex < CHALLENGE_LEVELS.length - 1 ? (
                      <>
                        進入下一關
                        <ArrowRight className="w-3.5 h-3.5" />
                      </>
                    ) : (
                      <>
                        前往自由劇場
                        <CheckCircle className="w-3.5 h-3.5" />
                      </>
                    )}
                  </button>
                </div>
              </>
            ) : (
              <>
                <div className="w-16 h-16 rounded-full bg-red-950/40 border-2 border-red-700/60 mx-auto flex items-center justify-center text-red-400 mb-3">
                  <RotateCcw className="w-8 h-8" />
                </div>
                <h3 className="text-2xl font-bold font-serif-tc text-[#faecd5] mb-1">
                  時間到，未達成動作
                </h3>
                <p className="text-xs text-[#c9aa7d] mb-5">
                  皮影戲考驗耐心與敏捷，重整旗鼓再來一次！
                </p>

                <div className="flex items-center gap-3">
                  <button
                    onClick={onGoHome}
                    className="flex-1 py-2.5 rounded-xl border border-white/10 bg-black/40 text-[#c9aa7d] hover:text-white text-xs cursor-pointer"
                  >
                    回主選單
                  </button>
                  <button
                    onClick={resetLevel}
                    className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-[#d4af37] to-[#e67e22] text-[#1c0f05] hover:opacity-95 font-semibold text-xs shadow-lg shadow-amber-500/20 cursor-pointer"
                  >
                    重新挑戰此關
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
