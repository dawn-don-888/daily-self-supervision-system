import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ReactECharts from 'echarts-for-react';
import {
  addAccountingRecord,
  deleteAccountingRecord,
  getAccounting,
  getAchievements,
  saveAchievements,
  unlockBadge,
  POINTS,
} from '@/lib/storage';
import { ACCOUNTING_EXPENSE_CATEGORIES, ACCOUNTING_INCOME_CATEGORIES } from '@/lib/constants';
import type { IAccountingRecord } from '@/lib/storage';
import { Plus, Trash2, TrendingDown, TrendingUp, Wallet, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

export default function FinanceTracker() {
  const [records, setRecords] = useState<IAccountingRecord[]>(() => getAccounting().records);
  const [showForm, setShowForm] = useState(false);
  const [type, setType] = useState<'expense' | 'income'>('expense');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState(ACCOUNTING_EXPENSE_CATEGORIES[0].id);
  const [note, setNote] = useState('');
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));

  const categories = type === 'expense' ? ACCOUNTING_EXPENSE_CATEGORIES : ACCOUNTING_INCOME_CATEGORIES;

  // 本月统计
  const monthStats = useMemo(() => {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    const monthRecords = records.filter((r) => {
      const d = new Date(r.date);
      return d.getFullYear() === year && d.getMonth() === month;
    });
    const expense = monthRecords.filter((r) => r.type === 'expense').reduce((s, r) => s + r.amount, 0);
    const income = monthRecords.filter((r) => r.type === 'income').reduce((s, r) => s + r.amount, 0);
    const days = new Set(monthRecords.map((r) => r.date)).size;
    return { expense, income, balance: income - expense, days };
  }, [records]);

  // 分类支出饼图数据
  const pieData = useMemo(() => {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    const monthExpense = records.filter(
      (r) => r.type === 'expense' && new Date(r.date).getFullYear() === year && new Date(r.date).getMonth() === month,
    );
    const map = new Map<string, number>();
    monthExpense.forEach((r) => {
      map.set(r.category, (map.get(r.category) ?? 0) + r.amount);
    });
    return Array.from(map.entries()).map(([id, value]) => {
      const cat = ACCOUNTING_EXPENSE_CATEGORIES.find((c) => c.id === id);
      return { name: cat?.name ?? id, value };
    });
  }, [records]);

  const pieOption = useMemo(() => {
    const colors = ['#F59E0B', '#FBBF24', '#FCD34D', '#FDE68A', '#FEF3C7', '#D97706', '#92400E', '#78350F'];
    return {
      tooltip: {
        trigger: 'item',
        formatter: '{b}: ¥{c} ({d}%)',
      },
      legend: {
        show: false,
      },
      series: [
        {
          type: 'pie',
          radius: ['55%', '80%'],
          center: ['50%', '50%'],
          avoidLabelOverlap: false,
          itemStyle: {
            borderRadius: 6,
            borderColor: '#fff',
            borderWidth: 2,
          },
          label: {
            show: false,
          },
          data: pieData.length > 0 ? pieData : [{ name: '暂无支出', value: 1 }],
          color: pieData.length > 0 ? colors : ['#E5E7EB'],
        },
      ],
    };
  }, [pieData]);

  // 按日期分组
  const groupedRecords = useMemo(() => {
    const groups = new Map<string, IAccountingRecord[]>();
    const sorted = [...records].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    sorted.forEach((r) => {
      const arr = groups.get(r.date) ?? [];
      arr.push(r);
      groups.set(r.date, arr);
    });
    return Array.from(groups.entries());
  }, [records]);

  const handleSubmit = () => {
    const amt = parseFloat(amount);
    if (isNaN(amt) || amt <= 0) {
      toast.error('请输入有效金额');
      return;
    }
    const newRecord = {
      type,
      amount: amt,
      category,
      note: note.trim(),
      date,
    };
    const added = addAccountingRecord(newRecord);
    setRecords(getAccounting().records);

    const achievements = getAchievements();
    achievements.totalPoints += POINTS.ACCOUNTING;
    saveAchievements(achievements);

    // 连续记账徽章
    // 简单判断：本月记账天数达到7天
    if (monthStats.days + 1 >= 7 && records.every((r) => r.date !== date)) {
      unlockBadge('finance-7days');
    }

    toast.success(`记账成功 +${POINTS.ACCOUNTING} 积分 💰`);
    setShowForm(false);
    setAmount('');
    setNote('');
  };

  const handleDelete = (id: string) => {
    deleteAccountingRecord(id);
    setRecords(getAccounting().records);
    toast.success('已删除');
  };

  const getCategoryMeta = (catId: string, t: 'expense' | 'income') => {
    const cats = t === 'expense' ? ACCOUNTING_EXPENSE_CATEGORIES : ACCOUNTING_INCOME_CATEGORIES;
    return cats.find((c) => c.id === catId);
  };

  return (
    <div className="space-y-4">
      {/* 本月概览 */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="rounded-2xl bg-gradient-to-br from-amber-100/70 to-yellow-100/60 p-4"
      >
        <h3 className="mb-3 text-sm font-semibold text-foreground">本月概览</h3>
        <div className="mb-3 grid grid-cols-3 gap-2">
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 text-xs text-muted-foreground">
              <TrendingDown className="size-3 text-rose-500" /> 支出
            </div>
            <div className="text-lg font-bold text-rose-600">¥{monthStats.expense.toFixed(2)}</div>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 text-xs text-muted-foreground">
              <TrendingUp className="size-3 text-emerald-500" /> 收入
            </div>
            <div className="text-lg font-bold text-emerald-600">¥{monthStats.income.toFixed(2)}</div>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 text-xs text-muted-foreground">
              <Wallet className="size-3 text-amber-600" /> 结余
            </div>
            <div className="text-lg font-bold text-amber-700">¥{monthStats.balance.toFixed(2)}</div>
          </div>
        </div>
        <p className="text-center text-xs text-muted-foreground">本月已记账 {monthStats.days} 天</p>
      </motion.div>

      {/* 支出饼图 */}
      {pieData.length > 0 && (
        <div className="rounded-2xl bg-card p-4 shadow-sm">
          <h3 className="mb-2 text-sm font-semibold text-foreground">支出分类占比</h3>
          <div className="flex items-center">
            <div className="h-40 flex-1">
              <ReactECharts option={pieOption} style={{ height: '100%', width: '100%' }} />
            </div>
            <div className="w-28 space-y-1.5">
              {pieData.slice(0, 5).map((item, i) => {
                const colors = ['#F59E0B', '#FBBF24', '#FCD34D', '#FDE68A', '#FEF3C7'];
                return (
                  <div key={item.name} className="flex items-center gap-1.5">
                    <span
                      className="size-2 shrink-0 rounded-full"
                      style={{ backgroundColor: colors[i] }}
                    />
                    <span className="truncate text-xs text-muted-foreground">{item.name}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* 记一笔按钮 */}
      <button
        onClick={() => setShowForm(true)}
        className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 py-3.5 text-base font-semibold text-white shadow-md shadow-amber-500/20 transition-all hover:opacity-90 active:scale-[0.98]"
      >
        <Plus className="size-5" />
        记一笔
      </button>

      {/* 账单列表 */}
      <div>
        <h3 className="mb-2 text-sm font-semibold text-foreground">账单记录</h3>
        {groupedRecords.length === 0 ? (
          <div className="rounded-2xl bg-card p-8 text-center shadow-sm">
            <Wallet className="mx-auto mb-2 size-10 text-muted-foreground/50" />
            <p className="text-sm text-muted-foreground">还没有记账记录~</p>
            <p className="mt-1 text-xs text-muted-foreground/70">点击上方按钮开始记账</p>
          </div>
        ) : (
          <div className="space-y-3">
            {groupedRecords.map(([dateStr, dayRecords]) => {
              const dayExpense = dayRecords
                .filter((r) => r.type === 'expense')
                .reduce((s, r) => s + r.amount, 0);
              const dayIncome = dayRecords
                .filter((r) => r.type === 'income')
                .reduce((s, r) => s + r.amount, 0);
              return (
                <div key={dateStr} className="rounded-2xl bg-card p-3 shadow-sm">
                  <div className="mb-2 flex items-center justify-between border-b border-border/50 pb-2">
                    <span className="text-sm font-medium text-foreground">{dateStr}</span>
                    <div className="text-xs text-muted-foreground">
                      {dayIncome > 0 && <span className="text-emerald-500">收 ¥{dayIncome}</span>}
                      {dayIncome > 0 && dayExpense > 0 && <span className="mx-1">·</span>}
                      {dayExpense > 0 && <span className="text-rose-500">支 ¥{dayExpense}</span>}
                    </div>
                  </div>
                  <div className="space-y-2">
                    {dayRecords.map((r) => {
                      const meta = getCategoryMeta(r.category, r.type);
                      return (
                        <div key={r.id} className="flex items-center gap-3">
                          <div
                            className={cn(
                              'flex size-9 shrink-0 items-center justify-center rounded-full text-base',
                              r.type === 'expense' ? 'bg-rose-50' : 'bg-emerald-50',
                            )}
                          >
                            {meta?.icon ?? '💰'}
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="text-sm font-medium text-foreground">
                              {meta?.name ?? r.category}
                            </div>
                            {r.note && (
                              <p className="truncate text-xs text-muted-foreground">{r.note}</p>
                            )}
                          </div>
                          <div
                            className={cn(
                              'text-sm font-semibold',
                              r.type === 'expense' ? 'text-rose-600' : 'text-emerald-600',
                            )}
                          >
                            {r.type === 'expense' ? '-' : '+'}¥{r.amount.toFixed(2)}
                          </div>
                          <button
                            onClick={() => handleDelete(r.id)}
                            className="flex size-8 shrink-0 items-center justify-center rounded-full text-muted-foreground/60 hover:bg-muted hover:text-rose-500"
                          >
                            <Trash2 className="size-4" />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 记账表单弹窗 */}
      <AnimatePresence>
        {showForm && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[60] bg-black/40"
              onClick={() => setShowForm(false)}
            />
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="fixed bottom-0 left-1/2 z-[70] w-full max-w-md -translate-x-1/2 rounded-t-3xl bg-card p-5 pb-8 shadow-2xl"
            >
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-lg font-bold text-foreground">记一笔</h3>
                <button
                  onClick={() => setShowForm(false)}
                  className="flex size-8 items-center justify-center rounded-full bg-muted text-muted-foreground hover:bg-accent"
                >
                  <X className="size-4" />
                </button>
              </div>

              {/* 类型切换 */}
              <div className="mb-4 grid grid-cols-2 gap-2 rounded-xl bg-muted p-1">
                <button
                  onClick={() => {
                    setType('expense');
                    setCategory(ACCOUNTING_EXPENSE_CATEGORIES[0].id);
                  }}
                  className={cn(
                    'rounded-lg py-2 text-sm font-medium transition-all',
                    type === 'expense'
                      ? 'bg-card text-rose-600 shadow-sm'
                      : 'text-muted-foreground',
                  )}
                >
                  支出
                </button>
                <button
                  onClick={() => {
                    setType('income');
                    setCategory(ACCOUNTING_INCOME_CATEGORIES[0].id);
                  }}
                  className={cn(
                    'rounded-lg py-2 text-sm font-medium transition-all',
                    type === 'income'
                      ? 'bg-card text-emerald-600 shadow-sm'
                      : 'text-muted-foreground',
                  )}
                >
                  收入
                </button>
              </div>

              {/* 金额输入 */}
              <div className="mb-4">
                <label className="mb-1.5 block text-sm font-medium text-foreground">金额</label>
                <div className="flex items-center gap-2 rounded-xl border border-border bg-background px-3 py-3">
                  <span className="text-xl font-bold text-foreground">¥</span>
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="0.00"
                    inputMode="decimal"
                    className="flex-1 bg-transparent text-xl font-bold text-foreground placeholder:text-muted-foreground/50 focus:outline-none"
                  />
                </div>
              </div>

              {/* 分类选择 */}
              <div className="mb-4">
                <label className="mb-1.5 block text-sm font-medium text-foreground">分类</label>
                <div className="grid grid-cols-4 gap-2">
                  {categories.map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => setCategory(cat.id)}
                      className={cn(
                        'flex flex-col items-center gap-1 rounded-xl p-2 text-xs transition-all',
                        category === cat.id
                          ? type === 'expense'
                            ? 'bg-rose-50 ring-1 ring-rose-200'
                            : 'bg-emerald-50 ring-1 ring-emerald-200'
                          : 'bg-muted/50 hover:bg-muted',
                      )}
                    >
                      <span className="text-lg">{cat.icon}</span>
                      <span
                        className={cn(
                          category === cat.id
                            ? type === 'expense'
                              ? 'text-rose-700'
                              : 'text-emerald-700'
                            : 'text-muted-foreground',
                        )}
                      >
                        {cat.name}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* 日期 */}
              <div className="mb-4">
                <label className="mb-1.5 block text-sm font-medium text-foreground">日期</label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-amber-500/30"
                />
              </div>

              {/* 备注 */}
              <div className="mb-5">
                <label className="mb-1.5 block text-sm font-medium text-foreground">备注（选填）</label>
                <input
                  type="text"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="写点什么..."
                  className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-amber-500/30"
                />
              </div>

              <button
                onClick={handleSubmit}
                className="w-full rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 py-3 text-base font-semibold text-white shadow-md shadow-amber-500/20 transition-all hover:opacity-90 active:scale-[0.98]"
              >
                保存
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
