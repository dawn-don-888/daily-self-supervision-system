import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import ReactECharts from 'echarts-for-react';
import {
  getAllDailyRecords,
  getLearningProgress,
  getAchievements,
  getEnglishProgress,
  getFitness,
  getAccounting,
  getTodos,
} from '@/lib/storage';
import { MOCK_LEARNING_STAGES } from '@/data/learning-page';
import {
  Flame,
  CalendarCheck,
  TrendingUp,
  Star,
  FileText,
  BookOpen,
  RotateCcw,
  Volume2,
  Dumbbell,
  Wallet,
  CheckSquare,
} from 'lucide-react';
import { CHART_COLORS } from '@/lib/chart-colors';
import WeeklyReportSection from './sections/WeeklyReportSection';

export default function StatsPage() {
  const [stats, setStats] = useState(() => computeStats());

  useEffect(() => {
    const refresh = () => setStats(computeStats());
    window.addEventListener('storage', refresh);
    return () => window.removeEventListener('storage', refresh);
  }, []);

  const heatmapOption = useMemo(() => getHeatmapOption(stats.heatmapData), [stats.heatmapData]);
  const moodOption = useMemo(() => getMoodOption(stats.moodTrend), [stats.moodTrend]);

  const totalLearningDays = MOCK_LEARNING_STAGES.reduce((sum, s) => sum + s.totalDays, 0);
  const learningProgress = (stats.learningCompletedDays / totalLearningDays) * 100;

  return (
    <div className="mx-auto max-w-md px-4 pb-20 pt-4">
      <motion.h1
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-4 text-xl font-bold text-foreground"
      >
        数据统计
      </motion.h1>

      {/* KPI 卡片 2x2 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="mb-5 grid grid-cols-2 gap-3"
      >
        <div className="rounded-2xl bg-card p-4 shadow-sm">
          <div className="mb-1 flex items-center gap-1.5 text-xs text-muted-foreground">
            <Flame className="size-3.5 text-orange-500" />
            连续打卡
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-bold text-foreground">{stats.streakDays}</span>
            <span className="text-xs text-muted-foreground">天</span>
          </div>
        </div>
        <div className="rounded-2xl bg-card p-4 shadow-sm">
          <div className="mb-1 flex items-center gap-1.5 text-xs text-muted-foreground">
            <CalendarCheck className="size-3.5 text-primary" />
            累计打卡
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-bold text-foreground">{stats.totalDays}</span>
            <span className="text-xs text-muted-foreground">天</span>
          </div>
        </div>
        <div className="rounded-2xl bg-card p-4 shadow-sm">
          <div className="mb-1 flex items-center gap-1.5 text-xs text-muted-foreground">
            <TrendingUp className="size-3.5 text-success" />
            本月打卡率
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-bold text-foreground">{stats.monthRate}</span>
            <span className="text-xs text-muted-foreground">%</span>
          </div>
        </div>
        <div className="rounded-2xl bg-card p-4 shadow-sm">
          <div className="mb-1 flex items-center gap-1.5 text-xs text-muted-foreground">
            <Star className="size-3.5 text-amber-500" />
            总积分
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-bold text-foreground">{stats.totalPoints}</span>
            <span className="text-xs text-muted-foreground">分</span>
          </div>
        </div>
      </motion.div>

      {/* 打卡热力图 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.05 }}
        className="mb-5 rounded-2xl bg-card p-4 shadow-sm"
      >
        <h3 className="mb-3 text-sm font-semibold text-foreground">打卡热力图</h3>
        <div className="h-36 w-full">
          <ReactECharts
            option={heatmapOption}
            style={{ height: '100%', width: '100%' }}
            opts={{ renderer: 'canvas' }}
          />
        </div>
        <div className="mt-2 flex items-center justify-end gap-1 text-[10px] text-muted-foreground">
          <span>少</span>
          <span className="size-2.5 rounded-sm bg-muted" />
          <span className="size-2.5 rounded-sm bg-amber-200" />
          <span className="size-2.5 rounded-sm bg-amber-400" />
          <span className="size-2.5 rounded-sm bg-amber-600" />
          <span>多</span>
        </div>
      </motion.div>

      {/* 心情趋势图 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="mb-5 rounded-2xl bg-card p-4 shadow-sm"
      >
        <h3 className="mb-2 text-sm font-semibold text-foreground">心情趋势（近30天）</h3>
        <div className="h-48 w-full">
          <ReactECharts
            option={moodOption}
            style={{ height: '100%', width: '100%' }}
            opts={{ renderer: 'canvas' }}
          />
        </div>
      </motion.div>

      {/* 学习进度 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.15 }}
        className="mb-5 rounded-2xl bg-card p-4 shadow-sm"
      >
        <h3 className="mb-3 text-sm font-semibold text-foreground">学习进度</h3>
        <div className="mb-2 flex items-center justify-between text-xs">
          <span className="text-muted-foreground">总体进度</span>
          <span className="font-medium text-foreground">
            {stats.learningCompletedDays} / {totalLearningDays} 天
          </span>
        </div>
        <div className="mb-4 h-2 w-full overflow-hidden rounded-full bg-muted">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${learningProgress}%` }}
            transition={{ duration: 0.8, ease: 'easeOut', delay: 0.3 }}
            className="h-full rounded-full bg-primary"
          />
        </div>

        <div className="space-y-2.5">
          {MOCK_LEARNING_STAGES.map((stage, idx) => {
            const stageProgress = getStageProgress(stats.learningCompletedDays, stage);
            return (
              <div key={stage.id}>
                <div className="mb-1 flex items-center justify-between text-xs">
                  <span className="text-foreground">阶段{stage.id} · {stage.name}</span>
                  <span className="text-muted-foreground">{Math.round(stageProgress)}%</span>
                </div>
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${stageProgress}%` }}
                    transition={{
                      duration: 0.6,
                      ease: 'easeOut',
                      delay: 0.4 + idx * 0.1,
                    }}
                    className="h-full rounded-full"
                    style={{ backgroundColor: CHART_COLORS[idx % CHART_COLORS.length] }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </motion.div>

      {/* 生活模块统计 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.175 }}
        className="mb-5 rounded-2xl bg-card p-4 shadow-sm"
      >
        <h3 className="mb-3 text-sm font-semibold text-foreground">生活习惯统计</h3>
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-xl bg-blue-50/50 p-3">
            <div className="mb-1 flex items-center gap-1.5">
              <Volume2 className="size-4 text-blue-500" />
              <span className="text-xs font-medium text-foreground">英语朗读</span>
            </div>
            <p className="text-xl font-bold text-blue-700">{stats.englishReadDays}</p>
            <p className="text-[11px] text-blue-500/70">累计朗读天数</p>
          </div>
          <div className="rounded-xl bg-rose-50/50 p-3">
            <div className="mb-1 flex items-center gap-1.5">
              <Dumbbell className="size-4 text-rose-500" />
              <span className="text-xs font-medium text-foreground">健身运动</span>
            </div>
            <p className="text-xl font-bold text-rose-700">{stats.fitnessDays}</p>
            <p className="text-[11px] text-rose-500/70">运动天数</p>
          </div>
          <div className="rounded-xl bg-amber-50/50 p-3">
            <div className="mb-1 flex items-center gap-1.5">
              <Wallet className="size-4 text-amber-600" />
              <span className="text-xs font-medium text-foreground">记账</span>
            </div>
            <p className="text-xl font-bold text-amber-700">
              {stats.accountingIncome >= 0 && stats.accountingIncome.toFixed(0)}
              {stats.accountingExpense > 0 ? '/-' + stats.accountingExpense.toFixed(0) : ''}
            </p>
            <p className="text-[11px] text-amber-600/70">收/支(元)</p>
          </div>
          <div className="rounded-xl bg-cyan-50/50 p-3">
            <div className="mb-1 flex items-center gap-1.5">
              <CheckSquare className="size-4 text-cyan-600" />
              <span className="text-xs font-medium text-foreground">待办</span>
            </div>
            <p className="text-xl font-bold text-cyan-700">{stats.todoCompletedRate}%</p>
            <p className="text-[11px] text-cyan-600/70">完成率</p>
          </div>
        </div>
      </motion.div>

      {/* 写作统计 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.2 }}
        className="rounded-2xl bg-card p-4 shadow-sm"
      >
        <h3 className="mb-3 text-sm font-semibold text-foreground">写作统计</h3>
        <div className="grid grid-cols-3 gap-3">
          <div className="text-center">
            <div className="mb-1 flex justify-center">
              <FileText className="size-5 text-primary" />
            </div>
            <p className="text-lg font-bold text-foreground">{stats.totalWords}</p>
            <p className="text-[11px] text-muted-foreground">累计字数</p>
          </div>
          <div className="text-center">
            <div className="mb-1 flex justify-center">
              <BookOpen className="size-5 text-primary" />
            </div>
            <p className="text-lg font-bold text-foreground">{stats.inspirationCount}</p>
            <p className="text-[11px] text-muted-foreground">知识启发</p>
          </div>
          <div className="text-center">
            <div className="mb-1 flex justify-center">
              <RotateCcw className="size-5 text-primary" />
            </div>
            <p className="text-lg font-bold text-foreground">{stats.reviewCount}</p>
            <p className="text-[11px] text-muted-foreground">复盘次数</p>
          </div>
        </div>
      </motion.div>

      {/* 每周报告 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.25 }}
      >
        <WeeklyReportSection />
      </motion.div>
    </div>
  );
}

// ============ 统计计算 ============

function computeStats() {
  const records = getAllDailyRecords();
  const achievements = getAchievements();
  const learningProgress = getLearningProgress();

  const dates = Object.keys(records).sort();
  const totalDays = dates.length;

  // 连续打卡天数
  let streakDays = 0;
  const today = new Date().toISOString().slice(0, 10);
  let checkDate = new Date(today);
  while (true) {
    const dateStr = checkDate.toISOString().slice(0, 10);
    if (records[dateStr] && records[dateStr].completedCount > 0) {
      streakDays++;
      checkDate.setDate(checkDate.getDate() - 1);
    } else {
      break;
    }
  }

  // 本月打卡率
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const daysInMonthSoFar = now.getDate();
  let monthCheckedIn = 0;
  for (let d = new Date(monthStart); d <= now; d.setDate(d.getDate() + 1)) {
    const ds = d.toISOString().slice(0, 10);
    if (records[ds] && records[ds].completedCount > 0) {
      monthCheckedIn++;
    }
  }
  const monthRate = daysInMonthSoFar > 0 ? Math.round((monthCheckedIn / daysInMonthSoFar) * 100) : 0;

  // 热力图数据（最近 180 天）
  const heatmapData: [string, number][] = [];
  const heatmapStart = new Date(today);
  heatmapStart.setDate(heatmapStart.getDate() - 179);
  for (let d = new Date(heatmapStart); d <= new Date(today); d.setDate(d.getDate() + 1)) {
    const ds = d.toISOString().slice(0, 10);
    heatmapData.push([ds, records[ds]?.completedCount ?? 0]);
  }

  // 心情趋势（近 30 天）
  const moodTrend: { date: string; score: number }[] = [];
  const moodStart = new Date(today);
  moodStart.setDate(moodStart.getDate() - 29);
  for (let d = new Date(moodStart); d <= new Date(today); d.setDate(d.getDate() + 1)) {
    const ds = d.toISOString().slice(0, 10);
    const score = records[ds]?.mood?.score ?? 0;
    moodTrend.push({ date: ds, score });
  }

  // 累计字数
  let totalWords = 0;
  let inspirationCount = 0;
  let reviewCount = 0;
  Object.values(records).forEach((r) => {
    if (r.question?.answer) totalWords += r.question.answer.length;
    if (r.mood?.reason) totalWords += r.mood.reason.length;
    if (r.review?.goodPoint) totalWords += r.review.goodPoint.length;
    if (r.review?.nextStep) totalWords += r.review.nextStep.length;
    if (r.learningNote) totalWords += r.learningNote.length;
    if (r.inspirations) {
      inspirationCount += r.inspirations.length;
      r.inspirations.forEach((i) => {
        totalWords += (i.content?.length ?? 0) + (i.insight?.length ?? 0);
      });
    }
    if (r.review?.goodPoint && r.review?.nextStep) reviewCount++;
  });

  return {
    streakDays,
    totalDays,
    monthRate,
    totalPoints: achievements.totalPoints,
    heatmapData,
    moodTrend,
    totalWords,
    inspirationCount,
    reviewCount,
    learningCompletedDays: learningProgress.completedDays.length,
    englishReadDays: getEnglishProgress().completedDays.length,
    fitnessDays: new Set(getFitness().records.map((r) => r.date)).size,
    accountingIncome: getAccounting().records.filter((r) => r.type === 'income').reduce((s, r) => s + r.amount, 0),
    accountingExpense: getAccounting().records.filter((r) => r.type === 'expense').reduce((s, r) => s + r.amount, 0),
    todoCompletedRate: computeTodoRate(),
  };
}

function getStageProgress(completedDays: number, stage: { startDay: number; totalDays: number }) {
  const stageEnd = stage.startDay + stage.totalDays - 1;
  if (completedDays < stage.startDay - 1) return 0;
  if (completedDays >= stageEnd) return 100;
  const doneInStage = completedDays - stage.startDay + 1;
  return (doneInStage / stage.totalDays) * 100;
}

function computeTodoRate(): number {
  const todos = getTodos();
  if (todos.items.length === 0) return 0;
  const done = todos.items.filter((t) => t.done).length;
  return Math.round((done / todos.items.length) * 100);
}

// ============ ECharts Options ============

function getHeatmapOption(data: [string, number][]) {
  const dates = data.map((d) => d[0]);
  const values = data.map((d) => [d[0], 0, d[1]]);

  return {
    grid: { left: 0, right: 0, top: 0, bottom: 20, containLabel: false },
    xAxis: {
      type: 'category',
      data: dates,
      show: false,
    },
    yAxis: {
      type: 'category',
      data: [''],
      show: false,
    },
    tooltip: {
      trigger: 'item',
      formatter: (params: { value: [string, number, number] }) => {
        const [date, , count] = params.value;
        return `${date}<br/>完成 ${count} 项`;
      },
    },
    series: [
      {
        type: 'heatmap',
        data: values,
        itemStyle: {
          borderRadius: 3,
          borderWidth: 2,
          borderColor: '#fff',
        },
        visualMap: false,
        encode: {
          x: 0,
          y: 1,
        },
      },
    ],
    visualMap: {
      min: 0,
      max: 4,
      calculable: false,
      orient: 'horizontal',
      left: 'center',
      bottom: 0,
      show: false,
      inRange: {
        color: ['#f3f4f6', '#fde68a', '#f59e0b', '#d97706'],
      },
    },
  };
}

function getMoodOption(trend: { date: string; score: number }[]) {
  const dates = trend.map((t) => t.date.slice(5));
  const scores = trend.map((t) => (t.score === 0 ? null : t.score));

  return {
    grid: { left: 10, right: 10, top: 20, bottom: 24, containLabel: false },
    xAxis: {
      type: 'category',
      data: dates,
      axisLine: { show: false },
      axisTick: { show: false },
      axisLabel: {
        fontSize: 10,
        color: '#9ca3af',
        interval: Math.floor(dates.length / 6),
      },
    },
    yAxis: {
      type: 'value',
      min: 1,
      max: 5,
      interval: 1,
      axisLine: { show: false },
      axisTick: { show: false },
      splitLine: {
        lineStyle: { color: '#f3f4f6', type: 'dashed' },
      },
      axisLabel: {
        fontSize: 10,
        color: '#9ca3af',
        formatter: (val: number) => ['😢', '😟', '😐', '🙂', '😊'][val - 1] ?? '',
      },
    },
    tooltip: {
      trigger: 'axis',
      formatter: (params: { name: string; value: number | null }[]) => {
        const p = params[0];
        if (p.value == null) return `${p.name}<br/>暂无记录`;
        const labels = ['很差', '不好', '一般', '不错', '很棒'];
        return `${p.name}<br/>心情：${labels[p.value - 1]}`;
      },
    },
    series: [
      {
        type: 'line',
        data: scores,
        smooth: true,
        symbol: 'circle',
        symbolSize: 5,
        lineStyle: {
          color: CHART_COLORS[0],
          width: 2,
        },
        itemStyle: {
          color: CHART_COLORS[0],
        },
        areaStyle: {
          color: {
            type: 'linear',
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              { offset: 0, color: 'rgba(245, 158, 11, 0.3)' },
              { offset: 1, color: 'rgba(245, 158, 11, 0.02)' },
            ],
          },
        },
        connectNulls: true,
      },
    ],
  };
}
