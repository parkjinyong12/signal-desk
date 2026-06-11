'use client'
import { useState } from 'react'
import { Card, CardHeader, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { BriefingRequest, briefingRequestsApi } from '@/lib/api'
import { PlusCircle, Trash2, Bell } from 'lucide-react'

interface Props {
  requests: BriefingRequest[]
  onRefresh: () => void
}

export function BriefingRequestCard({ requests, onRefresh }: Props) {
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)

  const handleAdd = async () => {
    if (!input.trim()) return
    setLoading(true)
    try {
      await briefingRequestsApi.create(input.trim())
      setInput('')
      onRefresh()
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: number) => {
    await briefingRequestsApi.delete(id)
    onRefresh()
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Bell className="w-4 h-4 text-violet-500" />
          <h2 className="font-semibold text-slate-800">내일 브리핑 추가 요청</h2>
          <span className="ml-auto text-xs text-slate-400">내일 07:05 반영</span>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex gap-2 mb-3">
          <input
            className="flex-1 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-400"
            placeholder="예: 삼성전자 실적 발표 관련해서 봐줘, 오늘 금리 발표 영향 분석..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
          />
          <Button
            onClick={handleAdd}
            disabled={loading || !input.trim()}
            className="flex-shrink-0 bg-violet-500 hover:bg-violet-600 focus:ring-violet-500"
            size="sm"
          >
            <PlusCircle className="w-4 h-4" />
          </Button>
        </div>

        {requests.length === 0 ? (
          <p className="text-slate-400 text-xs text-center py-2">
            내일 아침 브리핑에 포함할 내용을 입력하세요.
          </p>
        ) : (
          <ul className="space-y-2">
            {requests.map((req) => (
              <li key={req.id} className="flex items-start gap-2 bg-violet-50 rounded-lg px-3 py-2">
                <p className="flex-1 text-sm text-slate-700">{req.content}</p>
                <button
                  onClick={() => handleDelete(req.id)}
                  className="flex-shrink-0 text-slate-300 hover:text-red-400 mt-0.5"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  )
}
