'use client'
import { Card, CardHeader, CardContent } from '@/components/ui/card'
import { DailyPlanBlock } from '@/types'
import { blockTypeLabel, blockTypeColor, formatTime } from '@/lib/utils'
import { Clock } from 'lucide-react'

interface Props {
  blocks: DailyPlanBlock[]
}

export function ScheduleCard({ blocks }: Props) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-blue-500" />
          <h2 className="font-semibold text-slate-800">추천 실행 시간표</h2>
        </div>
      </CardHeader>
      <CardContent>
        {blocks.length === 0 ? (
          <p className="text-slate-400 text-sm text-center py-4">브리핑을 생성하면 일정이 배치됩니다.</p>
        ) : (
          <div className="space-y-2">
            {blocks.map((block) => (
              <div
                key={block.id}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg border ${blockTypeColor(block.blockType)}`}
              >
                <div className="flex-shrink-0 text-xs font-mono font-semibold text-slate-500 w-20">
                  {formatTime(block.startTime)} - {formatTime(block.endTime)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-800 truncate">{block.title}</p>
                  <p className="text-xs text-slate-400">{blockTypeLabel(block.blockType)}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
