# 每日自我监督系统

> 免费的个人成长工作台 · 灵感→待办→执行→复盘 一个闭环
> 版本：v3.0 | 更新：2026-08-11
> ⚠️ 本仓库当前仅收录数据层源码（src/lib/），UI 页面、静态数据、构建配置待补充。

## 在线体验

https://4ktk9f5gbuxq7.feishuapp.com/app/app_17bwfebgv2m

手机浏览器打开，可"添加到主屏幕"像App一样使用。

## 功能

### 今日
- 心情打卡（5档+标签）
- 每日一问（"今天的卡点是什么？"等24题轮换）
- 极简复盘（做得好的+下一步，KISS原则）
- 知识启发记录
- 今日习惯总览（9项完成度）

### 学习
- **AI应用开发**：120天4阶段（Coze启蒙→Python基础→LangChain→作品集）
- **AI产品经理**：60天+四支柱雷达图（技术/产品/工具/商业）
- **Vibe Coding**：30天（入门→进阶→实战）
- **英语朗读**：60句从易到难，TTS原文发音+录音对比

### 生活
- **记账**：收支分类、饼图、月度统计
- **健身**：运动类型（含自定义）、时长、连续天数
- **待办**：增删勾选、防刷分机制、学习任务自动同步
- **灵感碎片**：
  - 语音录制转文字（Web Speech API）
  - 视频链接建卡（自动解析）
  - 五列看板：积压碎片→待办→进行中→审核→完成
  - 每月灵感串联（按标签分组生成项目）
- **健脑打卡**：英语朗读/冥想/深度阅读/写作输出/复盘思考

### 数据
- 多维度统计图表
- 每周报告（打卡/学习/记账/健身/健脑/灵感/待办/积分）
- 成就徽章（19个）
- 等级系统（新手→学徒→践行者→成长者→大师）

### 我的
- 数据导出/导入（JSON）
- Pro版入口（隐藏，即将推出）
- 产品理念说明

## 技术栈

- Vite + React 19 + TypeScript
- Tailwind CSS 4.0 + shadcn UI
- ECharts 数据可视化
- framer-motion 动画
- scopedStorage（飞书 APAAS 沙箱存储）本地存储
- 浏览器原生API：SpeechSynthesis（TTS）、MediaRecorder（录音）、SpeechRecognition（语音转文字）

## 数据结构

所有数据存在浏览器localStorage，key前缀`__selfsuper_`：

| Key | 内容 |
|-----|------|
| daily_records | 每日打卡记录 |
| learning_progress | AI开发学习进度 |
| aipm_progress | AI产品学习进度 |
| vibe_progress | Vibe Coding进度 |
| english_progress | 英语朗读进度 |
| achievements | 积分/等级/徽章 |
| accounting | 记账记录 |
| fitness | 健身记录 |
| todos | 待办事项 |
| brain | 健脑打卡 |
| inspirations | 灵感碎片卡片 |
| weekly_reports | 周报 |
| awarded_todos | 已奖励待办（防刷分） |

## 防刷分机制

- 待办完成时检查是否已奖励过（awarded_todos）
- 取消完成扣回积分
- 删除已完成待办扣回积分
- 积分操作幂等，无法通过反复勾选刷分

## 核心理念

**元能力"拆仿练创"**：
- 拆：建立领域地图
- 仿：向顶级样本靠近
- 练：主动撞向卡点
- 创：知识网络化

## 开源参考

| 项目 | 用途 |
|------|------|
| everyone-can-use-english (30k stars) | 英语朗读方法论 |
| ai-radar-wiki | AI PM四支柱知识图谱 |
| 鱼皮ai-guide | Vibe Coding学习路径 |
| Tresso | React+shadcn看板参考 |
| Loop Habit Tracker | 习惯追踪算法 |

## 目录结构

```
src/
├── lib/          # 数据层(storage.ts/constants.ts/utils.ts)
├── data/         # 静态数据(英语句子/学习路径等)
├── components/   # 布局组件
└── pages/        # 页面组件
    ├── TodayPage/
    ├── LearningPage/
    ├── LifePage/
    ├── StatsPage/
    └── ProfilePage/
```

## 相关文档

- [需求整理.md](./需求整理.md) - 完整需求清单
- [交接文档.md](./交接文档.md) - 跨AI交接说明
- [开发SOP.md](./开发SOP.md) - 开发流程规范
- [小红书MVP推广文档.md](./小红书MVP推广文档.md) - 推广方案

## License

MIT
