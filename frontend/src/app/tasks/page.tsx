'use client'
import { useEffect, useState, useCallback } from 'react'
import { tasksApi, goalsApi } from '@/lib/api'
import { Task, EnergyLevel, Goal } from '@/types'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { priorityLabel, priorityColor, formatDeadline, goalTypeLabel, GOAL_TYPE_ORDER } from '@/lib/utils'
import { Plus, Check, Trash2, ChevronDown, ChevronUp } from 'lucide-react'

type FormData = {
  title: string
  description: string
  category: string
  deadline: string
  estimatedMinutes: number
  importanceScore: number
  urgencyScore: number
  energyLevel: EnergyLevel
  goalIds: number[]
}

const defaultForm: FormData = {
  title: '',
  description: '',
  category: '',
  deadline: '',
  estimatedMinutes: 30,
  importanceScore: 5,
  urgencyScore: 5,
  energyLevel: 'MEDIUM',
  goalIds: [],
}

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [goals, setGoals] = useState<Goal[]>([])
  const [showForm, setShowForm] = useState(false)
  const [editId, setEditId] = useState<number | null>(null)
  const [form, setForm] = useState<FormData>(defaultForm)
  const [loading, setLoading] = useState(false)

  const load = useCallback(async () => {
    const data = await tasksApi.list()
    setTasks(data)
  }, [])

  useEffect(() => {
    load()
    goalsApi.list().then(setGoals)
  }, [load])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const payload = {
        ...form,
        deadline: form.deadline ? new Date(form.deadline).toISOString() : undefined,
      }
      if (editId) {
        await tasksApi.update(editId, payload)
      } else {
        await tasksApi.create(payload)
      }
      setForm(defaultForm)
      setShowForm(false)
      setEditId(null)
      await load()
    } finally {
      setLoading(false)
    }
  }

  const handleComplete = async (id: number) => {
    await tasksApi.updateStatus(id, 'DONE')
    await load()
  }

  const handleDelete = async (id: number) => {
    if (!confirm('삭제하시겠습니까?')) return
    await tasksApi.delete(id)
    await load()
  }

  const startEdit = (task: Task) => {
    setForm({
      title: task.title,
      description: task.description ?? '',
      category: task.category ?? '',
      deadline: task.deadline ? task.deadline.substring(0, 16) : '',
      estimatedMinutes: task.estimatedMinutes,
      importanceScore: task.importanceScore,
      urgencyScore: task.urgencyScore,
      energyLevel: task.energyLevel,
      goalIds: task.goalIds,
    })
    setEditId(task.id)
    setShowForm(true)
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold text-slate-800">할 일 관리</h1>
        <Button onClick={() => { setShowForm(!showForm); setEditId(null); setForm(defaultForm) }} size="sm">
          <Plus className="w-4 h-4 mr-1" />
          새 할 일
        </Button>
      </div>

      {showForm && (
        <Card className="mb-6">
          <CardContent className="pt-5">
            <h2 className="font-semibold text-slate-800 mb-4">{editId ? '할 일 수정' : '새 할 일 등록'}</h2>
            <form onSubmit={handleSubmit} className="space-y-3">
              <input
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                placeholder="할 일 제목 *"
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
                <select
                  className="border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                >
                  <option value="">카테고리 선택</option>
                  {['업무', '개인', '학습', '투자', '부동산', '건강', '기타'].map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
                <input
                  type="datetime-local"
                  className="border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                  value={form.deadline}
                  onChange={(e) => setForm({ ...form, deadline: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-xs text-slate-500 block mb-1">예상 소요 (분)</label>
                  <input
                    type="number"
                    min={5}
                    max={480}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                    value={form.estimatedMinutes}
                    onChange={(e) => setForm({ ...form, estimatedMinutes: Number(e.target.value) })}
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-500 block mb-1">중요도 (1-10)</label>
                  <input
                    type="number"
                    min={1}
                    max={10}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                    value={form.importanceScore}
                    onChange={(e) => setForm({ ...form, importanceScore: Number(e.target.value) })}
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-500 block mb-1">긴급도 (1-10)</label>
                  <input
                    type="number"
                    min={1}
                    max={10}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                    value={form.urgencyScore}
                    onChange={(e) => setForm({ ...form, urgencyScore: Number(e.target.value) })}
                  />
                </div>
              </div>
              <div>
                <label className="text-xs text-slate-500 block mb-1">에너지 요구도</label>
                <select
                  className="border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                  value={form.energyLevel}
                  onChange={(e) => setForm({ ...form, energyLevel: e.target.value as EnergyLevel })}
                >
                  <option value="LOW">낮음</option>
                  <option value="MEDIUM">보통</option>
                  <option value="HIGH">높음</option>
                </select>
              </div>
              {goals.some((g) => g.status !== 'ARCHIVED') && (
                <div>
                  <label className="text-xs text-slate-500 block mb-1">연결된 목표</label>
                  <div className="max-h-40 overflow-y-auto border border-slate-200 rounded-lg p-2 space-y-2">
                    {GOAL_TYPE_ORDER.map((type) => {
                      const goalsOfType = goals.filter((g) => g.goalType === type && g.status !== 'ARCHIVED')
                      if (goalsOfType.length === 0) return null
                      return (
                        <div key={type}>
                          <p className="text-[11px] font-semibold text-slate-400 mb-1">{goalTypeLabel(type)}</p>
                          <div className="flex flex-wrap gap-x-3 gap-y-1">
                            {goalsOfType.map((g) => (
                              <label key={g.id} className="flex items-center gap-1 text-xs">
                                <input
                                  type="checkbox"
                                  checked={form.goalIds.includes(g.id)}
                                  onChange={(e) =>
                                    setForm({
                                      ...form,
                                      goalIds: e.target.checked
                                        ? [...form.goalIds, g.id]
                                        : form.goalIds.filter((id) => id !== g.id),
                                    })
                                  }
                                />
                                {g.title}
                              </label>
                            ))}
                          </div>
                        </div>
                      )
                    })}
                  </div>
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

      <div className="space-y-2">
        {tasks.length === 0 ? (
          <Card>
            <CardContent className="py-10 text-center text-slate-400 text-sm">
              할 일이 없습니다. 새로 등록해보세요.
            </CardContent>
          </Card>
        ) : (
          tasks.map((task) => (
            <Card key={task.id} className="hover:shadow-md transition-shadow">
              <CardContent className="py-3">
                <div className="flex items-start gap-3">
                  <button
                    onClick={() => handleComplete(task.id)}
                    className="flex-shrink-0 mt-0.5 w-5 h-5 rounded-full border-2 border-slate-300 hover:border-green-400 hover:bg-green-50 transition-colors flex items-center justify-center"
                  >
                    {task.status === 'DONE' && <Check className="w-3 h-3 text-green-500" />}
                  </button>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`text-sm font-medium ${task.status === 'DONE' ? 'line-through text-slate-400' : 'text-slate-800'}`}>
                        {task.title}
                      </span>
                      <Badge className={priorityColor(task.priorityLevel)}>
                        {priorityLabel(task.priorityLevel)}
                      </Badge>
                      {task.category && (
                        <Badge className="bg-slate-100 text-slate-500 border-slate-200">{task.category}</Badge>
                      )}
                    </div>
                    {task.description && (
                      <p className="text-xs text-slate-500 mt-0.5 truncate">{task.description}</p>
                    )}
                    <div className="flex items-center gap-3 mt-1 text-xs text-slate-400">
                      {task.deadline && <span className="text-orange-500">{formatDeadline(task.deadline)}</span>}
                      <span>{task.estimatedMinutes}분</span>
                      <span>중요도 {task.importanceScore}</span>
                      {task.priorityScore != null && <span>점수 {task.priorityScore}</span>}
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <button
                      onClick={() => startEdit(task)}
                      className="p-1.5 text-slate-400 hover:text-brand-500 hover:bg-brand-50 rounded transition-colors"
                    >
                      <ChevronUp className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(task.id)}
                      className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
