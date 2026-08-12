export interface ITodayPageData {
  date: string
  moodScore: number
  moodTags: string[]
  moodReason: string
  dailyQuestion: string
  dailyAnswer: string
  reviewGoodPoint: string
  reviewNextStep: string
  completedItems: string[]
  totalItems: number
  allDone: boolean
}

export const MOCK_TODAY_PAGE: ITodayPageData = {
  date: '2025-01-15',
  moodScore: 4,
  moodTags: ['开心', '充实'],
  moodReason: '今天完成了很多任务',
  dailyQuestion: '今天最有成就感的一件事是什么？',
  dailyAnswer: '完成了学习路径第3天的打卡任务',
  reviewGoodPoint: '主动学习了新知识',
  reviewNextStep: '看1集教程视频',
  completedItems: ['mood', 'question', 'review'],
  totalItems: 4,
  allDone: false,
}
