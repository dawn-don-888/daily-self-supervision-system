import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  getVibeProgress,
  saveVibeProgress,
  getAchievements,
  saveAchievements,
  unlockBadge,
  POINTS,
  addTodo,
  getTodos,
} from '@/lib/storage';
import { MOCK_VIBE_STAGES, MOCK_VIBE_TASKS } from '@/data/vibe-learning';
import { Check, Star, Lock, ChevronLeft, ChevronRight, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

export default function VibeLearning() {
  const [progress, setProgress] = useState(() => getVibeProgress());
  const [note, setNote] = useState('');
  const [showNoteInput, setShowNoteInput] = useState(false);

  const currentDay = progress.currentDay;
  const currentStage = MOCK_VIBE_STAGES.find(
    (s) => currentDay >= s.startDay && currentDay < s.startDay + s.totalDays,
  ) ?? MOCK_VIBE_STAGES[0];
  const dayInStage = currentDay - currentStage.startDay + 1;
  const stageProgress = ((dayInStage - 1) / currentStage.totalDays) * 100;
  const totalDays = 30;

  const todayTask = MOCK_VIBE_TASKS.find((t) => t.day === currentDay);
  const isTodayDone = progress.completedDays.includes(currentDay);

  const timelineDays = [];
  for (let d = Math.max(1, currentDay - 3); d <= Math.min(totalDays, currentDay + 4); d++) {
    const task = MOCK_VIBE_TASKS.find((t) => t.day === d);
    const stage = MOCK_VIBE_STAGES.find(
      (s) => d >= s.startDay && d < s.startDay + s.totalDays,
    );
    timelineDays.push({
      day: d,
      title: task?.title ?? `第${d}天`,
      stageName: stage?.name ?? '',
      stageId: stage?.id ?? 1,
      completed: progress.completedDays.includes(d),
      isToday: d === currentDay,
      isFuture: d > currentDay,
    });
  }

  const handleComplete = () => {
    if (isTodayDone) return;
    const newCompletedDays = [...progress.completedDays, currentDay];
    let stagesCompleted = [...progress.stagesCompleted];

    const stage = MOCK_VIBE_STAGES.find((s) => s.id === currentStage.id);
    if (stage) {
      const stageEndDay = stage.startDay + stage.totalDays - 1;
      if (currentDay === stageEndDay && !stagesCompleted.includes(stage.id)) {
        stagesCompleted.push(stage.id);
        if (stage.id === 1) unlockBadge('vibe-beginner');
        toast.success(`🎉 恭喜完成${stage.name}阶段！`);
      }
    }

    const newProgress = { ...progress, completedDays: newCompletedDays, stagesCompleted };
    setProgress(newProgress);
    saveVibeProgress(newProgress);

    const achievements = getAchievements();
    achievements.totalPoints += POINTS.VIBE_TASK;
    saveAchievements(achievements);

    toast.success(`Vibe Coding完成！+${POINTS.VIBE_TASK} 积分 ⚡`);

    // 自动同步明日学习任务到待办
    const nextDayTask = MOCK_VIBE_TASKS.find((t) => t.day === currentDay + 1);
    if (nextDayTask) {
      const existing = getTodos();
      const alreadyExists = existing.items.some(
        (t) => t.text === `[Vibe Coding] Day${currentDay + 1}：${nextDayTask.title}`,
      );
      if (!alreadyExists) {
        addTodo(`[Vibe Coding] Day${currentDay + 1}：${nextDayTask.title}`);
      }
    }

    setShowNoteInput(true);
  };

  const handleNoteSave = () => {
    if (!note.trim()) {
      setShowNoteInput(false);
      return;
    }
    const newNotes = { ...progress.notes, [currentDay]: note.trim() };
    const newProgress = { ...progress, notes: newNotes };
    setProgress(newProgress);
    saveVibeProgress(newProgress);
    toast.success('学习笔记已保存 ✍️');
    setShowNoteInput(false);
  };

  const handlePrevDay = () => {
    if (currentDay <= 1) return;
    setProgress({ ...progress, currentDay: currentDay - 1 });
    saveVibeProgress({ ...progress, currentDay: currentDay - 1 });
    setNote(progress.notes[currentDay - 1] ?? '');
    setShowNoteInput(false);
  };

  const handleNextDay = () => {
    if (currentDay >= totalDays) return;
    if (!isTodayDone) {
      toast.warning('先完成今天的任务再前进吧~');
      return;
    }
    setProgress({ ...progress, currentDay: currentDay + 1 });
    saveVibeProgress({ ...progress, currentDay: currentDay + 1 });
    setNote('');
    setShowNoteInput(false);
  };

  useEffect(() => {
    setNote(progress.notes[currentDay] ?? '');
  }, [currentDay, progress.notes]);

  return (
    <div className="space-y-5">
      {/* 阶段进度 */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="rounded-2xl bg-gradient-to-br from-emerald-100/60 to-teal-100/60 p-4"
      >
        <div className="mb-1 flex items-center justify-between">
          <span className="text-sm font-semibold text-foreground">
            阶段{currentStage.id}：{currentStage.name}
          </span>
          <span className="text-xs text-muted-foreground">
            第 {dayInStage} 天 / {currentStage.totalDays} 天
          </span>
        </div>
        <div className="h-2 w-full overflow-hidden rounded-full bg-white/60">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${stageProgress}%` }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-500"
          />
        </div>
        <div className="mt-3 flex items-start gap-2 rounded-xl bg-white/50 p-3">
          <Zap className="mt-0.5 shrink-0 size-4 text-emerald-600" />
          <p className="text-xs text-muted-foreground">
            Vibe Coding 是"用自然语言和AI对话来编程"，零基础也能做产品。
          </p>
        </div>
      </motion.div>

      {/* 今日学习任务卡片 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="rounded-2xl bg-card p-5 shadow-sm"
      >
        <div className="mb-2 flex items-center justify-between">
          <span className="rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-600">
            今日任务 · Day {currentDay}
          </span>
          <div className="flex items-center gap-1 text-xs text-amber-500">
            <Star className="size-3.5 fill-current" />
            +{POINTS.VIBE_TASK} 积分
          </div>
        </div>

        <h2 className="mb-2 text-lg font-bold text-foreground">
          {todayTask?.title ?? `第${currentDay}天学习任务`}
        </h2>
        <p className="mb-5 text-sm leading-relaxed text-muted-foreground">
          {todayTask?.description ?? '每天最小一步，动手做出东西~'}
        </p>

        {isTodayDone ? (
          <div className="flex items-center justify-center gap-2 rounded-xl bg-success/10 py-3 text-success">
            <Check className="size-5" />
            <span className="font-medium">已完成</span>
          </div>
        ) : (
          <button
            onClick={handleComplete}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 py-3.5 text-base font-semibold text-white shadow-md shadow-emerald-500/20 transition-all hover:opacity-90 active:scale-[0.98]"
          >
            完成打卡
            <Check className="size-5" />
          </button>
        )}

        {showNoteInput && (
          <motion.div
            initial={{ opacity: 0, height: 0, marginTop: 0 }}
            animate={{ opacity: 1, height: 'auto', marginTop: 16 }}
            className="overflow-hidden"
          >
            <label className="mb-1.5 block text-sm font-medium text-foreground">
              今天学到了什么？（选填）
            </label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="记录一下今天的收获吧~"
              rows={3}
              className="mb-3 w-full resize-none rounded-xl border border-border bg-background px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
            />
            <button
              onClick={handleNoteSave}
              className="w-full rounded-xl bg-muted py-2.5 text-sm font-medium text-foreground hover:bg-muted/80"
            >
              保存笔记
            </button>
          </motion.div>
        )}

        {isTodayDone && !showNoteInput && note && (
          <div className="mt-4 rounded-xl bg-muted/40 p-3">
            <p className="mb-1 text-xs font-medium text-foreground">📝 学习笔记</p>
            <p className="text-sm text-muted-foreground">{note}</p>
          </div>
        )}
      </motion.div>

      {/* 左右切换天数 */}
      <div className="flex items-center justify-between">
        <button
          onClick={handlePrevDay}
          disabled={currentDay <= 1}
          className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground disabled:opacity-40"
        >
          <ChevronLeft className="size-4" /> 上一天
        </button>
        <span className="text-sm font-medium text-foreground">Day {currentDay} / {totalDays}</span>
        <button
          onClick={handleNextDay}
          disabled={currentDay >= totalDays}
          className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground disabled:opacity-40"
        >
          下一天 <ChevronRight className="size-4" />
        </button>
      </div>

      {/* 时间线 */}
      <div>
        <h3 className="mb-3 text-sm font-semibold text-foreground">学习路径</h3>
        <div className="space-y-0">
          {timelineDays.map((day, index) => (
            <div key={day.day} className="relative flex gap-3 pb-4">
              {index < timelineDays.length - 1 && (
                <div
                  className={cn(
                    'absolute left-[15px] top-[30px] h-full w-0.5',
                    day.completed ? 'bg-emerald-400/40' : 'bg-border',
                  )}
                />
              )}
              <div
                className={cn(
                  'relative z-10 flex size-8 shrink-0 items-center justify-center rounded-full',
                  day.isToday
                    ? 'bg-emerald-500 text-white ring-4 ring-emerald-500/20'
                    : day.completed
                      ? 'bg-emerald-500 text-white'
                      : 'bg-muted text-muted-foreground',
                )}
              >
                {day.completed ? (
                  <Check className="size-4" />
                ) : day.isFuture ? (
                  <Lock className="size-3.5" />
                ) : (
                  <span className="text-xs font-medium">{day.day}</span>
                )}
              </div>
              <div className="flex-1 pt-1">
                <div className="flex items-center gap-2">
                  <span
                    className={cn(
                      'text-xs',
                      day.isToday
                        ? 'font-semibold text-emerald-600'
                        : day.completed
                          ? 'text-muted-foreground'
                          : 'text-muted-foreground/60',
                    )}
                  >
                    Day {day.day}
                  </span>
                  <span
                    className={cn(
                      'rounded px-1.5 py-0.5 text-[10px]',
                      day.isToday
                        ? 'bg-emerald-500/10 text-emerald-600'
                        : 'bg-muted text-muted-foreground',
                    )}
                  >
                    {day.stageName}
                  </span>
                </div>
                <p
                  className={cn(
                    'mt-0.5 text-sm',
                    day.isToday
                      ? 'font-medium text-foreground'
                      : day.completed
                        ? 'text-muted-foreground'
                        : 'text-muted-foreground/50',
                  )}
                >
                  {day.title}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
