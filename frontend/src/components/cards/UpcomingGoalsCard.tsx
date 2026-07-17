'use client'
import Link from 'next/link'
import { Card, CardHeader, CardContent } from '@/components/ui/card'
import { Goal } from '@/types'
import { UpcomingGoalsList } from '@/components/goals/UpcomingGoalsList'
import { Clock } from 'lucide-react'

interface Props {
  goals: Goal[]
}

export function UpcomingGoalsCard({ goals }: Props) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-slate-400" />
          <h2 className="font-semibold text-slate-800">이번 달 목표</h2>
          <Link href="/planning?view=tree" className="ml-auto text-xs text-brand-500 hover:text-brand-600">
            전체 목표
          </Link>
        </div>
      </CardHeader>
      <CardContent>
        <UpcomingGoalsList goals={goals} />
      </CardContent>
    </Card>
  )
}
