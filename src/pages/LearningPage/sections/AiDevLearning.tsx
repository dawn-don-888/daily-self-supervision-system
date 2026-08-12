import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  getLearningProgress,
  saveLearningProgress,
  getAchievements,
  saveAchievements,
  unlockBadge,
  POINTS,
  addTodo,
  getTodos,
} from '@/lib/storage';
import { MOCK_LEARNING_STAGES, MOCK_LEARNING_TASKS } from '@/data/learning-page';
import { Check, Star, Lock, ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

export default function AiDevLearning() {
  const [progress, setProgress] = useState(() => getLearningProgress());
  const [note, setNote] = useState('');
  const [showNoteInput, setShowNoteInput] = useState(false);

  const currentDay = progress.currentDay;
  const currentStage = MOCK_LEARNING_STAGES.find(
    (s) => currentDay >= s.startDay && currentDay < s.startDay + s.totalDays,
  ) ?? MOCK_LEARNING_STAGES[0];
  const dayInStage = currentDay - currentStage.startDay + 1;
  const stageProgress = ((dayInStage - 1) / currentStage.totalDays) * 100;
  const totalDays = 120;

  const todayTask = MOCK_LEARNING_TASKS.find((t) => t.day === currentDay);
  const isTodayDone = progress.completedDays.includes(currentDay);

  // 生成时间线数据
  const timelineDays = [];
  for (let d = Math.max(1, currentDay - 3); d <= Math.min(totalDays, currentDay + 4); d++) {
    const task = MOCK_LEARNING_TASKS.find((t) => t.day === d);
    const stage = MOCK_LEARNING_STAGES.find(
      (s) => d >= s.startDay && d < s.startDay + s.totalDays,
    );
    timelineDays.push({
      day: d,
      title: task?.title ?? `第${d}天学习任务`,
      description: task?.description,
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

    // 检查阶段是否完成
    const stage = MOCK_LEARNING_STAGES.find((s) => s.id === currentStage.id);
    if (stage) {
      const stageEndDay = stage.startDay + stage.totalDays - 1;
      const allStageDays = Array.from({ length: stage.totalDays }, (_, i) => stage.startDay + i);
      const allDone = allStageDays.every((d) => newCompletedDays.includes(d)) || currentDay === stageEndDay;
      if (allDone && !stagesCompleted.includes(stage.id)) {
        stagesCompleted.push(stage.id);
        // 徽章解锁
        if (stage.id === 1) unlockBadge('learner');
        if (stage.id === 2) unlockBadge('code-beginner');
        if (stage.id === 3) unlockBadge('ai-explorer');
        if (stage.id === 4) unlockBadge('creator');
        toast.success(`🎉 恭喜完成${stage.name}阶段！`);
      }
    }

    const newProgress = { ...progress, completedDays: newCompletedDays, stagesCompleted };
    setProgress(newProgress);
    saveLearningProgress(newProgress);

    // 加积分
    const achievements = getAchievements();
    achievements.totalPoints += POINTS.LEARNING_TASK;
    saveAchievements(achievements);

    toast.success(`学习任务完成！+${POINTS.LEARNING_TASK} 积分 🎉`);

    // 自动同步明日学习任务到待办
    const nextDayTask = MOCK_LEARNING_TASKS.find((t) => t.day === currentDay + 1);
    if (nextDayTask) {
      const existing = getTodos();
      const alreadyExists = existing.items.some(
        (t) => t.text === `[AI开发] Day${currentDay + 1}：${nextDayTask.title}`,
      );
      if (!alreadyExists) {
        addTodo(`[AI开发] Day${currentDay + 1}：${nextDayTask.title}`);
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
    saveLearningProgress(newProgress);
    toast.success('学习笔记已保存 ✍️');
    setShowNoteInput(false);
  };

  const handlePrevDay = () => {
    if (currentDay <= 1) return;
    const newProgress = { ...progress, currentDay: currentDay - 1 };
    setProgress(newProgress);
    saveLearningProgress(newProgress);
    setNote(progress.notes[currentDay - 1] ?? '');
    setShowNoteInput(false);
  };

  const handleNextDay = () => {
    if (currentDay >= totalDays) return;
    if (!isTodayDone) {
      toast.warning('先完成今天的任务再前进吧~');
      return;
    }
    const newProgress = { ...progress, currentDay: currentDay + 1 };
    setProgress(newProgress);
    saveLearningProgress(newProgress);
    setNote('');
    setShowNoteInput(false);
  };

  useEffect(() => {
    setNote(progress.notes[currentDay] ?? '');
  }, [currentDay, progress.notes]);

  return (
    <div className="space-y-5">
      {/* 顶部阶段进度 */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="rounded-2xl bg-gradient-to-r from-primary/10 to-amber-100/60 p-4"
      >
        <div className="mb-1 flex items-center justify-between">
          <span className="text-sm font-semibold text-foreground">
            阶段{currentStage.id}：{currentStage.name}
          </span>
          <span className="text-xs text-muted-foreground">
            第 {dayInStage} 天 / {currentStage.totalDays} 天
          </span>
        </div>
        <div className="mb-2 h-2 w-full overflow-hidden rounded-full bg-white/60">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${stageProgress}%` }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            className="h-full rounded-full bg-primary"
          />
        </div>
        <p className="text-xs text-muted-foreground">{currentStage.description}</p>
      </motion.div>

      {/* 今日学习任务卡片 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="rounded-2xl bg-card p-5 shadow-sm"
      >
        <div className="mb-2 flex items-center justify-between">
          <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
            今日任务 · Day {currentDay}
          </span>
          <div className="flex items-center gap-1 text-xs text-amber-500">
            <Star className="size-3.5 fill-current" />
            +{POINTS.LEARNING_TASK} 积分
          </div>
        </div>

        <h2 className="mb-2 text-lg font-bold text-foreground">
          {todayTask?.title ?? `第${currentDay}天学习任务`}
        </h2>
        <p className="mb-5 text-sm leading-relaxed text-muted-foreground">
          {todayTask?.description ?? '继续你的学习之旅，每天最小一步~'}
        </p>

        {isTodayDone ? (
          <div className="flex items-center justify-center gap-2 rounded-xl bg-success/10 py-3 text-success">
            <Check className="size-5" />
            <span className="font-medium">已完成</span>
          </div>
        ) : (
          <button
            onClick={handleComplete}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-3.5 text-base font-semibold text-primary-foreground shadow-md shadow-primary/20 transition-all hover:bg-primary/90 active:scale-[0.98]"
          >
            完成打卡
            <Check className="size-5" />
          </button>
        )}

        {/* 学习笔记输入 */}
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
              className="mb-3 w-full resize-none rounded-xl border border-border bg-background px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
            <button
              onClick={handleNoteSave}
              className="w-full rounded-xl bg-muted py-2.5 text-sm font-medium text-foreground hover:bg-muted/80"
            >
              保存笔记
            </button>
          </motion.div>
        )}

        {/* 已保存笔记显示 */}
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

      {/* 学习路径时间线 */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4, delay: 0.2 }}
      >
        <h3 className="mb-3 text-sm font-semibold text-foreground">学习路径</h3>
        <div className="space-y-0">
          {timelineDays.map((day, index) => (
            <motion.div
              key={day.day}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: 0.2 + index * 0.05 }}
              className="relative flex gap-3 pb-4"
            >
              {/* 时间线竖线 */}
              {index < timelineDays.length - 1 && (
                <div
                  className={cn(
                    'absolute left-[15px] top-[30px] h-full w-0.5',
                    day.completed ? 'bg-primary/40' : 'bg-border',
                  )}
                />
              )}

              {/* 圆点 */}
              <div
                className={cn(
                  'relative z-10 flex size-8 shrink-0 items-center justify-center rounded-full',
                  day.isToday
                    ? 'bg-primary text-primary-foreground ring-4 ring-primary/20'
                    : day.completed
                      ? 'bg-primary text-primary-foreground'
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

              {/* 内容 */}
              <div className="flex-1 pt-1">
                <div className="flex items-center gap-2">
                  <span
                    className={cn(
                      'text-xs',
                      day.isToday
                        ? 'font-semibold text-primary'
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
                        ? 'bg-primary/10 text-primary'
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
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
