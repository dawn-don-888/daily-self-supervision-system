import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ReactECharts from 'echarts-for-react';
import {
  getAipmProgress,
  saveAipmProgress,
  getAchievements,
  saveAchievements,
  unlockBadge,
  POINTS,
  addTodo,
  getTodos,
} from '@/lib/storage';
import { MOCK_AIPM_STAGES, MOCK_AIPM_TASKS } from '@/data/aipm-learning';
import { AIPM_PILLARS } from '@/lib/constants';
import { Check, Star, Lock, ChevronLeft, ChevronRight, ChevronDown, Lightbulb, Target, Briefcase, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

export default function AiPmLearning() {
  const [progress, setProgress] = useState(() => getAipmProgress());
  const [note, setNote] = useState('');
  const [showNoteInput, setShowNoteInput] = useState(false);
  const [showCoreThinking, setShowCoreThinking] = useState(false);

  const currentDay = progress.currentDay;
  const currentStage = MOCK_AIPM_STAGES.find(
    (s) => currentDay >= s.startDay && currentDay < s.startDay + s.totalDays,
  ) ?? MOCK_AIPM_STAGES[0];
  const dayInStage = currentDay - currentStage.startDay + 1;
  const stageProgress = ((dayInStage - 1) / currentStage.totalDays) * 100;
  const totalDays = 60;

  const todayTask = MOCK_AIPM_TASKS.find((t) => t.day === currentDay);
  const isTodayDone = progress.completedDays.includes(currentDay);

  // 四支柱进度（按每个支柱已完成天数 / 该支柱总天数）
  const pillarProgress = useMemo(() => {
    const pillars: Record<string, { done: number; total: number }> = {};
    AIPM_PILLARS.forEach((p) => {
      pillars[p.id] = { done: 0, total: 0 };
    });
    MOCK_AIPM_TASKS.forEach((task) => {
      if (pillars[task.pillar]) {
        pillars[task.pillar].total += 1;
        if (progress.completedDays.includes(task.day)) {
          pillars[task.pillar].done += 1;
        }
      }
    });
    return pillars;
  }, [progress.completedDays]);

  // 雷达图配置
  const radarOption = useMemo(() => {
    const indicator = AIPM_PILLARS.map((p) => ({
      name: p.name,
      max: 100,
    }));
    const values = AIPM_PILLARS.map((p) => {
      const pp = pillarProgress[p.id];
      return pp.total > 0 ? Math.round((pp.done / pp.total) * 100) : 0;
    });
    return {
      radar: {
        indicator,
        shape: 'polygon',
        radius: '65%',
        axisName: {
          color: '#92400e',
          fontSize: 11,
        },
        splitArea: {
          areaStyle: {
            color: ['rgba(168, 85, 247, 0.03)', 'rgba(168, 85, 247, 0.06)'],
          },
        },
        axisLine: { lineStyle: { color: 'rgba(168, 85, 247, 0.2)' } },
        splitLine: { lineStyle: { color: 'rgba(168, 85, 247, 0.15)' } },
      },
      series: [
        {
          type: 'radar',
          data: [
            {
              value: values,
              name: '学习进度',
              areaStyle: {
                color: 'rgba(168, 85, 247, 0.25)',
              },
              lineStyle: {
                color: '#a855f7',
                width: 2,
              },
              itemStyle: {
                color: '#a855f7',
              },
            },
          ],
        },
      ],
    };
  }, [pillarProgress]);

  const timelineDays = [];
  for (let d = Math.max(1, currentDay - 3); d <= Math.min(totalDays, currentDay + 4); d++) {
    const task = MOCK_AIPM_TASKS.find((t) => t.day === d);
    const stage = MOCK_AIPM_STAGES.find(
      (s) => d >= s.startDay && d < s.startDay + s.totalDays,
    );
    timelineDays.push({
      day: d,
      title: task?.title ?? `第${d}天`,
      stageName: stage?.name ?? '',
      stageId: stage?.id ?? 1,
      pillar: task?.pillar ?? 'tech',
      completed: progress.completedDays.includes(d),
      isToday: d === currentDay,
      isFuture: d > currentDay,
    });
  }

  const handleComplete = () => {
    if (isTodayDone) return;
    const newCompletedDays = [...progress.completedDays, currentDay];
    let stagesCompleted = [...progress.stagesCompleted];

    const stage = MOCK_AIPM_STAGES.find((s) => s.id === currentStage.id);
    if (stage) {
      const stageEndDay = stage.startDay + stage.totalDays - 1;
      if (currentDay === stageEndDay && !stagesCompleted.includes(stage.id)) {
        stagesCompleted.push(stage.id);
        if (stage.id === 1) unlockBadge('pm-beginner');
        toast.success(`🎉 恭喜完成${stage.name}阶段！`);
      }
    }

    const newProgress = { ...progress, completedDays: newCompletedDays, stagesCompleted };
    setProgress(newProgress);
    saveAipmProgress(newProgress);

    const achievements = getAchievements();
    achievements.totalPoints += POINTS.AIPM_TASK;
    saveAchievements(achievements);

    toast.success(`AI产品学习完成！+${POINTS.AIPM_TASK} 积分 🎯`);

    // 自动同步明日学习任务到待办
    const nextDayTask = MOCK_AIPM_TASKS.find((t) => t.day === currentDay + 1);
    if (nextDayTask) {
      const existing = getTodos();
      const alreadyExists = existing.items.some(
        (t) => t.text === `[AI产品] Day${currentDay + 1}：${nextDayTask.title}`,
      );
      if (!alreadyExists) {
        addTodo(`[AI产品] Day${currentDay + 1}：${nextDayTask.title}`);
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
    saveAipmProgress(newProgress);
    toast.success('学习笔记已保存 ✍️');
    setShowNoteInput(false);
  };

  const handlePrevDay = () => {
    if (currentDay <= 1) return;
    setProgress({ ...progress, currentDay: currentDay - 1 });
    saveAipmProgress({ ...progress, currentDay: currentDay - 1 });
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
    saveAipmProgress({ ...progress, currentDay: currentDay + 1 });
    setNote('');
    setShowNoteInput(false);
  };

  useEffect(() => {
    setNote(progress.notes[currentDay] ?? '');
  }, [currentDay, progress.notes]);

  const pillarMeta = AIPM_PILLARS.find((p) => p.id === todayTask?.pillar);

  return (
    <div className="space-y-5">
      {/* 知识地图雷达图 */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="rounded-2xl bg-gradient-to-br from-purple-100/60 to-pink-100/60 p-4"
      >
        <h3 className="mb-2 text-sm font-semibold text-foreground">🧭 知识地图</h3>
        <div className="h-56 w-full">
          <ReactECharts option={radarOption} style={{ height: '100%', width: '100%' }} />
        </div>
        <div className="grid grid-cols-2 gap-2">
          {AIPM_PILLARS.map((p) => {
            const pp = pillarProgress[p.id];
            const pct = pp.total > 0 ? Math.round((pp.done / pp.total) * 100) : 0;
            return (
              <div key={p.id} className="flex items-center gap-2">
                <span className="text-base">{p.icon}</span>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-foreground">{p.name}</span>
                    <span className="text-xs text-muted-foreground">{pct}%</span>
                  </div>
                  <div className="mt-0.5 h-1 w-full overflow-hidden rounded-full bg-white/60">
                    <div
                      className={`h-full rounded-full bg-gradient-to-r ${p.color}`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </motion.div>

      {/* 阶段进度 */}
      <div className="rounded-2xl bg-card p-4 shadow-sm">
        <div className="mb-1 flex items-center justify-between">
          <span className="text-sm font-semibold text-foreground">
            阶段{currentStage.id}：{currentStage.name}
          </span>
          <span className="text-xs text-muted-foreground">
            第 {dayInStage} 天 / {currentStage.totalDays} 天
          </span>
        </div>
        <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${stageProgress}%` }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            className="h-full rounded-full bg-gradient-to-r from-purple-500 to-pink-500"
          />
        </div>
      </div>

      {/* AI PM 核心思维卡片 */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.05 }}
        className="overflow-hidden rounded-2xl bg-gradient-to-br from-violet-500/10 to-purple-500/10 shadow-sm"
      >
        <button
          onClick={() => setShowCoreThinking(!showCoreThinking)}
          className="flex w-full items-center justify-between p-4 text-left"
        >
          <div className="flex items-center gap-2">
            <div className="flex size-8 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-purple-500 text-white">
              <Lightbulb className="size-4" />
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">AI PM 核心思维</p>
              <p className="text-[11px] text-muted-foreground">产品经理底层能力</p>
            </div>
          </div>
          <ChevronDown
            className={cn(
              'size-5 text-muted-foreground transition-transform',
              showCoreThinking && 'rotate-180',
            )}
          />
        </button>

        <AnimatePresence>
          {showCoreThinking && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="overflow-hidden"
            >
              <div className="space-y-3 px-4 pb-4">
                {/* 拆仿练创 */}
                <div className="rounded-xl bg-card p-3">
                  <div className="mb-2 flex items-center gap-1.5">
                    <Zap className="size-3.5 text-violet-500" />
                    <span className="text-xs font-semibold text-foreground">成长四步法：拆仿练创</span>
                  </div>
                  <div className="grid grid-cols-4 gap-1.5 text-center">
                    <div className="rounded-lg bg-violet-50 py-2">
                      <p className="text-sm font-bold text-violet-600">拆</p>
                      <p className="text-[9px] text-violet-500/80">建立领域地图</p>
                    </div>
                    <div className="rounded-lg bg-indigo-50 py-2">
                      <p className="text-sm font-bold text-indigo-600">仿</p>
                      <p className="text-[9px] text-indigo-500/80">向顶级样本靠近</p>
                    </div>
                    <div className="rounded-lg bg-amber-50 py-2">
                      <p className="text-sm font-bold text-amber-600">练</p>
                      <p className="text-[9px] text-amber-500/80">撞向卡点</p>
                    </div>
                    <div className="rounded-lg bg-emerald-50 py-2">
                      <p className="text-sm font-bold text-emerald-600">创</p>
                      <p className="text-[9px] text-emerald-500/80">知识网络化</p>
                    </div>
                  </div>
                </div>

                {/* 产品思维四问 */}
                <div className="rounded-xl bg-card p-3">
                  <div className="mb-2 flex items-center gap-1.5">
                    <Target className="size-3.5 text-purple-500" />
                    <span className="text-xs font-semibold text-foreground">产品思维四问</span>
                  </div>
                  <div className="space-y-1.5">
                    {[
                      { q: '用户是谁？', tag: 'Who' },
                      { q: '痛点是什么？', tag: 'Pain' },
                      { q: '方案是什么？', tag: 'How' },
                      { q: '为什么是现在？', tag: 'Why Now' },
                    ].map((item, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <span className="w-14 shrink-0 rounded bg-purple-100 px-2 py-0.5 text-center text-[10px] font-medium text-purple-700">
                          {item.tag}
                        </span>
                        <span className="text-xs text-foreground">{item.q}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* AI PM 日常 */}
                <div className="rounded-xl bg-card p-3">
                  <div className="mb-2 flex items-center gap-1.5">
                    <Briefcase className="size-3.5 text-fuchsia-500" />
                    <span className="text-xs font-semibold text-foreground">AI PM 日常</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {['拆产品', '写 PRD', '看数据', 'AB 测试', '跟开发', '用户访谈', '竞品分析', '对齐需求'].map((tag) => (
                      <span
                        key={tag}
                        className="rounded-full bg-fuchsia-50 px-2 py-1 text-[11px] text-fuchsia-600"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* 今日学习任务卡片 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="rounded-2xl bg-card p-5 shadow-sm"
      >
        <div className="mb-2 flex items-center justify-between">
          <span className="rounded-full bg-purple-500/10 px-3 py-1 text-xs font-medium text-purple-600">
            今日任务 · Day {currentDay}
          </span>
          <div className="flex items-center gap-1 text-xs text-amber-500">
            <Star className="size-3.5 fill-current" />
            +{POINTS.AIPM_TASK} 积分
          </div>
        </div>

        {pillarMeta && (
          <div className="mb-2 flex items-center gap-1.5">
            <span className="text-sm">{pillarMeta.icon}</span>
            <span className="text-xs text-muted-foreground">{pillarMeta.name}支柱</span>
          </div>
        )}

        <h2 className="mb-2 text-lg font-bold text-foreground">
          {todayTask?.title ?? `第${currentDay}天学习任务`}
        </h2>
        <p className="mb-5 text-sm leading-relaxed text-muted-foreground">
          {todayTask?.description ?? '每天最小一步，稳步前进~'}
        </p>

        {isTodayDone ? (
          <div className="flex items-center justify-center gap-2 rounded-xl bg-success/10 py-3 text-success">
            <Check className="size-5" />
            <span className="font-medium">已完成</span>
          </div>
        ) : (
          <button
            onClick={handleComplete}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 py-3.5 text-base font-semibold text-white shadow-md shadow-purple-500/20 transition-all hover:opacity-90 active:scale-[0.98]"
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
              className="mb-3 w-full resize-none rounded-xl border border-border bg-background px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-purple-500/30"
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
                    day.completed ? 'bg-purple-400/40' : 'bg-border',
                  )}
                />
              )}
              <div
                className={cn(
                  'relative z-10 flex size-8 shrink-0 items-center justify-center rounded-full',
                  day.isToday
                    ? 'bg-purple-500 text-white ring-4 ring-purple-500/20'
                    : day.completed
                      ? 'bg-purple-500 text-white'
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
                        ? 'font-semibold text-purple-600'
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
                        ? 'bg-purple-500/10 text-purple-600'
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
