import { useState } from 'react';
import { motion } from 'framer-motion';
import { useLocation, useNavigate } from 'react-router-dom';
import { Code2, Lightbulb, Zap, Volume2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import AiDevLearning from './sections/AiDevLearning';
import AiPmLearning from './sections/AiPmLearning';
import VibeLearning from './sections/VibeLearning';
import EnglishLearning from './sections/EnglishLearning';

const LEARNING_TABS = [
  { id: 'ai-dev', label: 'AI开发', Icon: Code2, color: 'text-primary' },
  { id: 'ai-pm', label: 'AI产品', Icon: Lightbulb, color: 'text-purple-500' },
  { id: 'vibe', label: 'Vibe Coding', Icon: Zap, color: 'text-emerald-500' },
  { id: 'english', label: '英语', Icon: Volume2, color: 'text-blue-500' },
];

export default function LearningPage() {
  const location = useLocation();
  const navigate = useNavigate();

  // 从 URL hash 获取当前 tab，默认 ai-dev
  const hash = location.hash.replace('#', '') || 'ai-dev';
  const [activeTab, setActiveTab] = useState(hash);

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
    navigate(`#${tabId}`, { replace: true });
  };

  return (
    <div className="mx-auto max-w-md px-4 pb-8 pt-4">
      {/* 顶部紧凑 Tab（四个一行排下，pill 样式） */}
      <div className="mb-5 rounded-full bg-muted p-1">
        <div className="grid grid-cols-4 gap-1">
          {LEARNING_TABS.map(({ id, label, Icon }) => (
            <button
              key={id}
              onClick={() => handleTabChange(id)}
              className={cn(
                'flex flex-col items-center justify-center gap-0.5 rounded-full py-2 text-[11px] font-medium transition-all',
                activeTab === id
                  ? 'bg-card text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground',
              )}
            >
              <Icon className="size-4" />
              <span className="truncate">{label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* 内容区 */}
      {activeTab === 'ai-dev' && <AiDevLearning />}
      {activeTab === 'ai-pm' && <AiPmLearning />}
      {activeTab === 'vibe' && <VibeLearning />}
      {activeTab === 'english' && <EnglishLearning />}
    </div>
  );
}
