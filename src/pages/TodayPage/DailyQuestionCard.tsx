import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Lightbulb } from 'lucide-react';
import type { IDailyQuestion } from '@/lib/storage';

interface DailyQuestionCardProps {
  question: string;
  savedQuestion?: IDailyQuestion;
  onChange: (answer: string) => void;
}

export default function DailyQuestionCard({
  question,
  savedQuestion,
  onChange,
}: DailyQuestionCardProps) {
  const [answer, setAnswer] = useState(savedQuestion?.answer ?? '');

  useEffect(() => {
    setAnswer(savedQuestion?.answer ?? '');
  }, [savedQuestion?.answer]);

  const handleChange = (value: string) => {
    setAnswer(value);
    onChange(value);
  };

  const hasAnswer = answer.trim().length > 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4, delay: 0.05 }}
      className="rounded-2xl bg-card p-5 shadow-sm"
    >
      <div className="mb-3 flex items-start gap-2">
        <div className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
          <Lightbulb className="size-4" />
        </div>
        <div className="flex-1">
          <p className="text-sm font-medium text-foreground">每日一问</p>
          <p className="mt-1 text-base font-semibold leading-relaxed text-foreground">
            {question}
          </p>
        </div>
        {hasAnswer && (
          <span className="shrink-0 text-xs text-success">✓ 已回答</span>
        )}
      </div>

      <textarea
        value={answer}
        onChange={(e) => handleChange(e.target.value)}
        placeholder="写几句话回答吧，不用很长~"
        rows={4}
        className="w-full resize-none rounded-xl border border-border bg-background px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
      />
    </motion.div>
  );
}
