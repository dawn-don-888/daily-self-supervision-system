import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import {
  getEnglishProgress,
  checkInEnglish,
  getAchievements,
  saveAchievements,
  unlockBadge,
  POINTS,
} from '@/lib/storage';
import { ENGLISH_SENTENCES, ENGLISH_READING_METHODS } from '@/data/english-sentences';
import { Volume2, Flame, Calendar, Clock, ChevronUp, ChevronDown, BookOpen, Check, Mic, Play, Pause, RotateCcw, Gauge, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

// ============ TTS 工具函数 ============
function warmupTTS() {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
  // 预热语音列表
  window.speechSynthesis.getVoices();
  if ('onvoiceschanged' in window.speechSynthesis) {
    window.speechSynthesis.onvoiceschanged = () => {
      window.speechSynthesis.getVoices();
    };
  }
  // iOS Safari 需要在用户手势里播放，这里只预热不发声
}

function isTTSSupported(): boolean {
  return typeof window !== 'undefined' && 'speechSynthesis' in window && 'SpeechSynthesisUtterance' in window;
}

// ============ 录音 MIME 检测 ============
function getSupportedMimeType(): string {
  if (typeof MediaRecorder === 'undefined' || !('isTypeSupported' in MediaRecorder)) return '';
  const candidates = [
    'audio/webm;codecs=opus',
    'audio/mp4',
    'audio/webm',
    'audio/ogg;codecs=opus',
    'audio/aac',
  ];
  for (const t of candidates) {
    try {
      if (MediaRecorder.isTypeSupported(t)) return t;
    } catch {
      // skip
    }
  }
  return '';
}

// ============ 语音识别特性检测 ============
interface ISpeechRecognition {
  lang: string;
  interimResults: boolean;
  onresult: ((e: { results: { transcript: string }[][] }) => void) | null;
  onerror: ((e: { error: string }) => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
}

type SpeechRecognitionCtor = new () => ISpeechRecognition;

function getSpeechRecognition(): SpeechRecognitionCtor | null {
  if (typeof window === 'undefined') return null;
  const w = window as unknown as {
    SpeechRecognition?: SpeechRecognitionCtor;
    webkitSpeechRecognition?: SpeechRecognitionCtor;
  };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
}

export default function EnglishLearning() {
  const [progress, setProgress] = useState(() => getEnglishProgress());
  const [minutes, setMinutes] = useState(15);
  const [showMethods, setShowMethods] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [rate, setRate] = useState(0.8);
  const [recording, setRecording] = useState(false);
  const [recordDuration, setRecordDuration] = useState(0);
  const [recordUrl, setRecordUrl] = useState<string | null>(null);
  const [isPlayingRecord, setIsPlayingRecord] = useState(false);
  const [recorderSupported, setRecorderSupported] = useState(true);
  const [recordPermissionError, setRecordPermissionError] = useState<string | null>(null);
  // 语音转文字相关
  const [speechSupported, setSpeechSupported] = useState(false);
  const [speechText, setSpeechText] = useState('');
  const [speechListening, setSpeechListening] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const recordTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const speechRecogRef = useRef<ISpeechRecognition | null>(null);
  const ttsSupported = isTTSSupported();

  const currentDay = progress.currentDay;
  const totalDays = ENGLISH_SENTENCES.length;
  const todaySentence = ENGLISH_SENTENCES.find((s) => s.day === currentDay) ?? ENGLISH_SENTENCES[0];
  const isTodayDone = progress.lastReadDate === new Date().toISOString().slice(0, 10);

  // TTS 朗读（必须在用户手势同步调用栈里触发，iOS Safari 限制）
  const speak = (text: string) => {
    if (!ttsSupported) {
      toast.error('当前浏览器不支持语音朗读');
      return;
    }
    window.speechSynthesis.cancel();
    const utter = new SpeechSynthesisUtterance(text);
    utter.lang = 'en-US';
    utter.rate = rate;
    utter.pitch = 1;
    utter.volume = 1;

    // 尝试找英语语音
    const voices = window.speechSynthesis.getVoices();
    const enVoice =
      voices.find((v) => v.lang.startsWith('en') && !v.localService) ??
      voices.find((v) => v.lang.startsWith('en'));
    if (enVoice && 'voice' in utter) {
      try {
        utter.voice = enVoice;
      } catch {
        // ignore
      }
    }

    utter.onstart = () => setIsSpeaking(true);
    utter.onend = () => setIsSpeaking(false);
    utter.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utter);
  };

  const stopSpeak = () => {
    if (ttsSupported) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  };

  useEffect(() => {
    // TTS 预热
    warmupTTS();
    // 检测录音支持
    if (typeof MediaRecorder === 'undefined') {
      setRecorderSupported(false);
    }
    // 检测语音识别支持
    setSpeechSupported(getSpeechRecognition() !== null);
    return () => {
      stopSpeak();
      stopRecording();
      stopSpeechRecognition();
      if (recordTimerRef.current) clearInterval(recordTimerRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 录音：支持 MIME 检测，兼容 iOS Safari（audio/mp4）
  const startRecording = async () => {
    if (!recorderSupported) {
      toast.error('当前浏览器不支持录音功能');
      return;
    }
    setRecordPermissionError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mimeType = getSupportedMimeType();
      const recorder = mimeType ? new MediaRecorder(stream, { mimeType }) : new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;
      audioChunksRef.current = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data);
      };

      recorder.onstop = () => {
        const finalType = mimeType || recorder.mimeType || 'audio/webm';
        const blob = new Blob(audioChunksRef.current, { type: finalType });
        const url = URL.createObjectURL(blob);
        if (recordUrl) {
          try { URL.revokeObjectURL(recordUrl); } catch { /* ignore */ }
        }
        setRecordUrl(url);
        stream.getTracks().forEach((t) => t.stop());
      };

      recorder.start();
      setRecording(true);
      setRecordDuration(0);

      recordTimerRef.current = setInterval(() => {
        setRecordDuration((d) => d + 1);
      }, 1000);
    } catch (e) {
      const err = e as { name?: string; message?: string };
      const msg =
        err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError'
          ? '请在浏览器设置中允许麦克风权限'
          : '无法访问麦克风，请检查权限设置';
      setRecordPermissionError(msg);
      toast.error(msg);
    }
  };

  // ============ 语音转文字（SpeechRecognition 或降级手动输入） ============
  const startSpeechRecognition = () => {
    const Ctor = getSpeechRecognition();
    if (!Ctor) return;
    try {
      const recog = new Ctor();
      recog.lang = 'zh-CN';
      recog.interimResults = true;
      speechRecogRef.current = recog;
      recog.onresult = (e) => {
        let transcript = '';
        for (let i = 0; i < e.results.length; i++) {
          transcript += e.results[i][0].transcript;
        }
        setSpeechText(transcript);
      };
      recog.onerror = (e) => {
        setSpeechListening(false);
        if (e.error !== 'no-speech') {
          toast.error('语音识别出错：' + e.error);
        }
      };
      recog.onend = () => {
        setSpeechListening(false);
      };
      recog.start();
      setSpeechListening(true);
      setSpeechText('');
    } catch (e) {
      toast.error('无法启动语音识别');
    }
  };

  const stopSpeechRecognition = () => {
    if (speechRecogRef.current) {
      try { speechRecogRef.current.stop(); } catch { /* ignore */ }
      speechRecogRef.current = null;
    }
    setSpeechListening(false);
  };

  const toggleSpeechRecognition = () => {
    if (speechListening) stopSpeechRecognition();
    else startSpeechRecognition();
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && recording) {
      mediaRecorderRef.current.stop();
      setRecording(false);
      if (recordTimerRef.current) clearInterval(recordTimerRef.current);
    }
  };

  const toggleRecording = () => {
    if (recording) stopRecording();
    else startRecording();
  };

  const playRecording = () => {
    if (!recordUrl || !audioRef.current) return;
    if (isPlayingRecord) {
      audioRef.current.pause();
      setIsPlayingRecord(false);
    } else {
      audioRef.current.play();
      setIsPlayingRecord(true);
    }
  };

  const formatRecordTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
  };

  const handleCheckIn = () => {
    if (isTodayDone) return;

    const updated = checkInEnglish(minutes);
    setProgress(updated);

    // 加积分
    const achievements = getAchievements();
    achievements.totalPoints += POINTS.ENGLISH_READ;
    saveAchievements(achievements);

    // 徽章检查
    if (updated.completedDays.length === 1) unlockBadge('english-beginner');
    if (updated.streakDays === 7) unlockBadge('english-7days');
    if (updated.streakDays === 30) unlockBadge('english-30days');

    toast.success(`朗读完成！+${POINTS.ENGLISH_READ} 积分 📖`);
  };

  const handlePrevDay = () => {
    if (currentDay <= 1) return;
    const updated = { ...progress, currentDay: currentDay - 1 };
    setProgress(updated);
  };

  const handleNextDay = () => {
    if (currentDay >= totalDays) return;
    const updated = { ...progress, currentDay: currentDay + 1 };
    setProgress(updated);
  };

  // 进度等级标签
  const levelLabel =
    todaySentence.level === 'beginner' ? '初级' : todaySentence.level === 'intermediate' ? '中级' : '高级';
  const levelColor =
    todaySentence.level === 'beginner'
      ? 'bg-blue-500/10 text-blue-600'
      : todaySentence.level === 'intermediate'
        ? 'bg-indigo-500/10 text-indigo-600'
        : 'bg-violet-500/10 text-violet-600';

  return (
    <div className="space-y-5">
      {/* 顶部统计 */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="grid grid-cols-3 gap-3"
      >
        <div className="rounded-2xl bg-gradient-to-br from-blue-100/60 to-cyan-100/60 p-3 text-center">
          <Flame className="mx-auto mb-1 size-5 text-blue-600" />
          <div className="text-xl font-bold text-foreground">{progress.streakDays}</div>
          <div className="text-[11px] text-muted-foreground">连续天</div>
        </div>
        <div className="rounded-2xl bg-gradient-to-br from-blue-100/60 to-cyan-100/60 p-3 text-center">
          <Calendar className="mx-auto mb-1 size-5 text-blue-600" />
          <div className="text-xl font-bold text-foreground">{progress.completedDays.length}</div>
          <div className="text-[11px] text-muted-foreground">累计天</div>
        </div>
        <div className="rounded-2xl bg-gradient-to-br from-blue-100/60 to-cyan-100/60 p-3 text-center">
          <Clock className="mx-auto mb-1 size-5 text-blue-600" />
          <div className="text-xl font-bold text-foreground">{progress.totalMinutes}</div>
          <div className="text-[11px] text-muted-foreground">总分钟</div>
        </div>
      </motion.div>

      {/* 今日朗读任务卡片 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="rounded-2xl bg-card p-5 shadow-sm"
      >
        <div className="mb-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="rounded-full bg-blue-500/10 px-3 py-1 text-xs font-medium text-blue-600">
              Day {currentDay} · {levelLabel}
            </span>
          </div>
          <div className="flex items-center gap-1 text-xs text-amber-500">
            <BookOpen className="size-3.5" />
            +{POINTS.ENGLISH_READ} 积分
          </div>
        </div>

        {/* 英文句子 */}
        <div className="mb-2 rounded-xl bg-gradient-to-br from-blue-50 to-cyan-50 p-4">
          <p className="text-lg font-semibold leading-relaxed text-blue-900">
            "{todaySentence.sentence}"
          </p>
        </div>

        {/* 朗读操作栏 */}
        <div className="mb-4 flex items-center gap-2">
          <button
            onClick={() => isSpeaking ? stopSpeak() : speak(todaySentence.sentence)}
            className={cn(
              'flex flex-1 items-center justify-center gap-1.5 rounded-xl py-2.5 text-sm font-medium transition-all',
              isSpeaking
                ? 'bg-blue-100 text-blue-700 ring-2 ring-blue-300'
                : 'bg-blue-500 text-white hover:bg-blue-600',
            )}
          >
            {isSpeaking ? <Pause className="size-4" /> : <Volume2 className="size-4" />}
            {isSpeaking ? '停止朗读' : '🔊 原文朗读'}
          </button>
          <button
            onClick={toggleRecording}
            className={cn(
              'flex flex-1 items-center justify-center gap-1.5 rounded-xl py-2.5 text-sm font-medium transition-all',
              recording
                ? 'bg-rose-100 text-rose-700 ring-2 ring-rose-300 animate-pulse'
                : 'bg-rose-500 text-white hover:bg-rose-600',
            )}
          >
            {recording ? <Mic className="size-4" /> : <Mic className="size-4" />}
            {recording ? `录音中 ${formatRecordTime(recordDuration)}` : '🎙️ 录音对比'}
          </button>
        </div>

        {/* 语速调节 */}
        <div className="mb-4 flex items-center gap-3 rounded-xl bg-muted/30 px-3 py-2">
          <Gauge className="size-4 shrink-0 text-muted-foreground" />
          <span className="shrink-0 text-xs text-muted-foreground">语速</span>
          <input
            type="range"
            min="0.5"
            max="1.5"
            step="0.1"
            value={rate}
            onChange={(e) => setRate(parseFloat(e.target.value))}
            className="h-1.5 flex-1 cursor-pointer appearance-none rounded-full bg-blue-200 accent-blue-500"
          />
          <span className="w-10 shrink-0 text-right text-xs font-medium text-blue-600 tabular-nums">
            {rate.toFixed(1)}x
          </span>
        </div>

        {/* 我的录音回放 */}
        {recordUrl && (
          <div className="mb-4 flex items-center gap-3 rounded-xl bg-rose-50 p-3">
            <button
              onClick={playRecording}
              className="flex size-10 shrink-0 items-center justify-center rounded-full bg-rose-500 text-white shadow-md shadow-rose-500/20 hover:bg-rose-600"
            >
              {isPlayingRecord ? <Pause className="size-4" /> : <Play className="size-4" />}
            </button>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-rose-700">🎤 我的录音</p>
              <p className="text-xs text-rose-600/70">跟原文对比，看看你的发音</p>
            </div>
            <button
              onClick={() => {
                URL.revokeObjectURL(recordUrl);
                setRecordUrl(null);
              }}
              className="flex size-8 shrink-0 items-center justify-center rounded-full text-rose-400 hover:bg-rose-100 hover:text-rose-600"
              title="重新录制"
            >
              <RotateCcw className="size-4" />
            </button>
            <audio
              ref={audioRef}
              src={recordUrl}
              onEnded={() => setIsPlayingRecord(false)}
              className="hidden"
            />
          </div>
        )}

        {/* 录音波形动画 */}
        {recording && (
          <div className="mb-4 flex items-center justify-center gap-1 py-2">
            {Array.from({ length: 24 }).map((_, i) => (
              <motion.div
                key={i}
                className="w-1 rounded-full bg-rose-400"
                animate={{ height: ['20%', `${20 + Math.random() * 80}%`, '20%'] }}
                transition={{
                  duration: 0.4 + Math.random() * 0.4,
                  repeat: Infinity,
                  repeatType: 'mirror',
                  delay: i * 0.03,
                }}
                style={{ height: '20px' }}
              />
            ))}
          </div>
        )}

        {!recorderSupported && (
          <div className="mb-4 rounded-xl bg-amber-50 p-3">
            <div className="flex items-start gap-2">
              <AlertCircle className="mt-0.5 size-4 shrink-0 text-amber-600" />
              <div className="flex-1">
                <p className="text-xs font-medium text-amber-700">当前浏览器不支持录音功能</p>
                <p className="text-[11px] text-amber-600/80">请使用 Chrome / Edge / Safari 浏览器，或直接在下方输入你想说的句子：</p>
              </div>
            </div>
            <textarea
              value={speechText}
              onChange={(e) => setSpeechText(e.target.value)}
              placeholder="输入你想说的英文句子，朗读后记录下来..."
              className="mt-2 w-full rounded-xl border border-amber-200 bg-white p-3 text-sm text-foreground focus:border-blue-400 focus:outline-none"
              rows={3}
            />
          </div>
        )}

        {recordPermissionError && (
          <div className="mb-4 rounded-xl bg-rose-50 p-3">
            <div className="flex items-start gap-2">
              <AlertCircle className="mt-0.5 size-4 shrink-0 text-rose-600" />
              <div className="flex-1">
                <p className="text-xs font-medium text-rose-700">{recordPermissionError}</p>
                <p className="text-[11px] text-rose-600/80">请在浏览器地址栏左侧的权限图标中允许麦克风访问</p>
              </div>
            </div>
          </div>
        )}

        {/* 语音转文字（支持时显示，不支持时隐藏） */}
        {recorderSupported && speechSupported && (
          <div className="mb-4">
            <button
              onClick={toggleSpeechRecognition}
              className={cn(
                'flex w-full items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-medium transition-all',
                speechListening
                  ? 'bg-violet-100 text-violet-700 ring-2 ring-violet-300 animate-pulse'
                  : 'bg-violet-500 text-white hover:bg-violet-600',
              )}
            >
              <Mic className="size-4" />
              {speechListening ? '正在听...点击停止' : '🎤 语音跟读（说出来）'}
            </button>
            {speechText && (
              <div className="mt-2 rounded-xl bg-violet-50 p-3 text-sm text-violet-800">
                <p className="mb-1 text-[11px] font-medium text-violet-600">识别结果</p>
                <p className="leading-relaxed">{speechText || '...'}</p>
              </div>
            )}
          </div>
        )}

        {/* 不支持语音识别但支持录音时，提供手动输入框 */}
        {recorderSupported && !speechSupported && (
          <div className="mb-4">
            <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
              跟读记录（你的浏览器不支持实时转文字，可手动输入）
            </label>
            <textarea
              value={speechText}
              onChange={(e) => setSpeechText(e.target.value)}
              placeholder="听完自己的录音后，把你说的句子写在这里..."
              className="w-full rounded-xl border border-border bg-background p-3 text-sm text-foreground focus:border-primary focus:outline-none"
              rows={2}
            />
          </div>
        )}

        {/* 中文翻译 */}
        <p className="mb-4 text-sm leading-relaxed text-muted-foreground">
          {todaySentence.translation}
        </p>

        {/* 朗读时长选择 */}
        {!isTodayDone && (
          <div className="mb-4">
            <label className="mb-1.5 block text-sm font-medium text-foreground">
              朗读时长（分钟）
            </label>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setMinutes(Math.max(5, minutes - 5))}
                className="flex size-9 items-center justify-center rounded-full bg-muted text-foreground hover:bg-accent"
              >
                <ChevronDown className="size-4" />
              </button>
              <div className="flex-1 text-center">
                <span className="text-2xl font-bold text-blue-600">{minutes}</span>
                <span className="ml-1 text-sm text-muted-foreground">分钟</span>
              </div>
              <button
                onClick={() => setMinutes(Math.min(60, minutes + 5))}
                className="flex size-9 items-center justify-center rounded-full bg-muted text-foreground hover:bg-accent"
              >
                <ChevronUp className="size-4" />
              </button>
            </div>
          </div>
        )}

        {isTodayDone ? (
          <div className="flex items-center justify-center gap-2 rounded-xl bg-success/10 py-3 text-success">
            <Check className="size-5" />
            <span className="font-medium">今日已朗读</span>
          </div>
        ) : (
          <button
            onClick={handleCheckIn}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-500 py-3.5 text-base font-semibold text-white shadow-md shadow-blue-500/20 transition-all hover:opacity-90 active:scale-[0.98]"
          >
            <Volume2 className="size-5" />
            朗读完成
          </button>
        )}
      </motion.div>

      {/* 左右切换天数 */}
      <div className="flex items-center justify-between">
        <button
          onClick={handlePrevDay}
          disabled={currentDay <= 1}
          className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground disabled:opacity-40"
        >
          上一句
        </button>
        <span className="text-sm font-medium text-foreground">Day {currentDay} / {totalDays}</span>
        <button
          onClick={handleNextDay}
          disabled={currentDay >= totalDays}
          className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground disabled:opacity-40"
        >
          下一句
        </button>
      </div>

      {/* 朗读方法论 */}
      <div className="overflow-hidden rounded-2xl bg-card shadow-sm">
        <button
          onClick={() => setShowMethods(!showMethods)}
          className="flex w-full items-center justify-between p-4 text-left"
        >
          <span className="text-sm font-semibold text-foreground">💡 朗读方法论</span>
          <ChevronDown
            className={cn(
              'size-4 text-muted-foreground transition-transform',
              showMethods && 'rotate-180',
            )}
          />
        </button>
        {showMethods && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            className="space-y-3 px-4 pb-4"
          >
            {ENGLISH_READING_METHODS.map((m, i) => (
              <div key={i} className="rounded-xl bg-muted/30 p-3">
                <p className="mb-1 text-sm font-medium text-foreground">{m.title}</p>
                <p className="text-xs leading-relaxed text-muted-foreground">{m.content}</p>
              </div>
            ))}
          </motion.div>
        )}
      </div>

      {/* 句子库预览 */}
      <div>
        <h3 className="mb-3 text-sm font-semibold text-foreground">句子库（部分预览）</h3>
        <div className="space-y-2">
          {ENGLISH_SENTENCES.slice(Math.max(0, currentDay - 2), Math.min(totalDays, currentDay + 3)).map(
            (s) => (
              <div
                key={s.day}
                className={cn(
                  'rounded-xl border p-3',
                  s.day === currentDay
                    ? 'border-blue-300 bg-blue-50/50'
                    : 'border-border bg-card',
                )}
              >
                <div className="mb-1 flex items-center gap-2">
                  <span className="text-[10px] font-medium text-muted-foreground">Day {s.day}</span>
                  <span
                    className={cn(
                      'rounded px-1.5 py-0.5 text-[10px]',
                      levelColor,
                    )}
                  >
                    {s.level === 'beginner' ? '初级' : s.level === 'intermediate' ? '中级' : '高级'}
                  </span>
                </div>
                <p className="text-sm font-medium text-foreground">{s.sentence}</p>
                <p className="mt-0.5 text-xs text-muted-foreground">{s.translation}</p>
              </div>
            ),
          )}
        </div>
      </div>
    </div>
  );
}
