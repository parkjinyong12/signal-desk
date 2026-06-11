'use client'
import { Card, CardHeader, CardContent } from '@/components/ui/card'
import { Task } from '@/types'
import { priorityLabel, priorityColor } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { Clock3 } from 'lucide-react'

interface Props {
  tasks: Task[]
}

export function DeferredTasksCard({ tasks }: Props) {
  const deferred = tasks.filter(
    (t) => t.priorityLevel === 'C_THIS_WEEK' || t.priorityLevel === 'D_WAITING' || t.priorityLevel === 'E_LATER_OR_DELETE'
  )

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Clock3 className="w-4 h-4 text-slate-400" />
          <h2 className="font-semibold text-slate-800">미뤄도 되는 일</h2>
          <span className="ml-auto text-xs text-slate-400">{deferred.length}건</span>
        </div>
      </CardHeader>
      <CardContent>
        {deferred.length === 0 ? (
          <p className="text-slate-400 text-sm text-center py-4">해당 항목이 없습니다.</p>
        ) : (
          <ul className="space-y-2">
            {deferred.slice(0, 5).map((task) => (
              <li key={task.id} className="flex items-center gap-2">
                <Badge className={priorityColor(task.priorityLevel)}>
                  {priorityLabel(task.priorityLevel)}
                </Badge>
                <span className="text-sm text-slate-600 truncate flex-1">{task.title}</span>
                {task.estimatedMinutes && (
                  <span className="text-xs text-slate-400 flex-shrink-0">{task.estimatedMinutes}분</span>
                )}
              </li>
            ))}
            {deferred.length > 5 && (
              <p className="text-xs text-slate-400 text-center pt-1">+{deferred.length - 5}건 더 있음</p>
            )}
          </ul>
        )}
      </CardContent>
    </Card>
  )
}
