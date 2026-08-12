export interface IAipmStage {
  id: number;
  name: string;
  totalDays: number;
  startDay: number;
  pillar: string;
}

export interface IAipmTask {
  day: number;
  title: string;
  description?: string;
  stageId: number;
  points: number;
  pillar: string;
}

export const MOCK_AIPM_STAGES: IAipmStage[] = [
  { id: 1, name: 'AI基础认知', totalDays: 10, startDay: 1, pillar: 'tech' },
  { id: 2, name: '产品设计能力', totalDays: 15, startDay: 11, pillar: 'product' },
  { id: 3, name: '工具与实战', totalDays: 20, startDay: 26, pillar: 'tools' },
  { id: 4, name: '商业与进阶', totalDays: 15, startDay: 46, pillar: 'business' },
];

export const MOCK_AIPM_TASKS: IAipmTask[] = [
  { day: 1, title: '什么是大语言模型（LLM）', description: '了解LLM的基本概念，用自己的话解释给朋友听', stageId: 1, points: 20, pillar: 'tech' },
  { day: 2, title: '和AI对话30分钟', description: '注册ChatGPT/豆包/DeepSeek，感受它的能力边界', stageId: 1, points: 20, pillar: 'tech' },
  { day: 3, title: '学习提示词（Prompt）', description: '写3个不同风格的提示词，比较效果差异', stageId: 1, points: 20, pillar: 'tech' },
  { day: 4, title: '什么是RAG（检索增强生成）', description: '用大白话解释RAG的工作原理', stageId: 1, points: 20, pillar: 'tech' },
  { day: 5, title: '什么是AI Agent（智能体）', description: '在Coze上创建一个简单的Agent', stageId: 1, points: 20, pillar: 'tech' },
  { day: 6, title: '多模态AI', description: '了解多模态AI：文字、图片、语音、视频', stageId: 1, points: 20, pillar: 'tech' },
  { day: 7, title: '什么是Token', description: '了解Token的概念，以及它为什么重要', stageId: 1, points: 20, pillar: 'tech' },
  { day: 8, title: 'GitHub AI开源项目探索', description: '搜索3个AI开源项目，读它们的README', stageId: 1, points: 20, pillar: 'tech' },
  { day: 9, title: 'AI概念思维导图', description: '整理本周学到的AI概念，画出关系图', stageId: 1, points: 20, pillar: 'tech' },
  { day: 10, title: '阶段复盘：AI基础认知', description: '我能说清哪些AI概念？用一段话总结', stageId: 1, points: 20, pillar: 'tech' },
  { day: 11, title: '什么是PRD', description: '学习产品需求文档，找一个AI产品的PRD模板看看', stageId: 2, points: 20, pillar: 'product' },
  { day: 12, title: '拆解一个常用AI产品', description: '拆解你常用的AI产品（如豆包），分析核心功能', stageId: 2, points: 20, pillar: 'product' },
  { day: 13, title: 'AI聊天产品用户流程图', description: '画一个AI聊天产品的用户流程图', stageId: 2, points: 20, pillar: 'product' },
  { day: 14, title: 'AI产品的交互设计特点', description: '学习对话式交互、流式输出等设计特点', stageId: 2, points: 20, pillar: 'product' },
  { day: 15, title: 'AI产品的Onboarding分析', description: '分析3个AI产品的新手引导流程', stageId: 2, points: 20, pillar: 'product' },
  { day: 16, title: 'AI"幻觉"问题与产品应对', description: '学习幻觉问题，思考产品上如何应对', stageId: 2, points: 20, pillar: 'product' },
  { day: 17, title: '设计一个AI功能的Prompt流程', description: '用户输入→AI处理→结果展示的完整流程', stageId: 2, points: 20, pillar: 'product' },
  { day: 18, title: 'AI产品的评估方法', description: '学习准确率、满意度、留存率等评估指标', stageId: 2, points: 20, pillar: 'product' },
  { day: 19, title: '拆解一个AI Agent产品', description: '分析它的工具调用逻辑和工作流设计', stageId: 2, points: 20, pillar: 'product' },
  { day: 20, title: '写一份简单的AI产品PRD', description: '选一个你自己的痛点来设计', stageId: 2, points: 20, pillar: 'product' },
  { day: 21, title: 'AI产品的数据指标', description: '学习DAU、对话轮次、任务完成率等', stageId: 2, points: 20, pillar: 'product' },
  { day: 22, title: 'AI产品的付费模式', description: '分析订阅、按量、免费增值等模式', stageId: 2, points: 20, pillar: 'product' },
  { day: 23, title: 'AI产品竞品对比', description: '研究2个AI产品的竞品差异', stageId: 2, points: 20, pillar: 'product' },
  { day: 24, title: 'AI安全与合规基础', description: '了解AI产品的安全与合规要点', stageId: 2, points: 20, pillar: 'product' },
  { day: 25, title: '阶段复盘：产品设计能力', description: '我能独立设计一个AI产品方案吗？', stageId: 2, points: 20, pillar: 'product' },
  { day: 26, title: 'Coze工作流实战', description: '深入使用Coze，搭建一个完整的工作流', stageId: 3, points: 20, pillar: 'tools' },
  { day: 27, title: '了解Dify平台', description: '对比Coze和Dify的区别与适用场景', stageId: 3, points: 20, pillar: 'tools' },
  { day: 28, title: 'AI画图工具学习', description: '使用Midjourney/即梦，理解文生图逻辑', stageId: 3, points: 20, pillar: 'tools' },
  { day: 29, title: 'AI编程工具实战', description: '用Cursor/Claude做一个简单页面', stageId: 3, points: 20, pillar: 'tools' },
  { day: 30, title: 'LangChain是什么', description: '了解LangChain的概念和能力（不需要写代码）', stageId: 3, points: 20, pillar: 'tools' },
  { day: 31, title: 'API是什么', description: '学习API概念，AI产品如何调用API', stageId: 3, points: 20, pillar: 'tools' },
  { day: 32, title: 'Coze搭建RAG知识库机器人', description: '从零搭建一个RAG问答机器人', stageId: 3, points: 20, pillar: 'tools' },
  { day: 33, title: '什么是MCP', description: '学习Model Context Protocol', stageId: 3, points: 20, pillar: 'tools' },
  { day: 34, title: 'AI产品技术架构', description: '了解前端→后端→模型→数据库的架构', stageId: 3, points: 20, pillar: 'tools' },
  { day: 35, title: '画AI产品技术架构图', description: '画出一张完整的AI产品技术架构图', stageId: 3, points: 20, pillar: 'tools' },
  { day: 36, title: 'AI模型评估与选择', description: '学习如何评估和选择GPT/Claude/DeepSeek等模型', stageId: 3, points: 20, pillar: 'tools' },
  { day: 37, title: 'AI产品部署方式', description: '了解云服务、API调用、本地部署', stageId: 3, points: 20, pillar: 'tools' },
  { day: 38, title: '实战：AI客服产品方案', description: '设计一个完整的AI客服产品方案', stageId: 3, points: 20, pillar: 'tools' },
  { day: 39, title: '实战：AI写作助手方案', description: '设计一个AI写作助手产品方案', stageId: 3, points: 20, pillar: 'tools' },
  { day: 40, title: '实战：AI教育产品方案', description: '设计一个AI教育产品方案', stageId: 3, points: 20, pillar: 'tools' },
  { day: 41, title: 'AI产品用户调研方法', description: '学习如何做AI产品的用户调研', stageId: 3, points: 20, pillar: 'tools' },
  { day: 42, title: 'AI产品的AB测试', description: '学习AI产品的AB测试方法', stageId: 3, points: 20, pillar: 'tools' },
  { day: 43, title: 'AI产品增长策略', description: '研究AI产品的增长策略', stageId: 3, points: 20, pillar: 'tools' },
  { day: 44, title: '整理你的AI产品工具箱', description: '列出你掌握的所有AI工具和用法', stageId: 3, points: 20, pillar: 'tools' },
  { day: 45, title: '阶段复盘：工具与实战', description: '我能从0到1设计一个AI产品吗？', stageId: 3, points: 20, pillar: 'tools' },
  { day: 46, title: 'AI行业商业模式', description: '研究SaaS、API计费、市场平台等模式', stageId: 4, points: 20, pillar: 'business' },
  { day: 47, title: '3家AI公司商业逻辑', description: '分析OpenAI、字节、月之暗面的商业逻辑', stageId: 4, points: 20, pillar: 'business' },
  { day: 48, title: 'AI产品定价策略', description: '学习AI产品的定价策略和方法', stageId: 4, points: 20, pillar: 'business' },
  { day: 49, title: 'AI创业基本流程', description: '了解AI创业的基本步骤和要点', stageId: 4, points: 20, pillar: 'business' },
  { day: 50, title: 'AI产品的护城河', description: '研究数据、网络效应、技术壁垒等护城河', stageId: 4, points: 20, pillar: 'business' },
  { day: 51, title: 'AI产品商业计划书', description: '学习如何写AI产品的商业计划书', stageId: 4, points: 20, pillar: 'business' },
  { day: 52, title: 'AI行业融资情况', description: '了解AI行业的融资环境和趋势', stageId: 4, points: 20, pillar: 'business' },
  { day: 53, title: 'AI Agent商业应用场景', description: '研究AI Agent的商业应用场景', stageId: 4, points: 20, pillar: 'business' },
  { day: 54, title: 'AI PM面试题（产品sense）', description: '学习并准备产品sense类面试题', stageId: 4, points: 20, pillar: 'business' },
  { day: 55, title: 'AI PM面试题（技术理解）', description: '学习并准备技术理解类面试题', stageId: 4, points: 20, pillar: 'business' },
  { day: 56, title: '准备AI产品经理作品集', description: '整理你的作品和项目，准备作品集', stageId: 4, points: 20, pillar: 'business' },
  { day: 57, title: '完整AI产品方案', description: '写一个完整的AI产品方案（PRD+架构+商业模式）', stageId: 4, points: 20, pillar: 'business' },
  { day: 58, title: 'GitHub整理学习笔记', description: '在GitHub上整理你的学习笔记', stageId: 4, points: 20, pillar: 'business' },
  { day: 59, title: '模拟AI PM面试', description: '进行一次模拟AI产品经理面试', stageId: 4, points: 20, pillar: 'business' },
  { day: 60, title: '总复盘：我的AI PM能力地图', description: '总结60天学习，绘制你的能力地图', stageId: 4, points: 20, pillar: 'business' },
];
