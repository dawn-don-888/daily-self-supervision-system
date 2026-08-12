import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import {
  getSettings,
  saveSettings,
  exportAllData,
  importAllData,
  clearAllData,
  getAchievements,
} from '@/lib/storage';
import { MOCK_PROFILE_PAGE } from '@/data/profile-page';
import { BADGE_DEFINITIONS, LEVELS } from '@/lib/constants';
import { Download, Upload, Bell, Info, Trash2, ChevronRight, Shield, Trophy, Star, Medal, Sparkles, Heart } from 'lucide-react';
import { toast } from 'sonner';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Switch } from '@/components/ui/switch';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';

export default function ProfilePage() {
  const [settings, setSettings] = useState(() => getSettings());
  const [showAbout, setShowAbout] = useState(false);
  const [showPro, setShowPro] = useState(false);
  const [showPhilosophy, setShowPhilosophy] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleToggleReminder = async (checked: boolean) => {
    if (checked) {
      if (!('Notification' in window)) {
        toast.error('当前浏览器不支持通知功能');
        return;
      }
      const permission = await Notification.requestPermission();
      if (permission !== 'granted') {
        toast.error('通知权限被拒绝，请在浏览器设置中开启');
        return;
      }
      new Notification('每日自我监督', {
        body: '提醒已开启，每天会准时叫你打卡哦~',
        icon: '',
      });
    }
    const newSettings = { ...settings, reminderEnabled: checked };
    setSettings(newSettings);
    saveSettings(newSettings);
    toast.success(checked ? '每日提醒已开启 🔔' : '每日提醒已关闭');
  };

  const handleTimeChange = (time: string) => {
    const newSettings = { ...settings, reminderTime: time };
    setSettings(newSettings);
    saveSettings(newSettings);
  };

  const handleExport = () => {
    const json = exportAllData();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    const date = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    a.href = url;
    a.download = `selfsuper_backup_${date}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success('数据导出成功 📦');
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const success = importAllData(content);
      if (success) {
        toast.success('数据导入成功 ✅');
        // 刷新页面以加载新数据
        setTimeout(() => window.location.reload(), 1000);
      } else {
        toast.error('导入失败，请检查文件格式');
      }
    };
    reader.readAsText(file);
    // 重置 input 以便重复选择同一文件
    e.target.value = '';
  };

  const handleClearData = () => {
    clearAllData();
    toast.success('数据已清空，重新开始吧 🌱');
    setTimeout(() => window.location.reload(), 1000);
  };

  return (
    <div className="mx-auto max-w-md px-4 pb-8 pt-4">
      <motion.h1
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-4 text-xl font-bold text-foreground"
      >
        我的
      </motion.h1>

      {/* 应用信息 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="mb-5 rounded-2xl bg-gradient-to-br from-primary/10 to-secondary/30 p-5"
      >
        <div className="flex items-center gap-3">
          <div className="flex size-12 items-center justify-center rounded-2xl bg-primary text-2xl text-primary-foreground shadow-md shadow-primary/20">
            🌅
          </div>
          <div>
            <h2 className="text-lg font-bold text-foreground">{MOCK_PROFILE_PAGE.appName}</h2>
            <p className="text-xs text-muted-foreground">{MOCK_PROFILE_PAGE.version}</p>
          </div>
        </div>
        <p className="mt-3 text-sm leading-relaxed text-foreground/80">
          {MOCK_PROFILE_PAGE.description}
        </p>
      </motion.div>

      {/* 成就等级卡片 */}
      <AchievementCard />

      {/* 设置列表 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.05 }}
        className="mb-5 overflow-hidden rounded-2xl bg-card shadow-sm"
      >
        {/* 数据导出 */}
        <button
          onClick={handleExport}
          className="flex w-full items-center gap-3 border-b border-border/50 p-4 text-left transition-colors hover:bg-muted/50"
        >
          <div className="flex size-9 items-center justify-center rounded-full bg-primary/10 text-primary">
            <Download className="size-4" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium text-foreground">导出数据</p>
            <p className="text-xs text-muted-foreground">备份所有数据为 JSON 文件</p>
          </div>
          <ChevronRight className="size-4 text-muted-foreground" />
        </button>

        {/* 数据导入 */}
        <button
          onClick={handleImportClick}
          className="flex w-full items-center gap-3 border-b border-border/50 p-4 text-left transition-colors hover:bg-muted/50"
        >
          <div className="flex size-9 items-center justify-center rounded-full bg-success/10 text-success">
            <Upload className="size-4" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium text-foreground">导入数据</p>
            <p className="text-xs text-muted-foreground">从 JSON 文件恢复数据</p>
          </div>
          <ChevronRight className="size-4 text-muted-foreground" />
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept=".json,application/json"
          onChange={handleFileChange}
          className="hidden"
        />

        {/* 每日提醒 */}
        <div className="flex items-center gap-3 border-b border-border/50 p-4">
          <div className="flex size-9 items-center justify-center rounded-full bg-amber-500/10 text-amber-500">
            <Bell className="size-4" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium text-foreground">每日提醒</p>
            <p className="text-xs text-muted-foreground">
              {settings.reminderEnabled ? `每天 ${settings.reminderTime} 提醒` : '未开启'}
            </p>
          </div>
          <Switch
            checked={settings.reminderEnabled}
            onCheckedChange={handleToggleReminder}
          />
        </div>

        {/* 提醒时间（仅开启时显示） */}
        {settings.reminderEnabled && (
          <div className="flex items-center gap-3 border-b border-border/50 bg-muted/20 px-4 py-3">
            <div className="ml-12 flex-1">
              <p className="text-xs text-muted-foreground">提醒时间</p>
              <input
                type="time"
                value={settings.reminderTime}
                onChange={(e) => handleTimeChange(e.target.value)}
                className="mt-1 rounded-lg border border-border bg-background px-2 py-1 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
            </div>
          </div>
        )}

        {/* 关于 */}
        <button
          onClick={() => setShowAbout(true)}
          className="flex w-full items-center gap-3 p-4 text-left transition-colors hover:bg-muted/50"
        >
          <div className="flex size-9 items-center justify-center rounded-full bg-info/10 text-info">
            <Info className="size-4" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium text-foreground">关于</p>
            <p className="text-xs text-muted-foreground">隐私说明和使用介绍</p>
          </div>
          <ChevronRight className="size-4 text-muted-foreground" />
        </button>
      </motion.div>

      {/* 产品理念 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.08 }}
        className="overflow-hidden rounded-2xl bg-gradient-to-br from-amber-50 to-orange-50 shadow-sm"
      >
        <button
          onClick={() => setShowPhilosophy(true)}
          className="flex w-full items-center gap-3 p-4 text-left transition-colors hover:bg-white/50"
        >
          <div className="flex size-9 items-center justify-center rounded-full bg-gradient-to-br from-amber-400 to-orange-400 text-white">
            <Heart className="size-4" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium text-foreground">产品理念</p>
            <p className="text-xs text-muted-foreground">每天进步一点点的温暖</p>
          </div>
          <ChevronRight className="size-4 text-muted-foreground" />
        </button>
      </motion.div>

      {/* Pro 版 低调入口 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.09 }}
        className="overflow-hidden rounded-2xl bg-card shadow-sm"
      >
        <button
          onClick={() => setShowPro(true)}
          className="flex w-full items-center gap-3 p-4 text-left transition-colors hover:bg-muted/50"
        >
          <div className="flex size-9 items-center justify-center rounded-full bg-gradient-to-br from-amber-300 to-yellow-500 text-white">
            <Sparkles className="size-4" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-1.5">
              <p className="text-sm font-medium text-foreground">升级 Pro</p>
              <span className="rounded-full bg-gradient-to-r from-amber-400 to-yellow-500 px-1.5 py-0.5 text-[9px] font-bold text-white">
                NEW
              </span>
            </div>
            <p className="text-xs text-muted-foreground">更多功能，更大空间</p>
          </div>
          <ChevronRight className="size-4 text-muted-foreground" />
        </button>
      </motion.div>

      {/* 清空数据 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="overflow-hidden rounded-2xl bg-card shadow-sm"
      >
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <button className="flex w-full items-center gap-3 p-4 text-left text-destructive transition-colors hover:bg-destructive/5">
              <div className="flex size-9 items-center justify-center rounded-full bg-destructive/10 text-destructive">
                <Trash2 className="size-4" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium">清空所有数据</p>
                <p className="text-xs opacity-70">此操作不可恢复</p>
              </div>
              <ChevronRight className="size-4 opacity-50" />
            </button>
          </AlertDialogTrigger>
          <AlertDialogContent className="max-w-xs rounded-2xl">
            <AlertDialogHeader>
              <AlertDialogTitle>确定要清空所有数据吗？</AlertDialogTitle>
              <AlertDialogDescription>
                {MOCK_PROFILE_PAGE.clearDataConfirmText}
                <br />
                建议先导出备份再清空~
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>取消</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleClearData}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                确认清空
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </motion.div>

      {/* 关于弹窗 */}
      <Dialog open={showAbout} onOpenChange={setShowAbout}>
        <DialogContent className="max-w-xs rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-center text-lg">关于每日自我监督</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 text-sm text-foreground/80">
            <div className="flex items-center gap-2 rounded-xl bg-primary/5 p-3">
              <Shield className="size-5 shrink-0 text-primary" />
              <p className="text-xs leading-relaxed">
                {MOCK_PROFILE_PAGE.privacyNote}
              </p>
            </div>
            <div>
              <p className="mb-1 font-medium text-foreground">这是什么？</p>
              <p className="text-xs leading-relaxed text-muted-foreground">
                一个帮你每天进步一点点的个人成长打卡工具。
                通过心情记录、每日一问、极简复盘、知识启发和AI学习路径，
                让你每天都有方向、有收获、有成就感。
              </p>
            </div>
            <div>
              <p className="mb-1 font-medium text-foreground">怎么用？</p>
              <p className="text-xs leading-relaxed text-muted-foreground">
                每天花 5 分钟，在「今日」Tab 完成打卡：
                选心情、答一问、写复盘、记录启发。
                在「学习」Tab 跟着 120 天 AI 学习路径，每天最小一步。
                坚持就是胜利！
              </p>
            </div>
            <div className="text-center text-xs text-muted-foreground">
              版本 {MOCK_PROFILE_PAGE.version}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* 产品理念弹窗 */}
      <Dialog open={showPhilosophy} onOpenChange={setShowPhilosophy}>
        <DialogContent className="max-w-xs rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-center text-lg">
              💛 产品理念
            </DialogTitle>
            <DialogDescription className="text-center text-xs">
              关于「每天进步一点点」的思考
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 text-sm text-foreground/80">
            <div className="rounded-xl bg-gradient-to-br from-amber-50 to-orange-50 p-4">
              <p className="mb-1 text-base font-bold text-amber-700">最小一步，持续前行</p>
              <p className="text-xs leading-relaxed text-amber-600/80">
                不需要大动作，每天最小的一步，
                也能在时间的复利下，走出很远的距离。
              </p>
            </div>

            <div className="space-y-3">
              <PhilosophyItem
                num="01"
                title="真实胜过完美"
                desc="记录真实的自己，比假装完美更重要。每一个小进步、每一次卡壳，都是成长的证据。"
              />
              <PhilosophyItem
                num="02"
                title="每天只需5分钟"
                desc="低门槛的开始，才能真正坚持下去。每天5分钟，好过每周一次马拉松。"
              />
              <PhilosophyItem
                num="03"
                title="数据是朋友"
                desc="数据不是用来焦虑的，是用来看见自己的。看见趋势、看见变化、看见努力的痕迹。"
              />
              <PhilosophyItem
                num="04"
                title="温暖陪伴感"
                desc="我们不是冷冰冰的效率工具，而是陪你一起成长的小伙伴。温暖、轻松、不焦虑。"
              />
            </div>

            <p className="text-center text-xs text-muted-foreground">
              愿你每天都比昨天更好一点点 ✨
            </p>
          </div>
        </DialogContent>
      </Dialog>

      {/* Pro 弹窗 */}
      <Dialog open={showPro} onOpenChange={setShowPro}>
        <DialogContent className="max-w-xs rounded-2xl">
          <DialogHeader>
            <DialogTitle className="bg-gradient-to-r from-amber-500 to-yellow-500 bg-clip-text text-center text-lg text-transparent">
              ✨ 升级 Pro 版
            </DialogTitle>
            <DialogDescription className="text-center text-xs">
              解锁更多高级功能
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div className="rounded-xl bg-gradient-to-br from-amber-50 to-yellow-50 p-4">
              <div className="mb-1 flex items-baseline gap-1">
                <span className="text-2xl font-bold text-amber-600">¥18</span>
                <span className="text-xs text-muted-foreground">/ 月</span>
                <span className="ml-auto rounded-full bg-amber-200/50 px-2 py-0.5 text-[10px] font-medium text-amber-700">
                  首月特惠
                </span>
              </div>
              <p className="text-[11px] text-muted-foreground">年度版 ¥168，省 ¥48</p>
            </div>

            <div className="space-y-2">
              {[
                { icon: '🔓', title: '无限灵感碎片', desc: '不再有数量限制' },
                { icon: '📊', title: '深度数据分析', desc: '月度报告、成长曲线' },
                { icon: '🎯', title: '自定义目标', desc: '设定你的专属目标' },
                { icon: '☁️', title: '云端同步备份', desc: '多设备无缝切换' },
                { icon: '🎨', title: '更多主题皮肤', desc: '个性化你的界面' },
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-3 rounded-lg bg-muted/30 p-2.5">
                  <span className="text-base">{item.icon}</span>
                  <div>
                    <p className="text-xs font-medium text-foreground">{item.title}</p>
                    <p className="text-[11px] text-muted-foreground">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            <button className="w-full rounded-xl bg-gradient-to-r from-amber-400 to-yellow-500 py-3 text-sm font-semibold text-white shadow-md shadow-amber-200">
              立即升级 Pro
            </button>
            <p className="text-center text-[10px] text-muted-foreground">
              7天内不满意全额退款 · 随时可取消
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function PhilosophyItem({ num, title, desc }: { num: string; title: string; desc: string }) {
  return (
    <div className="flex gap-3">
      <span className="flex h-6 w-8 shrink-0 items-center justify-center rounded-md bg-gradient-to-br from-amber-100 to-orange-100 text-xs font-bold text-amber-600">
        {num}
      </span>
      <div>
        <p className="text-sm font-medium text-foreground">{title}</p>
        <p className="text-xs leading-relaxed text-muted-foreground">{desc}</p>
      </div>
    </div>
  );
}

function AchievementCard() {
  const achievements = getAchievements();
  const currentLevel = achievements.level;
  const levelInfo = LEVELS[currentLevel - 1];
  const nextLevelInfo = LEVELS[currentLevel];
  const unlockedBadges = achievements.badges;

  // 等级进度
  const levelProgress = nextLevelInfo
    ? ((achievements.totalPoints - levelInfo.minPoints) /
        (nextLevelInfo.minPoints - levelInfo.minPoints)) *
      100
    : 100;

  const pointsToNext = nextLevelInfo
    ? nextLevelInfo.minPoints - achievements.totalPoints
    : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.05 }}
      className="mb-5 space-y-4"
    >
      {/* 等级卡 */}
      <div className="rounded-2xl bg-gradient-to-br from-amber-50 to-orange-100 p-5 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="flex size-14 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 text-2xl text-white shadow-md shadow-amber-500/30">
            {levelInfo.icon}
          </div>
          <div className="flex-1">
            <div className="flex items-baseline gap-2">
              <h3 className="text-lg font-bold text-foreground">{levelInfo.name}</h3>
              <span className="text-xs text-amber-700">Lv.{currentLevel}</span>
            </div>
            <p className="mt-0.5 text-xs text-muted-foreground">
              总积分：{achievements.totalPoints}
            </p>
          </div>
        </div>
        <div className="mt-4">
          <div className="mb-1.5 flex items-center justify-between text-xs">
            <span className="text-muted-foreground">升级进度</span>
            <span className="font-medium text-amber-700">
              {nextLevelInfo ? `还差 ${pointsToNext} 分` : '已满级'}
            </span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-white/60">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${Math.min(100, levelProgress)}%` }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
              className="h-full rounded-full bg-gradient-to-r from-amber-400 to-orange-500"
            />
          </div>
        </div>
      </div>

      {/* 徽章墙 */}
      <div className="rounded-2xl bg-card p-4 shadow-sm">
        <div className="mb-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Medal className="size-4 text-amber-500" />
            <h3 className="text-sm font-semibold text-foreground">徽章墙</h3>
          </div>
          <span className="text-xs text-muted-foreground">
            {unlockedBadges.length} / {BADGE_DEFINITIONS.length}
          </span>
        </div>
        <div className="grid grid-cols-3 gap-3">
          {BADGE_DEFINITIONS.map((badge, i) => {
            const unlocked = unlockedBadges.some((b) => b.id === badge.id);
            return (
              <motion.div
                key={badge.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, delay: 0.1 + i * 0.03 }}
                className={`flex flex-col items-center rounded-xl p-3 text-center transition-all ${
                  unlocked
                    ? 'bg-gradient-to-br from-amber-50 to-orange-50'
                    : 'bg-muted/30 opacity-60 grayscale'
                }`}
              >
                <span className="mb-1 text-2xl">{badge.icon}</span>
                <span className="text-xs font-medium text-foreground">{badge.name}</span>
              </motion.div>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
}
