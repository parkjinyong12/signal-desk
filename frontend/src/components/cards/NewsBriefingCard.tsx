'use client'
import { Card, CardHeader, CardContent } from '@/components/ui/card'
import { DailyBriefingItem } from '@/types'
import { Newspaper, ExternalLink, TrendingUp, AlertCircle, Info } from 'lucide-react'

interface Props {
  items: DailyBriefingItem[]
}

function scoreStyle(score?: number) {
  if (!score) return { bar: 'bg-slate-200', label: 'text-slate-400', bg: '' }
  if (score >= 80) return { bar: 'bg-red-400', label: 'text-red-600', bg: 'border-l-2 border-red-300 bg-red-50/40' }
  if (score >= 50) return { bar: 'bg-orange-400', label: 'text-orange-600', bg: 'border-l-2 border-orange-300 bg-orange-50/40' }
  return { bar: 'bg-slate-300', label: 'text-slate-500', bg: '' }
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
      <CardContent className="px-4 py-3">
        {newsItems.length === 0 ? (
          <p className="text-slate-400 text-sm text-center py-6">
            뉴스가 없습니다. 설정에서 RSS 피드를 확인하거나 직접 추가해보세요.
          </p>
        ) : (
          <div className="space-y-3">
            {newsItems.map((item) => {
              const style = scoreStyle(item.score ?? undefined)
              return (
                <div key={item.id} className={`rounded-lg px-3 py-3 ${style.bg || 'bg-slate-50'}`}>
                  {/* 제목 — 크고 위에 */}
                  <p className="text-base font-semibold text-slate-900 leading-snug mb-1.5">
                    {item.title}
                  </p>

                  {/* 요약 */}
                  {item.summary && (
                    <p className="text-sm text-slate-600 leading-relaxed mb-2">{item.summary}</p>
                  )}

                  {/* 왜 중요한가 */}
                  {item.reason && (
                    <div className="flex gap-1.5 mb-1.5">
                      <TrendingUp className="w-3.5 h-3.5 text-amber-500 flex-shrink-0 mt-0.5" />
                      <p className="text-xs text-slate-600 leading-relaxed">
                        <span className="font-semibold text-amber-700">왜 중요한가</span>
                        {' '}{item.reason}
                      </p>
                    </div>
                  )}

                  {/* 추천 행동 */}
                  {item.recommendedAction && (
                    <div className="flex gap-1.5 mb-2">
                      <AlertCircle className="w-3.5 h-3.5 text-brand-500 flex-shrink-0 mt-0.5" />
                      <p className="text-xs text-brand-700 leading-relaxed">
                        <span className="font-semibold">추천 행동</span>
                        {' '}{item.recommendedAction}
                      </p>
                    </div>
                  )}

                  {/* 하단: 테마·출처·점수 */}
                  <div className="flex items-center gap-2 flex-wrap mt-1">
                    {item.score != null && (
                      <span className={`text-xs font-bold px-1.5 py-0.5 rounded ${style.label} bg-white border border-current/20`}>
                        중요도 {item.score}
                      </span>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
