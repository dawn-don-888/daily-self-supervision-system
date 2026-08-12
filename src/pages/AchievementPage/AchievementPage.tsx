import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { getAchievements } from '@/lib/storage';
import { BADGE_DEFINITIONS, LEVELS, getLevelByPoints, POINTS } from '@/lib/constants';
import { Star, Info, ChevronDown, ChevronUp, Lock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';

export default function AchievementPage() {
  const [achievements, setAchievements] = useState(() => getAchievements());
  const [showRules, setShowRules] = useState(false);
  const [selectedBadge, setSelectedBadge] = useState<string | null>(null);

  useEffect(() => {
    const refresh = () => setAchievements(getAchievements());
    window.addEventListener('storage', refresh);
    return () => window.removeEventListener('storage', refresh);
  }, []);

  const currentLevel = getLevelByPoints(achievements.totalPoints);
  const nextLevel = LEVELS.find((l) => l.level === currentLevel.level + 1);
  const levelProgress = nextLevel
    ? ((achievements.totalPoints - currentLevel.minPoints) /
        (nextLevel.minPoints - currentLevel.minPoints)) *
      100
    : 100;

  const unlockedCount = achievements.badges.length;

  const rules = [
    { label: '每日打卡（心情/一问/复盘/学习任一）', points: POINTS.DAILY_CHECKIN },
    { label: '记录心情', points: POINTS.MOOD },
    { label: '完成复盘', points: POINTS.REVIEW },
    { label: '记录一条知识启发', points: POINTS.INSPIRATION },
    { label: '完成学习任务', points: POINTS.LEARNING_TASK },
    { label: '连续打卡（每天额外）', points: POINTS.STREAK_BONUS },
  ];

  const activeBadge = selectedBadge
    ? BADGE_DEFINITIONS.find((b) => b.id === selectedBadge)
    : null;
  const isUnlocked = activeBadge
    ? achievements.badges.some((b) => b.id === activeBadge.id)
    : false;
  const unlockedAt = activeBadge
    ? achievements.badges.find((b) => b.id === activeBadge.id)?.unlockedAt
    : undefined;

  return (
    <div className="mx-auto max-w-md px-4 pb-8 pt-4">
      <motion.h1
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-4 text-xl font-bold text-foreground"
      >
        我的成就
      </motion.h1>

      {/* 等级卡片 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="mb-5 overflow-hidden rounded-2xl bg-gradient-to-br from-primary via-amber-400 to-orange-400 p-5 text-white shadow-lg shadow-primary/20"
      >
        <div className="mb-2 flex items-center gap-2">
          <span className="text-3xl">{currentLevel.icon}</span>
          <div>
            <p className="text-xs opacity-80">当前等级</p>
            <p className="text-xl font-bold">Lv.{currentLevel.level} {currentLevel.name}</p>
          </div>
        </div>

        <div className="mb-1 mt-3 flex items-center justify-between text-xs">
          <span>积分 {achievements.totalPoints}</span>
          {nextLevel && <span>下一等级：{nextLevel.minPoints} 分</span>}
        </div>
        <div className="h-2.5 w-full overflow-hidden rounded-full bg-white/30">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${Math.min(100, levelProgress)}%` }}
            transition={{ duration: 0.8, ease: 'easeOut', delay: 0.2 }}
            className="h-full rounded-full bg-white"
          />
        </div>

        {nextLevel ? (
          <p className="mt-2 text-xs opacity-90">
            再获得 {nextLevel.minPoints - achievements.totalPoints} 积分就能升到
            Lv.{nextLevel.level} {nextLevel.name} 啦 💪
          </p>
        ) : (
          <p className="mt-2 text-xs opacity-90">你已达到最高等级！太厉害了 👑</p>
        )}
      </motion.div>

      {/* 积分规则 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.05 }}
        className="mb-5 rounded-2xl bg-card shadow-sm"
      >
        <button
          onClick={() => setShowRules(!showRules)}
          className="flex w-full items-center justify-between p-4"
        >
          <div className="flex items-center gap-2">
            <Star className="size-4 text-amber-500" />
            <span className="text-sm font-medium text-foreground">积分规则</span>
          </div>
          {showRules ? (
            <ChevronUp className="size-4 text-muted-foreground" />
          ) : (
            <ChevronDown className="size-4 text-muted-foreground" />
          )}
        </button>
        {showRules && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            className="overflow-hidden border-t border-border/50 px-4 py-3"
          >
            <div className="space-y-2">
              {rules.map((rule) => (
                <div
                  key={rule.label}
                  className="flex items-center justify-between text-sm"
                >
                  <span className="text-foreground/80">{rule.label}</span>
                  <span className="font-medium text-primary">+{rule.points}分</span>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </motion.div>

      {/* 徽章墙 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
      >
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-foreground">徽章墙</h3>
          <span className="text-xs text-muted-foreground">
            {unlockedCount} / {BADGE_DEFINITIONS.length}
          </span>
        </div>

        <div className="grid grid-cols-3 gap-3">
          {BADGE_DEFINITIONS.map((badge, idx) => {
            const unlocked = achievements.badges.some((b) => b.id === badge.id);
            return (
              <motion.button
                key={badge.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, delay: 0.1 + idx * 0.04 }}
                onClick={() => setSelectedBadge(badge.id)}
                className={cn(
                  'flex flex-col items-center gap-2 rounded-2xl p-4 transition-all hover:scale-105',
                  unlocked ? 'bg-card shadow-sm' : 'bg-muted/50',
                )}
              >
                <div
                  className={cn(
                    'flex size-12 items-center justify-center rounded-full text-2xl',
                    unlocked ? 'bg-primary/10' : 'bg-muted',
                  )}
                >
                  {unlocked ? badge.icon : <Lock className="size-5 text-muted-foreground/60" />}
                </div>
                <span
                  className={cn(
                    'text-center text-xs font-medium',
                    unlocked ? 'text-foreground' : 'text-muted-foreground/60',
                  )}
                >
                  {badge.name}
                </span>
              </motion.button>
            );
          })}
        </div>
      </motion.div>

      {/* 徽章详情弹窗 */}
      <Dialog open={!!selectedBadge} onOpenChange={(o) => !o && setSelectedBadge(null)}>
        <DialogContent className="max-w-xs rounded-2xl p-0">
          {activeBadge && (
            <div className="text-center">
              <div
                className={cn(
                  'flex h-24 items-center justify-center rounded-t-2xl text-5xl',
                  isUnlocked
                    ? 'bg-gradient-to-br from-primary to-amber-400'
                    : 'bg-muted',
                )}
              >
                {isUnlocked ? activeBadge.icon : <Lock className="size-10 text-muted-foreground/60" />}
              </div>
              <DialogHeader className="px-5 pb-2 pt-5">
                <DialogTitle className="text-lg">
                  {activeBadge.name}
                  {!isUnlocked && (
                    <span className="ml-2 text-xs font-normal text-muted-foreground">（未获得）</span>
                  )}
                </DialogTitle>
              </DialogHeader>
              <DialogDescription className="px-5 pb-3 text-foreground/70">
                {activeBadge.description}
              </DialogDescription>
              <div className="border-t border-border/50 px-5 py-3">
                <div className="flex items-start gap-2 text-left text-xs text-muted-foreground">
                  <Info className="mt-0.5 size-3.5 shrink-0" />
                  <div>
                    <p className="font-medium text-foreground/80">解锁条件</p>
                    <p>{activeBadge.unlockCondition}</p>
                    {isUnlocked && unlockedAt && (
                      <p className="mt-1 text-success">获得时间：{unlockedAt.slice(0, 10)}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
