export interface IVibeStage {
  id: number;
  name: string;
  totalDays: number;
  startDay: number;
}

export interface IVibeTask {
  day: number;
  title: string;
  description?: string;
  stageId: number;
  points: number;
}

export const MOCK_VIBE_STAGES: IVibeStage[] = [
  { id: 1, name: '入门', totalDays: 7, startDay: 1 },
  { id: 2, name: '进阶', totalDays: 11, startDay: 8 },
  { id: 3, name: '实战', totalDays: 12, startDay: 19 },
];

export const MOCK_VIBE_TASKS: IVibeTask[] = [
  { day: 1, title: '什么是Vibe Coding', description: '看一个演示视频，感受"说话就能做App"', stageId: 1, points: 20 },
  { day: 2, title: '注册AI编程工具', description: '注册Cursor或Trae，安装并熟悉界面', stageId: 1, points: 20 },
  { day: 3, title: '第一个网页：Hello World', description: '让AI帮你做一个个人介绍页', stageId: 1, points: 20 },
  { day: 4, title: '学习如何描述需求', description: '提示词基础：说清楚要什么、什么风格', stageId: 1, points: 20 },
  { day: 5, title: '做一个待办事项应用', description: '体验从需求到成品的完整过程', stageId: 1, points: 20 },
  { day: 6, title: '让AI修改代码', description: '练习：把按钮改颜色、加删除功能等', stageId: 1, points: 20 },
  { day: 7, title: '阶段复盘：入门', description: '我能用AI做出简单网页了吗？', stageId: 1, points: 20 },
  { day: 8, title: '学习如何拆解需求', description: '把大需求拆成小步骤告诉AI', stageId: 2, points: 20 },
  { day: 9, title: '天气查询应用', description: '让AI做一个天气查询应用（学习API调用）', stageId: 2, points: 20 },
  { day: 10, title: '学习如何调试', description: 'AI写的代码有bug怎么办（把错误信息发给AI）', stageId: 2, points: 20 },
  { day: 11, title: '计算器应用', description: '让AI做一个计算器应用', stageId: 2, points: 20 },
  { day: 12, title: '管理项目文件', description: '学习理解项目文件结构', stageId: 2, points: 20 },
  { day: 13, title: '简单的博客页面', description: '让AI做一个简单的博客页面', stageId: 2, points: 20 },
  { day: 14, title: '加动画效果', description: '学习如何让AI帮你加动画效果', stageId: 2, points: 20 },
  { day: 15, title: '番茄钟应用', description: '让AI做一个番茄钟应用', stageId: 2, points: 20 },
  { day: 16, title: '响应式设计', description: '让网页在手机上也好看', stageId: 2, points: 20 },
  { day: 17, title: '记账应用', description: '让AI做一个记账应用（为生活模块打基础）', stageId: 2, points: 20 },
  { day: 18, title: '阶段复盘：进阶', description: '我能独立用AI做一个完整小应用了吗？', stageId: 2, points: 20 },
  { day: 19, title: '选定你的产品想法', description: '写Mini-PRD：一句话描述+核心功能列表', stageId: 3, points: 20 },
  { day: 20, title: '设计产品结构', description: '让AI帮你设计页面结构和用户流程', stageId: 3, points: 20 },
  { day: 21, title: '开始开发：首页', description: '让AI写代码，先做首页', stageId: 3, points: 20 },
  { day: 22, title: '继续开发：核心功能页', description: '实现产品的核心功能页面', stageId: 3, points: 20 },
  { day: 23, title: '继续开发：数据存储', description: '添加数据存储功能（localStorage/后端）', stageId: 3, points: 20 },
  { day: 24, title: '用户登录功能', description: '让AI帮你加用户登录功能', stageId: 3, points: 20 },
  { day: 25, title: '美化UI', description: '让AI帮你美化UI界面', stageId: 3, points: 20 },
  { day: 26, title: '测试与修bug', description: '测试你的产品，让AI帮你修bug', stageId: 3, points: 20 },
  { day: 27, title: '学习部署上线', description: '让AI教你用Vercel或Netlify部署', stageId: 3, points: 20 },
  { day: 28, title: '部署到网上', description: '把你的产品部署到互联网上', stageId: 3, points: 20 },
  { day: 29, title: '产品介绍与分享', description: '写产品介绍，分享给朋友试用', stageId: 3, points: 20 },
  { day: 30, title: '总复盘：从0到1做产品', description: '我用Vibe Coding做出了一个完整产品！', stageId: 3, points: 20 },
];
