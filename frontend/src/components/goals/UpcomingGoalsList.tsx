'use client'
import Link from 'next/link'
import { Goal } from '@/types'
import { Badge } from '@/components/ui/badge'
import {
  goalTypeLabel,
  goalTypeDotColor,
  goalTypeColor,
  goalDDayLabel,
  goalDDayBadgeColor,
  stripTargetDateSuffix,
  daysUntil,
} from '@/lib/utils'
import { goalPeriodLabel } from '@/lib/goalPeriod'
import { Clock } from 'lucide-react'

interface Props {
  goals: Goal[]
}

interface Bucket {
  key: string
  label: string
  goals: Goal[]
}

export function UpcomingGoalsList({ goals }: Props) {
  const upcoming = goals
    .filter((g) => g.status === 'ACTIVE' && g.targetDate && daysUntil(g.targetDate) <= 30)
    .sort((a, b) => daysUntil(a.targetDate!) - daysUntil(b.targetDate!))

  const buckets: Bucket[] = [
    { key: 'overdue', label: '지남', goals: upcoming.filter((g) => daysUntil(g.targetDate!) < 0) },
    { key: 'thisWeek', label: '이번 주', goals: upcoming.filter((g) => { const d = daysUntil(g.targetDate!); return d >= 0 && d <= 7 }) },
    { key: 'thisMonth', label: '이번 달', goals: upcoming.filter((g) => { const d = daysUntil(g.targetDate!); return d > 7 && d <= 30 }) },
  ].filter((b) => b.goals.length > 0)

  if (upcoming.length === 0) {
    return (
      <div className="py-10 text-center text-slate-400 text-sm">
        한 달 안에 마감인 진행중인 목표가 없습니다.
      </div>
    )
  }

  return (
    <div className="space-y-5">
      {buckets.map((bucket) => (
        <div key={bucket.key}>
          <h3 className="text-xs font-semibold text-slate-400 mb-2">
            {bucket.label} ({bucket.goals.length})
          </h3>
          <div className="space-y-2">
            {bucket.goals.map((goal) => (
              <Link key={goal.id} href={`/planning/${goal.id}`} className="block">
                <div className="flex items-center gap-2 flex-wrap px-1">
                  <span className={`w-2 h-2 rounded-full flex-shrink-0 ${goalTypeDotColor(goal.goalType)}`} />
                  <span
                    className={`inline-block rounded-md px-2 py-0.5 shadow-sm border text-sm font-medium ${goalTypeColor(goal.goalType)}`}
                  >
                    {stripTargetDateSuffix(goal.title)}
                  </span>
                  <span className="text-xs text-slate-400">{goalTypeLabel(goal.goalType)}</span>
                  <span className="text-xs text-slate-400">{goalPeriodLabel(goal.goalType, goal.targetDate)}</span>
                  <Badge className={goalDDayBadgeColor(goal.targetDate)}>
                    <Clock className="w-3 h-3 mr-0.5" />
                    {goalDDayLabel(goal.targetDate)}
                  </Badge>
                  <span className="flex-1 max-w-[100px] h-1 bg-slate-100 rounded-full overflow-hidden">
                    <span className="h-full bg-brand-400 rounded-full block" style={{ width: `${goal.progress}%` }} />
                  </span>
                  <span className="text-xs text-slate-400 flex-shrink-0">{goal.progress}%</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
