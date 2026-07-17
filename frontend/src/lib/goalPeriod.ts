import {
  endOfYear,
  endOfQuarter,
  endOfMonth,
  endOfISOWeek,
  startOfISOWeek,
  setQuarter,
  setISOWeek,
  getQuarter,
  getISOWeek,
  getISOWeekYear,
  format,
  parseISO,
} from 'date-fns'
import { GoalType } from '@/types'

export function yearToTargetDate(year: number): string {
  return format(endOfYear(new Date(year, 0, 1)), 'yyyy-MM-dd')
}

export function yearQuarterToTargetDate(year: number, quarter: number): string {
  const base = setQuarter(new Date(year, 0, 1), quarter)
  return format(endOfQuarter(base), 'yyyy-MM-dd')
}

export function monthInputToTargetDate(monthValue: string): string {
  const [y, m] = monthValue.split('-').map(Number)
  if (!y || !m) return ''
  return format(endOfMonth(new Date(y, m - 1, 1)), 'yyyy-MM-dd')
}

export function weekInputToTargetDate(weekValue: string): string {
  const match = weekValue.match(/^(\d{4})-W(\d{2})$/)
  if (!match) return ''
  const year = Number(match[1])
  const week = Number(match[2])
  const jan4 = new Date(year, 0, 4)
  const base = setISOWeek(jan4, week)
  return format(endOfISOWeek(base), 'yyyy-MM-dd')
}

export function yearMonthToTargetDate(year: number, month: number): string {
  return format(endOfMonth(new Date(year, month - 1, 1)), 'yyyy-MM-dd')
}

export function targetDateToYearMonth(targetDate: string): { year: string; month: string } {
  if (!targetDate) return { year: '', month: '' }
  const d = parseISO(targetDate)
  return { year: String(d.getFullYear()), month: String(d.getMonth() + 1) }
}

export function monthWeekToTargetDate(year: number, month: number, weekOfMonth: number): string {
  const daysInMonth = new Date(year, month, 0).getDate()
  const rangeStart = (weekOfMonth - 1) * 7 + 1
  const rangeEnd = Math.min(weekOfMonth * 7, daysInMonth)
  for (let day = rangeStart; day <= rangeEnd; day++) {
    const d = new Date(year, month - 1, day)
    if (d.getDay() === 1) {
      return format(endOfISOWeek(d), 'yyyy-MM-dd')
    }
  }
  return format(endOfMonth(new Date(year, month - 1, 1)), 'yyyy-MM-dd')
}

export function targetDateToMonthWeek(targetDate: string): { year: string; month: string; week: string } {
  if (!targetDate) return { year: '', month: '', week: '' }
  const d = parseISO(targetDate)
  const monday = startOfISOWeek(d)
  return {
    year: String(monday.getFullYear()),
    month: String(monday.getMonth() + 1),
    week: String(Math.ceil(monday.getDate() / 7)),
  }
}

export function targetDateToYear(targetDate: string): string {
  return targetDate ? targetDate.slice(0, 4) : ''
}

export function targetDateToQuarter(targetDate: string): { year: string; quarter: string } {
  if (!targetDate) return { year: '', quarter: '' }
  const d = parseISO(targetDate)
  return { year: String(d.getFullYear()), quarter: String(getQuarter(d)) }
}

export function targetDateToMonthInput(targetDate: string): string {
  return targetDate ? targetDate.slice(0, 7) : ''
}

export function targetDateToWeekInput(targetDate: string): string {
  if (!targetDate) return ''
  const d = parseISO(targetDate)
  const week = getISOWeek(d)
  const isoYear = getISOWeekYear(d)
  return `${isoYear}-W${String(week).padStart(2, '0')}`
}

export function quarterMonths(quarter: number): number[] {
  const first = (quarter - 1) * 3 + 1
  return [first, first + 1, first + 2]
}

/** Default target date for a new goal, derived from its parent's target date. */
export function deriveDefaultTargetDate(childType: GoalType, parentTargetDate?: string): string {
  if (!parentTargetDate) return ''
  const pd = parseISO(parentTargetDate)
  const pYear = pd.getFullYear()
  switch (childType) {
    case 'QUARTERLY':
      return yearQuarterToTargetDate(pYear, 1)
    case 'MONTHLY': {
      const pQuarter = getQuarter(pd)
      return yearMonthToTargetDate(pYear, quarterMonths(pQuarter)[0])
    }
    case 'WEEKLY':
      return monthWeekToTargetDate(pYear, pd.getMonth() + 1, 1)
    default:
      // MID_TERM, YEARLY — parent only pins the year
      return yearToTargetDate(pYear)
  }
}

export function goalPeriodLabel(goalType: GoalType, targetDate?: string): string {
  if (!targetDate) return ''
  const d = parseISO(targetDate)
  switch (goalType) {
    case 'QUARTERLY':
      return `${d.getFullYear()}년 ${getQuarter(d)}분기`
    case 'MONTHLY':
      return `${d.getFullYear()}년 ${d.getMonth() + 1}월`
    case 'WEEKLY': {
      const monday = startOfISOWeek(d)
      const weekOfMonth = Math.ceil(monday.getDate() / 7)
      return `${monday.getMonth() + 1}월 ${weekOfMonth}주차`
    }
    default:
      return `${d.getFullYear()}년`
  }
}
