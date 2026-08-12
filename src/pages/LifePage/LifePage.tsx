import { useState } from 'react';
import { motion } from 'framer-motion';
import { useLocation, useNavigate } from 'react-router-dom';
import { Wallet, Dumbbell, CheckSquare, Lightbulb, Brain } from 'lucide-react';
import { cn } from '@/lib/utils';
import FinanceTracker from './sections/FinanceTracker';
import FitnessTracker from './sections/FitnessTracker';
import TodoTracker from './sections/TodoTracker';
import InspirationBoard from './sections/InspirationBoard';
import BrainTracker from './sections/BrainTracker';

const LIFE_TABS = [
  { id: 'finance', label: '记账', Icon: Wallet, color: 'text-amber-600' },
  { id: 'fitness', label: '健身', Icon: Dumbbell, color: 'text-rose-500' },
  { id: 'todo', label: '待办', Icon: CheckSquare, color: 'text-cyan-600' },
  { id: 'inspiration', label: '灵感', Icon: Lightbulb, color: 'text-indigo-500' },
  { id: 'brain', label: '健脑', Icon: Brain, color: 'text-fuchsia-500' },
];

export default function LifePage() {
  const location = useLocation();
  const navigate = useNavigate();

  const hash = location.hash.replace('#', '') || 'finance';
  const [activeTab, setActiveTab] = useState(hash);

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
    navigate(`#${tabId}`, { replace: true });
  };

  return (
    <div className="mx-auto max-w-md px-4 pb-20 pt-4">
      {/* 顶部 Tab */}
      <div className="mb-5">
        <div className="flex gap-2">
          {LIFE_TABS.map(({ id, label, Icon }) => (
            <button
              key={id}
              onClick={() => handleTabChange(id)}
              className={cn(
                'flex flex-1 items-center justify-center gap-1.5 rounded-full py-2 text-sm font-medium transition-all',
                activeTab === id
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'bg-card text-muted-foreground hover:bg-accent hover:text-foreground',
              )}
            >
              <Icon className="size-4" />
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* 内容区 */}
      <AnimatedTabContent key={activeTab}>
        {activeTab === 'finance' && <FinanceTracker />}
        {activeTab === 'fitness' && <FitnessTracker />}
        {activeTab === 'todo' && <TodoTracker />}
        {activeTab === 'inspiration' && <InspirationBoard />}
        {activeTab === 'brain' && <BrainTracker />}
      </AnimatedTabContent>
    </div>
  );
}

function AnimatedTabContent({ children, key }: { children: React.ReactNode; key: string }) {
  return (
    <motion.div
      key={key}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
    >
      {children}
    </motion.div>
  );
}
