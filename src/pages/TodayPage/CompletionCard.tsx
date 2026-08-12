import { motion } from 'framer-motion';
import { CheckCircle2, Circle, PartyPopper } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CompletionCardProps {
  completedCount: number;
  totalItems: number;
  items: { key: string; label: string; done: boolean }[];
  allDone: boolean;
}

export default function CompletionCard({
  completedCount,
  totalItems,
  items,
  allDone,
}: CompletionCardProps) {
  const progress = totalItems > 0 ? (completedCount / totalItems) * 100 : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4, delay: 0.2 }}
      className={cn(
        'rounded-2xl p-5 shadow-sm',
        allDone
          ? 'bg-gradient-to-br from-primary to-amber-400 text-primary-foreground'
          : 'bg-card',
      )}
    >
      <div className="mb-3 flex items-center gap-2">
        {allDone ? (
          <PartyPopper className="size-5" />
        ) : (
          <CheckCircle2 className="size-5 text-primary" />
        )}
        <h2
          className={cn(
            'text-base font-semibold',
            allDone ? 'text-primary-foreground' : 'text-foreground',
          )}
        >
          {allDone ? '今日全部完成！🎉' : `今日完成 ${completedCount}/${totalItems}`}
        </h2>
      </div>

      {/* 进度条 */}
      <div
        className={cn(
          'mb-4 h-2 w-full overflow-hidden rounded-full',
          allDone ? 'bg-white/20' : 'bg-muted',
        )}
      >
        <motion.div
          initial={{ width: 0 }}
          whileInView={{ width: `${progress}%` }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: 'easeOut', delay: 0.3 }}
          className={cn(
            'h-full rounded-full',
            allDone ? 'bg-white' : 'bg-primary',
          )}
        />
      </div>

      {/* 完成项列表 */}
      <div className="grid grid-cols-2 gap-2">
        {items.map((item) => (
          <div key={item.key} className="flex items-center gap-2">
            {item.done ? (
              <CheckCircle2
                className={cn(
                  'size-4 shrink-0',
                  allDone ? 'text-white' : 'text-success',
                )}
              />
            ) : (
              <Circle
                className={cn(
                  'size-4 shrink-0',
                  allDone ? 'text-white/50' : 'text-muted-foreground/40',
                )}
              />
            )}
            <span
              className={cn(
                'text-xs',
                allDone
                  ? item.done
                    ? 'text-primary-foreground'
                    : 'text-primary-foreground/60'
                  : item.done
                    ? 'text-foreground'
                    : 'text-muted-foreground',
              )}
            >
              {item.label}
            </span>
          </div>
        ))}
      </div>

      {allDone && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-3 text-center text-sm font-medium"
        >
          你太棒了！继续保持呀 ✨
        </motion.p>
      )}
    </motion.div>
  );
}
