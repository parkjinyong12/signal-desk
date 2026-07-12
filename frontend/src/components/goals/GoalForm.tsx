'use client'
import { Goal, GoalType } from '@/types'
import { Button } from '@/components/ui/button'
import { GOAL_TYPE_ORDER, goalTypeLabel } from '@/lib/utils'

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

export function GoalForm({ form, onChange, onSubmit, onCancel, goals, loading, isEdit }: GoalFormProps) {
  const parentTierIndex = GOAL_TYPE_ORDER.indexOf(form.goalType) - 1
  const parentCandidates = parentTierIndex >= 0
    ? goals.filter((g) => g.goalType === GOAL_TYPE_ORDER[parentTierIndex] && g.status !== 'ARCHIVED')
    : []

  return (
    <form onSubmit={onSubmit} className="space-y-3">
      <input
        className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
        placeholder="목표 제목 *"
        value={form.title}
        onChange={(e) => onChange({ ...form, title: e.target.value })}
        required
      />
      <textarea
        className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 resize-none"
        placeholder="설명"
        rows={2}
        value={form.description}
        onChange={(e) => onChange({ ...form, description: e.target.value })}
      />
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-xs text-slate-500 block mb-1">목표 단계</label>
          <select
            className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
            value={form.goalType}
            onChange={(e) => onChange({ ...form, goalType: e.target.value as GoalType, parentId: '' })}
          >
            {GOAL_TYPE_ORDER.map((t) => (
              <option key={t} value={t}>{goalTypeLabel(t)}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-xs text-slate-500 block mb-1">목표일</label>
          <input
            type="date"
            className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
            value={form.targetDate}
            onChange={(e) => onChange({ ...form, targetDate: e.target.value })}
          />
        </div>
      </div>
      {parentTierIndex >= 0 && (
        <div>
          <label className="text-xs text-slate-500 block mb-1">
            상위 목표 ({goalTypeLabel(GOAL_TYPE_ORDER[parentTierIndex])}) *
          </label>
          <select
            className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
            value={form.parentId}
            onChange={(e) => onChange({ ...form, parentId: e.target.value })}
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
