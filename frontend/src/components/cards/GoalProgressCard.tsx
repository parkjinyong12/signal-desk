'use client'
import Link from 'next/link'
import { Card, CardHeader, CardContent } from '@/components/ui/card'
import { Goal } from '@/types'
import { goalDDayLabel, goalDDayBadgeColor } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { Target } from 'lucide-react'

interface Props {
  goals: Goal[]
}

export function GoalProgressCard({ goals }: Props) {
  const lifeGoals = goals.filter((g) => g.goalType === 'LIFE' && g.status === 'ACTIVE')

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Target className="w-4 h-4 text-slate-400" />
          <h2 className="font-semibold text-slate-800">인생 목표 진행률</h2>
          <Link href="/planning" className="ml-auto text-xs text-brand-500 hover:text-brand-600">
            전체 보기
          </Link>
        </div>
      </CardHeader>
      <CardContent>
        {lifeGoals.length === 0 ? (
          <div className="text-center py-4">
            <p className="text-slate-400 text-sm mb-2">등록된 인생 목표가 없습니다.</p>
            <Link href="/planning" className="text-xs text-brand-500 hover:text-brand-600">
              목표 만들러 가기 →
            </Link>
          </div>
        ) : (
          <ul className="space-y-3">
            {lifeGoals.map((goal) => (
              <li key={goal.id}>
                <Link href={`/planning/${goal.id}`} className="block">
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span className="text-slate-700 font-medium truncate">{goal.title}</span>
                    <span className="flex items-center gap-2 flex-shrink-0 ml-2">
                      {goal.targetDate && (
                        <Badge className={goalDDayBadgeColor(goal.targetDate)}>
                          {goalDDayLabel(goal.targetDate)}
                        </Badge>
                      )}
                      <span className="text-xs text-slate-400">{goal.progress}%</span>
                    </span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-brand-500 rounded-full transition-all"
                      style={{ width: `${goal.progress}%` }}
                    />
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  )
}
