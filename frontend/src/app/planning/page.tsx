'use client'
import { useEffect, useState, useCallback, useMemo } from 'react'
import { goalsApi } from '@/lib/api'
import { Goal, GoalType } from '@/types'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { GoalForm, GoalFormData, defaultGoalForm } from '@/components/goals/GoalForm'
import { GoalTreeNode } from '@/components/goals/GoalTreeNode'
import { Plus, Archive } from 'lucide-react'

export default function PlanningPage() {
  const [goals, setGoals] = useState<Goal[]>([])
  const [showForm, setShowForm] = useState(false)
  const [editId, setEditId] = useState<number | null>(null)
  const [form, setForm] = useState<GoalFormData>(defaultGoalForm)
  const [loading, setLoading] = useState(false)
  const [showArchived, setShowArchived] = useState(false)
  const [collapsed, setCollapsed] = useState<Set<number>>(new Set())

  const load = useCallback(async () => {
    const data = await goalsApi.list()
    setGoals(data)
  }, [])

  useEffect(() => {
    load()
    const params = new URLSearchParams(window.location.search)
    const parentId = params.get('parentId')
    const goalType = params.get('goalType')
    if (parentId && goalType) {
      setForm({ ...defaultGoalForm, goalType: goalType as GoalType, parentId })
      setShowForm(true)
    }
  }, [load])

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
    setCollapsed((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
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
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold text-slate-800">목표 & 계획</h1>
        <div className="flex gap-2">
          <Button
            variant={showArchived ? 'secondary' : 'ghost'}
            size="sm"
            onClick={() => setShowArchived(!showArchived)}
          >
            <Archive className="w-4 h-4 mr-1" />
            보관된 목표 {showArchived ? '숨기기' : '보기'}
          </Button>
          <Button onClick={() => { setShowForm(!showForm); setEditId(null); setForm(defaultGoalForm) }} size="sm">
            <Plus className="w-4 h-4 mr-1" />
            새 목표
          </Button>
        </div>
      </div>

      {showForm && (
        <Card className="mb-6">
          <CardContent className="pt-5">
            <h2 className="font-semibold text-slate-800 mb-4">{editId ? '목표 수정' : '새 목표 등록'}</h2>
            <GoalForm
              form={form}
              onChange={setForm}
              onSubmit={handleSubmit}
              onCancel={() => { setShowForm(false); setEditId(null) }}
              goals={goals}
              loading={loading}
              isEdit={!!editId}
            />
          </CardContent>
        </Card>
      )}

      <Card>
        <CardContent className="py-2">
          {roots.length === 0 ? (
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
                collapsed={collapsed}
                onToggle={toggle}
              />
            ))
          )}
        </CardContent>
      </Card>
    </div>
  )
}
