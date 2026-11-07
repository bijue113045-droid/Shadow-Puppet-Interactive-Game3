import React, { useState, useEffect, useRef } from 'react';
import { PuppetId, PuppetPose, DEFAULT_WARRIOR_POSE, DEFAULT_SCHOLAR_POSE, PerformanceRecording, RecordedFrame } from '../types/puppet';
import { PuppetRenderer } from './PuppetRenderer';
import { StageBackdrop, BackdropType } from './StageBackdrop';
import { puppetAudio } from '../utils/audio';
import {
  Play,
  Square,
  RotateCcw,
  Trash2,
  Save,
  Volume2,
  VolumeX,
  Sparkles,
  Layers,
  Sliders,
  Film,
  Music,
  Check,
  Download
} from 'lucide-react';

interface FreeTheaterModeProps {
  puppetId: PuppetId;
  onChangePuppet: (id: PuppetId) => void;
  onGoHome: () => void;
}

export const FreeTheaterMode: React.FC<FreeTheaterModeProps> = ({
  puppetId,
  onChangePuppet,
  onGoHome,
}) => {
  const [pose, setPose] = useState<PuppetPose>(
    puppetId === 'warrior' ? { ...DEFAULT_WARRIOR_POSE } : { ...DEFAULT_SCHOLAR_POSE }
  );
  const [backdrop, setBackdrop] = useState<BackdropType>('temple');
  const [showRods, setShowRods] = useState(true);
  const [showJointHelpers, setShowJointHelpers] = useState(true);
  const [isShadowOnly, setIsShadowOnly] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Recording State
  const [isRecording, setIsRecording] = useState(false);
  const [isPlayingBack, setIsPlayingBack] = useState(false);
  const [recordingFrames, setRecordingFrames] = useState<RecordedFrame[]>([]);
  const recordingStartTimeRef = useRef<number>(0);
  const playbackAnimRef = useRef<number | null>(null);
  const [playbackTime, setPlaybackTime] = useState(0);
  const [savedPerformances, setSavedPerformances] = useState<PerformanceRecording[]>([]);
  const [saveToast, setSaveToast] = useState(false);

  // Load saved performances from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem('shadow_puppet_performances');
      if (saved) {
        setSavedPerformances(JSON.parse(saved));
      }
    } catch {
      // ignore
    }
  }, []);

  // Update default pose when puppetId changes
  useEffect(() => {
    if (!isPlayingBack) {
      setPose(puppetId === 'warrior' ? { ...DEFAULT_WARRIOR_POSE } : { ...DEFAULT_SCHOLAR_POSE });
    }
  }, [puppetId]);

  // Handle pose changes during free manipulation
  const handlePoseChange = (newPose: PuppetPose) => {
    setPose(newPose);
    if (isRecording) {
      const now = performance.now();
      const relTime = Math.round(now - recordingStartTimeRef.current);
      setRecordingFrames((prev) => [...prev, { time: relTime, pose: { ...newPose } }]);
    }
  };

  // Start / Stop Recording
  const toggleRecording = () => {
    if (isRecording) {
      // Stop recording
      setIsRecording(false);
      puppetAudio.playDrum(120, 0.3);
    } else {
      // Start recording
      setRecordingFrames([{ time: 0, pose: { ...pose } }]);
      recordingStartTimeRef.current = performance.now();
      setIsRecording(true);
      setIsPlayingBack(false);
      puppetAudio.playGong(260, 1.2);
    }
  };

  // Playback Logic
  const startPlayback = (framesToPlay = recordingFrames) => {
    if (framesToPlay.length === 0) return;
    setIsPlayingBack(true);
    setIsRecording(false);
    puppetAudio.playGong(320, 1.2);

    const totalDuration = framesToPlay[framesToPlay.length - 1].time;
    const startTime = performance.now();

    const animate = () => {
      const elapsed = performance.now() - startTime;
      setPlaybackTime(elapsed);

      if (elapsed >= totalDuration) {
        // Playback finished
        setIsPlayingBack(false);
        setPose(framesToPlay[framesToPlay.length - 1].pose);
        return;
      }

      // Find surrounding frames for interpolation
      let curFrame = framesToPlay[0];
      for (let i = 0; i < framesToPlay.length; i++) {
        if (framesToPlay[i].time <= elapsed) {
          curFrame = framesToPlay[i];
        } else {
          break;
        }
      }

      setPose(curFrame.pose);
      playbackAnimRef.current = requestAnimationFrame(animate);
    };

    playbackAnimRef.current = requestAnimationFrame(animate);
  };

  const stopPlayback = () => {
    if (playbackAnimRef.current) {
      cancelAnimationFrame(playbackAnimRef.current);
    }
    setIsPlayingBack(false);
  };

  const resetPose = () => {
    stopPlayback();
    setPose(puppetId === 'warrior' ? { ...DEFAULT_WARRIOR_POSE } : { ...DEFAULT_SCHOLAR_POSE });
    puppetAudio.playBangzi();
  };

  const clearRecording = () => {
    stopPlayback();
    setRecordingFrames([]);
    setPlaybackTime(0);
    puppetAudio.playJointClick();
  };

  // Save current recording
  const saveCurrentPerformance = () => {
    if (recordingFrames.length < 2) return;
    const durationSec = Math.round(recordingFrames[recordingFrames.length - 1].time / 100) / 10;
    const newRecord: PerformanceRecording = {
      id: Date.now().toString(),
      name: `${puppetId === 'warrior' ? '武將' : '文生'}精彩折子戲 (${durationSec}秒)`,
      character: puppetId,
      duration: durationSec,
      createdAt: new Date().toLocaleTimeString('zh-TW', { hour: '2-digit', minute: '2-digit' }),
      frames: recordingFrames,
    };

    const updated = [newRecord, ...savedPerformances].slice(0, 10);
    setSavedPerformances(updated);
    try {
      localStorage.setItem('shadow_puppet_performances', JSON.stringify(updated));
    } catch {
      // ignore
    }
    puppetAudio.playCelebration();
    setSaveToast(true);
    setTimeout(() => setSaveToast(false), 2500);
  };

  const loadPerformance = (rec: PerformanceRecording) => {
    onChangePuppet(rec.character);
    setRecordingFrames(rec.frames);
    startPlayback(rec.frames);
  };

  const deleteSavedPerformance = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = savedPerformances.filter((p) => p.id !== id);
    setSavedPerformances(updated);
    try {
      localStorage.setItem('shadow_puppet_performances', JSON.stringify(updated));
    } catch {
      // ignore
    }
  };

  const maxDuration = recordingFrames.length > 0 ? recordingFrames[recordingFrames.length - 1].time : 0;

  return (
    <div className="w-full max-w-5xl mx-auto flex flex-col items-center gap-5 py-3 px-3 sm:px-6">
      {/* Top Header */}
      <div className="w-full flex items-center justify-between">
        <div>
          <span className="text-xs uppercase tracking-widest text-[#d4af37] font-semibold">FREE THEATER</span>
          <h2 className="text-xl sm:text-2xl font-bold font-serif-tc text-[#f5ebd9]">
            自由劇場 · 即興編排
          </h2>
        </div>

        {/* Puppet Character Switcher Tabs */}
        <div className="flex items-center gap-2 bg-[#201107] border border-[#5c3718] p-1 rounded-xl">
          <button
            onClick={() => onChangePuppet('warrior')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold font-serif-tc transition-all cursor-pointer ${
              puppetId === 'warrior'
                ? 'bg-gradient-to-r from-[#a8241b] to-[#d4881d] text-white shadow-sm'
                : 'text-[#a8824f] hover:text-[#f5ebd9]'
            }`}
          >
            武將（持槍）
          </button>
          <button
            onClick={() => onChangePuppet('scholar')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold font-serif-tc transition-all cursor-pointer ${
              puppetId === 'scholar'
                ? 'bg-gradient-to-r from-[#1d486c] to-[#2d7a6e] text-white shadow-sm'
                : 'text-[#a8824f] hover:text-[#f5ebd9]'
            }`}
          >
            文生（執扇）
          </button>

          <button
            onClick={onGoHome}
            className="ml-2 px-2.5 py-1 text-xs text-[#a8824f] hover:text-[#f5ebd9] transition-colors cursor-pointer"
          >
            回首頁
          </button>
        </div>
      </div>

      {/* STAGE AREA */}
      <div className="w-full flex flex-col items-center relative">
        <StageBackdrop type={backdrop}>
          <PuppetRenderer
            puppetId={puppetId}
            pose={pose}
            onPoseChange={handlePoseChange}
            interactive={!isPlayingBack}
            showRods={showRods}
            showJointHelpers={showJointHelpers}
            isShadowOnly={isShadowOnly}
          />
        </StageBackdrop>

        {/* Live Recording Indicator */}
        {isRecording && (
          <div className="absolute top-14 left-10 flex items-center gap-2 bg-red-950/80 border border-red-500/80 px-3 py-1 rounded-full text-red-300 text-xs font-semibold animate-pulse z-30">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500" />
            <span>錄製表演中... ({recordingFrames.length} 幀)</span>
          </div>
        )}

        {/* Live Playback Indicator */}
        {isPlayingBack && (
          <div className="absolute top-14 left-10 flex items-center gap-2 bg-amber-950/80 border border-amber-500/80 px-3 py-1 rounded-full text-amber-300 text-xs font-semibold z-30">
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>回放重播中...</span>
          </div>
        )}
      </div>

      {/* THEATER CONTROL BAR (Record, Playback, Reset, Scenery, Tools) */}
      <div className="w-full bg-[#1e1107] border border-[#573516] rounded-2xl p-4 shadow-xl flex flex-col gap-4">
        {/* Row 1: Recording & Playback Timeline */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#3d2410] pb-3">
          <div className="flex items-center gap-2">
            {/* Record Button */}
            <button
              onClick={toggleRecording}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                isRecording
                  ? 'bg-red-600 text-white animate-pulse shadow-lg shadow-red-600/30'
                  : 'bg-[#2e1708] border border-[#7a4e23] text-red-400 hover:bg-red-950/40'
              }`}
            >
              {isRecording ? <Square className="w-3.5 h-3.5 fill-current" /> : <span className="w-3 h-3 rounded-full bg-red-500" />}
              {isRecording ? '停止錄製' : '錄製表演'}
            </button>

            {/* Play / Replay Button */}
            <button
              onClick={() => (isPlayingBack ? stopPlayback() : startPlayback())}
              disabled={recordingFrames.length === 0}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                recordingFrames.length === 0
                  ? 'bg-[#2b1709]/50 text-[#73502d] cursor-not-allowed'
                  : isPlayingBack
                  ? 'bg-amber-600 text-white shadow-lg shadow-amber-500/20'
                  : 'bg-gradient-to-r from-[#d4af37] to-[#c28b29] text-[#1c0f05] hover:opacity-95'
              }`}
            >
              {isPlayingBack ? <Square className="w-3.5 h-3.5 fill-current" /> : <Play className="w-3.5 h-3.5 fill-current" />}
              {isPlayingBack ? '暫停重播' : '重播錄影'}
            </button>

            {/* Reset Pose */}
            <button
              onClick={resetPose}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-[#573516] bg-[#241308] text-[#e8dac1] hover:bg-[#3d220f] transition-colors text-xs cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5 text-amber-400" />
              <span>歸位重置</span>
            </button>

            {/* Clear Recording */}
            {recordingFrames.length > 0 && (
              <button
                onClick={clearRecording}
                className="p-2 rounded-xl border border-[#573516] bg-[#241308] text-[#a8824f] hover:text-red-400 hover:bg-[#3d220f] transition-colors cursor-pointer"
                title="清除目前錄製"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Save Recording */}
          {recordingFrames.length >= 2 && (
            <div className="flex items-center gap-2">
              <button
                onClick={saveCurrentPerformance}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#2e1a0b] border border-[#d4af37]/60 text-[#f5d799] hover:bg-[#42250f] text-xs font-semibold cursor-pointer"
              >
                <Save className="w-3.5 h-3.5 text-amber-400" />
                <span>儲存此段表演</span>
              </button>
              {saveToast && (
                <span className="text-xs text-emerald-400 flex items-center gap-1">
                  <Check className="w-3.5 h-3.5" /> 已存入劇目本
                </span>
              )}
            </div>
          )}
        </div>

        {/* Row 2: Traditional Percussion & Sound Effects Pad (鑼鼓點) */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#3d2410] pb-3">
          <div className="flex items-center gap-2 text-xs text-[#d4af37] font-serif-tc font-semibold">
            <Music className="w-4 h-4" />
            <span>現場鑼鼓伴奏：</span>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => puppetAudio.playGong(260, 1.8)}
              className="px-3.5 py-1.5 rounded-lg bg-[#361f0e] border border-[#a8742d]/60 text-[#f7e0a8] hover:bg-[#4a2b13] active:scale-95 transition-all text-xs font-serif-tc font-bold cursor-pointer"
            >
              🪙 大鑼 (Luo)
            </button>
            <button
              onClick={() => puppetAudio.playDrum(80, 0.45)}
              className="px-3.5 py-1.5 rounded-lg bg-[#361f0e] border border-[#a8742d]/60 text-[#f7e0a8] hover:bg-[#4a2b13] active:scale-95 transition-all text-xs font-serif-tc font-bold cursor-pointer"
            >
              🥁 堂鼓 (Drum)
            </button>
            <button
              onClick={() => puppetAudio.playCymbal(0.7)}
              className="px-3.5 py-1.5 rounded-lg bg-[#361f0e] border border-[#a8742d]/60 text-[#f7e0a8] hover:bg-[#4a2b13] active:scale-95 transition-all text-xs font-serif-tc font-bold cursor-pointer"
            >
              🔔 碰鐘 (Chime)
            </button>
            <button
              onClick={() => puppetAudio.playBangzi()}
              className="px-3.5 py-1.5 rounded-lg bg-[#361f0e] border border-[#a8742d]/60 text-[#f7e0a8] hover:bg-[#4a2b13] active:scale-95 transition-all text-xs font-serif-tc font-bold cursor-pointer"
            >
              🪵 梆子 (Woodblock)
            </button>
            <button
              onClick={() => puppetAudio.playCelebration()}
              className="px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-[#8a4e15] to-[#c28026] text-[#fff3cf] hover:opacity-90 active:scale-95 transition-all text-xs font-serif-tc font-bold cursor-pointer"
            >
              🎉 鑼鼓齊鳴
            </button>
          </div>
        </div>

        {/* Row 3: Stage Scenery & Visual Options */}
        <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
          {/* Backdrop Selectors */}
          <div className="flex items-center gap-2">
            <span className="text-[#a8824f]">戲臺背景：</span>
            {[
              { id: 'temple', name: '傳統廟埕' },
              { id: 'cloud', name: '雲海仙境' },
              { id: 'ink', name: '水墨山水' },
              { id: 'moon', name: '幽夜古月' },
            ].map((bg) => (
              <button
                key={bg.id}
                onClick={() => setBackdrop(bg.id as BackdropType)}
                className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer ${
                  backdrop === bg.id
                    ? 'bg-[#d4af37] text-[#1c0f05] font-semibold'
                    : 'bg-[#2b1709] text-[#c7aa83] hover:bg-[#3d220f]'
                }`}
              >
                {bg.name}
              </button>
            ))}
          </div>

          {/* Visual Toggles */}
          <div className="flex items-center gap-3 text-[#c7aa83]">
            <label className="flex items-center gap-1.5 cursor-pointer hover:text-white">
              <input
                type="checkbox"
                checked={showRods}
                onChange={(e) => setShowRods(e.target.checked)}
                className="accent-amber-500 rounded"
              />
              <span>操偶竹籤</span>
            </label>
            <label className="flex items-center gap-1.5 cursor-pointer hover:text-white">
              <input
                type="checkbox"
                checked={showJointHelpers}
                onChange={(e) => setShowJointHelpers(e.target.checked)}
                className="accent-amber-500 rounded"
              />
              <span>關節光圈</span>
            </label>
            <label className="flex items-center gap-1.5 cursor-pointer hover:text-white">
              <input
                type="checkbox"
                checked={isShadowOnly}
                onChange={(e) => setIsShadowOnly(e.target.checked)}
                className="accent-amber-500 rounded"
              />
              <span>古法純影模式</span>
            </label>
          </div>
        </div>
      </div>

      {/* SAVED PERFORMANCES DRAWER / LIST */}
      {savedPerformances.length > 0 && (
        <div className="w-full bg-[#1b1007] border border-[#4a2e16] rounded-2xl p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Film className="w-4 h-4 text-amber-400" />
              <h4 className="text-sm font-semibold font-serif-tc text-[#faecd5]">
                已存演目紀錄 ({savedPerformances.length})
              </h4>
            </div>
            <span className="text-xs text-[#a8824f]">點擊即可重現專屬操偶折子戲</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
            {savedPerformances.map((rec) => (
              <div
                key={rec.id}
                onClick={() => loadPerformance(rec)}
                className="flex items-center justify-between p-3 rounded-xl bg-[#281508] border border-[#5c3718] hover:border-[#d4af37] transition-all cursor-pointer group"
              >
                <div>
                  <div className="text-xs font-semibold text-[#f5ebd9] group-hover:text-amber-300">
                    {rec.name}
                  </div>
                  <div className="text-[11px] text-[#a8824f]">
                    {rec.createdAt} · {rec.character === 'warrior' ? '武將' : '文生'}
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  <Play className="w-4 h-4 text-amber-400 group-hover:scale-110 transition-transform" />
                  <button
                    onClick={(e) => deleteSavedPerformance(rec.id, e)}
                    className="p-1 rounded text-[#7a4e23] hover:text-red-400 transition-colors"
                    title="刪除"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
