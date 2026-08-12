export interface IProfilePage {
  id: string
  appName: string
  version: string
  description: string
  privacyNote: string
  exportLabel: string
  importLabel: string
  reminderLabel: string
  reminderTimeLabel: string
  aboutLabel: string
  clearDataLabel: string
  clearDataConfirmText: string
  initialReminderEnabled: boolean
  initialReminderTime: string
}

export const MOCK_PROFILE_PAGE: IProfilePage = {
  id: '1',
  appName: '每日自我监督',
  version: 'v1.0.0',
  description: '每天最小一步，见证自己的成长',
  privacyNote: '所有数据存储在本地浏览器，隐私优先，不上传任何服务器',
  exportLabel: '导出数据',
  importLabel: '导入数据',
  reminderLabel: '每日提醒',
  reminderTimeLabel: '提醒时间',
  aboutLabel: '关于',
  clearDataLabel: '清空所有数据',
  clearDataConfirmText: '确定要删除所有数据吗？此操作不可恢复',
  initialReminderEnabled: false,
  initialReminderTime: '21:00',
}
