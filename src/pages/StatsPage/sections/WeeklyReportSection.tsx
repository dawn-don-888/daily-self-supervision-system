import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ReactECharts from 'echarts-for-react';
import {
  Calendar,
  Flame,
  BookOpen,
  Dumbbell,
  Wallet,
  Brain,
  Lightbulb,
  CheckSquare,
  Star,
  ChevronLeft,
  ChevronRight,
  FileText,
  Sparkles,
  Download,
} from 'lucide-react';
import {
  generateWeeklyReport,
  getWeeklyReports,
  saveWeeklyReport,
  type IWeeklyReport,
} from '@/lib/storage';
import { CHART_COLORS } from '@/lib/chart-colors';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

function getMondayOfWeek(d: Date): Date {
  const date = new Date(d);
  const day = date.getDay() || 7;
  date.setDate(date.getDate() - day + 1);
  date.setHours(0, 0, 0, 0);
  return date;
}

export default function WeeklyReportSection() {
  const [reports, setReports] = useState(() => getWeeklyReports());
  const [currentMonday, setCurrentMonday] = useState(() => getMondayOfWeek(new Date()));
  const [showDetail, setShowDetail] = useState(false);
  const [activeReport, setActiveReport] = useState<IWeeklyReport | null>(null);

  const currentWeekStr = useMemo(() => {
    const end = new Date(currentMonday);
    end.setDate(end.getDate() + 6);
    const fmt = (d: Date) => `${d.getMonth() + 1}/${d.getDate()}`;
    return `${fmt(currentMonday)} - ${fmt(end)}`;
  }, [currentMonday]);

  // 生成当前周报告
  const currentReport = useMemo(() => generateWeeklyReport(currentMonday), [currentMonday]);

  const handleGenerate = () => {
    saveWeeklyReport(currentReport);
    setReports(getWeeklyReports());
    setActiveReport(currentReport);
    setShowDetail(true);
    toast.success('周报已生成 📊');
  };

  const prevWeek = () => {
    const d = new Date(currentMonday);
    d.setDate(d.getDate() - 7);
    setCurrentMonday(d);
  };

  const nextWeek = () => {
    const d = new Date(currentMonday);
    d.setDate(d.getDate() + 7);
    const now = new Date();
    if (d > getMondayOfWeek(now)) return;
    setCurrentMonday(d);
  };

  const openReport = (r: IWeeklyReport) => {
    setActiveReport(r);
    setShowDetail(true);
  };

  const exportReport = () => {
    if (!activeReport) return;
    const text = buildReportText(activeReport);
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `weekly_report_${activeReport.id}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('已导出周报');
  };

  return (
    <div className="space-y-4">
      {/* 周报入口卡片 */}
      <div className="rounded-2xl bg-gradient-to-br from-amber-400 via-orange-400 to-rose-400 p-5 text-white shadow-lg shadow-orange-500/20">
        <div className="mb-2 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="size-5" />
            <span className="text-sm font-medium opacity-90">每周报告</span>
          </div>
          <Sparkles className="size-5 opacity-80" />
        </div>
        <h3 className="mb-1 text-xl font-bold">{currentWeekStr}</h3>
        <p className="mb-3 text-xs opacity-80">
          本周打卡 {currentReport.data.checkInDays} 天 · 积分 {currentReport.data.pointsGained}
        </p>
        <div className="flex gap-2">
          <button
            onClick={handleGenerate}
            className="flex-1 rounded-xl bg-white/25 py-2 text-sm font-semibold backdrop-blur-sm hover:bg-white/35"
          >
            生成本周周报
          </button>
          {reports.length > 0 && (
            <button
              onClick={() => setShowDetail(true)}
              className="rounded-xl bg-white/25 px-3 py-2 text-sm font-semibold backdrop-blur-sm hover:bg-white/35"
            >
              历史
            </button>
          )}
        </div>
      </div>

      {/* 周报选择器 */}
      <div className="flex items-center justify-between rounded-2xl bg-card p-3 shadow-sm">
        <button
          onClick={prevWeek}
          className="flex size-8 items-center justify-center rounded-full bg-muted text-muted-foreground hover:bg-accent hover:text-foreground"
        >
          <ChevronLeft className="size-4" />
        </button>
        <div className="text-center">
          <p className="text-sm font-semibold text-foreground">第 {getWeekNum(currentMonday)} 周</p>
          <p className="text-xs text-muted-foreground">{currentWeekStr}</p>
        </div>
        <button
          onClick={nextWeek}
          className="flex size-8 items-center justify-center rounded-full bg-muted text-muted-foreground hover:bg-accent hover:text-foreground"
        >
          <ChevronRight className="size-4" />
        </button>
      </div>

      {/* 周报详情弹窗 */}
      <AnimatePresence>
        {showDetail && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-black/40"
              onClick={() => setShowDetail(false)}
            />
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="fixed bottom-0 left-1/2 z-50 max-h-[90vh] w-full max-w-md -translate-x-1/2 overflow-y-auto rounded-t-3xl bg-card p-5 pb-8 shadow-2xl"
            >
              <ReportDetail
                report={activeReport ?? currentReport}
                onClose={() => setShowDetail(false)}
                onExport={exportReport}
                reports={reports}
                onSelect={openReport}
              />
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

function ReportDetail({
  report,
  onClose,
  onExport,
  reports,
  onSelect,
}: {
  report: IWeeklyReport;
  onClose: () => void;
  onExport: () => void;
  reports: IWeeklyReport[];
  onSelect: (r: IWeeklyReport) => void;
}) {
  const chartOption = useMemo(() => {
    const data = report.data.dailyCompletedCounts.map((d) => d.count);
    const xAxis = report.data.dailyCompletedCounts.map((d) => {
      const date = new Date(d.date);
      return ['一', '二', '三', '四', '五', '六', '日'][date.getDay() === 0 ? 6 : date.getDay() - 1];
    });
    return {
      grid: { left: 30, right: 10, top: 20, bottom: 24 },
      xAxis: {
        type: 'category',
        data: xAxis,
        axisLine: { show: false },
        axisTick: { show: false },
        axisLabel: { color: '#6B7280', fontSize: 11 },
      },
      yAxis: {
        type: 'value',
        splitLine: { lineStyle: { color: '#f3f4f6' } },
        axisLabel: { show: false },
      },
      series: [
        {
          type: 'line',
          data,
          smooth: true,
          symbol: 'circle',
          symbolSize: 6,
          lineStyle: { color: CHART_COLORS[0], width: 2.5 },
          itemStyle: { color: CHART_COLORS[0] },
          areaStyle: {
            color: {
              type: 'linear',
              x: 0, y: 0, x2: 0, y2: 1,
              colorStops: [
                { offset: 0, color: `${CHART_COLORS[0]}40` },
                { offset: 1, color: `${CHART_COLORS[0]}05` },
              ],
            },
          },
        },
      ],
    };
  }, [report]);

  const d = report.data;

  return (
    <div className="space-y-4">
      {/* 顶部 */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold text-foreground">
            📊 {report.id} 周报
          </h3>
          <p className="text-xs text-muted-foreground">
            {report.weekStart} ~ {report.weekEnd}
          </p>
        </div>
        <div className="flex gap-1">
          <button
            onClick={onExport}
            className="flex size-8 items-center justify-center rounded-full bg-muted text-muted-foreground hover:bg-accent"
            title="导出"
          >
            <Download className="size-4" />
          </button>
          <button
            onClick={onClose}
            className="flex size-8 items-center justify-center rounded-full bg-muted text-muted-foreground hover:bg-accent"
          >
            ✕
          </button>
        </div>
      </div>

      {/* 鼓励语 */}
      <div className="rounded-xl bg-gradient-to-r from-amber-50 to-orange-50 p-3">
        <p className="text-sm font-medium text-amber-700">💛 {d.encouragement}</p>
      </div>

      {/* 每日完成趋势图 */}
      <div className="rounded-2xl bg-card p-3 shadow-sm ring-1 ring-border/50">
        <h4 className="mb-1 text-xs font-medium text-muted-foreground">每日完成项数</h4>
        <ReactECharts option={chartOption} style={{ height: 120 }} lazyUpdate />
      </div>

      {/* 核心数据网格 */}
      <div className="grid grid-cols-2 gap-2">
        <StatCard
          icon={<Flame className="size-4 text-orange-500" />}
          label="打卡天数"
          value={`${d.checkInDays} 天`}
          sub={`连续 ${d.streakDays} 天`}
        />
        <StatCard
          icon={<Star className="size-4 text-amber-500" />}
          label="积分增长"
          value={`+${d.pointsGained}`}
          sub="本周新增"
          color="text-amber-600"
        />
      </div>

      {/* 学习进度 */}
      <div className="rounded-2xl bg-card p-4 shadow-sm">
        <div className="mb-2 flex items-center gap-2">
          <BookOpen className="size-4 text-blue-500" />
          <h4 className="text-sm font-semibold text-foreground">学习推进</h4>
        </div>
        <div className="space-y-2 text-xs">
          <ProgressRow label="AI开发" value={d.learningProgress.aiDev} color="bg-blue-500" />
          <ProgressRow label="AI产品" value={d.learningProgress.aiPm} color="bg-violet-500" />
          <ProgressRow label="Vibe Coding" value={d.learningProgress.vibe} color="bg-emerald-500" />
        </div>
      </div>

      {/* 生活数据 */}
      <div className="grid grid-cols-2 gap-2">
        <StatCard
          icon={<Wallet className="size-4 text-amber-500" />}
          label="本周支出"
          value={`¥${d.accounting.totalExpense.toFixed(0)}`}
          sub={`${d.accounting.categoryBreakdown[0]?.name ?? '—'}占比最高`}
        />
        <StatCard
          icon={<Dumbbell className="size-4 text-rose-500" />}
          label="健身"
          value={`${d.fitness.days} 天`}
          sub={`${d.fitness.totalMinutes} 分钟`}
        />
        <StatCard
          icon={<Brain className="size-4 text-fuchsia-500" />}
          label="健脑"
          value={`${d.brain.days} 天`}
          sub={`${d.brain.totalMinutes} 分钟`}
        />
        <StatCard
          icon={<Lightbulb className="size-4 text-indigo-500" />}
          label="灵感碎片"
          value={`${d.inspiration.newCount} 新`}
          sub={`完成 ${d.inspiration.doneCount} / 积压 ${d.inspiration.backlogCount}`}
        />
      </div>

      {/* 待办完成率 */}
      <div className="rounded-2xl bg-card p-4 shadow-sm">
        <div className="mb-2 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckSquare className="size-4 text-cyan-500" />
            <h4 className="text-sm font-semibold text-foreground">待办完成率</h4>
          </div>
          <span className="text-sm font-bold text-cyan-600">{d.todoCompletionRate}%</span>
        </div>
        <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
          <div
            className="h-full rounded-full bg-gradient-to-r from-cyan-400 to-cyan-500 transition-all"
            style={{ width: `${Math.min(100, d.todoCompletionRate)}%` }}
          />
        </div>
        <p className="mt-1.5 text-xs text-muted-foreground">
          完成率 {d.todoCompletionRate}%
        </p>
      </div>

      {/* 历史周报 */}
      {reports.length > 0 && (
        <div className="rounded-2xl bg-card p-4 shadow-sm">
          <h4 className="mb-2 text-sm font-semibold text-foreground">历史周报</h4>
          <div className="space-y-1.5">
            {reports.slice(0, 5).map((r) => (
              <button
                key={r.id}
                onClick={() => onSelect(r)}
                className="flex w-full items-center justify-between rounded-xl bg-muted/30 px-3 py-2 text-left hover:bg-muted"
              >
                <span className="text-sm font-medium text-foreground">{r.id}</span>
                <span className="text-xs text-muted-foreground">{r.weekStart}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
  sub,
  color = 'text-foreground',
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  sub?: string;
  color?: string;
}) {
  return (
    <div className="rounded-2xl bg-card p-3 shadow-sm">
      <div className="mb-1 flex items-center gap-1.5">{icon}</div>
      <p className={cn('text-base font-bold', color)}>{value}</p>
      <p className="text-[11px] text-muted-foreground">{label}</p>
      {sub && <p className="mt-0.5 text-[10px] text-muted-foreground/70">{sub}</p>}
    </div>
  );
}

function ProgressRow({
  label,
  value,
  color,
}: {
  label: string;
  value: number;
  color: string;
}) {
  return (
    <div className="flex items-center gap-2">
      <span className="w-20 shrink-0 text-muted-foreground">{label}</span>
      <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
        <div
          className={cn('h-full rounded-full', color)}
          style={{ width: `${Math.min(100, value * 10)}%` }}
        />
      </div>
      <span className="w-8 shrink-0 text-right text-muted-foreground tabular-nums">{value}天</span>
    </div>
  );
}

function getWeekNum(d: Date): number {
  const firstJan = new Date(d.getFullYear(), 0, 1);
  const daysDiff = Math.floor((d.getTime() - firstJan.getTime()) / 86400000);
  return Math.ceil((daysDiff + firstJan.getDay() + 1) / 7);
}

function buildReportText(r: IWeeklyReport): string {
  const d = r.data;
  const lines = [
    `📊 ${r.id} 每周报告`,
    `时间：${r.weekStart} ~ ${r.weekEnd}`,
    '',
    `💛 ${d.encouragement}`,
    '',
    '【打卡】',
    `  本周打卡 ${d.checkInDays} 天`,
    `  连续打卡 ${d.streakDays} 天`,
    `  积分增长 +${d.pointsGained}`,
    '',
    '【学习】',
    `  AI开发：${d.learningProgress.aiDev} 天`,
    `  AI产品：${d.learningProgress.aiPm} 天`,
    `  Vibe Coding：${d.learningProgress.vibe} 天`,
    '',
    '【记账】',
    `  本周支出 ¥${d.accounting.totalExpense.toFixed(0)}`,
    ...d.accounting.categoryBreakdown.map((c) => `    ${c.name}: ¥${c.amount.toFixed(0)}`),
    '',
    '【健身】',
    `  运动 ${d.fitness.days} 天，共 ${d.fitness.totalMinutes} 分钟`,
    '',
    '【健脑】',
    `  健脑 ${d.brain.days} 天，共 ${d.brain.totalMinutes} 分钟`,
    '',
    '【灵感碎片】',
    `  新增 ${d.inspiration.newCount} 条`,
    `  完成 ${d.inspiration.doneCount} 条`,
    `  积压 ${d.inspiration.backlogCount} 条`,
    '',
    '【待办】',
    `  完成率 ${d.todoCompletionRate}%`,
  ];
  return lines.join('\n');
}
