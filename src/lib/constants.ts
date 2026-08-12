// 积分规则
export const POINTS = {
  DAILY_CHECKIN: 10,
  REVIEW: 15,
  MOOD: 5,
  INSPIRATION: 10,
  LEARNING_TASK: 20,
  STREAK_BONUS: 1,
  ENGLISH_READ: 15,
  FITNESS: 10,
  ACCOUNTING: 5,
  TODO_COMPLETE: 2,
  AIPM_TASK: 20,
  VIBE_TASK: 20,
} as const;

// 每日一问问题库
export const DAILY_QUESTIONS = [
  '今天最有成就感的一件事是什么？',
  '今天学到了什么新东西？',
  '今天的卡点是什么？',
  '今天有没有什么小确幸？',
  '今天哪个瞬间让你觉得在进步？',
  '今天遇到了什么挑战？怎么应对的？',
  '如果今天可以重来，你会改变什么？',
  '今天有没有帮助别人？',
  '今天最专注的是哪段时间？',
  '今天读了/看了什么有启发的内容？',
  '今天身体感觉怎么样？',
  '今天和谁聊了天？有什么收获？',
  '今天有没有迈出舒适区？',
  '今天最开心的瞬间是什么？',
  '今天有没有拖延？为什么？',
  '今天为目标做了什么？',
  '今天有没有对自己好一点？',
  '今天学到的一个教训是什么？',
  '今天最期待明天的什么？',
  '用三个词形容今天',
  '今天让你微笑的一件小事是什么？',
  '今天放弃了什么？是正确的选择吗？',
  '今天最珍惜的人是谁？',
  '今天的精力状态如何？',
];

export const MOOD_TAGS = ['开心','平静','焦虑','疲惫','兴奋','沮丧','充实','迷茫'];

export const MOOD_OPTIONS = [
  { score: 5, emoji: '😊', label: '很棒' },
  { score: 4, emoji: '🙂', label: '不错' },
  { score: 3, emoji: '😐', label: '一般' },
  { score: 2, emoji: '😟', label: '不好' },
  { score: 1, emoji: '😢', label: '很差' },
];

export const INSPIRATION_CATEGORIES = ['认知提升','效率方法','投资理财','心理学','AI技术','其他'];

export const LEVELS = [
  { level: 1, name: '新手', minPoints: 0, maxPoints: 100, icon: '🌱' },
  { level: 2, name: '学徒', minPoints: 100, maxPoints: 300, icon: '🌿' },
  { level: 3, name: '践行者', minPoints: 300, maxPoints: 600, icon: '🌳' },
  { level: 4, name: '成长者', minPoints: 600, maxPoints: 1000, icon: '🌟' },
  { level: 5, name: '大师', minPoints: 1000, maxPoints: 99999, icon: '👑' },
];

export const BADGE_DEFINITIONS = [
  { id: 'first-step', name: '第一步', description: '完成第一次打卡，开启成长之路', icon: '🎯' },
  { id: 'seven-days', name: '七日坚持', description: '连续打卡7天，习惯初步养成', icon: '🔥' },
  { id: 'thirty-days', name: '月度达人', description: '连续打卡30天，毅力非凡', icon: '🏆' },
  { id: 'hundred-days', name: '百日筑基', description: '连续打卡100天，脱胎换骨', icon: '💎' },
  { id: 'reflector', name: '反思者', description: '完成30次每日复盘', icon: '🤔' },
  { id: 'knowledge-hunter', name: '知识猎人', description: '收集50条知识启发', icon: '📚' },
  { id: 'learner', name: '学习者', description: '完成第一个学习阶段', icon: '🎓' },
  { id: 'code-beginner', name: '代码新手', description: '完成Python基础阶段', icon: '🐍' },
  { id: 'ai-explorer', name: 'AI探索者', description: '完成LangChain框架阶段', icon: '🤖' },
  { id: 'creator', name: '创造者', description: '完成全部120天学习路径', icon: '✨' },
  { id: 'english-beginner', name: '朗读新手', description: '完成第一次英语朗读打卡', icon: '📖' },
  { id: 'english-7days', name: '朗读7天', description: '连续朗读7天，养成朗读习惯', icon: '🗣️' },
  { id: 'english-30days', name: '朗读30天', description: '连续朗读30天，口语突飞猛进', icon: '🎙️' },
  { id: 'fitness-lover', name: '运动达人', description: '健身打卡累计7天', icon: '💪' },
  { id: 'accounting-master', name: '记账小能手', description: '连续记账7天', icon: '💰' },
  { id: 'todo-terminator', name: '待办终结者', description: '累计完成100个待办', icon: '✅' },
  { id: 'pm-beginner', name: '产品新手', description: '完成AI产品经理第一阶段', icon: '📐' },
  { id: 'vibe-beginner', name: 'Vibe初学者', description: '完成Vibe Coding第一阶段', icon: '⚡' },
  { id: 'all-rounder', name: '全能选手', description: '同一天完成所有打卡项', icon: '🏅' },
];

export interface ICategoryItem {
  id: string;
  name: string;
  icon: string;
}

export const ACCOUNTING_EXPENSE_CATEGORIES: ICategoryItem[] = [
  { id: 'food', name: '餐饮', icon: '🍜' },
  { id: 'transport', name: '交通', icon: '🚗' },
  { id: 'shopping', name: '购物', icon: '🛍️' },
  { id: 'housing', name: '住房', icon: '🏠' },
  { id: 'entertainment', name: '娱乐', icon: '🎮' },
  { id: 'medical', name: '医疗', icon: '💊' },
  { id: 'education', name: '教育', icon: '📚' },
  { id: 'other', name: '其他', icon: '📦' },
];

export const ACCOUNTING_INCOME_CATEGORIES: ICategoryItem[] = [
  { id: 'salary', name: '工资', icon: '💰' },
  { id: 'parttime', name: '兼职', icon: '💼' },
  { id: 'investment', name: '理财', icon: '📈' },
  { id: 'other', name: '其他', icon: '🎁' },
];

export const FITNESS_TYPES: ICategoryItem[] = [
  { id: 'running', name: '跑步', icon: '🏃' },
  { id: 'pushup', name: '俯卧撑', icon: '💪' },
  { id: 'squat', name: '深蹲', icon: '🦵' },
  { id: 'plank', name: '平板支撑', icon: '🧘' },
  { id: 'jumping', name: '跳绳', icon: '🪢' },
  { id: 'walking', name: '散步', icon: '🚶' },
  { id: 'yoga', name: '瑜伽', icon: '🧘‍♀️' },
  { id: 'other', name: '其他', icon: '⚽' },
];

export function getQuestionOfDay(dateStr?: string): string {
  const date = dateStr ?? new Date().toISOString().slice(0, 10);
  let hash = 0;
  for (let i = 0; i < date.length; i++) {
    hash = (hash << 5) - hash + date.charCodeAt(i);
    hash = hash & hash;
  }
  return DAILY_QUESTIONS[Math.abs(hash) % DAILY_QUESTIONS.length];
}

export function getLevelByPoints(points: number) {
  for (let i = LEVELS.length - 1; i >= 0; i--) {
    if (points >= LEVELS[i].minPoints) return LEVELS[i];
  }
  return LEVELS[0];
}

export const AIPM_PILLARS = [
  { id: 'tech', name: '技术能力', icon: '🧠', color: 'from-purple-500 to-indigo-500' },
  { id: 'product', name: '产品模式', icon: '💡', color: 'from-pink-500 to-rose-500' },
  { id: 'tools', name: '工具生态', icon: '🛠️', color: 'from-cyan-500 to-blue-500' },
  { id: 'business', name: '商业动态', icon: '📈', color: 'from-amber-500 to-orange-500' },
];
