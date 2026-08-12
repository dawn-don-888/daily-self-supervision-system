import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  getTodos,
  addTodo,
  toggleTodo,
  deleteTodo,
  getAchievements,
  saveAchievements,
  unlockBadge,
  POINTS,
  isTodoAwarded,
  markTodoAwarded,
  unmarkTodoAwarded,
} from '@/lib/storage';
import type { ITodoItem } from '@/lib/storage';
import { getLevelByPoints } from '@/lib/constants';
import { CheckSquare, Plus, Trash2, Check, Circle, Target, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

export default function TodoTracker() {
  const [state, setState] = useState(() => getTodos());
  const [text, setText] = useState('');

  const todayStr = new Date().toISOString().slice(0, 10);
  const todayTodos = state.items.filter((i) => i.date === todayStr);
  const todayDone = todayTodos.filter((i) => i.done).length;
  const todayTotal = todayTodos.length;

  const totalDone = state.items.filter((i) => i.done).length;

  const handleAdd = () => {
    if (!text.trim()) return;
    addTodo(text.trim());
    setState(getTodos());
    setText('');
    toast.success('待办已添加 ✅');
  };

  const handleToggle = (id: string) => {
    const item = state.items.find((i) => i.id === id);
    if (!item) return;
    const wasDone = item.done;
    toggleTodo(id);
    const newState = getTodos();
    setState(newState);

    const achievements = getAchievements();

    if (!wasDone) {
      // 从未完成 → 完成：只在未获得过积分时加分
      if (!isTodoAwarded(id)) {
        achievements.totalPoints += POINTS.TODO_COMPLETE;
        const newLevel = getLevelByPoints(achievements.totalPoints);
        achievements.level = newLevel.level;
        markTodoAwarded(id);

        const newDoneCount = totalDone + 1;
        if (newDoneCount >= 100) unlockBadge('todo-terminator');

        toast.success(`+${POINTS.TODO_COMPLETE} 积分 ✅`);
      }
      saveAchievements(achievements);
    } else {
      // 从完成 → 未完成：扣回积分（如果之前获得过）
      if (isTodoAwarded(id)) {
        achievements.totalPoints = Math.max(0, achievements.totalPoints - POINTS.TODO_COMPLETE);
        const newLevel = getLevelByPoints(achievements.totalPoints);
        achievements.level = newLevel.level;
        unmarkTodoAwarded(id);
        saveAchievements(achievements);
      }
    }
  };

  const handleDelete = (id: string) => {
    // 删除已完成且已获积分的待办时，扣回积分
    const item = state.items.find((i) => i.id === id);
    if (item && item.done && isTodoAwarded(id)) {
      const achievements = getAchievements();
      achievements.totalPoints = Math.max(0, achievements.totalPoints - POINTS.TODO_COMPLETE);
      const newLevel = getLevelByPoints(achievements.totalPoints);
      achievements.level = newLevel.level;
      unmarkTodoAwarded(id);
      saveAchievements(achievements);
    }
    deleteTodo(id);
    setState(getTodos());
    toast.success('已删除');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleAdd();
  };

  // 未完成的在前，已完成的在后
  const sortedItems = [...state.items].sort((a, b) => {
    if (a.done !== b.done) return a.done ? 1 : -1;
    return b.date.localeCompare(a.date);
  });

  return (
    <div className="space-y-4">
      {/* 今日概览 */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="grid grid-cols-2 gap-3"
      >
        <div className="rounded-2xl bg-gradient-to-br from-cyan-100/70 to-sky-100/60 p-4">
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Target className="size-3 text-cyan-600" /> 今日进度
          </div>
          <div className="mt-1 flex items-baseline gap-1">
            <span className="text-2xl font-bold text-cyan-700">{todayDone}</span>
            <span className="text-sm text-muted-foreground">/ {todayTotal}</span>
          </div>
          <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-white/60">
            <div
              className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-sky-500"
              style={{ width: todayTotal > 0 ? `${(todayDone / todayTotal) * 100}%` : '0%' }}
            />
          </div>
        </div>
        <div className="rounded-2xl bg-gradient-to-br from-cyan-100/70 to-sky-100/60 p-4">
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <CheckSquare className="size-3 text-cyan-600" /> 累计完成
          </div>
          <div className="mt-1 text-2xl font-bold text-cyan-700">{totalDone}</div>
          <p className="mt-2 text-xs text-muted-foreground">100个解锁"待办终结者"徽章</p>
        </div>
      </motion.div>

      {/* 添加待办 */}
      <div className="flex gap-2">
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="添加一个待办事项..."
          className="flex-1 rounded-xl border border-border bg-card px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground shadow-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/30"
        />
        <button
          onClick={handleAdd}
          disabled={!text.trim()}
          className="flex items-center justify-center gap-1 rounded-xl bg-gradient-to-r from-cyan-500 to-sky-500 px-4 text-sm font-semibold text-white shadow-md shadow-cyan-500/20 transition-all hover:opacity-90 active:scale-[0.98] disabled:opacity-50"
        >
          <Plus className="size-4" />
          添加
        </button>
      </div>

      {/* 待办列表 */}
      <div>
        <h3 className="mb-2 text-sm font-semibold text-foreground">
          全部待办 ({state.items.length})
        </h3>
        {sortedItems.length === 0 ? (
          <div className="rounded-2xl bg-card p-8 text-center shadow-sm">
            <CheckSquare className="mx-auto mb-2 size-10 text-muted-foreground/50" />
            <p className="text-sm text-muted-foreground">还没有待办事项~</p>
            <p className="mt-1 text-xs text-muted-foreground/70">添加第一个待办开始吧</p>
          </div>
        ) : (
          <div className="space-y-2">
            <AnimatePresence initial={false}>
              {sortedItems.map((item) => (
                <TodoItemCard
                  key={item.id}
                  item={item}
                  onToggle={() => handleToggle(item.id)}
                  onDelete={() => handleDelete(item.id)}
                />
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}

function TodoItemCard({
  item,
  onToggle,
  onDelete,
}: {
  item: ITodoItem;
  onToggle: () => void;
  onDelete: () => void;
}) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: 20 }}
      transition={{ duration: 0.2 }}
      className="flex items-center gap-3 rounded-2xl bg-card p-3 shadow-sm"
    >
      <button
        onClick={onToggle}
        className={cn(
          'flex size-6 shrink-0 items-center justify-center rounded-full border-2 transition-all',
          item.done
            ? 'border-cyan-500 bg-cyan-500 text-white'
            : 'border-border hover:border-cyan-400',
        )}
      >
        {item.done ? <Check className="size-3.5" /> : <Circle className="size-3 text-transparent" />}
      </button>
      <span
        className={cn(
          'flex-1 text-sm',
          item.done ? 'text-muted-foreground line-through' : 'text-foreground',
        )}
      >
        {item.text}
      </span>
      <button
        onClick={onDelete}
        className="flex size-8 shrink-0 items-center justify-center rounded-full text-muted-foreground/50 hover:bg-muted hover:text-rose-500"
      >
        <Trash2 className="size-4" />
      </button>
    </motion.div>
  );
}
