export interface IStatsData {
  id: string
  streakDays: number
  totalCheckInDays: number
  monthCheckInRate: number
  totalPoints: number
  totalWordCount: number
  inspirationCount: number
  reviewCount: number
  currentStageName: string
  totalCompletedDays: number
  totalDays: number
  heatmapData: Record<string, number>
  moodTrend: { date: string; score: number }[]
}

function generateHeatmapData(): Record<string, number> {
  const data: Record<string, number> = {}
  const today = new Date()
  for (let i = 180; i >= 0; i--) {
    const d = new Date(today)
    d.setDate(d.getDate() - i)
    const dateStr = d.toISOString().slice(0, 10)
    const isWeekend = d.getDay() === 0 || d.getDay() === 6
    const recent = i <= 30
    const rand = Math.random()
    let count = 0
    if (recent) {
      count = rand < 0.7 ? 4 : rand < 0.85 ? 3 : rand < 0.95 ? 2 : 1
    } else if (isWeekend) {
      count = rand < 0.5 ? 3 : rand < 0.75 ? 2 : rand < 0.9 ? 1 : 0
    } else {
      count = rand < 0.4 ? 3 : rand < 0.7 ? 2 : rand < 0.85 ? 1 : 0
    }
    data[dateStr] = count
  }
  return data
}

function generateMoodTrend(): { date: string; score: number }[] {
  const trend: { date: string; score: number }[] = []
  const today = new Date()
  for (let i = 29; i >= 0; i--) {
    const d = new Date(today)
    d.setDate(d.getDate() - i)
    const dateStr = d.toISOString().slice(0, 10)
    const score = Math.floor(Math.random() * 3) + 3
    trend.push({ date: dateStr, score })
  }
  return trend
}

export const MOCK_STATS_DATA: IStatsData[] = [
  {
    id: '1',
    streakDays: 12,
    totalCheckInDays: 47,
    monthCheckInRate: 82,
    totalPoints: 680,
    totalWordCount: 12580,
    inspirationCount: 23,
    reviewCount: 42,
    currentStageName: '阶段2：Python基础',
    totalCompletedDays: 28,
    totalDays: 120,
    heatmapData: generateHeatmapData(),
    moodTrend: generateMoodTrend(),
  },
]
