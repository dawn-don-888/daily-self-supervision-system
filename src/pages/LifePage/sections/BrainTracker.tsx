import { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus,
  X,
  Brain,
  Sparkles,
  BookOpen,
  Mic2,
  PenTool,
  RotateCcw,
} from 'lucide-react';
import {
  getBrainState,
  addBrainRecord,
  type IBrainRecord,
  type BrainTrainingType,
} from '@/lib/storage';
import { getTodayStr, cn } from '@/lib/utils';
import { toast } from 'sonner';

const BRAIN_TYPES: {
  id: BrainTrainingType;
  name: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  bg: string;
  textColor: string;
}[] = [
  { id: 'reading', name: '深度阅读', icon: BookOpen, color: 'bg-fuchsia-500', bg: 'bg-fuchsia-50', textColor: 'text-fuchsia-600' },
  { id: 'english', name: '英语朗读', icon: Mic2, color: 'bg-sky-500', bg: 'bg-sky-50', textColor: 'text-sky-600' },
  { id: 'writing', name: '写作输出', icon: PenTool, color: 'bg-amber-500', bg: 'bg-amber-50', textColor: 'text-amber-600' },
  { id: 'meditation', name: '冥想', icon: Sparkles, color: 'bg-violet-500', bg: 'bg-violet-50', textColor: 'text-violet-600' },
  { id: 'review', name: '复盘思考', icon: RotateCcw, color: 'bg-emerald-500', bg: 'bg-emerald-50', textColor: 'text-emerald-600' },
];

const DURATION_OPTIONS = [5, 10, 15, 20, 30, 45, 60];

export default function BrainTracker() {
  const [state, setState] = useState(() => getBrainState());
  const [showForm, setShowForm] = useState(false);
  const todayStr = getTodayStr();

  const todayRecords = useMemo(
    () => state.records.filter((r) => r.date === todayStr),
    [state.records, todayStr],
  );

  const todayTotal = useMemo(
    () => todayRecords.reduce((sum, r) => sum + r.duration, 0),
    [todayRecords],
  );

  const streak = state.streakDays ?? 0;

  // 本周统计
  const weekStats = useMemo(() => {
    const days: { date: string; total: number; types: Record<string, number> }[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().slice(0, 10);
      const dayRecords = state.records.filter((r) => r.date === dateStr);
      const total = dayRecords.reduce((sum, r) => sum + r.duration, 0);
      const types: Record<string, number> = {};
      dayRecords.forEach((r) => {
        types[r.type] = (types[r.type] || 0) + r.duration;
      });
      days.push({ date: dateStr, total, types });
    }
    return days;
  }, [state.records]);

  const maxDayTotal = Math.max(...weekStats.map((d) => d.total), 1);

  const handleAdd = (data: { type: BrainTrainingType; duration: number; note?: string }) => {
    addBrainRecord({
      ...data,
      date: todayStr,
    });
    setState(getBrainState());
    setShowForm(false);
    toast.success(`+${data.duration}分钟健脑打卡成功 🧠`);
  };

  const handleDelete = (id: string) => {
    // 直接调用storage的方法不存在，用scopedStorage直接操作
    const state = getBrainState();
    const filtered = state.records.filter((r) => r.id !== id);
    state.records = filtered;
    // 重算streak
    const dates = new Set(filtered.map((r) => r.date));
    let newStreak = 0;
    const today = new Date();
    for (let i = 0; i < 365; i++) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().slice(0, 10);
      if (dates.has(dateStr)) {
        newStreak++;
      } else {
        if (i === 0) continue;
        break;
      }
    }
    state.streakDays = newStreak;
    if (filtered.length === 0) state.lastDate = undefined;
    // 直接通过 scopedStorage 写
    import('@lark-apaas/client-toolkit-lite').then(({ scopedStorage }) => {
      scopedStorage.setItem('__selfsuper_brain', JSON.stringify(state));
      setState(getBrainState());
    });
    toast.success('已删除');
  };

  const getTypeMeta = (typeId: string) => {
    return BRAIN_TYPES.find((t) => t.id === typeId) ?? BRAIN_TYPES[0];
  };

  return (
    <div className="space-y-4">
      {/* 顶部概览 */}
      <div className="rounded-2xl bg-gradient-to-br from-fuchsia-500 via-purple-500 to-violet-500 p-5 text-white shadow-lg shadow-fuchsia-500/20">
        <div className="mb-2 flex items-center gap-2">
          <Brain className="size-5" />
          <span className="text-sm font-medium opacity-90">健脑打卡</span>
        </div>
        <div className="mb-1 text-3xl font-bold">{todayTotal}<span className="text-base font-normal opacity-70"> 分钟</span></div>
        <p className="text-xs opacity-80">
          已连续 <span className="font-bold">{streak}</span> 天 · 认知训练日课
        </p>
      </div>

      {/* 本周趋势 */}
      <div className="rounded-2xl bg-card p-4 shadow-sm">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-foreground">本周健脑</h3>
          <span className="text-xs text-muted-foreground">
            共 {weekStats.reduce((s, d) => s + d.total, 0)} 分钟
          </span>
        </div>
        <div className="flex items-end justify-between gap-1.5">
          {weekStats.map((day, idx) => {
            const height = day.total === 0 ? 4 : Math.max(8, (day.total / maxDayTotal) * 80);
            const today = idx === 6;
            return (
              <div key={day.date} className="flex flex-1 flex-col items-center gap-1">
                <div
                  className={cn(
                    'w-full rounded-t-md transition-all',
                    today
                      ? 'bg-gradient-to-t from-fuchsia-500 to-violet-400'
                      : day.total > 0
                        ? 'bg-fuchsia-300/70'
                        : 'bg-muted',
                  )}
                  style={{ height: `${height}%`, minHeight: day.total > 0 ? '8px' : '4px' }}
                />
                <span className={cn('text-[10px]', today ? 'font-semibold text-fuchsia-600' : 'text-muted-foreground')}>
                  {['日', '一', '二', '三', '四', '五', '六'][new Date(day.date).getDay()]}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* 今日记录 */}
      <div className="rounded-2xl bg-card p-4 shadow-sm">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-foreground">今日记录</h3>
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-1 rounded-full bg-fuchsia-100 px-3 py-1.5 text-xs font-medium text-fuchsia-600 hover:bg-fuchsia-200"
          >
            <Plus className="size-3.5" />
            打卡
          </button>
        </div>
        {todayRecords.length === 0 ? (
          <div className="py-8 text-center">
            <Brain className="mx-auto mb-2 size-8 text-muted-foreground/30" />
            <p className="text-sm text-muted-foreground">还没开始健脑练习</p>
            <p className="mt-1 text-xs text-muted-foreground/70">每天15分钟，点亮大脑</p>
          </div>
        ) : (
          <div className="space-y-2">
            {todayRecords.map((record) => {
              const meta = getTypeMeta(record.type);
              const Icon = meta.icon;
              return (
                <motion.div
                  key={record.id}
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center gap-3 rounded-xl bg-muted/30 p-3"
                >
                  <div className={cn('flex size-10 shrink-0 items-center justify-center rounded-xl', meta.bg)}>
                    <Icon className={cn('size-5', meta.textColor)} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground">{meta.name}</p>
                    {record.note && (
                      <p className="truncate text-xs text-muted-foreground">{record.note}</p>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-foreground">{record.duration}<span className="text-xs font-normal text-muted-foreground">分</span></p>
                  </div>
                  <button
                    onClick={() => handleDelete(record.id)}
                    className="flex size-7 shrink-0 items-center justify-center rounded-full text-muted-foreground hover:bg-muted hover:text-rose-500"
                  >
                    <X className="size-3.5" />
                  </button>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      {/* 健脑说明 */}
      <div className="rounded-2xl bg-fuchsia-50/50 p-4">
        <div className="mb-2 flex items-center gap-2">
          <Sparkles className="size-4 text-fuchsia-500" />
          <span className="text-sm font-semibold text-fuchsia-700">什么是健脑？</span>
        </div>
        <p className="text-xs leading-relaxed text-fuchsia-700/80">
          健脑 = 认知训练。包括深度阅读、英语朗读、写作输出、冥想、复盘思考。
          每天主动使用大脑，就像给大脑做健身，保持思维敏锐度。
        </p>
      </div>

      {/* 添加表单 */}
      <AnimatePresence>
        {showForm && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-black/40"
              onClick={() => setShowForm(false)}
            />
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="fixed bottom-0 left-1/2 z-50 w-full max-w-md -translate-x-1/2 rounded-t-3xl bg-card p-5 pb-8 shadow-2xl"
            >
              <BrainForm onSubmit={handleAdd} onCancel={() => setShowForm(false)} />
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

function BrainForm({
  onSubmit,
  onCancel,
}: {
  onSubmit: (data: { type: BrainTrainingType; duration: number; note?: string }) => void;
  onCancel: () => void;
}) {
  const [type, setType] = useState<BrainTrainingType>('reading');
  const [duration, setDuration] = useState(15);
  const [customDuration, setCustomDuration] = useState('');
  const [note, setNote] = useState('');

  const finalDuration = customDuration ? parseInt(customDuration) || duration : duration;

  const handleSubmit = () => {
    if (finalDuration <= 0) {
      toast.error('请输入有效时长');
      return;
    }
    onSubmit({
      type,
      duration: finalDuration,
      note: note.trim() || undefined,
    });
  };

  const activeTypeMeta = BRAIN_TYPES.find((t) => t.id === type)!;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold text-foreground">健脑打卡</h3>
        <button
          onClick={onCancel}
          className="flex size-8 items-center justify-center rounded-full bg-muted text-muted-foreground hover:bg-accent"
        >
          <X className="size-4" />
        </button>
      </div>

      {/* 类型选择 */}
      <div>
        <label className="mb-2 block text-sm font-medium text-foreground">选择类型</label>
        <div className="grid grid-cols-5 gap-2">
          {BRAIN_TYPES.map((t) => {
            const Icon = t.icon;
            const active = type === t.id;
            return (
              <button
                key={t.id}
                onClick={() => setType(t.id)}
                className={cn(
                  'flex flex-col items-center gap-1 rounded-xl p-2 transition-all',
                  active ? 'bg-fuchsia-100 ring-2 ring-fuchsia-400' : 'bg-muted/50 hover:bg-muted',
                )}
              >
                <Icon className={cn('size-5', active ? t.textColor : 'text-muted-foreground')} />
                <span className={cn('text-[11px]', active ? t.textColor : 'text-muted-foreground')}>
                  {t.name}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 时长选择 */}
      <div>
        <label className="mb-2 block text-sm font-medium text-foreground">时长（分钟）</label>
        <div className="mb-2 grid grid-cols-4 gap-2">
          {DURATION_OPTIONS.map((d) => (
            <button
              key={d}
              onClick={() => {
                setDuration(d);
                setCustomDuration('');
              }}
              className={cn(
                'rounded-xl py-2 text-sm font-medium transition-colors',
                !customDuration && duration === d
                  ? 'bg-fuchsia-500 text-white'
                  : 'bg-muted text-foreground hover:bg-accent',
              )}
            >
              {d}分钟
            </button>
          ))}
        </div>
        <input
          type="number"
          value={customDuration}
          onChange={(e) => setCustomDuration(e.target.value)}
          placeholder="自定义时长"
          className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-fuchsia-500/30"
        />
      </div>

      {/* 备注 */}
      <div>
        <label className="mb-1.5 block text-sm font-medium text-foreground">备注（选填）</label>
        <input
          type="text"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="读了什么书 / 冥想了什么主题..."
          className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-fuchsia-500/30"
        />
      </div>

      <button
        onClick={handleSubmit}
        className={cn(
          'w-full rounded-xl py-3 text-sm font-semibold text-white shadow-md',
          activeTypeMeta.color,
          'shadow-fuchsia-500/20',
        )}
      >
        记录 {finalDuration} 分钟 {activeTypeMeta.name}
      </button>
    </div>
  );
}
