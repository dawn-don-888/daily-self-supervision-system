import { useState } from 'react';
import { motion } from 'framer-motion';
import { MOOD_OPTIONS, MOOD_TAGS } from '@/lib/constants';
import { cn } from '@/lib/utils';
import type { IMoodRecord } from '@/lib/storage';

interface MoodCardProps {
  mood?: IMoodRecord;
  onChange: (mood: IMoodRecord) => void;
}

export default function MoodCard({ mood, onChange }: MoodCardProps) {
  const [selectedScore, setSelectedScore] = useState(mood?.score ?? 0);
  const [tags, setTags] = useState<string[]>(mood?.tags ?? []);
  const [reason, setReason] = useState(mood?.reason ?? '');

  const handleScoreSelect = (score: number) => {
    setSelectedScore(score);
    const newMood = { score, tags, reason: reason || undefined };
    onChange(newMood);
  };

  const toggleTag = (tag: string) => {
    const newTags = tags.includes(tag) ? tags.filter((t) => t !== tag) : [...tags, tag];
    setTags(newTags);
    if (selectedScore > 0) {
      onChange({ score: selectedScore, tags: newTags, reason: reason || undefined });
    }
  };

  const handleReasonChange = (value: string) => {
    setReason(value);
    if (selectedScore > 0) {
      onChange({ score: selectedScore, tags, reason: value || undefined });
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4 }}
      className="rounded-2xl bg-card p-5 shadow-sm"
    >
      <h2 className="mb-1 text-base font-semibold text-foreground">今天心情怎么样？</h2>
      <p className="mb-4 text-sm text-muted-foreground">选一个最贴合的表情吧~</p>

      <div className="mb-4 flex items-center justify-between gap-1">
        {MOOD_OPTIONS.map((opt) => (
          <button
            key={opt.score}
            onClick={() => handleScoreSelect(opt.score)}
            className={cn(
              'flex flex-1 flex-col items-center gap-1 rounded-xl py-3 transition-all',
              selectedScore === opt.score
                ? 'bg-primary/10 scale-105'
                : 'hover:bg-muted',
            )}
          >
            <span className="text-2xl">{opt.emoji}</span>
            <span
              className={cn(
                'text-xs',
                selectedScore === opt.score
                  ? 'font-semibold text-primary'
                  : 'text-muted-foreground',
              )}
            >
              {opt.label}
            </span>
          </button>
        ))}
      </div>

      {selectedScore > 0 && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          transition={{ duration: 0.3 }}
          className="space-y-4 overflow-hidden"
        >
          <div>
            <p className="mb-2 text-xs text-muted-foreground">心情标签（可多选）</p>
            <div className="flex flex-wrap gap-2">
              {MOOD_TAGS.map((tag) => (
                <button
                  key={tag}
                  onClick={() => toggleTag(tag)}
                  className={cn(
                    'rounded-full px-3 py-1 text-xs transition-all',
                    tags.includes(tag)
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-muted-foreground hover:bg-muted/80',
                  )}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-xs text-muted-foreground">
              今天心情为什么这样？（选填）
            </label>
            <textarea
              value={reason}
              onChange={(e) => handleReasonChange(e.target.value)}
              placeholder="简单写几句吧..."
              rows={2}
              className="w-full resize-none rounded-xl border border-border bg-background px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}
