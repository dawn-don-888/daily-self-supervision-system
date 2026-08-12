import { useEffect, useState, useRef } from 'react';
import { NavLink } from 'react-router-dom';
import { CalendarCheck, GraduationCap, HeartPulse, BarChart3, User } from 'lucide-react';
import { cn } from '@/lib/utils';

const TAB_ITEMS = [
  { path: '/', label: '今日', Icon: CalendarCheck, end: true },
  { path: '/learning', label: '学习', Icon: GraduationCap, end: false },
  { path: '/life', label: '生活', Icon: HeartPulse, end: false },
  { path: '/stats', label: '数据', Icon: BarChart3, end: false },
  { path: '/profile', label: '我的', Icon: User, end: false },
];

export default function BottomTabBar() {
  const [hidden, setHidden] = useState(false);
  const lastScrollY = useRef(0);
  const ticking = useRef(false);

  useEffect(() => {
    const handleScroll = () => {
      if (ticking.current) return;
      ticking.current = true;
      requestAnimationFrame(() => {
        const currentY = window.scrollY;
        const diff = currentY - lastScrollY.current;

        // 只有滚动距离超过一定阈值才切换，避免抖动
        if (diff > 8 && currentY > 120) {
          // 向上滑动（内容向上滚 = 用户手指向下划）→ 隐藏
          setHidden(true);
        } else if (diff < -8) {
          // 向下滑动 → 显示
          setHidden(false);
        }

        lastScrollY.current = currentY;
        ticking.current = false;
      });
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav
      className={cn(
        'fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-card/95 backdrop-blur-md transition-transform duration-300 ease-out',
        hidden ? 'translate-y-full' : 'translate-y-0',
      )}
    >
      <div className="mx-auto flex max-w-md items-center justify-around px-2 pb-[env(safe-area-inset-bottom)]">
        {TAB_ITEMS.map(({ path, label, Icon, end }) => (
          <NavLink
            key={path}
            to={path}
            end={end}
            className={({ isActive }) =>
              cn(
                'flex flex-1 flex-col items-center gap-0.5 py-2.5 transition-colors',
                isActive
                  ? 'text-primary'
                  : 'text-muted-foreground hover:text-foreground',
              )
            }
          >
            <Icon className="size-5 shrink-0" strokeWidth={1.8} />
            <span className="text-[11px] font-medium">{label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
