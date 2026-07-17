'use client'
import { Goal, GoalType } from '@/types'
import { Button } from '@/components/ui/button'
import { GOAL_TYPE_ORDER, goalTypeLabel, goalTargetDateWave } from '@/lib/utils'
import {
  yearToTargetDate,
  yearQuarterToTargetDate,
  yearMonthToTargetDate,
  monthWeekToTargetDate,
  targetDateToYear,
  targetDateToQuarter,
  targetDateToYearMonth,
  targetDateToMonthWeek,
  quarterMonths,
  deriveDefaultTargetDate,
} from '@/lib/goalPeriod'

import { getQuarter } from 'date-fns'

/** Years from just-before-now up through maxYear (never starts later than that, however far maxYear is). */
function yearOptions(maxYear: number): number[] {
  const start = new Date().getFullYear() - 1
  const end = Math.max(maxYear, start)
  return Array.from({ length: end - start + 1 }, (_, i) => start + i)
}

const MONTH_OPTIONS = Array.from({ length: 12 }, (_, i) => i + 1)
const WEEK_OPTIONS = [1, 2, 3, 4, 5]

export type GoalFormData = {
  title: string
  description: string
  goalType: GoalType
  parentId: string
  targetDate: string
}

export const defaultGoalForm: GoalFormData = {
  title: '',
  description: '',
  goalType: 'LIFE',
  parentId: '',
  targetDate: '',
}

interface GoalFormProps {
  form: GoalFormData
  onChange: (form: GoalFormData) => void
  onSubmit: (e: React.FormEvent) => void
  onCancel: () => void
  goals: Goal[]
  loading: boolean
  isEdit: boolean
}

const inputClass =
  'w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500'

export function GoalForm({ form, onChange, onSubmit, onCancel, goals, loading, isEdit }: GoalFormProps) {
  const parentTierIndex = GOAL_TYPE_ORDER.indexOf(form.goalType) - 1
  const parentCandidates = parentTierIndex >= 0
    ? goals.filter((g) => g.goalType === GOAL_TYPE_ORDER[parentTierIndex] && g.status !== 'ARCHIVED')
    : []

  const currentYear = new Date().getFullYear()
  const parentGoal = form.parentId ? goals.find((g) => String(g.id) === form.parentId) : undefined
  const parentDate = parentGoal?.targetDate ? new Date(parentGoal.targetDate) : undefined
  const parentYear = parentDate?.getFullYear()
  const parentMonth = parentDate ? parentDate.getMonth() + 1 : undefined
  const parentQuarter = parentDate ? getQuarter(parentDate) : undefined

  const handleParentChange = (parentIdStr: string) => {
    const parent = goals.find((g) => String(g.id) === parentIdStr)
    const targetDate = form.targetDate || deriveDefaultTargetDate(form.goalType, parent?.targetDate)
    onChange({ ...form, parentId: parentIdStr, targetDate })
  }

  const renderTargetDatePicker = () => {
    switch (form.goalType) {
      case 'LIFE':
      case 'MID_TERM':
      case 'YEARLY': {
        const year = targetDateToYear(form.targetDate)
        const fallbackSpan = form.goalType === 'LIFE' ? 50 : form.goalType === 'MID_TERM' ? 15 : 11
        const maxYear = parentYear ?? currentYear + fallbackSpan
        const options = yearOptions(maxYear)
        return (
          <select
            className={inputClass}
            value={year}
            onChange={(e) => {
              const y = Number(e.target.value)
              onChange({ ...form, targetDate: y ? yearToTargetDate(y) : '' })
            }}
          >
            <option value="">연도 선택</option>
            {options.map((y) => (
              <option key={y} value={y}>{y}년</option>
            ))}
          </select>
        )
      }
      case 'QUARTERLY': {
        const { quarter } = targetDateToQuarter(form.targetDate)
        const y = parentYear ?? currentYear
        return (
          <select
            className={inputClass}
            value={quarter}
            onChange={(e) => {
              const q = Number(e.target.value)
              onChange({ ...form, targetDate: q ? yearQuarterToTargetDate(y, q) : yearToTargetDate(y) })
            }}
          >
            <option value="">연도 전체</option>
            <option value="1">1분기</option>
            <option value="2">2분기</option>
            <option value="3">3분기</option>
            <option value="4">4분기</option>
          </select>
        )
      }
      case 'MONTHLY': {
        const { month } = targetDateToYearMonth(form.targetDate)
        const monthOptions = parentGoal?.goalType === 'QUARTERLY' && parentQuarter
          ? quarterMonths(parentQuarter)
          : MONTH_OPTIONS
        const y = parentYear ?? currentYear
        return (
          <select
            className={inputClass}
            value={month}
            onChange={(e) => {
              const m = Number(e.target.value)
              onChange({ ...form, targetDate: yearMonthToTargetDate(y, m) })
            }}
          >
            <option value="">월</option>
            {monthOptions.map((m) => (
              <option key={m} value={m}>{m}월</option>
            ))}
          </select>
        )
      }
      case 'WEEKLY': {
        const { week } = targetDateToMonthWeek(form.targetDate)
        const y = parentYear ?? currentYear
        const m = parentMonth ?? new Date().getMonth() + 1
        return (
          <select
            className={inputClass}
            value={week}
            onChange={(e) => {
              const w = Number(e.target.value)
              onChange({ ...form, targetDate: monthWeekToTargetDate(y, m, w) })
            }}
          >
            <option value="">주차</option>
            {WEEK_OPTIONS.map((w) => (
              <option key={w} value={w}>{w}주차</option>
            ))}
          </select>
        )
      }
    }
  }

  const parentContextLabel = (() => {
    if (!parentYear) return ''
    if (form.goalType === 'WEEKLY' && parentMonth) return ` · ${parentYear}년 ${parentMonth}월`
    if (form.goalType === 'MONTHLY' && parentQuarter) return ` · ${parentYear}년 ${parentQuarter}분기`
    if (form.goalType === 'QUARTERLY') return ` · ${parentYear}년`
    return ''
  })()

  return (
    <form onSubmit={onSubmit} className="space-y-3">
      <input
        className={inputClass}
        placeholder="목표 제목 *"
        value={form.title}
        onChange={(e) => onChange({ ...form, title: e.target.value })}
        required
      />
      <textarea
        className={`${inputClass} resize-none`}
        placeholder="설명"
        rows={2}
        value={form.description}
        onChange={(e) => onChange({ ...form, description: e.target.value })}
      />
      <div>
        <label className="text-xs text-slate-500 block mb-1">목표 단계</label>
        <select
          className={inputClass}
          value={form.goalType}
          onChange={(e) =>
            onChange({ ...form, goalType: e.target.value as GoalType, parentId: '', targetDate: '' })
          }
        >
          {GOAL_TYPE_ORDER.map((t) => (
            <option key={t} value={t}>{goalTypeLabel(t)}</option>
          ))}
        </select>
      </div>
      {parentTierIndex >= 0 && (
        <div>
          <label className="text-xs text-slate-500 block mb-1">
            상위 목표 ({goalTypeLabel(GOAL_TYPE_ORDER[parentTierIndex])}{parentContextLabel}) *
          </label>
          <select
            className={inputClass}
            value={form.parentId}
            onChange={(e) => handleParentChange(e.target.value)}
            required
          >
            <option value="">선택하세요</option>
            {parentCandidates.map((g) => (
              <option key={g.id} value={g.id}>{g.title}</option>
            ))}
          </select>
          {parentCandidates.length === 0 && (
            <p className="text-xs text-orange-500 mt-1">
              {goalTypeLabel(GOAL_TYPE_ORDER[parentTierIndex])} 목표를 먼저 등록하세요.
            </p>
          )}
        </div>
      )}
      <div>
        <label className="text-xs text-slate-500 block mb-1">목표일 (기간 끝날짜 자동 계산)</label>
        {renderTargetDatePicker()}
        {form.targetDate && (
          <p className="text-xs text-slate-400 mt-1">{goalTargetDateWave(form.targetDate)} 까지</p>
        )}
      </div>
      <div className="flex gap-2 pt-1">
        <Button type="submit" disabled={loading} className="flex-1">
          {loading ? '저장 중...' : isEdit ? '수정' : '등록'}
        </Button>
        <Button type="button" variant="secondary" onClick={onCancel}>
          취소
        </Button>
      </div>
    </form>
  )
}
