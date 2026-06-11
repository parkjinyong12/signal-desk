'use client'
import { Card, CardHeader, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { DailyBriefingItem } from '@/types'
import { formatDeadline } from '@/lib/utils'
import { AlertCircle } from 'lucide-react'

interface Props {
  items: DailyBriefingItem[]
}

export function MustDoCard({ items }: Props) {
  const taskItems = items.filter((i) => i.itemType === 'TASK')

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-red-500" />
          <h2 className="font-semibold text-slate-800">반드시 처리할 일</h2>
          <Badge className="bg-red-100 text-red-600 border-red-200 ml-auto">{taskItems.length}건</Badge>
        </div>
      </CardHeader>
      <CardContent>
        {taskItems.length === 0 ? (
          <p className="text-slate-400 text-sm text-center py-4">오늘 반드시 처리할 일이 없습니다.</p>
        ) : (
          <ul className="space-y-3">
            {taskItems.map((item, i) => (
              <li key={item.id} className="flex items-start gap-3">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-red-100 text-red-600 text-xs font-bold flex items-center justify-center mt-0.5">
                  {String.fromCharCode(65 + i)}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-800 truncate">{item.title}</p>
                  {item.reason && (
                    <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">{item.reason}</p>
                  )}
                </div>
                {item.score != null && (
                  <span className="flex-shrink-0 text-xs text-slate-400">점수 {item.score}</span>
                )}
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  )
}
