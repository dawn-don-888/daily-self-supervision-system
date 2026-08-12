export interface ILevel {
  level: number
  name: string
  minPoints: number
  maxPoints: number
  icon: string
}

export interface IBadge {
  id: string
  name: string
  description: string
  unlockCondition: string
  icon: string
  unlocked: boolean
  unlockedAt?: string
}

export const MOCK_LEVELS: ILevel[] = [
  { level: 1, name: '新手', minPoints: 0, maxPoints: 100, icon: '🌱' },
  { level: 2, name: '学徒', minPoints: 100, maxPoints: 300, icon: '🌿' },
  { level: 3, name: '践行者', minPoints: 300, maxPoints: 600, icon: '🌳' },
  { level: 4, name: '成长者', minPoints: 600, maxPoints: 1000, icon: '🌟' },
  { level: 5, name: '大师', minPoints: 1000, maxPoints: 99999, icon: '👑' },
]

export const MOCK_BADGES: IBadge[] = [
  { id: '1', name: '第一步', description: '完成第一次打卡，开启成长之路', unlockCondition: '完成第一次打卡', icon: '🎯', unlocked: true, unlockedAt: '2025-01-01' },
  { id: '2', name: '七日坚持', description: '连续打卡7天，习惯初步养成', unlockCondition: '连续打卡7天', icon: '🔥', unlocked: true, unlockedAt: '2025-01-07' },
  { id: '3', name: '月度达人', description: '连续打卡30天，毅力非凡', unlockCondition: '连续打卡30天', icon: '🏆', unlocked: false },
  { id: '4', name: '百日筑基', description: '连续打卡100天，脱胎换骨', unlockCondition: '连续打卡100天', icon: '💎', unlocked: false },
  { id: '5', name: '反思者', description: '完成30次每日复盘', unlockCondition: '完成30次复盘', icon: '🤔', unlocked: false },
  { id: '6', name: '知识猎人', description: '收集50条知识启发', unlockCondition: '收集50条知识启发', icon: '📚', unlocked: false },
  { id: '7', name: '学习者', description: '完成第一个学习阶段', unlockCondition: '完成Coze启蒙阶段', icon: '🎓', unlocked: false },
  { id: '8', name: '代码新手', description: '完成Python基础阶段', unlockCondition: '完成Python基础阶段', icon: '🐍', unlocked: false },
  { id: '9', name: 'AI探索者', description: '完成LangChain框架阶段', unlockCondition: '完成LangChain阶段', icon: '🤖', unlocked: false },
  { id: '10', name: '创造者', description: '完成全部120天学习路径', unlockCondition: '完成全部学习路径', icon: '✨', unlocked: false },
]
