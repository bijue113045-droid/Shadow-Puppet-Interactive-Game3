import React, { useState } from 'react';
import { PuppetId, PuppetPose, JointName, DEFAULT_WARRIOR_POSE, DEFAULT_SCHOLAR_POSE } from '../types/puppet';
import { PuppetRenderer } from './PuppetRenderer';
import { StageBackdrop } from './StageBackdrop';
import { puppetAudio } from '../utils/audio';
import { CheckCircle2, ChevronRight, RotateCcw, Sparkles } from 'lucide-react';

interface TutorialStep {
  id: number;
  title: string;
  targetJoint: JointName;
  instruction: string;
  tip: string;
  checkCompletion: (pose: PuppetPose) => boolean;
}

interface TutorialModeProps {
  puppetId: PuppetId;
  onFinishTutorial: () => void;
  onGoHome: () => void;
}

export const TutorialMode: React.FC<TutorialModeProps> = ({
  puppetId,
  onFinishTutorial,
  onGoHome,
}) => {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [pose, setPose] = useState<PuppetPose>(
    puppetId === 'warrior' ? { ...DEFAULT_WARRIOR_POSE } : { ...DEFAULT_SCHOLAR_POSE }
  );
  const [stepCompleted, setStepCompleted] = useState(false);
  const [hasCelebrated, setHasCelebrated] = useState(false);

  const tutorialSteps: TutorialStep[] = [
    {
      id: 1,
      title: '第一課：控制頭部俯仰',
      targetJoint: 'head',
      instruction: '將手指或滑鼠移動到戲偶的「頭部」，按住並上下拖曳，讓戲偶仰頭或低頭（角度達到 ±15° 以上）。',
      tip: '皮影戲偶由「領籤」牽引頭部，能表現出仰天長嘯或低頭沉思的豐富表情。',
      checkCompletion: (p) => Math.abs(p.headAngle) >= 15,
    },
    {
      id: 2,
      title: '第二課：控制手肘與揮動',
      targetJoint: 'rightForearm',
      instruction: '拖曳戲偶的「右小臂」或手腕關節，轉動角度達到 ±20° 以上，讓手部或道具自然舞動。',
      tip: '戲偶的手腕與手肘裝有黃銅連環釘扣，操偶師手腕微微轉動，長槍或摺扇便能靈動生姿。',
      checkCompletion: (p) => Math.abs(p.rightForearm) >= 20 || Math.abs(p.rightUpperArm) >= 25,
    },
    {
      id: 3,
      title: '第三課：控制雙腿邁步',
      targetJoint: 'rightThigh',
      instruction: '拖曳戲偶的「大腿」或「膝蓋」，將腿部向前或向後邁開（角度達到 ±20° 以上）。',
      tip: '皮影戲的角色行走時，前後雙腿交替擺動，配合操偶竹籤上下起伏，宛如真人漫步臺上。',
      checkCompletion: (p) => Math.abs(p.rightThigh) >= 20 || Math.abs(p.leftShin) >= 20,
    },
    {
      id: 4,
      title: '第四課：完成迎客揮手動作',
      targetJoint: 'rightUpperArm',
      instruction: '將戲偶的「右大臂」抬高至 25° 以上，完成熱情的招手迎客姿勢。',
      tip: '傳統開場時，文生或武將往往登場向臺下觀眾作揖招手，此為「出將」之儀。',
      checkCompletion: (p) => p.rightUpperArm >= 25 || p.rightForearm >= 25,
    },
    {
      id: 5,
      title: '第五課：完成恭敬鞠躬動作',
      targetJoint: 'torso',
      instruction: '拖曳中央「軀幹」，將身體向前傾斜大於 12°，並讓頭部順勢低垂，完成標準的拱手鞠躬。',
      tip: '鞠躬躬身時，腰部皮軸前屈，頭部隨之垂首，展現傳統禮樂之美。',
      checkCompletion: (p) => p.torsoAngle >= 12 && p.headAngle >= 8,
    },
  ];

  const currentStep = tutorialSteps[currentStepIndex];

  const handlePoseChange = (newPose: PuppetPose) => {
    setPose(newPose);
    if (!stepCompleted && currentStep.checkCompletion(newPose)) {
      setStepCompleted(true);
      if (!hasCelebrated) {
        puppetAudio.playCelebration();
        setHasCelebrated(true);
      }
    }
  };

  const handleNextStep = () => {
    if (currentStepIndex < tutorialSteps.length - 1) {
      setCurrentStepIndex((prev) => prev + 1);
      setStepCompleted(false);
      setHasCelebrated(false);
      // reset pose
      setPose(puppetId === 'warrior' ? { ...DEFAULT_WARRIOR_POSE } : { ...DEFAULT_SCHOLAR_POSE });
    } else {
      onFinishTutorial();
    }
  };

  const handleResetPose = () => {
    setPose(puppetId === 'warrior' ? { ...DEFAULT_WARRIOR_POSE } : { ...DEFAULT_SCHOLAR_POSE });
    setStepCompleted(false);
    setHasCelebrated(false);
    puppetAudio.playBangzi();
  };

  return (
    <div className="w-full max-w-5xl mx-auto flex flex-col items-center gap-6 py-4 px-3 sm:px-6">
      {/* Top Header */}
      <div className="w-full flex items-center justify-between">
        <div>
          <span className="text-xs uppercase tracking-widest text-[#d4af37] font-semibold">TUTORIAL MODE</span>
          <h2 className="text-xl sm:text-2xl font-bold font-serif-tc text-[#f5ebd9]">
            操偶入門教學
          </h2>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleResetPose}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#7a4e23]/60 bg-[#2b1709]/80 text-[#f5ebd9] hover:bg-[#3d220f] transition-colors text-xs font-medium cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            重置姿勢
          </button>
          <button
            onClick={onGoHome}
            className="px-3 py-1.5 rounded-lg bg-black/40 border border-white/10 text-[#d4af37] hover:text-white transition-colors text-xs cursor-pointer"
          >
            返回主選單
          </button>
        </div>
      </div>

      {/* Progress Track */}
      <div className="w-full bg-[#1e1208] border border-[#523315]/60 p-4 rounded-xl shadow-lg">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-[#f5d799] tracking-wider">
              {currentStep.title}
            </span>
            <span className="text-xs text-[#a8824f]">
              (第 {currentStepIndex + 1} / {tutorialSteps.length} 關)
            </span>
          </div>
          {stepCompleted ? (
            <span className="flex items-center gap-1 text-xs font-semibold text-emerald-400 animate-pulse">
              <CheckCircle2 className="w-4 h-4" />
              動作達成！
            </span>
          ) : (
            <span className="text-xs text-amber-300/80">操作中...</span>
          )}
        </div>

        {/* Step dots */}
        <div className="flex gap-2 mb-3">
          {tutorialSteps.map((s, idx) => (
            <div
              key={s.id}
              className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${
                idx < currentStepIndex
                  ? 'bg-[#d4af37]'
                  : idx === currentStepIndex
                  ? stepCompleted
                    ? 'bg-emerald-400'
                    : 'bg-amber-500'
                  : 'bg-[#3b2311]'
              }`}
            />
          ))}
        </div>

        <p className="text-sm text-[#e8dac1] leading-relaxed">
          {currentStep.instruction}
        </p>

        <div className="mt-2 text-xs text-[#b89569] italic">
          💡 文化小典故：{currentStep.tip}
        </div>
      </div>

      {/* Stage Area */}
      <div className="w-full flex flex-col items-center">
        <StageBackdrop type="temple">
          <PuppetRenderer
            puppetId={puppetId}
            pose={pose}
            onPoseChange={handlePoseChange}
            interactive={true}
            showRods={true}
            showJointHelpers={true}
            activeJointHighlight={currentStep.targetJoint}
          />
        </StageBackdrop>
      </div>

      {/* Action Footer */}
      <div className="w-full flex items-center justify-between bg-[#190d05] border border-[#4a2e16] p-4 rounded-xl">
        <div className="text-xs text-[#ba9a6d]">
          請用滑鼠或手指直接拖曳高亮光圈處的【{currentStep.targetJoint}】關節點
        </div>
        <button
          onClick={handleNextStep}
          disabled={!stepCompleted}
          className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-semibold text-sm transition-all duration-200 cursor-pointer ${
            stepCompleted
              ? 'bg-gradient-to-r from-[#d4af37] to-[#e67e22] text-[#1c0f05] shadow-lg shadow-amber-500/20 hover:scale-105 active:scale-95'
              : 'bg-[#332012] text-[#806346] cursor-not-allowed opacity-60'
          }`}
        >
          {currentStepIndex === tutorialSteps.length - 1 ? (
            <>
              <Sparkles className="w-4 h-4" />
              完成全部教學！前往挑戰
            </>
          ) : (
            <>
              下一步教學
              <ChevronRight className="w-4 h-4" />
            </>
          )}
        </button>
      </div>
    </div>
  );
};
