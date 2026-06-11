'use client'
import { Card, CardContent } from '@/components/ui/card'
import { DailyBriefing } from '@/types'
import { format } from 'date-fns'
import { ko } from 'date-fns/locale'

interface Props {
  briefing?: DailyBriefing | null
  onGenerate: () => void
  loading?: boolean
}

export function SummaryCard({ briefing, onGenerate, loading }: Props) {
  const today = format(new Date(), 'yyyy년 M월 d일 (EEEE)', { locale: ko })

  return (
    <Card className="bg-gradient-to-br from-brand-500 to-brand-700 border-0 text-white">
      <CardContent className="py-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <p className="text-brand-100 text-sm font-medium mb-1">{today}</p>
            <h1 className="text-2xl font-bold mb-3">오늘의 브리핑</h1>
            {briefing ? (
              <>
                <p className="text-white/90 text-sm leading-relaxed mb-4">{briefing.summary}</p>
                <div className="flex gap-4">
                  <div className="text-center">
                    <p className="text-3xl font-bold">{briefing.mustDoCount}</p>
                    <p className="text-brand-100 text-xs mt-0.5">반드시 처리</p>
                  </div>
                  <div className="w-px bg-white/20" />
                  <div className="text-center">
                    <p className="text-3xl font-bold">{briefing.totalTaskCount}</p>
                    <p className="text-brand-100 text-xs mt-0.5">전체 할 일</p>
                  </div>
                </div>
              </>
            ) : (
              <p className="text-white/70 text-sm">아직 브리핑이 없습니다. 지금 생성해보세요.</p>
            )}
          </div>
        </div>
        <button
          onClick={onGenerate}
          disabled={loading}
          className="mt-5 w-full bg-white/15 hover:bg-white/25 text-white text-sm font-medium py-2 rounded-lg transition-colors disabled:opacity-50"
        >
          {loading ? '생성 중...' : briefing ? '브리핑 재생성' : '브리핑 생성하기'}
        </button>
      </CardContent>
    </Card>
  )
}
