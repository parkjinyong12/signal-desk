import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { PriorityLevel, BlockType, GoalType } from '@/types'

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

export const GOAL_TYPE_ORDER: GoalType[] = ['LIFE', 'YEARLY', 'QUARTERLY', 'MONTHLY', 'WEEKLY']

export function goalTypeLabel(type: GoalType): string {
  const map: Record<GoalType, string> = {
    LIFE: '인생',
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
    YEARLY: 'bg-blue-100 text-blue-700 border-blue-200',
    QUARTERLY: 'bg-teal-100 text-teal-700 border-teal-200',
    MONTHLY: 'bg-green-100 text-green-700 border-green-200',
    WEEKLY: 'bg-amber-100 text-amber-700 border-amber-200',
  }
  return map[type] ?? 'bg-slate-100 text-slate-600 border-slate-200'
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
