'use client'
import { useEffect, useState, useCallback, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { goalsApi } from '@/lib/api'
import { Goal, GoalType } from '@/types'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { GoalForm, GoalFormData, defaultGoalForm } from '@/components/goals/GoalForm'
import { GoalTreeNode } from '@/components/goals/GoalTreeNode'
import { UpcomingGoalsList } from '@/components/goals/UpcomingGoalsList'
import { deriveDefaultTargetDate } from '@/lib/goalPeriod'
import { Plus, Archive, Maximize2, Minimize2 } from 'lucide-react'

type ViewMode = 'tree' | 'upcoming'

export default function PlanningPage() {
  const router = useRouter()
  const [goals, setGoals] = useState<Goal[]>([])
  const [showForm, setShowForm] = useState(false)
  const [editId, setEditId] = useState<number | null>(null)
  const [form, setForm] = useState<GoalFormData>(defaultGoalForm)
  const [loading, setLoading] = useState(false)
  const [showArchived, setShowArchived] = useState(false)
  const [expanded, setExpanded] = useState<Set<number>>(new Set())
  const [view, setView] = useState<ViewMode>('upcoming')
  const [fromDeepLink, setFromDeepLink] = useState(false)

  const load = useCallback(async () => {
    const data = await goalsApi.list()
    setGoals(data)
    return data
  }, [])

  useEffect(() => {
    (async () => {
      const data = await load()
      const params = new URLSearchParams(window.location.search)
      const parentId = params.get('parentId')
      const goalType = params.get('goalType')
      if (parentId && goalType) {
        const parent = data.find((g) => String(g.id) === parentId)
        const targetDate = deriveDefaultTargetDate(goalType as GoalType, parent?.targetDate)
        setForm({ ...defaultGoalForm, goalType: goalType as GoalType, parentId, targetDate })
        setShowForm(true)
        setFromDeepLink(true)
      }
      if (params.get('view') === 'tree') {
        setView('tree')
      }
    })()
  }, [load])

  const closeForm = () => {
    if (fromDeepLink) {
      router.back()
      return
    }
    setShowForm(false)
    setEditId(null)
    setForm(defaultGoalForm)
  }

  const visibleGoals = useMemo(
    () => (showArchived ? goals : goals.filter((g) => g.status !== 'ARCHIVED')),
    [goals, showArchived]
  )

  const { roots, childrenByParentId } = useMemo(() => {
    const visibleIds = new Set(visibleGoals.map((g) => g.id))
    const map = new Map<number, Goal[]>()
    for (const g of visibleGoals) {
      if (g.parentId != null) {
        const list = map.get(g.parentId) ?? []
        list.push(g)
        map.set(g.parentId, list)
      }
    }
    const rootGoals = visibleGoals.filter((g) => g.parentId == null || !visibleIds.has(g.parentId))
    return { roots: rootGoals, childrenByParentId: map }
  }, [visibleGoals])

  const toggle = (id: number) => {
    setExpanded((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const expandableIds = useMemo(() => Array.from(childrenByParentId.keys()), [childrenByParentId])
  const isFullyExpanded = expandableIds.length > 0 && expandableIds.every((id) => expanded.has(id))
  const toggleExpandAll = () => {
    setExpanded(isFullyExpanded ? new Set() : new Set(expandableIds))
  }

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
      setForm(defaultGoalForm)
      setShowForm(false)
      setEditId(null)
      await load()
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-bold text-slate-800">목표 & 계획</h1>
        <div className="flex gap-2">
          {!showForm && view === 'tree' && (
            <Button
              variant={showArchived ? 'secondary' : 'ghost'}
              size="sm"
              onClick={() => setShowArchived(!showArchived)}
            >
              <Archive className="w-4 h-4 mr-1" />
              보관된 목표 {showArchived ? '숨기기' : '보기'}
            </Button>
          )}
          {!showForm && (
            <Button
              onClick={() => {
                setFromDeepLink(false)
                setShowForm(true)
                setEditId(null)
                setForm(defaultGoalForm)
              }}
              size="sm"
            >
              <Plus className="w-4 h-4 mr-1" />
              새 목표
            </Button>
          )}
        </div>
      </div>

      {!showForm && (
        <div className="flex gap-1 mb-6 border-b border-slate-200">
          <button
            onClick={() => setView('upcoming')}
            className={`px-3 py-2 text-sm font-medium border-b-2 -mb-px transition-colors ${
              view === 'upcoming' ? 'border-brand-500 text-brand-600' : 'border-transparent text-slate-400 hover:text-slate-600'
            }`}
          >
            이번 달 목표
          </button>
          <button
            onClick={() => setView('tree')}
            className={`px-3 py-2 text-sm font-medium border-b-2 -mb-px transition-colors ${
              view === 'tree' ? 'border-brand-500 text-brand-600' : 'border-transparent text-slate-400 hover:text-slate-600'
            }`}
          >
            전체 목표
          </button>
        </div>
      )}

      {showForm && (
        <Card className="mb-6">
          <CardContent className="pt-5">
            <h2 className="font-semibold text-slate-800 mb-4">{editId ? '목표 수정' : '새 목표 등록'}</h2>
            <GoalForm
              form={form}
              onChange={setForm}
              onSubmit={handleSubmit}
              onCancel={closeForm}
              goals={goals}
              loading={loading}
              isEdit={!!editId}
            />
          </CardContent>
        </Card>
      )}

      {!showForm && view === 'tree' && expandableIds.length > 0 && (
        <div className="flex justify-end mb-2">
          <button
            onClick={toggleExpandAll}
            className="text-xs font-medium text-slate-400 hover:text-slate-600 inline-flex items-center gap-1"
          >
            {isFullyExpanded ? (
              <>
                <Minimize2 className="w-3.5 h-3.5" />
                전체 접기
              </>
            ) : (
              <>
                <Maximize2 className="w-3.5 h-3.5" />
                전체 펼치기
              </>
            )}
          </button>
        </div>
      )}

      <Card>
        <CardContent className="py-2">
          {view === 'tree' ? (
            roots.length === 0 ? (
              <p className="py-8 text-center text-slate-400 text-sm">
                등록된 목표가 없습니다. 새로 등록해보세요.
              </p>
            ) : (
              roots.map((goal) => (
                <GoalTreeNode
                  key={goal.id}
                  goal={goal}
                  depth={0}
                  childrenByParentId={childrenByParentId}
                  expanded={expanded}
                  onToggle={toggle}
                />
              ))
            )
          ) : (
            <UpcomingGoalsList goals={goals} />
          )}
        </CardContent>
      </Card>
    </div>
  )
}
