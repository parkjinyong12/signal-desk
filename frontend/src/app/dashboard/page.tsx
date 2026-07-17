'use client'
import { useEffect, useState, useCallback } from 'react'
import { SummaryCard } from '@/components/cards/SummaryCard'
import { MustDoCard } from '@/components/cards/MustDoCard'
import { ScheduleCard } from '@/components/cards/ScheduleCard'
import { NewsBriefingCard } from '@/components/cards/NewsBriefingCard'
import { JudgementCard } from '@/components/cards/JudgementCard'
import { DeferredTasksCard } from '@/components/cards/DeferredTasksCard'
import { BriefingRequestCard } from '@/components/cards/BriefingRequestCard'
import { UpcomingGoalsCard } from '@/components/cards/UpcomingGoalsCard'
import { briefingApi, tasksApi, briefingRequestsApi, goalsApi, BriefingRequest } from '@/lib/api'
import { DailyBriefing, Task, Goal } from '@/types'

export default function DashboardPage() {
  const [briefing, setBriefing] = useState<DailyBriefing | null>(null)
  const [tasks, setTasks] = useState<Task[]>([])
  const [tomorrowRequests, setTomorrowRequests] = useState<BriefingRequest[]>([])
  const [goals, setGoals] = useState<Goal[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const loadData = useCallback(async () => {
    try {
      const [b, t, r, g] = await Promise.all([
        briefingApi.today().catch(() => null),
        tasksApi.list(),
        briefingRequestsApi.tomorrow(),
        goalsApi.list().catch(() => []),
      ])
      setBriefing(b)
      setTasks(t)
      setTomorrowRequests(r)
      setGoals(g)
    } catch {
      setError('데이터를 불러오지 못했습니다.')
    }
  }, [])

  useEffect(() => { loadData() }, [loadData])

  const handleGenerate = async () => {
    setLoading(true)
    setError(null)
    try {
      const b = await briefingApi.generate()
      setBriefing(b)
    } catch {
      setError('브리핑 생성에 실패했습니다.')
    } finally {
      setLoading(false)
    }
  }

  const items = briefing?.items ?? []
  const planBlocks = briefing?.planBlocks ?? []

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      {error && (
        <div className="mb-4 px-4 py-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
          {error}
        </div>
      )}
      <div className="grid gap-4 lg:grid-cols-2">
        <div className="lg:col-span-2">
          <SummaryCard briefing={briefing} onGenerate={handleGenerate} loading={loading} />
        </div>

        <MustDoCard items={items} />
        <ScheduleCard blocks={planBlocks} />
        <NewsBriefingCard items={items} />
        <JudgementCard items={items} />

        <div className="lg:col-span-2">
          <UpcomingGoalsCard goals={goals} />
        </div>

        <div className="lg:col-span-2">
          <DeferredTasksCard tasks={tasks} />
        </div>

        <div className="lg:col-span-2">
          <BriefingRequestCard requests={tomorrowRequests} onRefresh={loadData} />
        </div>
      </div>
    </div>
  )
}
