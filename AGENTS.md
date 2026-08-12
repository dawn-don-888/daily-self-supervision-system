# 每日自我监督系统 - 需求文档

## 产品概述

一款面向个人成长的自我监督 Web 应用，帮助用户通过每日打卡、学习计划、生活记录、数据可视化来养成习惯、追踪成长。产品定位为"AI 时代个人成长操作系统"，同时作为开发者转行 AI 产品经理的作品集项目。

## 技术栈

- Vite + React 19 + TypeScript
- Tailwind CSS 4.0 + shadcn UI (new-york style)
- ECharts / Recharts 数据可视化
- framer-motion 动画
- react-router-dom 7 路由
- localStorage (scopedStorage) 数据持久化
- 纯前端应用，无需后端

## 页面结构

### 1. 今日页 (/)
- 日期显示与完成度卡片
- 心情记录（5档emoji + 8个情绪标签 + 原因）
- 每日一问（按日期hash轮换，24题，含"今天的卡点是什么？"）
- 每日复盘（做得好的一点 + 明天最小一步）
- 灵感碎片（看到什么 + 启发 + 分类，一日多条）
- 完成进度条 + 撒花动画

### 2. 学习页 (/learning)
四个Tab：
- **AI开发**：120天4阶段（Coze启蒙14天/Python基础28天/LangChain42天/复刻创造36天），完成自动入待办
- **AI产品**：60天4阶段，四支柱雷达图（技术能力/产品模式/工具生态/商业动态），AI PM核心思维
- **Vibe Coding**：30天3阶段（入门7/进阶11/实战12），绿色主题
- **英语朗读**：60句英文（初/中/高级），TTS朗读（语速0.5-1.5x），录音对比，语音识别

### 3. 生活页 (/life)
五个Tab：
- **记账**：支出8类/收入4类，月度概览，环形饼图，按日列表
- **健身**：8种运动+自定义，连续天数，本周进度
- **待办**：五区看板（积压碎片/待办/进行中/审核/完成），完成+2积分（防刷分）
- **灵感**：五区看板，手动/语音/视频链接三种记录方式，月度串联
- **健脑**：5种类型（深度阅读/英语朗读/写作输出/冥想/复盘思考），连续天数

### 4. 统计页 (/stats)
- KPI 2x2（连续打卡/累计打卡/本月打卡率/总积分）
- 180天打卡热力图
- 30天心情趋势
- 学习进度总览
- 生活习惯统计
- 每周报告（生成/查看/导出txt）

### 5. 我的页 (/profile)
- 等级卡 + 19个徽章墙
- 数据导出/导入
- 每日提醒设置
- 产品理念/关于/Pro版占位
- 清空数据

### 6. 引导页 (/welcome)
- 3页滑动引导
- "开始使用"完成onboarding

## 数据结构 (localStorage)

| Key | 内容 |
|-----|------|
| __selfsuper_daily_records | 每日打卡记录 |
| __selfsuper_learning_progress | AI开发120天进度 |
| __selfsuper_aipm_progress | AI PM 60天进度 |
| __selfsuper_vibe_progress | Vibe 30天进度 |
| __selfsuper_english_progress | 英语朗读进度 |
| __selfsuper_achievements | 积分/等级/徽章 |
| __selfsuper_settings | 设置 |
| __selfsuper_accounting | 记账记录 |
| __selfsuper_fitness | 健身记录 |
| __selfsuper_todos | 待办事项 |
| __selfsuper_brain | 健脑记录 |
| __selfsuper_inspirations | 灵感卡片 |
| __selfsuper_weekly_reports | 周报 |
| __selfsuper_awarded_todos | 已奖励待办（防刷分） |

## 积分规则

| 行为 | 积分 |
|------|------|
| 每日打卡 | 10 |
| 每日复盘 | 15 |
| 心情记录 | 5 |
| 灵感碎片 | 10 |
| 学习任务 | 20 |
| 连续打卡奖励 | 1/天 |
| 英语朗读 | 15 |
| 健身打卡 | 10 |
| 记账 | 5 |
| 待办完成 | 2 |
| AI PM任务 | 20 |
| Vibe任务 | 20 |

等级：1新手(0-100) 2学徒(100-300) 3践行者(300-600) 4成长者(600-1000) 5大师(1000+)

## UI设计指南

- 主色：暖橙色 hsl(38 92% 50%)
- 风格：日记风、温暖、简洁
- 移动端优先，底部导航栏（滚动隐藏）
- 圆角卡片、柔和阴影
- 各学习板块有独立主题色（AI开发橙/AI产品紫/Vibe绿/英语蓝）

## 开发规范

- 路径别名：@ → src，@shared → shared
- 新页面放 src/pages/，组件放 src/components/
- 数据操作统一通过 src/lib/storage.ts
- 禁止修改 vite.config.ts、package.json 等构建配置
- 提交前运行 typecheck 和 lint
