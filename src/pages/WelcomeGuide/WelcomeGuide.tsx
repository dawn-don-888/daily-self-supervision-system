import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Target, ShieldCheck, ChevronRight, Loader2 } from 'lucide-react';
import { saveSettings, getSettings } from '@/lib/storage';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

const SLIDES = [
  {
    icon: Sparkles,
    title: '欢迎来到每日自我监督',
    description: '每天花 5 分钟，记录心情、回答一问、极简复盘，见证自己的成长。',
    accent: 'from-primary to-amber-400',
  },
  {
    icon: Target,
    title: '每天最小一步',
    description: '不用完美，只要开始。跟着 120 天 AI 学习路径，从零基础到能看懂代码。',
    accent: 'from-orange-400 to-rose-400',
  },
  {
    icon: ShieldCheck,
    title: '你的数据只属于你',
    description: '所有数据保存在本地浏览器，不上传任何服务器，隐私优先，安心使用。',
    accent: 'from-emerald-400 to-teal-400',
  },
];

export default function WelcomeGuide() {
  const [current, setCurrent] = useState(0);
  const navigate = useNavigate();

  const isLast = current === SLIDES.length - 1;

  const handleNext = () => {
    if (isLast) {
      finishOnboarding();
    } else {
      setCurrent(current + 1);
    }
  };

  const handleSkip = () => {
    finishOnboarding();
  };

  const [finishing, setFinishing] = useState(false);

  const finishOnboarding = () => {
    if (finishing) return;
    setFinishing(true);
    const settings = getSettings();
    saveSettings({ ...settings, onboardingDone: true });
    // 立即通知 OnboardingGuard 重渲染（不走路由也能生效）
    const win = window as unknown as { __onboardingResolve?: () => void };
    if (win.__onboardingResolve) {
      win.__onboardingResolve();
    }
    // 兜底：走导航确保进入首页
    navigate('/', { replace: true });
    toast.success('欢迎开启成长之旅 ✨');
  };

  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* 跳过按钮 */}
      {!isLast && (
        <button
          onClick={handleSkip}
          className="absolute right-4 top-6 z-10 text-sm text-muted-foreground hover:text-foreground"
        >
          跳过
        </button>
      )}

      {/* 主内容 */}
      <div className="flex flex-1 items-center justify-center px-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={current}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.3 }}
            className="w-full max-w-sm text-center"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.1, type: 'spring' }}
              className={`mx-auto mb-8 flex size-32 items-center justify-center rounded-full bg-gradient-to-br ${SLIDES[current].accent} text-white shadow-xl`}
            >
              {(() => {
                const Icon = SLIDES[current].icon;
                return <Icon className="size-14" strokeWidth={1.5} />;
              })()}
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="mb-3 text-2xl font-bold text-foreground"
            >
              {SLIDES[current].title}
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-sm leading-relaxed text-muted-foreground"
            >
              {SLIDES[current].description}
            </motion.p>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* 底部指示 + 按钮 */}
      <div className="px-6 pb-12 pt-6">
        {/* 分页指示器 */}
        <div className="mb-6 flex justify-center gap-2">
          {SLIDES.map((_, idx) => (
            <motion.div
              key={idx}
              animate={{
                width: idx === current ? 24 : 8,
                backgroundColor: idx === current ? 'hsl(var(--primary))' : 'hsl(var(--border))',
              }}
              transition={{ duration: 0.3 }}
              className="h-2 rounded-full"
            />
          ))}
        </div>

        <button
          onClick={handleNext}
          disabled={finishing}
          className="flex w-full items-center justify-center gap-2 rounded-2xl bg-primary py-4 text-base font-semibold text-primary-foreground shadow-lg shadow-primary/30 transition-all hover:bg-primary/90 active:scale-[0.98] disabled:opacity-70"
        >
          {finishing && isLast && <Loader2 className="size-5 animate-spin" />}
          {!finishing && isLast && '开始使用'}
          {!isLast && '下一步'}
          {!finishing && !isLast && <ChevronRight className="size-5" />}
        </button>
      </div>
    </div>
  );
}
