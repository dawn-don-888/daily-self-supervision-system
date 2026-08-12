import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, Plus, X, ChevronDown, ChevronUp } from 'lucide-react';
import { INSPIRATION_CATEGORIES } from '@/lib/constants';
import { cn } from '@/lib/utils';
import type { IInspiration } from '@/lib/storage';

interface InspirationCardProps {
  inspirations: IInspiration[];
  onAdd: (inspiration: IInspiration) => void;
  onRemove: (id: string) => void;
}

export default function InspirationCard({
  inspirations,
  onAdd,
  onRemove,
}: InspirationCardProps) {
  const [expanded, setExpanded] = useState(false);
  const [content, setContent] = useState('');
  const [insight, setInsight] = useState('');
  const [category, setCategory] = useState('认知提升');

  const handleAdd = () => {
    if (!content.trim() && !insight.trim()) return;
    const newInspiration: IInspiration = {
      id: Date.now().toString(),
      content: content.trim(),
      insight: insight.trim(),
      category,
      createdAt: new Date().toISOString(),
    };
    onAdd(newInspiration);
    setContent('');
    setInsight('');
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4, delay: 0.15 }}
      className="rounded-2xl bg-card p-5 shadow-sm"
    >
      <div className="mb-3 flex items-center gap-2">
        <BookOpen className="size-5 text-primary" />
        <h2 className="text-base font-semibold text-foreground">知识启发</h2>
        <span className="ml-1 rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
          {inspirations.length}条
        </span>
      </div>

      {/* 已记录的启发列表 */}
      {inspirations.length > 0 && (
        <div className="mb-4 space-y-2">
          {inspirations.slice(0, expanded ? undefined : 2).map((item) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="relative rounded-xl bg-muted/40 p-3"
            >
              <button
                onClick={() => onRemove(item.id)}
                className="absolute right-2 top-2 rounded-full p-1 text-muted-foreground hover:bg-background hover:text-destructive"
                aria-label="删除"
              >
                <X className="size-3.5" />
              </button>
              <span className="mb-1 inline-block rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-medium text-primary">
                {item.category}
              </span>
              {item.content && (
                <p className="mb-1 text-xs text-foreground">{item.content}</p>
              )}
              {item.insight && (
                <p className="text-xs text-muted-foreground">💡 {item.insight}</p>
              )}
            </motion.div>
          ))}
          {inspirations.length > 2 && (
            <button
              onClick={() => setExpanded(!expanded)}
              className="flex w-full items-center justify-center gap-1 py-1 text-xs text-muted-foreground hover:text-foreground"
            >
              {expanded ? (
                <>
                  收起 <ChevronUp className="size-3.5" />
                </>
              ) : (
                <>
                  展开全部 {inspirations.length} 条 <ChevronDown className="size-3.5" />
                </>
              )}
            </button>
          )}
        </div>
      )}

      {/* 添加新启发 */}
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="space-y-3 overflow-hidden"
        >
          <div>
            <label className="mb-1 block text-xs text-muted-foreground">看到了什么？</label>
            <input
              type="text"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="内容/链接/想法"
              className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs text-muted-foreground">对我有什么启发？</label>
            <input
              type="text"
              value={insight}
              onChange={(e) => setInsight(e.target.value)}
              placeholder="一句话启发"
              className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs text-muted-foreground">分类</label>
            <div className="flex flex-wrap gap-1.5">
              {INSPIRATION_CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setCategory(cat)}
                  className={cn(
                    'rounded-full px-2.5 py-1 text-[11px] transition-all',
                    category === cat
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-muted-foreground hover:bg-muted/80',
                  )}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
          <button
            onClick={handleAdd}
            disabled={!content.trim() && !insight.trim()}
            className="flex w-full items-center justify-center gap-1.5 rounded-xl bg-primary py-2.5 text-sm font-medium text-primary-foreground transition-all hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Plus className="size-4" /> 添加一条
          </button>
        </motion.div>
      </AnimatePresence>
    </motion.div>
  );
}
