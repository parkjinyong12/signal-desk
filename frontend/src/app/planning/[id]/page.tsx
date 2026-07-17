'use client'
import { useEffect, useState, useCallback, useMemo } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { goalsApi, tasksApi } from '@/lib/api'
import { Goal, Task, GoalType } from '@/types'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { GoalForm, GoalFormData, defaultGoalForm } from '@/components/goals/GoalForm'
import { GoalTreeNode } from '@/components/goals/GoalTreeNode'
import {
  GOAL_TYPE_ORDER,
  goalTypeLabel,
  goalTypeColor,
  goalTypeDotColor,
  goalTypeTextColor,
  goalStatusLabel,
  goalStatusColor,
  goalDDayLabel,
  goalDDayBadgeColor,
  goalTargetDateWave,
  stripTargetDateSuffix,
  priorityLabel,
  priorityColor,
} from '@/lib/utils'
import {
  ChevronLeft,
  Plus,
  Pencil,
  Trash2,
  Check,
  CheckCircle2,
  Archive,
  RotateCcw,
  Clock,
  AlertTriangle,
  Maximize2,
  Minimize2,
} from 'lucide-react'

export default function GoalDetailPage() {
  const params = useParams()
  const router = useRouter()
  const id = Number(params.id)

  const [goal, setGoal] = useState<Goal | null>(null)
  const [tasks, setTasks] = useState<Task[]>([])
  const [allGoals, setAllGoals] = useState<Goal[]>([])
  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState<GoalFormData>(defaultGoalForm)
  const [loading, setLoading] = useState(false)
  const [expanded, setExpanded] = useState<Set<number>>(new Set())

  const load = useCallback(async () => {
    const [g, t, all] = await Promise.all([
      goalsApi.get(id),
      goalsApi.tasks(id),
      goalsApi.list(),
    ])
    setGoal(g)
    setTasks(t)
    setAllGoals(all)
  }, [id])

  useEffect(() => { load() }, [load])

  const childrenByParentId = useMemo(() => {
    const map = new Map<number, Goal[]>()
    for (const g of allGoals) {
      if (g.parentId != null) {
        const list = map.get(g.parentId) ?? []
        list.push(g)
        map.set(g.parentId, list)
      }
    }
    return map
  }, [allGoals])

  const toggle = (goalId: number) => {
    setExpanded((prev) => {
      const next = new Set(prev)
      if (next.has(goalId)) next.delete(goalId)
      else next.add(goalId)
      return next
    })
  }

  const subtreeExpandableIds = useMemo(() => {
    const ids: number[] = []
    const walk = (parentId: number) => {
      for (const child of childrenByParentId.get(parentId) ?? []) {
        if ((childrenByParentId.get(child.id) ?? []).length > 0) {
          ids.push(child.id)
          walk(child.id)
        }
      }
    }
    walk(id)
    return ids
  }, [childrenByParentId, id])

  const isSubtreeFullyExpanded =
    subtreeExpandableIds.length > 0 && subtreeExpandableIds.every((gid) => expanded.has(gid))

  const toggleExpandSubtree = () => {
    setExpanded((prev) => {
      const next = new Set(prev)
      if (isSubtreeFullyExpanded) {
        subtreeExpandableIds.forEach((gid) => next.delete(gid))
      } else {
        subtreeExpandableIds.forEach((gid) => next.add(gid))
      }
      return next
    })
  }

  if (!goal) {
    return <div className="max-w-3xl mx-auto px-4 py-6 text-sm text-slate-400">불러오는 중...</div>
  }

  const startEdit = () => {
    setForm({
      title: stripTargetDateSuffix(goal.title),
      description: goal.description ?? '',
      goalType: goal.goalType,
      parentId: goal.parentId ? String(goal.parentId) : '',
      targetDate: goal.targetDate ?? '',
    })
    setEditing(true)
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
      await goalsApi.update(id, payload)
      setEditing(false)
      await load()
    } finally {
      setLoading(false)
    }
  }

  const handleStatusChange = async (status: string) => {
    await goalsApi.updateStatus(id, status)
    await load()
  }

  const handleDelete = async () => {
    if (!confirm('삭제하시겠습니까? 하위 목표가 있으면 삭제할 수 없습니다.')) return
    try {
      await goalsApi.delete(id)
      router.push('/planning?view=tree')
    } catch {
      alert('삭제할 수 없습니다. 하위 목표를 먼저 정리하세요.')
    }
  }

  const handleTaskComplete = async (taskId: number) => {
    await tasksApi.updateStatus(taskId, 'DONE')
    const [t, g] = await Promise.all([goalsApi.tasks(id), goalsApi.get(id)])
    setTasks(t)
    setGoal(g)
  }

  const childTierIndex = GOAL_TYPE_ORDER.indexOf(goal.goalType) + 1
  const childType: GoalType | null =
    childTierIndex < GOAL_TYPE_ORDER.length ? GOAL_TYPE_ORDER[childTierIndex] : null

  const parentTierIndex = GOAL_TYPE_ORDER.indexOf(goal.goalType) - 1
  const parentType: GoalType | null = parentTierIndex >= 0 ? GOAL_TYPE_ORDER[parentTierIndex] : null

  return (
    <div className="max-w-3xl mx-auto px-4 py-6">
      <div className="mb-3 flex items-center">
        {goal.parentTitle && goal.parentId ? (
          <Link
            href={`/planning/${goal.parentId}`}
            className="text-sm font-semibold text-slate-500 hover:text-slate-700 inline-flex items-center gap-1"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
            상위 목표{parentType && ` (${goalTypeLabel(parentType)})`}
          </Link>
        ) : (
          <Link
            href="/planning?view=tree"
            className="text-sm font-semibold text-slate-500 hover:text-slate-700 inline-flex items-center gap-1"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
            전체 목표
          </Link>
        )}
      </div>

      <Card className="mb-6">
        <CardContent className="pt-[17px]">
          {editing ? (
            <GoalForm
              form={form}
              onChange={setForm}
              onSubmit={handleSubmit}
              onCancel={() => setEditing(false)}
              goals={allGoals}
              loading={loading}
              isEdit
            />
          ) : (
            <>
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2 flex-wrap mb-[14px]">
                    <span className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${goalTypeDotColor(goal.goalType)}`} />
                    <h1
                      className={`inline-block rounded-md px-2.5 py-1 border border-opacity-30 text-lg font-medium ${goalTypeColor(goal.goalType)}`}
                    >
                      {stripTargetDateSuffix(goal.title)}
                    </h1>
                    {goal.status !== 'ACTIVE' && (
                      <Badge className={goalStatusColor(goal.status)}>{goalStatusLabel(goal.status)}</Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <span className={`text-xs font-medium ${goalTypeTextColor(goal.goalType)}`}>
                      {goalTypeLabel(goal.goalType)}
                    </span>
                    {goal.targetDate && goal.status === 'ACTIVE' && (
                      <span
                        className={`text-xs flex items-center gap-0.5 px-1.5 py-0.5 rounded-full border font-medium ${goalDDayBadgeColor(goal.targetDate)}`}
                      >
                        <Clock className="w-3 h-3" />
                        {goalDDayLabel(goal.targetDate)}
                      </span>
                    )}
                  </div>
                  {goal.targetDate && (
                    <p className="text-xs text-slate-400">{goalTargetDateWave(goal.targetDate)}</p>
                  )}
                  {goal.parentTargetDate && goal.targetDate && goal.targetDate > goal.parentTargetDate && (
                    <p className="text-xs text-red-500 mt-0.5 flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3 flex-shrink-0" />
                      상위 목표 &quot;{goal.parentTitle}&quot;의 기간({goalTargetDateWave(goal.parentTargetDate)})을
                      벗어났습니다
                    </p>
                  )}
                </div>
                <div className="flex gap-1">
                  <button
                    onClick={startEdit}
                    className="p-1.5 text-slate-400 hover:text-brand-500 hover:bg-brand-50 rounded transition-colors"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button
                    onClick={handleDelete}
                    className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              {goal.description && (
                <p className="text-sm text-slate-600 mt-2 whitespace-pre-wrap">{goal.description}</p>
              )}

              <div className="mt-4">
                <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
                  <span>전체 진행률 (하위 목표 반영)</span>
                  <span className="font-medium">{goal.progress}%</span>
                </div>
                <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-brand-500 rounded-full transition-all"
                    style={{ width: `${goal.progress}%` }}
                  />
                </div>
                <p className="text-xs text-slate-400 mt-1">
                  {goal.linkedTaskCount === 0
                    ? '직접 연결된 작업 없음'
                    : `직접 연결된 작업 ${goal.completedTaskCount} / ${goal.linkedTaskCount} 완료`}
                </p>
              </div>

              <div className="flex gap-2 mt-4">
                {goal.status !== 'COMPLETED' && (
                  <Button size="sm" variant="secondary" onClick={() => handleStatusChange('COMPLETED')}>
                    <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
                    완료 처리
                  </Button>
                )}
                {goal.status !== 'ARCHIVED' && (
                  <Button size="sm" variant="secondary" onClick={() => handleStatusChange('ARCHIVED')}>
                    <Archive className="w-3.5 h-3.5 mr-1" />
                    보관
                  </Button>
                )}
                {goal.status !== 'ACTIVE' && (
                  <Button size="sm" variant="secondary" onClick={() => handleStatusChange('ACTIVE')}>
                    <RotateCcw className="w-3.5 h-3.5 mr-1" />
                    재활성화
                  </Button>
                )}
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {childType && (
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-sm font-semibold text-slate-500">하위 목표 ({goalTypeLabel(childType)})</h2>
            <div className="flex items-center gap-1">
              {subtreeExpandableIds.length > 0 && (
                <button
                  onClick={toggleExpandSubtree}
                  className="text-xs font-medium text-slate-400 hover:text-slate-600 inline-flex items-center gap-1 px-2 py-1.5"
                >
                  {isSubtreeFullyExpanded ? (
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
              )}
              <Button
                size="sm"
                variant="ghost"
                onClick={() => router.push(`/planning?parentId=${goal.id}&goalType=${childType}`)}
              >
                <Plus className="w-3.5 h-3.5 mr-1" />
                하위 목표 추가
              </Button>
            </div>
          </div>
          {(childrenByParentId.get(goal.id) ?? []).length === 0 ? (
            <Card>
              <CardContent className="py-6 text-center text-slate-400 text-sm">하위 목표가 없습니다.</CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="py-2">
                {(childrenByParentId.get(goal.id) ?? []).map((child) => (
                  <GoalTreeNode
                    key={child.id}
                    goal={child}
                    depth={0}
                    childrenByParentId={childrenByParentId}
                    expanded={expanded}
                    onToggle={toggle}
                    parentTargetDate={goal.targetDate}
                  />
                ))}
              </CardContent>
            </Card>
          )}
        </div>
      )}

      <div>
        <h2 className="text-sm font-semibold text-slate-500 mb-2">연결된 작업</h2>
        {tasks.length === 0 ? (
          <Card>
            <CardContent className="py-6 text-center text-slate-400 text-sm">연결된 작업이 없습니다.</CardContent>
          </Card>
        ) : (
          <div className="space-y-2">
            {tasks.map((task) => (
              <Card key={task.id}>
                <CardContent className="py-3">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => handleTaskComplete(task.id)}
                      className="flex-shrink-0 w-5 h-5 rounded-full border-2 border-slate-300 hover:border-green-400 hover:bg-green-50 transition-colors flex items-center justify-center"
                    >
                      {task.status === 'DONE' && <Check className="w-3 h-3 text-green-500" />}
                    </button>
                    <span
                      className={`text-sm ${task.status === 'DONE' ? 'line-through text-slate-400' : 'text-slate-800'}`}
                    >
                      {task.title}
                    </span>
                    <Badge className={priorityColor(task.priorityLevel)}>{priorityLabel(task.priorityLevel)}</Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
