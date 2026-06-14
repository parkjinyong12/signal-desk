'use client'
import { useEffect, useState, useCallback } from 'react'
import { newsApi, rssFeedsApi } from '@/lib/api'
import { NewsArticle } from '@/types'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Plus, RefreshCw, ExternalLink, TrendingUp, AlertCircle, Rss } from 'lucide-react'

type FormData = { title: string; source: string; url: string; content: string; category: string }
const defaultForm: FormData = { title: '', source: '', url: '', content: '', category: '' }

function ScoreBadge({ score }: { score: number }) {
  if (score === 0) return null
  const [bg, text] =
    score >= 80 ? ['bg-red-100', 'text-red-700'] :
    score >= 50 ? ['bg-orange-100', 'text-orange-700'] :
    score >= 25 ? ['bg-yellow-100', 'text-yellow-700'] :
    ['bg-slate-100', 'text-slate-500']
  return (
    <span className={`flex-shrink-0 text-xs font-bold px-2 py-0.5 rounded-full ${bg} ${text}`}>
      {score}
    </span>
  )
}

const CATEGORY_COLOR: Record<string, string> = {
  투자: 'bg-amber-100 text-amber-700 border-amber-200',
  경제: 'bg-blue-100 text-blue-700 border-blue-200',
  부동산: 'bg-green-100 text-green-700 border-green-200',
  개발: 'bg-purple-100 text-purple-700 border-purple-200',
  AI: 'bg-pink-100 text-pink-700 border-pink-200',
}

export default function NewsPage() {
  const [articles, setArticles] = useState<NewsArticle[]>([])
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState<FormData>(defaultForm)
  const [loading, setLoading] = useState(false)
  const [collecting, setCollecting] = useState(false)
  const [filter, setFilter] = useState<string>('전체')

  const load = useCallback(async () => {
    const data = await newsApi.list()
    setArticles(data)
  }, [])

  useEffect(() => { load() }, [load])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      await newsApi.create({ ...form, publishedAt: new Date().toISOString() })
      setForm(defaultForm)
      setShowForm(false)
      await load()
    } finally {
      setLoading(false)
    }
  }

  const handleCollect = async () => {
    setCollecting(true)
    try {
      await rssFeedsApi.collect()
      await newsApi.summarize()
      await load()
    } finally {
      setCollecting(false)
    }
  }

  const categories = ['전체', ...Array.from(new Set(articles.map((a) => a.category).filter(Boolean) as string[]))]
  const filtered = articles
    .filter((a) => filter === '전체' || a.category === filter)
    .sort((a, b) => b.importanceScore - a.importanceScore)

  return (
    <div className="max-w-3xl mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-bold text-slate-800">뉴스 브리핑</h1>
        <div className="flex gap-2">
          <Button variant="secondary" size="sm" onClick={handleCollect} disabled={collecting}>
            <Rss className={`w-4 h-4 mr-1 ${collecting ? 'animate-pulse' : ''}`} />
            {collecting ? '수집 중...' : 'RSS 수집'}
          </Button>
          <Button size="sm" onClick={() => setShowForm(!showForm)}>
            <Plus className="w-4 h-4 mr-1" />
            직접 추가
          </Button>
        </div>
      </div>

      {/* 카테고리 필터 */}
      <div className="flex gap-2 flex-wrap mb-4">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setFilter(cat)}
            className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
              filter === cat
                ? 'bg-brand-500 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {showForm && (
        <Card className="mb-5">
          <CardContent className="pt-5">
            <h2 className="font-semibold text-slate-800 mb-4">뉴스 직접 추가</h2>
            <form onSubmit={handleSubmit} className="space-y-3">
              <input
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                placeholder="뉴스 제목 *"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                required
              />
              <div className="grid grid-cols-2 gap-3">
                <input
                  className="border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                  placeholder="출처 (예: 조선일보)"
                  value={form.source}
                  onChange={(e) => setForm({ ...form, source: e.target.value })}
                />
                <select
                  className="border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                >
                  <option value="">카테고리</option>
                  {['투자', '경제', '부동산', 'AI', '개발', '정치', '국제', '기타'].map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
              <input
                type="url"
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                placeholder="URL"
                value={form.url}
                onChange={(e) => setForm({ ...form, url: e.target.value })}
              />
              <textarea
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 resize-none"
                placeholder="본문 내용 (키워드 매칭에 사용)"
                rows={3}
                value={form.content}
                onChange={(e) => setForm({ ...form, content: e.target.value })}
              />
              <div className="flex gap-2">
                <Button type="submit" disabled={loading} className="flex-1">
                  {loading ? '추가 중...' : '추가'}
                </Button>
                <Button type="button" variant="secondary" onClick={() => setShowForm(false)}>취소</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="space-y-3">
        {filtered.length === 0 ? (
          <Card>
            <CardContent className="py-10 text-center text-slate-400 text-sm">
              뉴스가 없습니다. RSS 수집 버튼을 눌러보세요.
            </CardContent>
          </Card>
        ) : (
          filtered.map((article) => (
            <Card key={article.id} className="hover:shadow-md transition-shadow">
              <CardContent className="py-4 px-4">
                {/* 제목 — 크고 위에 */}
                <div className="flex items-start gap-2 mb-1.5">
                  <p className="flex-1 text-base font-semibold text-slate-900 leading-snug">
                    {article.title}
                  </p>
                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    <ScoreBadge score={article.importanceScore} />
                    {article.url && (
                      <a href={article.url} target="_blank" rel="noopener noreferrer"
                        className="text-slate-300 hover:text-brand-500 transition-colors">
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    )}
                  </div>
                </div>

                {/* 테마·출처 — 제목 아래 */}
                <div className="flex items-center gap-2 flex-wrap mb-2">
                  {article.category && (
                    <Badge className={CATEGORY_COLOR[article.category] ?? 'bg-slate-100 text-slate-500 border-slate-200'}>
                      {article.category}
                    </Badge>
                  )}
                  {article.source && (
                    <span className="text-xs text-slate-400">{article.source}</span>
                  )}
                  {article.publishedAt && (
                    <span className="text-xs text-slate-300">
                      {new Date(article.publishedAt).toLocaleString('ko-KR', { month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </span>
                  )}
                </div>

                {/* 요약 */}
                {article.summary && (
                  <p className="text-sm text-slate-600 leading-relaxed mb-2">{article.summary}</p>
                )}

                {/* 왜 중요한가 */}
                {article.whyItMatters && (
                  <div className="flex gap-1.5 mb-1.5 bg-amber-50 rounded-md px-2.5 py-2">
                    <TrendingUp className="w-3.5 h-3.5 text-amber-500 flex-shrink-0 mt-0.5" />
                    <p className="text-xs text-slate-700 leading-relaxed">
                      <span className="font-semibold text-amber-700">왜 중요한가</span>
                      {' '}{article.whyItMatters}
                    </p>
                  </div>
                )}

                {/* 추천 행동 */}
                {article.recommendedAction && (
                  <div className="flex gap-1.5 bg-blue-50 rounded-md px-2.5 py-2">
                    <AlertCircle className="w-3.5 h-3.5 text-brand-500 flex-shrink-0 mt-0.5" />
                    <p className="text-xs text-slate-700 leading-relaxed">
                      <span className="font-semibold text-brand-600">추천 행동</span>
                      {' '}{article.recommendedAction}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
