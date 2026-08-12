import { scopedStorage } from '@lark-apaas/client-toolkit-lite';
import { getLevelByPoints } from './constants';

// Storage keys
const KEYS = {
  DAILY_RECORDS: '__selfsuper_daily_records',
  LEARNING_PROGRESS: '__selfsuper_learning_progress',
  AIPM_PROGRESS: '__selfsuper_aipm_progress',
  VIBE_PROGRESS: '__selfsuper_vibe_progress',
  ENGLISH_PROGRESS: '__selfsuper_english_progress',
  ACHIEVEMENTS: '__selfsuper_achievements',
  SETTINGS: '__selfsuper_settings',
  ACCOUNTING: '__selfsuper_accounting',
  FITNESS: '__selfsuper_fitness',
  TODOS: '__selfsuper_todos',
  BRAIN: '__selfsuper_brain',
  INSPIRATIONS: '__selfsuper_inspirations',
  WEEKLY_REPORTS: '__selfsuper_weekly_reports',
  AWARDED_TODOS: '__selfsuper_awarded_todos',
} as const;

// ============ Types ============

export interface IMoodRecord {
  score: number;
  tags: string[];
  reason?: string;
}

export interface IDailyQuestion {
  question: string;
  answer: string;
}

export interface IDailyReview {
  goodPoint: string;
  nextStep: string;
}

export interface IInspiration {
  id: string;
  content: string;
  insight: string;
  category: string;
  createdAt: string;
}

export interface IDailyRecord {
  date: string;
  mood?: IMoodRecord;
  question?: IDailyQuestion;
  review?: IDailyReview;
  inspirations: IInspiration[];
  learningTaskDone: boolean;
  learningNote?: string;
  completedCount: number;
}

export interface ILearningProgress {
  currentDay: number;
  completedDays: number[];
  notes: Record<number, string>;
  stagesCompleted: number[];
}

export interface IAipmProgress {
  currentDay: number;
  completedDays: number[];
  notes: Record<number, string>;
  stagesCompleted: number[];
  pillarProgress: {
    tech: number;
    product: number;
    tools: number;
    business: number;
  };
}

export interface IVibeProgress {
  currentDay: number;
  completedDays: number[];
  notes: Record<number, string>;
  stagesCompleted: number[];
}

export interface IEnglishProgress {
  currentDay: number;
  completedDays: number[];
  totalMinutes: number;
  streakDays: number;
  lastReadDate?: string;
}

export interface IAchievementBadge {
  id: string;
  unlockedAt: string;
}

export interface IAchievementState {
  totalPoints: number;
  level: number;
  badges: IAchievementBadge[];
  streakDays: number;
  lastCheckInDate?: string;
}

export interface IAppSettings {
  onboardingDone: boolean;
  reminderEnabled: boolean;
  reminderTime: string;
}

export interface IAccountingRecord {
  id: string;
  type: 'expense' | 'income';
  amount: number;
  category: string;
  date: string;
  note?: string;
  createdAt: string;
}

export interface IAccountingState {
  records: IAccountingRecord[];
}

export interface IFitnessRecord {
  id: string;
  type: string;
  duration: number;
  date: string;
  createdAt: string;
}

export interface IFitnessState {
  records: IFitnessRecord[];
  streakDays: number;
  lastWorkoutDate?: string;
}

export interface ITodoItem {
  id: string;
  text: string;
  done: boolean;
  date: string;
  completedAt?: string;
}

export interface ITodoState {
  items: ITodoItem[];
}

export type InspirationSourceType = 'manual' | 'voice' | 'video';
export type InspirationStatus =
  | 'backlog'
  | 'todo'
  | 'in-progress'
  | 'review'
  | 'done';

export interface IInspirationCard {
  id: string;
  title: string;
  content: string;
  sourceType: InspirationSourceType;
  sourceUrl?: string;
  tags: string[];
  createdAt: string;
  status: InspirationStatus;
  planDate?: string;
  whyCollect?: string;
  videoId?: string;
}

export interface IInspirationState {
  cards: IInspirationCard[];
}

export type BrainTrainingType = 'english' | 'meditation' | 'reading' | 'writing' | 'review';

export interface IBrainRecord {
  id: string;
  type: BrainTrainingType;
  duration: number;
  date: string;
  note?: string;
  createdAt: string;
}

export interface IBrainState {
  records: IBrainRecord[];
  streakDays: number;
  lastDate?: string;
}

export interface IWeeklyReport {
  id: string;
  weekStart: string;
  weekEnd: string;
  generatedAt: string;
  data: {
    checkInDays: number;
    streakDays: number;
    learningProgress: {
      aiDev: number;
      aiPm: number;
      vibe: number;
    };
    accounting: {
      totalExpense: number;
      categoryBreakdown: { name: string; amount: number }[];
    };
    fitness: {
      days: number;
      totalMinutes: number;
    };
    brain: {
      days: number;
      totalMinutes: number;
    };
    inspiration: {
      newCount: number;
      doneCount: number;
      backlogCount: number;
    };
    todoCompletionRate: number;
    pointsGained: number;
    encouragement: string;
    dailyCompletedCounts: { date: string; count: number }[];
  };
}

export interface IAwardedTodoState {
  ids: string[];
}

// ============ Defaults ============

const DEFAULT_LEARNING_PROGRESS: ILearningProgress = {
  currentDay: 1, completedDays: [], notes: {}, stagesCompleted: [],
};
const DEFAULT_AIPM_PROGRESS: IAipmProgress = {
  currentDay: 1, completedDays: [], notes: {}, stagesCompleted: [],
  pillarProgress: { tech: 0, product: 0, tools: 0, business: 0 },
};
const DEFAULT_VIBE_PROGRESS: IVibeProgress = {
  currentDay: 1, completedDays: [], notes: {}, stagesCompleted: [],
};
const DEFAULT_ENGLISH_PROGRESS: IEnglishProgress = {
  currentDay: 1, completedDays: [], totalMinutes: 0, streakDays: 0,
};
const DEFAULT_ACHIEVEMENTS: IAchievementState = {
  totalPoints: 0, level: 1, badges: [], streakDays: 0,
};
const DEFAULT_SETTINGS: IAppSettings = {
  onboardingDone: false, reminderEnabled: false, reminderTime: '21:00',
};
const DEFAULT_ACCOUNTING: IAccountingState = { records: [] };
const DEFAULT_FITNESS: IFitnessState = { records: [], streakDays: 0 };
const DEFAULT_TODOS: ITodoState = { items: [] };
const DEFAULT_INSPIRATIONS: IInspirationState = { cards: [] };
const DEFAULT_BRAIN: IBrainState = { records: [], streakDays: 0 };
const DEFAULT_WEEKLY_REPORTS: IWeeklyReport[] = [];
const DEFAULT_AWARDED_TODOS: IAwardedTodoState = { ids: [] };

// ============ Helpers ============

function safeParse<T>(raw: string | null, fallback: T): T {
  if (!raw) return fallback;
  try { return JSON.parse(raw) as T; } catch { return fallback; }
}

function getTodayStr(): string {
  return new Date().toISOString().slice(0, 10);
}

function calcCompletedCount(record: Partial<IDailyRecord>): number {
  let count = 0;
  if (record.mood && record.mood.score > 0) count++;
  if (record.question?.answer?.trim()) count++;
  if (record.review?.goodPoint?.trim() && record.review?.nextStep?.trim()) count++;
  if (record.learningTaskDone) count++;
  return count;
}

// ============ Daily Records ============

export function getAllDailyRecords(): Record<string, IDailyRecord> {
  return safeParse(scopedStorage.getItem(KEYS.DAILY_RECORDS), {});
}

export function getTodayRecord(): IDailyRecord {
  const date = getTodayStr();
  const all = getAllDailyRecords();
  return all[date] ?? { date, inspirations: [], learningTaskDone: false, completedCount: 0 };
}

export function saveTodayRecord(record: Partial<IDailyRecord>): IDailyRecord {
  const date = getTodayStr();
  const all = getAllDailyRecords();
  const existing = all[date] ?? { date, inspirations: [], learningTaskDone: false, completedCount: 0 };
  const updated: IDailyRecord = { ...existing, ...record };
  updated.completedCount = calcCompletedCount(updated);
  all[date] = updated;
  scopedStorage.setItem(KEYS.DAILY_RECORDS, JSON.stringify(all));
  return updated;
}

// ============ Learning Progress ============

export function getLearningProgress(): ILearningProgress {
  return safeParse(scopedStorage.getItem(KEYS.LEARNING_PROGRESS), DEFAULT_LEARNING_PROGRESS);
}
export function saveLearningProgress(progress: ILearningProgress): void {
  scopedStorage.setItem(KEYS.LEARNING_PROGRESS, JSON.stringify(progress));
}

export function getAipmProgress(): IAipmProgress {
  return safeParse(scopedStorage.getItem(KEYS.AIPM_PROGRESS), DEFAULT_AIPM_PROGRESS);
}
export function saveAipmProgress(progress: IAipmProgress): void {
  scopedStorage.setItem(KEYS.AIPM_PROGRESS, JSON.stringify(progress));
}

export function getVibeProgress(): IVibeProgress {
  return safeParse(scopedStorage.getItem(KEYS.VIBE_PROGRESS), DEFAULT_VIBE_PROGRESS);
}
export function saveVibeProgress(progress: IVibeProgress): void {
  scopedStorage.setItem(KEYS.VIBE_PROGRESS, JSON.stringify(progress));
}

export function getEnglishProgress(): IEnglishProgress {
  return safeParse(scopedStorage.getItem(KEYS.ENGLISH_PROGRESS), DEFAULT_ENGLISH_PROGRESS);
}
export function saveEnglishProgress(progress: IEnglishProgress): void {
  scopedStorage.setItem(KEYS.ENGLISH_PROGRESS, JSON.stringify(progress));
}

export function checkInEnglish(minutes: number): IEnglishProgress {
  const today = getTodayStr();
  const progress = getEnglishProgress();
  const lastDate = progress.lastReadDate;
  let streak = progress.streakDays;
  if (lastDate !== today) {
    if (lastDate) {
      const diffDays = Math.round((new Date(today).getTime() - new Date(lastDate).getTime()) / 86400000);
      streak = diffDays === 1 ? streak + 1 : diffDays > 1 ? 1 : streak;
    } else { streak = 1; }
  }
  if (!progress.completedDays.includes(progress.currentDay)) {
    progress.completedDays.push(progress.currentDay);
  }
  const updated: IEnglishProgress = {
    ...progress, totalMinutes: progress.totalMinutes + minutes,
    streakDays: streak, lastReadDate: today,
  };
  saveEnglishProgress(updated);
  return updated;
}

// ============ Achievements ============

export function getAchievements(): IAchievementState {
  return safeParse(scopedStorage.getItem(KEYS.ACHIEVEMENTS), DEFAULT_ACHIEVEMENTS);
}
export function saveAchievements(state: IAchievementState): void {
  scopedStorage.setItem(KEYS.ACHIEVEMENTS, JSON.stringify(state));
}

export function addPoints(points: number): { state: IAchievementState; newBadges: string[] } {
  const state = getAchievements();
  const newTotal = state.totalPoints + points;
  const level = getLevelByPoints(newTotal).level;
  const updated = { ...state, totalPoints: newTotal, level };
  saveAchievements(updated);
  return { state: updated, newBadges: [] };
}

export function unlockBadge(badgeId: string): boolean {
  const state = getAchievements();
  if (state.badges.some((b) => b.id === badgeId)) return false;
  state.badges.push({ id: badgeId, unlockedAt: new Date().toISOString() });
  saveAchievements(state);
  return true;
}

export function updateStreakFromCheckin(): number {
  const today = getTodayStr();
  const state = getAchievements();
  if (state.lastCheckInDate === today) return state.streakDays;
  let streak = state.streakDays;
  if (state.lastCheckInDate) {
    const diffDays = Math.round((new Date(today).getTime() - new Date(state.lastCheckInDate).getTime()) / 86400000);
    streak = diffDays === 1 ? streak + 1 : diffDays > 1 ? 1 : streak;
  } else { streak = 1; }
  state.streakDays = streak;
  state.lastCheckInDate = today;
  saveAchievements(state);
  return streak;
}

// ============ Settings ============

export function getSettings(): IAppSettings {
  return safeParse(scopedStorage.getItem(KEYS.SETTINGS), DEFAULT_SETTINGS);
}
export function saveSettings(settings: IAppSettings): void {
  scopedStorage.setItem(KEYS.SETTINGS, JSON.stringify(settings));
}

// ============ Accounting ============

export function getAccounting(): IAccountingState {
  return safeParse(scopedStorage.getItem(KEYS.ACCOUNTING), DEFAULT_ACCOUNTING);
}
export function saveAccounting(state: IAccountingState): void {
  scopedStorage.setItem(KEYS.ACCOUNTING, JSON.stringify(state));
}

export function addAccountingRecord(record: Omit<IAccountingRecord, 'id' | 'createdAt'>): IAccountingRecord {
  const state = getAccounting();
  const newRecord: IAccountingRecord = {
    ...record, id: `acc_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    createdAt: new Date().toISOString(),
  };
  state.records.unshift(newRecord);
  saveAccounting(state);
  return newRecord;
}

export function deleteAccountingRecord(id: string): void {
  const state = getAccounting();
  state.records = state.records.filter((r) => r.id !== id);
  saveAccounting(state);
}

export function getAccountingDaysThisMonth(): number {
  const state = getAccounting();
  const now = new Date();
  const days = new Set<string>();
  state.records.forEach((r) => {
    const d = new Date(r.date);
    if (d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth()) days.add(r.date);
  });
  return days.size;
}

export function getMonthlyAccountingStats(): { expense: number; income: number } {
  const state = getAccounting();
  const now = new Date();
  let expense = 0, income = 0;
  state.records.forEach((r) => {
    const d = new Date(r.date);
    if (d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth()) {
      if (r.type === 'expense') expense += r.amount; else income += r.amount;
    }
  });
  return { expense, income };
}

// ============ Fitness ============

export function getFitness(): IFitnessState {
  return safeParse(scopedStorage.getItem(KEYS.FITNESS), DEFAULT_FITNESS);
}
export function saveFitness(state: IFitnessState): void {
  scopedStorage.setItem(KEYS.FITNESS, JSON.stringify(state));
}

export function addFitnessRecord(record: Omit<IFitnessRecord, 'id' | 'createdAt'>): IFitnessState {
  const state = getFitness();
  const newRecord: IFitnessRecord = {
    ...record, id: `fit_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    createdAt: new Date().toISOString(),
  };
  state.records.unshift(newRecord);
  const today = record.date;
  const lastDate = state.lastWorkoutDate;
  let streak = state.streakDays;
  if (lastDate !== today) {
    if (lastDate) {
      const diffDays = Math.round((new Date(today).getTime() - new Date(lastDate).getTime()) / 86400000);
      streak = diffDays === 1 ? streak + 1 : diffDays > 1 ? 1 : streak;
    } else { streak = 1; }
  }
  state.streakDays = streak;
  state.lastWorkoutDate = today;
  saveFitness(state);
  return state;
}

export function getWeeklyFitnessStats(): { days: number; totalMinutes: number } {
  const state = getFitness();
  const now = new Date();
  const dayOfWeek = now.getDay() || 7;
  const monday = new Date(now);
  monday.setDate(now.getDate() - dayOfWeek + 1);
  monday.setHours(0, 0, 0, 0);
  const days = new Set<string>();
  let totalMinutes = 0;
  state.records.forEach((r) => {
    if (new Date(r.date) >= monday) { days.add(r.date); totalMinutes += r.duration; }
  });
  return { days: days.size, totalMinutes };
}

// ============ Todos ============

export function getTodos(): ITodoState {
  return safeParse(scopedStorage.getItem(KEYS.TODOS), DEFAULT_TODOS);
}
export function saveTodos(state: ITodoState): void {
  scopedStorage.setItem(KEYS.TODOS, JSON.stringify(state));
}

export function addTodo(text: string): ITodoItem {
  const state = getTodos();
  const item: ITodoItem = {
    id: `todo_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    text, done: false, date: getTodayStr(),
  };
  state.items.unshift(item);
  saveTodos(state);
  return item;
}

export function toggleTodo(id: string): ITodoItem | undefined {
  const state = getTodos();
  const item = state.items.find((i) => i.id === id);
  if (!item) return undefined;
  item.done = !item.done;
  item.completedAt = item.done ? new Date().toISOString() : undefined;
  saveTodos(state);
  return item;
}

export function deleteTodo(id: string): void {
  const state = getTodos();
  state.items = state.items.filter((i) => i.id !== id);
  saveTodos(state);
}

export function getTodayTodoStats(): { total: number; done: number } {
  const state = getTodos();
  const today = getTodayStr();
  const todayItems = state.items.filter((i) => i.date === today);
  return { total: todayItems.length, done: todayItems.filter((i) => i.done).length };
}

export function getTotalCompletedTodos(): number {
  return getTodos().items.filter((i) => i.done).length;
}

// ============ Awarded Todos (防刷分) ============

export function getAwardedTodos(): IAwardedTodoState {
  return safeParse(scopedStorage.getItem(KEYS.AWARDED_TODOS), DEFAULT_AWARDED_TODOS);
}
export function saveAwardedTodos(state: IAwardedTodoState): void {
  scopedStorage.setItem(KEYS.AWARDED_TODOS, JSON.stringify(state));
}
export function isTodoAwarded(id: string): boolean {
  return getAwardedTodos().ids.includes(id);
}
export function markTodoAwarded(id: string): void {
  const state = getAwardedTodos();
  if (!state.ids.includes(id)) { state.ids.push(id); saveAwardedTodos(state); }
}
export function unmarkTodoAwarded(id: string): void {
  const state = getAwardedTodos();
  state.ids = state.ids.filter((x) => x !== id);
  saveAwardedTodos(state);
}

// ============ Inspiration (灵感碎片) ============

export function getInspirations(): IInspirationState {
  return safeParse(scopedStorage.getItem(KEYS.INSPIRATIONS), DEFAULT_INSPIRATIONS);
}
export function saveInspirations(state: IInspirationState): void {
  scopedStorage.setItem(KEYS.INSPIRATIONS, JSON.stringify(state));
}

export function addInspirationCard(
  card: Omit<IInspirationCard, 'id' | 'createdAt' | 'status'> & { status?: InspirationStatus },
): IInspirationCard {
  const state = getInspirations();
  const newCard: IInspirationCard = {
    ...card, id: `insp_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    createdAt: new Date().toISOString(), status: card.status ?? 'backlog',
  };
  state.cards.unshift(newCard);
  saveInspirations(state);
  return newCard;
}

export function updateInspirationStatus(id: string, status: InspirationStatus): void {
  const state = getInspirations();
  const card = state.cards.find((c) => c.id === id);
  if (card) { card.status = status; saveInspirations(state); }
}

export function deleteInspirationCard(id: string): void {
  const state = getInspirations();
  state.cards = state.cards.filter((c) => c.id !== id);
  saveInspirations(state);
}

export function monthlyInspirationConnect(): {
  groups: { tag: string; cards: IInspirationCard[] }[];
  totalBacklog: number;
  groupCount: number;
} {
  const state = getInspirations();
  const backlog = state.cards.filter((c) => c.status === 'backlog');
  const tagMap = new Map<string, IInspirationCard[]>();
  backlog.forEach((card) => {
    if (card.tags.length === 0) {
      const arr = tagMap.get('未分类') ?? [];
      arr.push(card); tagMap.set('未分类', arr);
    } else {
      card.tags.forEach((tag) => {
        const arr = tagMap.get(tag) ?? [];
        arr.push(card); tagMap.set(tag, arr);
      });
    }
  });
  const groups = Array.from(tagMap.entries())
    .map(([tag, cards]) => ({ tag, cards }))
    .sort((a, b) => b.cards.length - a.cards.length);
  return { groups, totalBacklog: backlog.length, groupCount: groups.length };
}

// ============ Brain Training ============

export const BRAIN_TYPE_LABELS: Record<BrainTrainingType, { name: string; icon: string; color: string }> = {
  english: { name: '英语朗读', icon: '📖', color: 'from-blue-500 to-cyan-500' },
  meditation: { name: '冥想', icon: '🧘', color: 'from-violet-500 to-purple-500' },
  reading: { name: '深度阅读', icon: '📚', color: 'from-emerald-500 to-teal-500' },
  writing: { name: '写作输出', icon: '✍️', color: 'from-amber-500 to-orange-500' },
  review: { name: '复盘思考', icon: '🤔', color: 'from-rose-500 to-pink-500' },
};

export function getBrainState(): IBrainState {
  return safeParse(scopedStorage.getItem(KEYS.BRAIN), DEFAULT_BRAIN);
}
export function saveBrainState(state: IBrainState): void {
  scopedStorage.setItem(KEYS.BRAIN, JSON.stringify(state));
}

export function addBrainRecord(record: Omit<IBrainRecord, 'id' | 'createdAt'>): IBrainState {
  const state = getBrainState();
  const newRecord: IBrainRecord = {
    ...record, id: `brain_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    createdAt: new Date().toISOString(),
  };
  state.records.unshift(newRecord);
  const today = record.date;
  const lastDate = state.lastDate;
  let streak = state.streakDays;
  if (lastDate !== today) {
    if (lastDate) {
      const diffDays = Math.round((new Date(today).getTime() - new Date(lastDate).getTime()) / 86400000);
      streak = diffDays === 1 ? streak + 1 : diffDays > 1 ? 1 : streak;
    } else { streak = 1; }
  }
  state.streakDays = streak;
  state.lastDate = today;
  saveBrainState(state);
  return state;
}

export function getWeeklyBrainStats(): { days: number; totalMinutes: number } {
  const state = getBrainState();
  const now = new Date();
  const dayOfWeek = now.getDay() || 7;
  const monday = new Date(now);
  monday.setDate(now.getDate() - dayOfWeek + 1);
  monday.setHours(0, 0, 0, 0);
  const weekRecords = state.records.filter((r) => new Date(r.date).getTime() >= monday.getTime());
  return {
    days: new Set(weekRecords.map((r) => r.date)).size,
    totalMinutes: weekRecords.reduce((s, r) => s + r.duration, 0),
  };
}

// ============ Weekly Reports ============

export function getWeeklyReports(): IWeeklyReport[] {
  return safeParse(scopedStorage.getItem(KEYS.WEEKLY_REPORTS), DEFAULT_WEEKLY_REPORTS);
}
export function saveWeeklyReport(report: IWeeklyReport): void {
  const reports = getWeeklyReports();
  const idx = reports.findIndex((r) => r.id === report.id);
  if (idx >= 0) reports[idx] = report; else reports.unshift(report);
  scopedStorage.setItem(KEYS.WEEKLY_REPORTS, JSON.stringify(reports));
}

export function generateWeeklyReport(weekStartDate: Date): IWeeklyReport {
  const monday = new Date(weekStartDate);
  monday.setHours(0, 0, 0, 0);
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  sunday.setHours(23, 59, 59, 999);

  const year = monday.getFullYear();
  const firstJan = new Date(year, 0, 1);
  const daysDiff = Math.floor((monday.getTime() - firstJan.getTime()) / 86400000);
  const weekNum = Math.ceil((daysDiff + firstJan.getDay() + 1) / 7);
  const reportId = `${year}-W${String(weekNum).padStart(2, '0')}`;
  const mondayStr = monday.toISOString().slice(0, 10);
  const sundayStr = sunday.toISOString().slice(0, 10);

  const dailyRecords = getAllDailyRecords();
  let checkInDays = 0;
  const dailyCompletedCounts: { date: string; count: number }[] = [];
  for (let d = new Date(monday); d <= sunday; d.setDate(d.getDate() + 1)) {
    const ds = d.toISOString().slice(0, 10);
    const count = dailyRecords[ds]?.completedCount ?? 0;
    dailyCompletedCounts.push({ date: ds, count });
    if (count > 0) checkInDays++;
  }

  const learningProgress = getLearningProgress();
  const aipmProgress = getAipmProgress();
  const vibeProgress = getVibeProgress();

  const accountingState = getAccounting();
  const weekExpenseRecords = accountingState.records.filter((r) => {
    const t = new Date(r.date).getTime();
    return r.type === 'expense' && t >= monday.getTime() && t <= sunday.getTime();
  });
  const totalExpense = weekExpenseRecords.reduce((s, r) => s + r.amount, 0);
  const catMap = new Map<string, number>();
  weekExpenseRecords.forEach((r) => catMap.set(r.category, (catMap.get(r.category) ?? 0) + r.amount));
  const EXPENSE_CATS = [
    { id: 'food', name: '餐饮' }, { id: 'transport', name: '交通' },
    { id: 'shopping', name: '购物' }, { id: 'housing', name: '住房' },
    { id: 'entertainment', name: '娱乐' }, { id: 'medical', name: '医疗' },
    { id: 'education', name: '教育' }, { id: 'other', name: '其他' },
  ];
  const categoryBreakdown = Array.from(catMap.entries())
    .map(([id, amount]) => ({ name: EXPENSE_CATS.find((c) => c.id === id)?.name ?? id, amount }))
    .sort((a, b) => b.amount - a.amount);

  const fitnessState = getFitness();
  const weekFitness = fitnessState.records.filter((r) => {
    const t = new Date(r.date).getTime();
    return t >= monday.getTime() && t <= sunday.getTime();
  });
  const fitnessDays = new Set(weekFitness.map((r) => r.date)).size;
  const fitnessMinutes = weekFitness.reduce((s, r) => s + r.duration, 0);

  const brainState = getBrainState();
  const weekBrain = brainState.records.filter((r) => {
    const t = new Date(r.date).getTime();
    return t >= monday.getTime() && t <= sunday.getTime();
  });
  const brainDays = new Set(weekBrain.map((r) => r.date)).size;
  const brainMinutes = weekBrain.reduce((s, r) => s + r.duration, 0);

  const inspState = getInspirations();
  const weekInsp = inspState.cards.filter((c) => {
    const t = new Date(c.createdAt).getTime();
    return t >= monday.getTime() && t <= sunday.getTime();
  });
  const backlogCount = inspState.cards.filter((c) => c.status === 'backlog').length;
  const doneCount = inspState.cards.filter((c) => c.status === 'done').length;

  const todoState = getTodos();
  const weekTodos = todoState.items.filter((i) => {
    const t = new Date(i.date).getTime();
    return t >= monday.getTime() && t <= sunday.getTime();
  });
  const todoCompletionRate = weekTodos.length > 0
    ? Math.round((weekTodos.filter((i) => i.done).length / weekTodos.length) * 100) : 0;

  const achievements = getAchievements();
  const encouragements = [
    '这一周你付出了很多努力，继续保持，成长就在每一个小行动里。',
    '坚持本身就是一种胜利，你已经比昨天的自己更强了。',
    '每一个微小的进步，都在为更大的改变积蓄力量。',
    '成长是一场马拉松，不是百米冲刺，慢慢来，比较快。',
    '你已经走了这么远，别忘了回头看看自己的进步。',
  ];

  const report: IWeeklyReport = {
    id: reportId, weekStart: mondayStr, weekEnd: sundayStr,
    generatedAt: new Date().toISOString(),
    data: {
      checkInDays, streakDays: achievements.streakDays,
      learningProgress: {
        aiDev: learningProgress.completedDays.length,
        aiPm: aipmProgress.completedDays.length,
        vibe: vibeProgress.completedDays.length,
      },
      accounting: { totalExpense, categoryBreakdown },
      fitness: { days: fitnessDays, totalMinutes: fitnessMinutes },
      brain: { days: brainDays, totalMinutes: brainMinutes },
      inspiration: { newCount: weekInsp.length, doneCount, backlogCount },
      todoCompletionRate, pointsGained: achievements.totalPoints,
      encouragement: encouragements[Math.floor(Math.random() * encouragements.length)],
      dailyCompletedCounts,
    },
  };
  saveWeeklyReport(report);
  return report;
}

// ============ Import / Export ============

export function exportAllData(): string {
  return JSON.stringify({
    dailyRecords: getAllDailyRecords(),
    learningProgress: getLearningProgress(),
    aipmProgress: getAipmProgress(),
    vibeProgress: getVibeProgress(),
    englishProgress: getEnglishProgress(),
    achievements: getAchievements(),
    settings: getSettings(),
    accounting: getAccounting(),
    fitness: getFitness(),
    todos: getTodos(),
    brain: getBrainState(),
    inspirations: getInspirations(),
    weeklyReports: getWeeklyReports(),
    awardedTodos: getAwardedTodos(),
    exportedAt: new Date().toISOString(),
  }, null, 2);
}

export function importAllData(jsonStr: string): boolean {
  try {
    const data = JSON.parse(jsonStr);
    const map: [string, string][] = [
      ['dailyRecords', KEYS.DAILY_RECORDS], ['learningProgress', KEYS.LEARNING_PROGRESS],
      ['aipmProgress', KEYS.AIPM_PROGRESS], ['vibeProgress', KEYS.VIBE_PROGRESS],
      ['englishProgress', KEYS.ENGLISH_PROGRESS], ['achievements', KEYS.ACHIEVEMENTS],
      ['settings', KEYS.SETTINGS], ['accounting', KEYS.ACCOUNTING],
      ['fitness', KEYS.FITNESS], ['todos', KEYS.TODOS],
      ['brain', KEYS.BRAIN], ['inspirations', KEYS.INSPIRATIONS],
      ['weeklyReports', KEYS.WEEKLY_REPORTS], ['awardedTodos', KEYS.AWARDED_TODOS],
    ];
    map.forEach(([key, storageKey]) => {
      if (data[key]) scopedStorage.setItem(storageKey, JSON.stringify(data[key]));
    });
    return true;
  } catch { return false; }
}

export function clearAllData(): void {
  Object.values(KEYS).forEach((key) => scopedStorage.removeItem(key));
}

export function getTodayDateStr(): string {
  return getTodayStr();
}
