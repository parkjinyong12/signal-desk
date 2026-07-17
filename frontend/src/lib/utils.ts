import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { PriorityLevel, BlockType, GoalType, GoalStatus } from '@/types'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function priorityLabel(level: PriorityLevel): string {
  const map: Record<PriorityLevel, string> = {
    A_MUST_DO_TODAY: '오늘 반드시',
    B_SHOULD_DO_TODAY: '오늘 권장',
    C_THIS_WEEK: '이번 주',
    D_WAITING: '대기',
    E_LATER_OR_DELETE: '나중에',
  }
  return map[level] ?? level
}

export function priorityColor(level: PriorityLevel): string {
  const map: Record<PriorityLevel, string> = {
    A_MUST_DO_TODAY: 'bg-red-100 text-red-700 border-red-200',
    B_SHOULD_DO_TODAY: 'bg-orange-100 text-orange-700 border-orange-200',
    C_THIS_WEEK: 'bg-yellow-100 text-yellow-700 border-yellow-200',
    D_WAITING: 'bg-slate-100 text-slate-600 border-slate-200',
    E_LATER_OR_DELETE: 'bg-slate-50 text-slate-400 border-slate-100',
  }
  return map[level] ?? 'bg-slate-100 text-slate-600'
}

export function blockTypeLabel(type: BlockType): string {
  const map: Record<BlockType, string> = {
    FOCUS_WORK: '집중 업무',
    LIGHT_WORK: '가벼운 업무',
    MEETING_PREP: '회의 준비',
    LEARNING: '학습',
    INVESTMENT_CHECK: '투자 점검',
    REVIEW: '검토',
    BREAK: '휴식',
  }
  return map[type] ?? type
}

export function blockTypeColor(type: BlockType): string {
  const map: Record<BlockType, string> = {
    FOCUS_WORK: 'bg-blue-50 border-blue-200',
    LIGHT_WORK: 'bg-slate-50 border-slate-200',
    MEETING_PREP: 'bg-purple-50 border-purple-200',
    LEARNING: 'bg-green-50 border-green-200',
    INVESTMENT_CHECK: 'bg-amber-50 border-amber-200',
    REVIEW: 'bg-indigo-50 border-indigo-200',
    BREAK: 'bg-gray-50 border-gray-200',
  }
  return map[type] ?? 'bg-slate-50 border-slate-200'
}

export const GOAL_TYPE_ORDER: GoalType[] = ['LIFE', 'MID_TERM', 'YEARLY', 'QUARTERLY', 'MONTHLY', 'WEEKLY']

export function goalTypeLabel(type: GoalType): string {
  const map: Record<GoalType, string> = {
    LIFE: '인생',
    MID_TERM: '중장기',
    YEARLY: '연간',
    QUARTERLY: '분기',
    MONTHLY: '월간',
    WEEKLY: '주간',
  }
  return map[type] ?? type
}

export function goalTypeColor(type: GoalType): string {
  const map: Record<GoalType, string> = {
    LIFE: 'bg-purple-100 text-purple-700 border-purple-200',
    MID_TERM: 'bg-indigo-100 text-indigo-700 border-indigo-200',
    YEARLY: 'bg-blue-100 text-blue-700 border-blue-200',
    QUARTERLY: 'bg-teal-100 text-teal-700 border-teal-200',
    MONTHLY: 'bg-green-100 text-green-700 border-green-200',
    WEEKLY: 'bg-amber-100 text-amber-700 border-amber-200',
  }
  return map[type] ?? 'bg-slate-100 text-slate-600 border-slate-200'
}

export function goalTypeDotColor(type: GoalType): string {
  const map: Record<GoalType, string> = {
    LIFE: 'bg-purple-500',
    MID_TERM: 'bg-indigo-500',
    YEARLY: 'bg-blue-500',
    QUARTERLY: 'bg-teal-500',
    MONTHLY: 'bg-green-500',
    WEEKLY: 'bg-amber-500',
  }
  return map[type] ?? 'bg-slate-400'
}

export function goalTypeTextColor(type: GoalType): string {
  const map: Record<GoalType, string> = {
    LIFE: 'text-purple-600',
    MID_TERM: 'text-indigo-600',
    YEARLY: 'text-blue-600',
    QUARTERLY: 'text-teal-600',
    MONTHLY: 'text-green-600',
    WEEKLY: 'text-amber-600',
  }
  return map[type] ?? 'text-slate-500'
}

export function goalStatusLabel(status: GoalStatus): string {
  const map: Record<GoalStatus, string> = {
    ACTIVE: '진행중',
    COMPLETED: '완료',
    ARCHIVED: '보관됨',
  }
  return map[status] ?? status
}

export function goalStatusColor(status: GoalStatus): string {
  const map: Record<GoalStatus, string> = {
    ACTIVE: 'bg-blue-50 text-blue-600 border-blue-200',
    COMPLETED: 'bg-green-100 text-green-700 border-green-200',
    ARCHIVED: 'bg-slate-100 text-slate-500 border-slate-200',
  }
  return map[status] ?? 'bg-slate-100 text-slate-600 border-slate-200'
}

export function formatTime(timeStr?: string): string {
  if (!timeStr) return ''
  return timeStr.substring(0, 5)
}

export function formatDeadline(deadline?: string): string {
  if (!deadline) return ''
  const d = new Date(deadline)
  const now = new Date()
  const diff = Math.ceil((d.getTime() - now.getTime()) / (1000 * 60 * 60))
  if (diff <= 0) return '마감 초과'
  if (diff < 24) return `${diff}시간 후 마감`
  return `${Math.ceil(diff / 24)}일 후 마감`
}

export function daysUntil(targetDate: string): number {
  const target = new Date(targetDate + 'T00:00:00')
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return Math.round((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
}

function yearsAndDaysLabel(totalDays: number): string {
  const years = Math.floor(totalDays / 365)
  const remainder = totalDays % 365
  return `${years}년 ${remainder}일`
}

export function goalDDayLabel(targetDate?: string): string {
  if (!targetDate) return ''
  const days = Math.abs(daysUntil(targetDate))
  if (days === 0) return '오늘'
  return days > 365 ? yearsAndDaysLabel(days) : `${days}일`
}

export function goalTargetDateWave(targetDate?: string): string {
  if (!targetDate) return ''
  const [y, m, d] = targetDate.split('-')
  return `~${y}.${m}.${d}`
}

const TARGET_DATE_SUFFIX_PATTERN = /\s*\(~\d{2,4}\.\d{1,2}\.\d{1,2}\)\s*$/

export function stripTargetDateSuffix(title: string): string {
  return title.replace(TARGET_DATE_SUFFIX_PATTERN, '')
}

export function goalDDayColor(targetDate?: string): string {
  if (!targetDate) return 'text-slate-400'
  const days = daysUntil(targetDate)
  if (days < 0) return 'text-red-500'
  if (days <= 7) return 'text-orange-500'
  return 'text-slate-400'
}

export function goalDDayBadgeColor(targetDate?: string): string {
  if (!targetDate) return 'bg-slate-100 text-slate-500 border-slate-200'
  const days = daysUntil(targetDate)
  if (days < 0) return 'bg-red-100 text-red-700 border-red-200'
  if (days <= 7) return 'bg-orange-100 text-orange-700 border-orange-200'
  if (days <= 30) return 'bg-amber-50 text-amber-600 border-amber-200'
  return 'bg-slate-100 text-slate-500 border-slate-200'
}
