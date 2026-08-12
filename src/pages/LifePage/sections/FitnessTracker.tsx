import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  addFitnessRecord,
  getFitness,
  getAchievements,
  saveAchievements,
  unlockBadge,
  POINTS,
} from '@/lib/storage';
import { FITNESS_TYPES } from '@/lib/constants';
import type { IFitnessRecord } from '@/lib/storage';
import { Dumbbell, Flame, Calendar, Clock, Plus, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

export default function FitnessTracker() {
  const [fitnessState, setFitnessState] = useState(() => getFitness());
  const [showForm, setShowForm] = useState(false);
  const [type, setType] = useState(FITNESS_TYPES[0].id);
  const [customName, setCustomName] = useState('');
  const [duration, setDuration] = useState(30);

  const todayStr = new Date().toISOString().slice(0, 10);
  const todayDone = fitnessState.records.some((r) => r.date === todayStr);

  const totalDays = new Set(fitnessState.records.map((r) => r.date)).size;
  const totalMinutes = fitnessState.records.reduce((s, r) => s + r.duration, 0);

  // 本周统计
  const weekStats = (() => {
    const now = new Date();
    const dayOfWeek = now.getDay() || 7; // 周一=1, 周日=7
    const monday = new Date(now);
    monday.setDate(now.getDate() - dayOfWeek + 1);
    monday.setHours(0, 0, 0, 0);

    const weekRecords = fitnessState.records.filter(
      (r) => new Date(r.date).getTime() >= monday.getTime(),
    );
    const days = new Set(weekRecords.map((r) => r.date)).size;
    const totalMinutes = weekRecords.reduce((s, r) => s + r.duration, 0);
    return { days, totalMinutes };
  })();

  // 最近记录
  const recentRecords = [...fitnessState.records]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 10);

  const handleCheckIn = () => {
    if (duration <= 0) {
      toast.error('请输入有效时长');
      return;
    }
    let recordType = type;
    if (type === 'other') {
      if (!customName.trim()) {
        toast.error('请填写运动名称');
        return;
      }
      recordType = customName.trim();
    }
    const record: Omit<IFitnessRecord, 'id' | 'createdAt'> = {
      type: recordType,
      duration,
      date: todayStr,
    };
    const updated = addFitnessRecord(record);
    setFitnessState(updated);

    const achievements = getAchievements();
    achievements.totalPoints += POINTS.FITNESS;
    saveAchievements(achievements);

    // 徽章
    if (updated.streakDays === 7) unlockBadge('fitness-7days');

    toast.success(`健身打卡成功！+${POINTS.FITNESS} 积分 💪`);
    setShowForm(false);
    setCustomName('');
  };

  const getTypeMeta = (typeId: string) => {
    const match = FITNESS_TYPES.find((t) => t.id === typeId);
    if (match) return match;
    return { id: typeId, name: typeId, icon: '🏃' };
  };

  return (
    <div className="space-y-4">
      {/* 统计卡片 */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="grid grid-cols-3 gap-3"
      >
        <div className="rounded-2xl bg-gradient-to-br from-rose-100/70 to-red-100/60 p-3 text-center">
          <Flame className="mx-auto mb-1 size-5 text-rose-600" />
          <div className="text-xl font-bold text-foreground">{fitnessState.streakDays}</div>
          <div className="text-[11px] text-muted-foreground">连续天</div>
        </div>
        <div className="rounded-2xl bg-gradient-to-br from-rose-100/70 to-red-100/60 p-3 text-center">
          <Calendar className="mx-auto mb-1 size-5 text-rose-600" />
          <div className="text-xl font-bold text-foreground">{totalDays}</div>
          <div className="text-[11px] text-muted-foreground">累计天</div>
        </div>
        <div className="rounded-2xl bg-gradient-to-br from-rose-100/70 to-red-100/60 p-3 text-center">
          <Clock className="mx-auto mb-1 size-5 text-rose-600" />
          <div className="text-xl font-bold text-foreground">{totalMinutes}</div>
          <div className="text-[11px] text-muted-foreground">总分钟</div>
        </div>
      </motion.div>

      {/* 本周运动 */}
      <div className="rounded-2xl bg-card p-4 shadow-sm">
        <h3 className="mb-3 text-sm font-semibold text-foreground">本周运动</h3>
        <div className="flex items-end justify-between gap-2">
          <div className="flex-1">
            <div className="flex items-baseline gap-1">
              <span className="text-3xl font-bold text-rose-600">{weekStats.days}</span>
              <span className="text-sm text-muted-foreground">/ 7 天</span>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              本周累计运动 {weekStats.totalMinutes} 分钟
            </p>
          </div>
          <div className="text-right">
            <Dumbbell className="mx-auto size-8 text-rose-400" />
          </div>
        </div>
        <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-muted">
          <div
            className="h-full rounded-full bg-gradient-to-r from-rose-500 to-red-500"
            style={{ width: `${(weekStats.days / 7) * 100}%` }}
          />
        </div>
      </div>

      {/* 今日打卡按钮 */}
      {todayDone ? (
        <div className="flex items-center justify-center gap-2 rounded-xl bg-success/10 py-4 text-success">
          <Dumbbell className="size-5" />
          <span className="font-medium">今日已运动，继续保持！</span>
        </div>
      ) : (
        <button
          onClick={() => setShowForm(true)}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-rose-500 to-red-500 py-4 text-base font-semibold text-white shadow-md shadow-rose-500/20 transition-all hover:opacity-90 active:scale-[0.98]"
        >
          <Plus className="size-5" />
          开始运动打卡
        </button>
      )}

      {/* 运动记录列表 */}
      <div>
        <h3 className="mb-2 text-sm font-semibold text-foreground">最近记录</h3>
        {recentRecords.length === 0 ? (
          <div className="rounded-2xl bg-card p-8 text-center shadow-sm">
            <Dumbbell className="mx-auto mb-2 size-10 text-muted-foreground/50" />
            <p className="text-sm text-muted-foreground">还没有运动记录~</p>
            <p className="mt-1 text-xs text-muted-foreground/70">动起来，从今天开始</p>
          </div>
        ) : (
          <div className="space-y-2">
            {recentRecords.map((r) => {
              const meta = getTypeMeta(r.type);
              return (
                <div
                  key={r.id}
                  className="flex items-center gap-3 rounded-2xl bg-card p-3 shadow-sm"
                >
                  <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-rose-50 text-xl">
                    {meta?.icon ?? '🏃'}
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-medium text-foreground">
                      {meta?.name ?? r.type}
                    </div>
                    <div className="text-xs text-muted-foreground">{r.date}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-semibold text-rose-600">{r.duration} 分钟</div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 打卡表单弹窗 */}
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
              className="fixed bottom-0 left-1/2 z-50 w-full max-w-md -translate-x-1/2 rounded-t-3xl bg-card p-5 shadow-2xl"
            >
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-lg font-bold text-foreground">健身打卡</h3>
                <button
                  onClick={() => setShowForm(false)}
                  className="flex size-8 items-center justify-center rounded-full bg-muted text-muted-foreground hover:bg-accent"
                >
                  <X className="size-4" />
                </button>
              </div>

              {/* 运动类型 */}
              <div className="mb-4">
                <label className="mb-1.5 block text-sm font-medium text-foreground">运动类型</label>
                <div className="grid grid-cols-4 gap-2">
                  {FITNESS_TYPES.map((t) => (
                    <button
                      key={t.id}
                      onClick={() => setType(t.id)}
                      className={cn(
                        'flex flex-col items-center gap-1 rounded-xl p-2 text-xs transition-all',
                        type === t.id
                          ? 'bg-rose-50 ring-1 ring-rose-200'
                          : 'bg-muted/50 hover:bg-muted',
                      )}
                    >
                      <span className="text-lg">{t.icon}</span>
                      <span
                        className={cn(
                          type === t.id ? 'font-medium text-rose-700' : 'text-muted-foreground',
                        )}
                      >
                        {t.name}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* 其他运动名称 */}
              {type === 'other' && (
                <div className="mb-4">
                  <label className="mb-1.5 block text-sm font-medium text-foreground">
                    运动名称
                  </label>
                  <input
                    type="text"
                    value={customName}
                    onChange={(e) => setCustomName(e.target.value)}
                    placeholder="如：游泳、羽毛球..."
                    className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-rose-500/30"
                  />
                </div>
              )}

              {/* 时长 */}
              <div className="mb-5">
                <label className="mb-1.5 block text-sm font-medium text-foreground">
                  运动时长（分钟）
                </label>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setDuration(Math.max(5, duration - 5))}
                    className="flex size-10 items-center justify-center rounded-full bg-muted text-lg font-bold text-foreground hover:bg-accent"
                  >
                    -
                  </button>
                  <div className="flex-1 text-center">
                    <span className="text-3xl font-bold text-rose-600">{duration}</span>
                    <span className="ml-1 text-sm text-muted-foreground">分钟</span>
                  </div>
                  <button
                    onClick={() => setDuration(Math.min(180, duration + 5))}
                    className="flex size-10 items-center justify-center rounded-full bg-muted text-lg font-bold text-foreground hover:bg-accent"
                  >
                    +
                  </button>
                </div>
              </div>

              <button
                onClick={handleCheckIn}
                className="w-full rounded-xl bg-gradient-to-r from-rose-500 to-red-500 py-3 text-base font-semibold text-white shadow-md shadow-rose-500/20 transition-all hover:opacity-90 active:scale-[0.98]"
              >
                完成打卡
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
