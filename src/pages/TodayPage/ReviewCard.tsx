import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, ArrowRight } from 'lucide-react';
import type { IDailyReview } from '@/lib/storage';

interface ReviewCardProps {
  review?: IDailyReview;
  onChange: (review: IDailyReview) => void;
}

export default function ReviewCard({ review, onChange }: ReviewCardProps) {
  const [goodPoint, setGoodPoint] = useState(review?.goodPoint ?? '');
  const [nextStep, setNextStep] = useState(review?.nextStep ?? '');

  useEffect(() => {
    setGoodPoint(review?.goodPoint ?? '');
    setNextStep(review?.nextStep ?? '');
  }, [review?.goodPoint, review?.nextStep]);

  const isComplete = goodPoint.trim().length > 0 && nextStep.trim().length > 0;

  const handleGoodPointChange = (val: string) => {
    setGoodPoint(val);
    onChange({ goodPoint: val, nextStep });
  };

  const handleNextStepChange = (val: string) => {
    setNextStep(val);
    onChange({ goodPoint, nextStep: val });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4, delay: 0.1 }}
      className="rounded-2xl bg-gradient-to-br from-primary/5 to-secondary/30 p-5 shadow-sm"
    >
      <div className="mb-4 flex items-center gap-2">
        <Sparkles className="size-5 text-primary" />
        <h2 className="text-base font-semibold text-foreground">每日复盘</h2>
        {isComplete && (
          <span className="ml-auto text-xs text-success">✓ 已完成</span>
        )}
      </div>

      <div className="space-y-4">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-foreground">
            今天做得好的一点是什么？
          </label>
          <input
            type="text"
            value={goodPoint}
            onChange={(e) => handleGoodPointChange(e.target.value)}
            placeholder="哪怕很小的进步也值得记录~"
            className="w-full rounded-xl border border-border bg-card px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
        </div>

        <div className="flex items-center gap-2">
          <ArrowRight className="size-4 text-muted-foreground" />
          <div className="h-px flex-1 bg-border/60" />
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-foreground">
            明天最小的一步是什么？
          </label>
          <input
            type="text"
            value={nextStep}
            onChange={(e) => handleNextStepChange(e.target.value)}
            placeholder="具体到一件事，比如'看1集教程'"
            className="w-full rounded-xl border border-border bg-card px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
        </div>
      </div>
    </motion.div>
  );
}
