'use client'
import { useEffect, useState, useCallback } from 'react'
import { rssFeedsApi, RssFeed } from '@/lib/api'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Plus, Trash2, ToggleLeft, ToggleRight, RefreshCw, Rss } from 'lucide-react'

export default function SettingsPage() {
  const [feeds, setFeeds] = useState<RssFeed[]>([])
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ name: '', url: '', category: '' })
  const [collecting, setCollecting] = useState(false)
  const [collectResult, setCollectResult] = useState<string | null>(null)

  const load = useCallback(async () => {
    const data = await rssFeedsApi.list()
    setFeeds(data)
  }, [])

  useEffect(() => { load() }, [load])

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault()
    await rssFeedsApi.create(form)
    setForm({ name: '', url: '', category: '' })
    setShowForm(false)
    await load()
  }

  const handleToggle = async (id: number) => {
    await rssFeedsApi.toggle(id)
    await load()
  }

  const handleDelete = async (id: number) => {
    if (!confirm('삭제할까요?')) return
    await rssFeedsApi.delete(id)
    await load()
  }

  const handleCollect = async () => {
    setCollecting(true)
    setCollectResult(null)
    try {
      const result = await rssFeedsApi.collect()
      setCollectResult(`${result.collected}건의 새 기사를 수집했습니다.`)
    } catch {
      setCollectResult('수집 중 오류가 발생했습니다.')
    } finally {
      setCollecting(false)
    }
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-6">
      <h1 className="text-xl font-bold text-slate-800 mb-6">설정</h1>

      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Rss className="w-4 h-4 text-orange-500" />
            <h2 className="font-semibold text-slate-800">RSS 피드 관리</h2>
            <div className="ml-auto flex gap-2">
              <Button variant="secondary" size="sm" onClick={handleCollect} disabled={collecting}>
                <RefreshCw className={`w-4 h-4 mr-1 ${collecting ? 'animate-spin' : ''}`} />
                지금 수집
              </Button>
              <Button size="sm" onClick={() => setShowForm(!showForm)}>
                <Plus className="w-4 h-4 mr-1" />
                피드 추가
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {collectResult && (
            <div className="mb-3 px-3 py-2 bg-green-50 border border-green-200 text-green-700 rounded-lg text-sm">
              {collectResult}
            </div>
          )}

          {showForm && (
            <form onSubmit={handleAdd} className="mb-4 p-4 bg-slate-50 rounded-lg space-y-3">
              <input
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                placeholder="피드 이름 (예: 연합뉴스 경제)"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
              />
              <input
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                placeholder="RSS URL (예: https://example.com/rss.xml)"
                value={form.url}
                onChange={(e) => setForm({ ...form, url: e.target.value })}
                required
                type="url"
              />
              <select
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
              >
                <option value="">카테고리 선택</option>
                {['경제', '투자', '부동산', '개발', 'AI', '정치', '국제', '기타'].map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
              <div className="flex gap-2">
                <Button type="submit" className="flex-1">추가</Button>
                <Button type="button" variant="secondary" onClick={() => setShowForm(false)}>취소</Button>
              </div>
            </form>
          )}

          <div className="space-y-2">
            {feeds.length === 0 ? (
              <p className="text-slate-400 text-sm text-center py-4">RSS 피드가 없습니다.</p>
            ) : (
              feeds.map((feed) => (
                <div
                  key={feed.id}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg border transition-opacity ${
                    feed.enabled ? 'bg-white border-slate-200' : 'bg-slate-50 border-slate-100 opacity-60'
                  }`}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className={`text-sm font-medium ${feed.enabled ? 'text-slate-800' : 'text-slate-400'}`}>
                        {feed.name}
                      </span>
                      {feed.category && (
                        <Badge className="bg-slate-100 text-slate-500 border-slate-200">{feed.category}</Badge>
                      )}
                    </div>
                    <p className="text-xs text-slate-400 truncate mt-0.5">{feed.url}</p>
                  </div>
                  <button onClick={() => handleToggle(feed.id)} className="text-slate-400">
                    {feed.enabled
                      ? <ToggleRight className="w-5 h-5 text-brand-500" />
                      : <ToggleLeft className="w-5 h-5" />
                    }
                  </button>
                  <button onClick={() => handleDelete(feed.id)} className="text-slate-300 hover:text-red-400">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <h2 className="font-semibold text-slate-800">뉴스 수집 스케줄</h2>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[
              { time: '06:50', label: 'RSS 피드 뉴스 수집', color: 'bg-blue-100 text-blue-700' },
              { time: '07:00', label: '키워드 점수 계산 + 요약 생성', color: 'bg-amber-100 text-amber-700' },
              { time: '07:05', label: '오늘의 브리핑 자동 생성', color: 'bg-green-100 text-green-700' },
              { time: '07:10', label: '대시보드에서 확인 가능', color: 'bg-violet-100 text-violet-700' },
            ].map(({ time, label, color }) => (
              <div key={time} className="flex items-center gap-3">
                <span className={`flex-shrink-0 text-xs font-mono font-bold px-2 py-1 rounded ${color}`}>{time}</span>
                <span className="text-sm text-slate-600">{label}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
