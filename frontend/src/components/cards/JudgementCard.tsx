'use client'
import { Card, CardHeader, CardContent } from '@/components/ui/card'
import { DailyBriefingItem } from '@/types'
import { Lightbulb } from 'lucide-react'

interface Props {
  items: DailyBriefingItem[]
}

export function JudgementCard({ items }: Props) {
  const judgements = items.filter((i) => i.itemType === 'JUDGEMENT')

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Lightbulb className="w-4 h-4 text-amber-500" />
          <h2 className="font-semibold text-slate-800">오늘의 판단 포인트</h2>
        </div>
      </CardHeader>
      <CardContent>
        {judgements.length === 0 ? (
          <p className="text-slate-400 text-sm text-center py-4">브리핑을 생성하면 판단 포인트가 나타납니다.</p>
        ) : (
          <ul className="space-y-2.5">
            {judgements.map((item, i) => (
              <li key={item.id} className="flex items-start gap-2.5">
                <span className="flex-shrink-0 w-5 h-5 rounded-full bg-amber-100 text-amber-700 text-xs font-bold flex items-center justify-center mt-0.5">
                  {i + 1}
                </span>
                <p className="text-sm text-slate-700 leading-snug">{item.title}</p>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  )
}
