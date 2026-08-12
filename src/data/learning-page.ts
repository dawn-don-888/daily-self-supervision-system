export interface ILearningStage {
  id: number;
  name: string;
  totalDays: number;
  startDay: number;
  description: string;
}

export interface ILearningTask {
  day: number;
  title: string;
  description: string;
  stageId: number;
  points: number;
}

export const MOCK_LEARNING_STAGES: ILearningStage[] = [
  { id: 1, name: 'Coze启蒙', totalDays: 14, startDay: 1, description: '从零认识AI Agent和Coze平台' },
  { id: 2, name: 'Python基础', totalDays: 28, startDay: 15, description: '掌握Python编程基础和API调用' },
  { id: 3, name: 'LangChain框架', totalDays: 42, startDay: 43, description: '学习LangChain和RAG、Agent开发' },
  { id: 4, name: '复刻+创造', totalDays: 36, startDay: 85, description: '复刻开源项目并创造自己的作品' },
];

const stage1Tasks: ILearningTask[] = [
  { day: 1, title: '注册GitHub账号', description: '注册GitHub账号，star第一个开源项目', stageId: 1, points: 20 },
  { day: 2, title: '注册Coze账号', description: '注册扣子（Coze）账号，浏览首页了解功能', stageId: 1, points: 20 },
  { day: 3, title: '创建第一个聊天机器人', description: '跟着教程创建你的第一个AI聊天机器人', stageId: 1, points: 20 },
  { day: 4, title: '添加人设和提示词', description: '给机器人添加角色人设和系统提示词', stageId: 1, points: 20 },
  { day: 5, title: '添加知识库', description: '给机器人上传文档，添加知识库功能', stageId: 1, points: 20 },
  { day: 6, title: '创建第一个工作流', description: '学习工作流概念，创建第一个简单工作流', stageId: 1, points: 20 },
  { day: 7, title: '尝试插件功能', description: '探索Coze的插件市场，使用一个插件', stageId: 1, points: 20 },
  { day: 8, title: '理解什么是Agent', description: '用自己的话解释：什么是Agent？写下来', stageId: 1, points: 20 },
  { day: 9, title: '理解工作流', description: '用自己的话解释：什么是工作流？有什么用？', stageId: 1, points: 20 },
  { day: 10, title: '理解RAG', description: '用自己的话解释：什么是RAG？为什么需要它？', stageId: 1, points: 20 },
  { day: 11, title: '找一个Coze项目', description: '在GitHub上找一个Coze相关项目，读README', stageId: 1, points: 20 },
  { day: 12, title: '搭建数字我机器人', description: '做一个"数字我"问答机器人，用你的资料训练', stageId: 1, points: 20 },
  { day: 13, title: '自由探索一个功能', description: '挑一个Coze上你感兴趣的功能，自由玩一玩', stageId: 1, points: 20 },
  { day: 14, title: '阶段复盘', description: '第一阶段结束啦，写下：我学会了什么？最喜欢哪个功能？', stageId: 1, points: 20 },
];

const stage2Tasks: ILearningTask[] = [
  { day: 15, title: '安装Python', description: '安装Python环境，写第一行print("Hello World")', stageId: 2, points: 20 },
  { day: 16, title: '变量和数据类型', description: '学习变量、整数、浮点数、字符串等基础数据类型', stageId: 2, points: 20 },
  { day: 17, title: '变量赋值练习', description: '完成5个变量赋值小练习，亲自动手敲代码', stageId: 2, points: 20 },
  { day: 18, title: '字符串操作', description: '学习字符串拼接、格式化、切片等常用操作', stageId: 2, points: 20 },
  { day: 19, title: '列表list', description: '学习列表的增删改查和常用方法', stageId: 2, points: 20 },
  { day: 20, title: '字典dict', description: '学习字典的使用，key-value键值对', stageId: 2, points: 20 },
  { day: 21, title: 'if/else条件判断', description: '学习条件判断语句if/elif/else', stageId: 2, points: 20 },
  { day: 22, title: '猜数字游戏', description: '用if写一个简单的猜数字小游戏', stageId: 2, points: 20 },
  { day: 23, title: 'for循环', description: '学习for循环和range函数', stageId: 2, points: 20 },
  { day: 24, title: 'while循环', description: '学习while循环，对比for循环的区别', stageId: 2, points: 20 },
  { day: 25, title: '函数def', description: '学习函数定义def、参数和return返回值', stageId: 2, points: 20 },
  { day: 26, title: '写3个自己的函数', description: '动手写3个实用的小函数并测试', stageId: 2, points: 20 },
  { day: 27, title: '文件读写', description: '学习open()文件的读和写', stageId: 2, points: 20 },
  { day: 28, title: '存文件小程序', description: '写一个把内容保存到txt文件的小程序', stageId: 2, points: 20 },
  { day: 29, title: '异常处理try/except', description: '学习try/except捕获和处理错误', stageId: 2, points: 20 },
  { day: 30, title: 'JSON处理', description: '学习json模块，数据转JSON再读回来', stageId: 2, points: 20 },
  { day: 31, title: 'pip安装第三方库', description: '学习用pip install安装Python包', stageId: 2, points: 20 },
  { day: 32, title: 'requests库调用API', description: '安装requests，调用一个公开API试试', stageId: 2, points: 20 },
  { day: 33, title: '调用大模型API', description: '注册DeepSeek或类似API，用Python调用它', stageId: 2, points: 20 },
  { day: 34, title: '调API+存文件', description: '写一个完整小程序：调API + 把结果存到文件', stageId: 2, points: 20 },
  { day: 35, title: '读Python小项目代码', description: '在GitHub找一个Python小项目，读它的代码', stageId: 2, points: 20 },
  { day: 36, title: '修改项目一个功能', description: '尝试修改那个项目的一个小功能', stageId: 2, points: 20 },
  { day: 37, title: '自由练习Day1', description: '每天读100行开源代码，写下你看懂了什么', stageId: 2, points: 20 },
  { day: 38, title: '自由练习Day2', description: '每天读100行开源代码，写下你看懂了什么', stageId: 2, points: 20 },
  { day: 39, title: '自由练习Day3', description: '每天读100行开源代码，写下你看懂了什么', stageId: 2, points: 20 },
  { day: 40, title: '自由练习Day4', description: '每天读100行开源代码，写下你看懂了什么', stageId: 2, points: 20 },
  { day: 41, title: '自由练习Day5', description: '每天读100行开源代码，写下你看懂了什么', stageId: 2, points: 20 },
  { day: 42, title: '自由练习Day6', description: '每天读100行开源代码，写下你看懂了什么', stageId: 2, points: 20 },
];

const stage3Tasks: ILearningTask[] = [
  { day: 43, title: '安装LangChain', description: '安装LangChain，跑通第一个示例代码', stageId: 3, points: 20 },
  { day: 44, title: 'Prompt Template', description: '学习提示词模板的使用方法', stageId: 3, points: 20 },
  { day: 45, title: 'Chain的概念', description: '理解Chain链的概念，写一个简单的链', stageId: 3, points: 20 },
  { day: 46, title: '带记忆的聊天机器人', description: '给机器人加上对话记忆功能', stageId: 3, points: 20 },
  { day: 47, title: '文档加载和分割', description: '学习Document Loader和Text Splitter', stageId: 3, points: 20 },
  { day: 48, title: '向量化Embedding', description: '学习Embedding是什么，怎么把文本变成向量', stageId: 3, points: 20 },
  { day: 49, title: '向量数据库', description: '学习向量数据库的概念，尝试Chroma或FAISS', stageId: 3, points: 20 },
  { day: 50, title: '第一个RAG问答系统', description: '把前面学的串起来，跑通第一个RAG系统', stageId: 3, points: 20 },
  { day: 51, title: '添加自己的文档', description: '给RAG系统上传你自己的文档试试效果', stageId: 3, points: 20 },
  { day: 52, title: 'Agent和工具调用', description: '学习Agent概念，让大模型自己调用工具', stageId: 3, points: 20 },
  { day: 53, title: '能搜索网页的Agent', description: '写一个可以搜索网页的Agent', stageId: 3, points: 20 },
  { day: 54, title: 'ReAct模式', description: '学习ReAct（推理+行动）模式的原理', stageId: 3, points: 20 },
  { day: 55, title: '完善RAG Day1', description: '优化你的RAG项目，添加一个新功能', stageId: 3, points: 20 },
  { day: 56, title: '完善RAG Day2', description: '优化你的RAG项目，添加一个新功能', stageId: 3, points: 20 },
  { day: 57, title: '完善RAG Day3', description: '优化你的RAG项目，添加一个新功能', stageId: 3, points: 20 },
  { day: 58, title: '完善RAG Day4', description: '优化你的RAG项目，添加一个新功能', stageId: 3, points: 20 },
  { day: 59, title: '完善RAG Day5', description: '优化你的RAG项目，添加一个新功能', stageId: 3, points: 20 },
  { day: 60, title: '完善RAG Day6', description: '优化你的RAG项目，整理代码', stageId: 3, points: 20 },
  { day: 61, title: '初识LangGraph', description: '学习LangGraph，理解状态图的概念', stageId: 3, points: 20 },
  { day: 62, title: '简单的多Agent', description: '实现两个Agent协作完成一个任务', stageId: 3, points: 20 },
  { day: 63, title: '多Agent角色分工', description: '设计3个不同角色的Agent分工协作', stageId: 3, points: 20 },
  { day: 64, title: '多Agent对话', description: '让多个Agent之间相互对话讨论问题', stageId: 3, points: 20 },
  { day: 65, title: 'Human-in-the-loop', description: '学习人机协作模式，人工介入Agent决策', stageId: 3, points: 20 },
  { day: 66, title: '多Agent项目Day1', description: '开始构思一个多Agent协作的小项目', stageId: 3, points: 20 },
  { day: 67, title: '多Agent项目Day2', description: '搭建项目基础框架', stageId: 3, points: 20 },
  { day: 68, title: '多Agent项目Day3', description: '实现核心Agent的功能', stageId: 3, points: 20 },
  { day: 69, title: '多Agent项目Day4', description: '添加第二个Agent，测试协作效果', stageId: 3, points: 20 },
  { day: 70, title: '多Agent项目Day5', description: '完善交互和输出效果', stageId: 3, points: 20 },
  { day: 71, title: '多Agent项目Day6', description: '测试和调试，记录遇到的问题', stageId: 3, points: 20 },
  { day: 72, title: '多Agent项目Day7', description: '整理项目，写README', stageId: 3, points: 20 },
  { day: 73, title: '多Agent项目Day8', description: '优化代码结构和性能', stageId: 3, points: 20 },
  { day: 74, title: '多Agent项目Day9', description: '添加新功能，继续完善', stageId: 3, points: 20 },
  { day: 75, title: '多Agent项目Day10', description: '给项目添加一个用户界面', stageId: 3, points: 20 },
  { day: 76, title: '多Agent项目Day11', description: '测试不同场景下的表现', stageId: 3, points: 20 },
  { day: 77, title: '多Agent项目Day12', description: '修复bug，提升稳定性', stageId: 3, points: 20 },
  { day: 78, title: '多Agent项目Day13', description: '整理项目文档和使用说明', stageId: 3, points: 20 },
  { day: 79, title: '多Agent项目Day14', description: '最终测试，写项目总结', stageId: 3, points: 20 },
  { day: 80, title: '阶段复盘Day1', description: '回顾LangChain阶段，你最喜欢哪个部分？', stageId: 3, points: 20 },
  { day: 81, title: '阶段复盘Day2', description: '整理你在这个阶段学到的核心概念', stageId: 3, points: 20 },
  { day: 82, title: '阶段复盘Day3', description: '在GitHub上找一个LangChain项目研究学习', stageId: 3, points: 20 },
  { day: 83, title: '阶段复盘Day4', description: '写下你对下一阶段的期待和计划', stageId: 3, points: 20 },
  { day: 84, title: '阶段复盘Day5', description: '休息一天，准备进入最后阶段！', stageId: 3, points: 20 },
];

const stage4Tasks: ILearningTask[] = [
  { day: 85, title: '寻找RAG项目', description: '在GitHub找一个你感兴趣的RAG项目', stageId: 4, points: 20 },
  { day: 86, title: '克隆并跑通项目', description: '克隆项目代码，配置环境并跑通', stageId: 4, points: 20 },
  { day: 87, title: '读懂项目结构', description: '搞清楚项目的目录结构和核心代码', stageId: 4, points: 20 },
  { day: 88, title: '修改前端UI', description: '试着修改项目的前端界面', stageId: 4, points: 20 },
  { day: 89, title: '添加功能Day1', description: '给复刻项目添加一个你自己想的功能', stageId: 4, points: 20 },
  { day: 90, title: '添加功能Day2', description: '继续完善添加的功能', stageId: 4, points: 20 },
  { day: 91, title: '优化和测试', description: '测试你加的功能，修复问题', stageId: 4, points: 20 },
  { day: 92, title: '写项目笔记', description: '整理复刻过程中学到的东西', stageId: 4, points: 20 },
  { day: 93, title: '寻找Agent项目', description: '在GitHub找一个有趣的Agent项目', stageId: 4, points: 20 },
  { day: 94, title: 'Agent项目复刻Day1', description: '克隆并配置Agent项目', stageId: 4, points: 20 },
  { day: 95, title: 'Agent项目复刻Day2', description: '跑通项目，理解工作原理', stageId: 4, points: 20 },
  { day: 96, title: 'Agent项目复刻Day3', description: '修改一个核心功能试试', stageId: 4, points: 20 },
  { day: 97, title: 'Agent项目复刻Day4', description: '加入自己的想法和优化', stageId: 4, points: 20 },
  { day: 98, title: 'Agent项目总结', description: '总结复刻Agent项目的收获', stageId: 4, points: 20 },
  { day: 99, title: '创意构思', description: '想一个你自己想做的小项目，写下想法', stageId: 4, points: 20 },
  { day: 100, title: '项目规划', description: '规划你的项目需要哪些功能、用什么技术', stageId: 4, points: 20 },
  { day: 101, title: '搭建项目框架', description: '从零搭建你自己项目的基础框架', stageId: 4, points: 20 },
  { day: 102, title: '核心功能Day1', description: '实现项目的核心功能模块', stageId: 4, points: 20 },
  { day: 103, title: '核心功能Day2', description: '继续实现核心功能', stageId: 4, points: 20 },
  { day: 104, title: '核心功能Day3', description: '完成核心功能的初版', stageId: 4, points: 20 },
  { day: 105, title: '用户界面Day1', description: '给你的项目做一个用户界面', stageId: 4, points: 20 },
  { day: 106, title: '用户界面Day2', description: '完善界面交互和视觉效果', stageId: 4, points: 20 },
  { day: 107, title: '功能优化Day1', description: '测试项目，修复bug', stageId: 4, points: 20 },
  { day: 108, title: '功能优化Day2', description: '优化性能和用户体验', stageId: 4, points: 20 },
  { day: 109, title: '功能优化Day3', description: '添加一些锦上添花的小功能', stageId: 4, points: 20 },
  { day: 110, title: '部署上线Day1', description: '学习怎么把项目部署到网上', stageId: 4, points: 20 },
  { day: 111, title: '部署上线Day2', description: '把你的项目部署上线', stageId: 4, points: 20 },
  { day: 112, title: '测试上线版本', description: '测试线上版本，记录问题', stageId: 4, points: 20 },
  { day: 113, title: '整理GitHub主页', description: '整理你的GitHub主页，看起来专业一点', stageId: 4, points: 20 },
  { day: 114, title: '写README Day1', description: '给你的项目写一个漂亮的README', stageId: 4, points: 20 },
  { day: 115, title: '写README Day2', description: '完善README，加截图和使用说明', stageId: 4, points: 20 },
  { day: 116, title: '项目回顾', description: '回头看你做的项目，你满意吗？哪里可以更好？', stageId: 4, points: 20 },
  { day: 117, title: '学习路线复盘Day1', description: '回顾120天的学习，你最大的收获是什么？', stageId: 4, points: 20 },
  { day: 118, title: '学习路线复盘Day2', description: '你最喜欢哪个阶段？最想深入哪个方向？', stageId: 4, points: 20 },
  { day: 119, title: '制定下一步计划', description: '120天结束了，接下来你想做什么？', stageId: 4, points: 20 },
  { day: 120, title: '毕业日🎉', description: '恭喜你完成了全部120天学习！你已经不是小白了！', stageId: 4, points: 20 },
];

export const MOCK_LEARNING_TASKS: ILearningTask[] = [
  ...stage1Tasks,
  ...stage2Tasks,
  ...stage3Tasks,
  ...stage4Tasks,
];
