import { useState, useEffect, useCallback, useMemo } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { formatDate, getTodayStr } from '@/lib/utils';
import { getQuestionOfDay } from '@/lib/constants';
import {
  getTodayRecord,
  saveTodayRecord,
  getLearningProgress,
  getAchievements,
  saveAchievements,
  getAllDailyRecords,
  getEnglishProgress,
  getFitness,
  getAccounting,
  getTodos,
  POINTS,
  type IMoodRecord,
  type IDailyQuestion,
  type IDailyReview,
  type IInspiration,
  type IDailyRecord,
} from '@/lib/storage';
import { BADGE_DEFINITIONS, getLevelByPoints } from '@/lib/constants';
import MoodCard from './MoodCard';
import DailyQuestionCard from './DailyQuestionCard';
import ReviewCard from './ReviewCard';
import InspirationCard from './InspirationCard';
import CompletionCard from './CompletionCard';
import { toast } from 'sonner';
import { PartyPopper, Sun, Volume2, Dumbbell, CheckSquare, Wallet, BookOpen, ChevronRight } from 'lucide-react';

const TOTAL_ITEMS = 9; // 心情 / 每日一问 / 复盘 / AI学习 / 英语朗读 / 健身运动 / 记账 / 今日待办 / 知识启发

export default function TodayPage() {
  const navigate = useNavigate();
  const todayStr = getTodayStr();
  const questionOfDay = getQuestionOfDay(todayStr);
  const [record, setRecord] = useState<IDailyRecord>(() => getTodayRecord());
  const [refreshKey, setRefreshKey] = useState(0); // 用来触发习惯完成状态刷新
  const [showConfetti, setShowConfetti] = useState(false);

  // 实时计算9项完成情况（英语/健身/记账/待办 从各自 storage 读）
  const completedItems = useMemo(() => getCompletedItemList(record), [record, refreshKey]);
  const completedCount = completedItems.filter((i) => i.done).length;
  const allDone = completedCount >= TOTAL_ITEMS;

  const prevCompletedCount = usePrevious(completedCount);

  // 完成度变化时触发积分 + 鼓励
  useEffect(() => {
    if (prevCompletedCount === undefined) return;
    if (completedCount > prevCompletedCount) {
      // 每次完成一项加打卡积分
      const achievements = getAchievements();
      let pointsEarned = POINTS.DAILY_CHECKIN;
      let badgeEarned: string | null = null;

      // 首次打卡徽章
      if (achievements.streakDays === 0 && !achievements.badges.some((b) => b.id === 'first-step')) {
        achievements.badges.push({ id: 'first-step', unlockedAt: new Date().toISOString() });
        badgeEarned = 'first-step';
      }

      // 更新连续打卡
      achievements.totalPoints += pointsEarned;

      // 更新等级
      const newLevel = getLevelByPoints(achievements.totalPoints);
      achievements.level = newLevel.level;

      // 更新 lastCheckIn 和 streak
      const today = getTodayStr();
      if (achievements.lastCheckInDate !== today) {
        // 检查是否连续
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = yesterday.toISOString().slice(0, 10);
        if (achievements.lastCheckInDate === yesterdayStr) {
          achievements.streakDays += 1;
          achievements.totalPoints += POINTS.STREAK_BONUS;
          pointsEarned += POINTS.STREAK_BONUS;
        } else if (achievements.lastCheckInDate !== today) {
          achievements.streakDays = 1;
        }
        achievements.lastCheckInDate = today;
      }

      // 连续打卡徽章检查
      const streakBadges = [
        { id: 'seven-days', days: 7 },
        { id: 'thirty-days', days: 30 },
        { id: 'hundred-days', days: 100 },
      ];
      for (const sb of streakBadges) {
        if (
          achievements.streakDays >= sb.days &&
          !achievements.badges.some((b) => b.id === sb.id)
        ) {
          achievements.badges.push({ id: sb.id, unlockedAt: new Date().toISOString() });
          if (!badgeEarned) badgeEarned = sb.id;
        }
      }

      saveAchievements(achievements);

      if (badgeEarned) {
        const badge = BADGE_DEFINITIONS.find((b) => b.id === badgeEarned);
        if (badge) {
          toast.success(`🎉 解锁新徽章：${badge.name}`, {
            description: badge.description,
          });
        }
      } else {
        toast.success(`太棒了！+${pointsEarned} 积分 ✨`);
      }

      // 全部完成撒花
      if (completedCount >= TOTAL_ITEMS) {
        setShowConfetti(true);
        setTimeout(() => setShowConfetti(false), 4000);
      }
    }
  }, [completedCount, prevCompletedCount]);

  // 刷新习惯状态（供子组件在打卡后调用）
  const refreshHabits = useCallback(() => setRefreshKey((k) => k + 1), []);

  const handleMoodChange = useCallback((mood: IMoodRecord) => {
    const updated = saveTodayRecord({ mood });
    setRecord(updated);
  }, []);

  const handleQuestionAnswer = useCallback(
    (answer: string) => {
      const question: IDailyQuestion = { question: questionOfDay, answer };
      const updated = saveTodayRecord({ question });
      setRecord(updated);

      // 心情积分
      if (answer.trim()) {
        const achievements = getAchievements();
        achievements.totalPoints += POINTS.MOOD;
        const newLevel = getLevelByPoints(achievements.totalPoints);
        achievements.level = newLevel.level;
        saveAchievements(achievements);
      }
    },
    [questionOfDay],
  );

  const handleReviewChange = useCallback((review: IDailyReview) => {
    const updated = saveTodayRecord({ review });
    setRecord(updated);

    // 复盘积分（完成即给）
    if (review.goodPoint.trim() && review.nextStep.trim()) {
      const achievements = getAchievements();
      achievements.totalPoints += POINTS.REVIEW;
      const newLevel = getLevelByPoints(achievements.totalPoints);
      achievements.level = newLevel.level;

      // 反思者徽章
      const reviewCount = countReviews();
      if (reviewCount >= 30 && !achievements.badges.some((b) => b.id === 'reflector')) {
        achievements.badges.push({ id: 'reflector', unlockedAt: new Date().toISOString() });
      }

      saveAchievements(achievements);
    }
  }, []);

  const handleAddInspiration = useCallback((inspiration: IInspiration) => {
    const current = getTodayRecord();
    const newInspirations = [...current.inspirations, inspiration];
    const updated = saveTodayRecord({ inspirations: newInspirations });
    setRecord(updated);

    // 知识启发积分
    const achievements = getAchievements();
    achievements.totalPoints += POINTS.INSPIRATION;
    const newLevel = getLevelByPoints(achievements.totalPoints);
    achievements.level = newLevel.level;

    // 知识猎人徽章
    const totalInspirations = countInspirations();
    if (
      totalInspirations >= 50 &&
      !achievements.badges.some((b) => b.id === 'knowledge-hunter')
    ) {
      achievements.badges.push({
        id: 'knowledge-hunter',
        unlockedAt: new Date().toISOString(),
      });
    }

    saveAchievements(achievements);
    toast.success(`知识启发 +${POINTS.INSPIRATION} 分 📚`);
  }, []);

  const handleRemoveInspiration = useCallback((id: string) => {
    const current = getTodayRecord();
    const newInspirations = current.inspirations.filter((i) => i.id !== id);
    const updated = saveTodayRecord({ inspirations: newInspirations });
    setRecord(updated);
  }, []);

  return (
    <div className="relative mx-auto max-w-md px-4 pb-8 pt-4">
      {/* 撒花动画 */}
      <AnimatePresence>
        {showConfetti && <ConfettiOverlay />}
      </AnimatePresence>

      {/* 顶部日期 + 问候 */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="mb-5 flex items-center justify-between"
      >
        <div>
          <p className="text-xs text-muted-foreground">{formatDate(todayStr)}</p>
          <h1 className="text-xl font-bold text-foreground">
            <Sun className="mr-1 inline size-5 text-amber-500" />
            今天也要加油呀
          </h1>
        </div>
        <div className="text-right">
          <p className="text-xs text-muted-foreground">已连续</p>
          <p className="text-lg font-bold text-primary">
            {getAchievements().streakDays} 天
          </p>
        </div>
      </motion.div>

      <div className="space-y-4">
        <MoodCard mood={record.mood} onChange={handleMoodChange} />

        <DailyQuestionCard
          question={questionOfDay}
          savedQuestion={record.question}
          onChange={handleQuestionAnswer}
        />

        <ReviewCard review={record.review} onChange={handleReviewChange} />

        <InspirationCard
          inspirations={record.inspirations}
          onAdd={handleAddInspiration}
          onRemove={handleRemoveInspiration}
        />

        <TodayHabitsCard onStatusChange={refreshHabits} />

        <CompletionCard
          completedCount={completedCount}
          totalItems={TOTAL_ITEMS}
          items={completedItems}
          allDone={allDone}
        />
      </div>
    </div>
  );
}

// ============ helper hooks ============

function usePrevious<T>(value: T): T | undefined {
  const [prev, setPrev] = useState<T | undefined>(undefined);
  const [current, setCurrent] = useState<T>(value);

  useEffect(() => {
    if (current !== value) {
      setPrev(current);
      setCurrent(value);
    }
  }, [value, current]);

  return prev;
}

function getCompletedItemList(record: IDailyRecord) {
  const learningProgress = getLearningProgress();
  const today = getTodayStr();
  // 学习任务：如果今日记录了 learningTaskDone 或 学习路径中 today 对应的 day 已完成
  const learningDone =
    record.learningTaskDone ||
    learningProgress.completedDays.includes(learningProgress.currentDay);

  // 习惯完成情况
  const englishDone = getEnglishProgress().lastReadDate === today;
  const fitnessDone = getFitness().records.some((r) => r.date === today);
  const accountingDone = getAccounting().records.some((r) => r.date === today);
  const todayTodos = getTodos().items.filter((i) => i.date === today);
  const todoDone = todayTodos.length > 0 && todayTodos.every((t) => t.done);

  return [
    { key: 'mood', label: '心情记录', done: !!record.mood && record.mood.score > 0 },
    {
      key: 'question',
      label: '每日一问',
      done: !!record.question?.answer?.trim(),
    },
    {
      key: 'review',
      label: '每日复盘',
      done: !!record.review?.goodPoint?.trim() && !!record.review?.nextStep?.trim(),
    },
    { key: 'inspiration', label: '知识启发', done: record.inspirations.length > 0 },
    { key: 'learning', label: 'AI学习', done: learningDone },
    { key: 'english', label: '英语朗读', done: englishDone },
    { key: 'fitness', label: '健身运动', done: fitnessDone },
    { key: 'todo', label: '今日待办', done: todoDone },
    { key: 'finance', label: '记账', done: accountingDone },
  ];
}

function countReviews(): number {
  const records = getAllDailyRecords();
  let count = 0;
  Object.values(records).forEach((r) => {
    if (r.review?.goodPoint?.trim() && r.review?.nextStep?.trim()) {
      count++;
    }
  });
  return count;
}

function countInspirations(): number {
  const records = getAllDailyRecords();
  let count = 0;
  Object.values(records).forEach((r) => {
    count += r.inspirations?.length ?? 0;
  });
  return count;
}

// 轻量撒花（纯 CSS + framer-motion 粒子）
function ConfettiOverlay() {
  const colors = ['#F59E0B', '#FBBF24', '#FB923C', '#F97316', '#FDE68A', '#FFFFFF'];
  const particles = Array.from({ length: 40 }, (_, i) => i);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="pointer-events-none fixed inset-0 z-[100] overflow-hidden"
    >
      <PartyPopper className="absolute left-1/2 top-1/3 -translate-x-1/2 -translate-y-1/2 text-6xl" />
      {particles.map((i) => {
        const left = Math.random() * 100;
        const delay = Math.random() * 0.8;
        const duration = 2 + Math.random() * 2;
        const size = 6 + Math.random() * 8;
        const color = colors[i % colors.length];
        return (
          <motion.div
            key={i}
            initial={{ y: -20, x: 0, opacity: 1, rotate: 0 }}
            animate={{
              y: ['0vh', '100vh'],
              x: [
                `${left}vw`,
                `${left + (Math.random() - 0.5) * 20}vw`,
                `${left + (Math.random() - 0.5) * 30}vw`,
              ],
              rotate: [0, 360 * (Math.random() > 0.5 ? 1 : -1)],
              opacity: [1, 1, 0],
            }}
            transition={{
              duration,
              delay,
              ease: 'easeOut',
              times: [0, 0.8, 1],
            }}
            className="absolute top-0 rounded-sm"
            style={{
              width: size,
              height: size * 0.6,
              left: `${left}%`,
              backgroundColor: color,
            }}
          />
        );
      })}
    </motion.div>
  );
}

// 今日习惯快捷打卡卡片
function TodayHabitsCard({ onStatusChange }: { onStatusChange?: () => void }) {
  const navigate = useNavigate();
  const todayStr = getTodayStr();

  const englishProgress = getEnglishProgress();
  const englishDone = englishProgress.lastReadDate === todayStr;

  const fitnessState = getFitness();
  const fitnessDone = fitnessState.records.some((r) => r.date === todayStr);

  const accountingState = getAccounting();
  const accountingDone = accountingState.records.some((r) => r.date === todayStr);

  const todoState = getTodos();
  const todayTodos = todoState.items.filter((i) => i.date === todayStr);
  const todoDoneCount = todayTodos.filter((i) => i.done).length;
  const todoTotal = todayTodos.length;

  const learningProgress = getLearningProgress();
  const learningDone = learningProgress.completedDays.includes(learningProgress.currentDay);

  const habits = [
    {
      key: 'english',
      icon: Volume2,
      label: '英语朗读',
      iconColor: 'text-blue-500',
      bgColor: 'bg-blue-50',
      status: englishDone ? '已完成' : '未完成',
      done: englishDone,
      path: '/learning#english',
    },
    {
      key: 'fitness',
      icon: Dumbbell,
      label: '健身运动',
      iconColor: 'text-rose-500',
      bgColor: 'bg-rose-50',
      status: fitnessDone ? '已完成' : '未完成',
      done: fitnessDone,
      path: '/life#fitness',
    },
    {
      key: 'todo',
      icon: CheckSquare,
      label: '今日待办',
      iconColor: 'text-cyan-600',
      bgColor: 'bg-cyan-50',
      status: todoTotal > 0 ? `${todoDoneCount}/${todoTotal}` : '0个待办',
      done: todoTotal > 0 && todoDoneCount === todoTotal && todoDoneCount > 0,
      path: '/life#todo',
    },
    {
      key: 'finance',
      icon: Wallet,
      label: '记账',
      iconColor: 'text-amber-600',
      bgColor: 'bg-amber-50',
      status: accountingDone ? '已记账' : '未记账',
      done: accountingDone,
      path: '/life#finance',
    },
    {
      key: 'learning',
      icon: BookOpen,
      label: 'AI学习',
      iconColor: 'text-primary',
      bgColor: 'bg-primary/10',
      status: learningDone ? '已完成' : '未完成',
      done: learningDone,
      path: '/learning',
    },
  ];

  const handleClick = (path: string) => {
    const [route, hash] = path.split('#');
    if (hash) {
      navigate(`${route}#${hash}`);
    } else {
      navigate(route);
    }
    // 跳转后回来时刷新状态
    onStatusChange?.();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.15 }}
      className="rounded-2xl bg-card p-4 shadow-sm"
    >
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-foreground">今日习惯</h3>
        <span className="text-xs text-muted-foreground">
          {habits.filter((h) => h.done).length} / {habits.length}
        </span>
      </div>
      <div className="space-y-1">
        {habits.map(({ key, icon: Icon, label, iconColor, bgColor, status, done, path }) => (
          <button
            key={key}
            onClick={() => handleClick(path)}
            className="flex w-full items-center gap-3 rounded-xl p-2 transition-colors hover:bg-muted/50"
          >
            <div
              className={`flex size-9 shrink-0 items-center justify-center rounded-full ${bgColor}`}
            >
              <Icon className={`size-4 ${iconColor}`} />
            </div>
            <div className="flex-1 text-left">
              <p className="text-sm font-medium text-foreground">{label}</p>
            </div>
            <div className="flex items-center gap-1">
              <span
                className={`text-xs ${done ? 'text-success' : 'text-muted-foreground'}`}
              >
                {status}
              </span>
              <ChevronRight className="size-3.5 text-muted-foreground/50" />
            </div>
          </button>
        ))}
      </div>
    </motion.div>
  );
}
