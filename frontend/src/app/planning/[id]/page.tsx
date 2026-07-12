'use client'
import { useEffect, useState, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { goalsApi, tasksApi } from '@/lib/api'
import { Goal, Task, GoalType } from '@/types'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { GoalForm, GoalFormData, defaultGoalForm } from '@/components/goals/GoalForm'
import {
  GOAL_TYPE_ORDER,
  goalTypeLabel,
  goalTypeColor,
  goalStatusLabel,
  goalStatusColor,
  goalDDayLabel,
  goalDDayBadgeColor,
  priorityLabel,
  priorityColor,
} from '@/lib/utils'
import { ChevronLeft, Plus, Pencil, Trash2, Check, CheckCircle2, Archive, RotateCcw } from 'lucide-react'

export default function GoalDetailPage() {
  const params = useParams()
  const router = useRouter()
  const id = Number(params.id)

  const [goal, setGoal] = useState<Goal | null>(null)
  const [children, setChildren] = useState<Goal[]>([])
  const [tasks, setTasks] = useState<Task[]>([])
  const [allGoals, setAllGoals] = useState<Goal[]>([])
  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState<GoalFormData>(defaultGoalForm)
  const [loading, setLoading] = useState(false)

  const load = useCallback(async () => {
    const [g, c, t, all] = await Promise.all([
      goalsApi.get(id),
      goalsApi.children(id),
      goalsApi.tasks(id),
      goalsApi.list(),
    ])
    setGoal(g)
    setChildren(c)
    setTasks(t)
    setAllGoals(all)
  }, [id])

  useEffect(() => { load() }, [load])

  if (!goal) {
    return <div className="max-w-3xl mx-auto px-4 py-6 text-sm text-slate-400">불러오는 중...</div>
  }

  const startEdit = () => {
    setForm({
      title: goal.title,
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
      router.push('/planning')
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

  return (
    <div className="max-w-3xl mx-auto px-4 py-6">
      <div className="mb-4 flex items-center">
        <Link href="/planning" className="text-xs text-slate-400 hover:text-slate-600 inline-flex items-center gap-1">
          <ChevronLeft className="w-3.5 h-3.5" />
          전체 목표
        </Link>
        {goal.parentTitle && goal.parentId && (
          <>
            <span className="text-xs text-slate-300 mx-1">/</span>
            <Link href={`/planning/${goal.parentId}`} className="text-xs text-slate-400 hover:text-slate-600">
              {goal.parentTitle}
            </Link>
          </>
        )}
      </div>

      <Card className="mb-6">
        <CardContent className="pt-5">
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
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <h1 className="text-lg font-bold text-slate-800">{goal.title}</h1>
                    <Badge className={goalTypeColor(goal.goalType)}>{goalTypeLabel(goal.goalType)}</Badge>
                    <Badge className={goalStatusColor(goal.status)}>{goalStatusLabel(goal.status)}</Badge>
                    {goal.targetDate && goal.status === 'ACTIVE' && (
                      <Badge className={goalDDayBadgeColor(goal.targetDate)}>
                        {goalDDayLabel(goal.targetDate)}
                      </Badge>
                    )}
                  </div>
                  {goal.targetDate && <p className="text-xs text-slate-400">목표일: {goal.targetDate}</p>}
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
            <Button
              size="sm"
              variant="ghost"
              onClick={() => router.push(`/planning?parentId=${goal.id}&goalType=${childType}`)}
            >
              <Plus className="w-3.5 h-3.5 mr-1" />
              하위 목표 추가
            </Button>
          </div>
          {children.length === 0 ? (
            <Card>
              <CardContent className="py-6 text-center text-slate-400 text-sm">하위 목표가 없습니다.</CardContent>
            </Card>
          ) : (
            <div className="space-y-2">
              {children.map((child) => (
                <Link key={child.id} href={`/planning/${child.id}`}>
                  <Card className="hover:shadow-md transition-shadow">
                    <CardContent className="py-3">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-medium text-slate-800">{child.title}</span>
                        <Badge className={goalStatusColor(child.status)}>{goalStatusLabel(child.status)}</Badge>
                        {child.targetDate && child.status === 'ACTIVE' && (
                          <Badge className={goalDDayBadgeColor(child.targetDate)}>
                            {goalDDayLabel(child.targetDate)}
                          </Badge>
                        )}
                        <span className="text-xs text-slate-400 ml-auto">{child.progress}%</span>
                      </div>
                      <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden mt-1.5">
                        <div className="h-full bg-brand-500 rounded-full" style={{ width: `${child.progress}%` }} />
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
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
