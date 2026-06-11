'use client'
import { Card, CardHeader, CardContent } from '@/components/ui/card'
import { DailyBriefingItem } from '@/types'
import { Newspaper, ExternalLink } from 'lucide-react'

interface Props {
  items: DailyBriefingItem[]
}

export function NewsBriefingCard({ items }: Props) {
  const newsItems = items.filter((i) => i.itemType === 'NEWS')

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Newspaper className="w-4 h-4 text-green-500" />
          <h2 className="font-semibold text-slate-800">관심 뉴스 브리핑</h2>
          <span className="ml-auto text-xs text-slate-400">{newsItems.length}건</span>
        </div>
      </CardHeader>
      <CardContent>
        {newsItems.length === 0 ? (
          <p className="text-slate-400 text-sm text-center py-4">관심 뉴스가 없습니다. 뉴스를 추가하고 요약해보세요.</p>
        ) : (
          <div className="space-y-4">
            {newsItems.map((item) => (
              <div key={item.id} className="border-b border-slate-50 last:border-0 pb-4 last:pb-0">
                <div className="flex items-start justify-between gap-2 mb-1">
                  <p className="text-sm font-medium text-slate-800 leading-snug">{item.title}</p>
                  {item.score != null && (
                    <span className="flex-shrink-0 text-xs font-semibold text-green-600 bg-green-50 px-1.5 py-0.5 rounded">
                      {item.score}
                    </span>
                  )}
                </div>
                {item.summary && (
                  <p className="text-xs text-slate-600 mb-1.5 leading-relaxed">{item.summary}</p>
                )}
                {item.reason && (
                  <p className="text-xs text-slate-500 mb-1">
                    <span className="font-medium text-slate-600">왜 중요한가:</span> {item.reason}
                  </p>
                )}
                {item.recommendedAction && (
                  <p className="text-xs text-brand-600">
                    <span className="font-medium">추천 행동:</span> {item.recommendedAction}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
