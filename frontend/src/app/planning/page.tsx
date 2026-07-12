'use client'
import { useEffect, useState, useCallback } from 'react'
import { goalsApi } from '@/lib/api'
import { Goal, GoalType } from '@/types'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { GOAL_TYPE_ORDER, goalTypeLabel, goalTypeColor } from '@/lib/utils'
import { Plus, Trash2, ChevronUp, Target } from 'lucide-react'

type FormData = {
  title: string
  description: string
  goalType: GoalType
  parentId: string
  targetDate: string
}

const defaultForm: FormData = {
  title: '',
  description: '',
  goalType: 'LIFE',
  parentId: '',
  targetDate: '',
}

export default function PlanningPage() {
  const [goals, setGoals] = useState<Goal[]>([])
  const [showForm, setShowForm] = useState(false)
  const [editId, setEditId] = useState<number | null>(null)
  const [form, setForm] = useState<FormData>(defaultForm)
  const [loading, setLoading] = useState(false)

  const load = useCallback(async () => {
    const data = await goalsApi.list()
    setGoals(data)
  }, [])

  useEffect(() => { load() }, [load])

  const parentTierIndex = GOAL_TYPE_ORDER.indexOf(form.goalType) - 1
  const parentCandidates = parentTierIndex >= 0
    ? goals.filter((g) => g.goalType === GOAL_TYPE_ORDER[parentTierIndex])
    : []

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const payload = {
        title: form.title,
        description: form.description || undefined,
        goalType: form.goalType,
        parentId: form.parentId ? Number(form.parentId) : undefined,
        targetDate: form.targetDate || undefined,
      }
      if (editId) {
        await goalsApi.update(editId, payload)
      } else {
        await goalsApi.create(payload)
      }
      setForm(defaultForm)
      setShowForm(false)
      setEditId(null)
      await load()
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('삭제하시겠습니까? 하위 목표가 있으면 삭제할 수 없습니다.')) return
    try {
      await goalsApi.delete(id)
      await load()
    } catch {
      alert('삭제할 수 없습니다. 하위 목표를 먼저 정리하세요.')
    }
  }

  const startEdit = (goal: Goal) => {
    setForm({
      title: goal.title,
      description: goal.description ?? '',
      goalType: goal.goalType,
      parentId: goal.parentId ? String(goal.parentId) : '',
      targetDate: goal.targetDate ?? '',
    })
    setEditId(goal.id)
    setShowForm(true)
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold text-slate-800">목표 & 계획</h1>
        <Button onClick={() => { setShowForm(!showForm); setEditId(null); setForm(defaultForm) }} size="sm">
          <Plus className="w-4 h-4 mr-1" />
          새 목표
        </Button>
      </div>

      {showForm && (
        <Card className="mb-6">
          <CardContent className="pt-5">
            <h2 className="font-semibold text-slate-800 mb-4">{editId ? '목표 수정' : '새 목표 등록'}</h2>
            <form onSubmit={handleSubmit} className="space-y-3">
              <input
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                placeholder="목표 제목 *"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                required
              />
              <textarea
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 resize-none"
                placeholder="설명"
                rows={2}
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
              />
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-slate-500 block mb-1">목표 단계</label>
                  <select
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                    value={form.goalType}
                    onChange={(e) => setForm({ ...form, goalType: e.target.value as GoalType, parentId: '' })}
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
                    onChange={(e) => setForm({ ...form, targetDate: e.target.value })}
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
                    onChange={(e) => setForm({ ...form, parentId: e.target.value })}
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
                  {loading ? '저장 중...' : editId ? '수정' : '등록'}
                </Button>
                <Button type="button" variant="secondary" onClick={() => { setShowForm(false); setEditId(null) }}>
                  취소
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="space-y-6">
        {goals.length === 0 ? (
          <Card>
            <CardContent className="py-10 text-center text-slate-400 text-sm">
              등록된 목표가 없습니다. 새로 등록해보세요.
            </CardContent>
          </Card>
        ) : (
          GOAL_TYPE_ORDER.map((type) => {
            const goalsOfType = goals.filter((g) => g.goalType === type)
            if (goalsOfType.length === 0) return null
            return (
              <div key={type}>
                <h2 className="text-sm font-semibold text-slate-500 mb-2 flex items-center gap-1.5">
                  <Target className="w-3.5 h-3.5" />
                  {goalTypeLabel(type)} 목표
                </h2>
                <div className="space-y-2">
                  {goalsOfType.map((goal) => (
                    <Card key={goal.id} className="hover:shadow-md transition-shadow">
                      <CardContent className="py-3">
                        <div className="flex items-start gap-3">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-sm font-medium text-slate-800">{goal.title}</span>
                              <Badge className={goalTypeColor(goal.goalType)}>
                                {goalTypeLabel(goal.goalType)}
                              </Badge>
                              {goal.targetDate && (
                                <span className="text-xs text-slate-400">{goal.targetDate}</span>
                              )}
                            </div>
                            {goal.description && (
                              <p className="text-xs text-slate-500 mt-0.5 truncate">{goal.description}</p>
                            )}
                            <div className="mt-2">
                              <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                                <div
                                  className="h-full bg-brand-500 rounded-full transition-all"
                                  style={{ width: `${goal.progress}%` }}
                                />
                              </div>
                              <p className="text-xs text-slate-400 mt-1">
                                {goal.linkedTaskCount === 0
                                  ? '연결된 작업 없음'
                                  : `${goal.completedTaskCount} / ${goal.linkedTaskCount} 작업 완료 (${goal.progress}%)`}
                              </p>
                            </div>
                          </div>
                          <div className="flex gap-1">
                            <button
                              onClick={() => startEdit(goal)}
                              className="p-1.5 text-slate-400 hover:text-brand-500 hover:bg-brand-50 rounded transition-colors"
                            >
                              <ChevronUp className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(goal.id)}
                              className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
