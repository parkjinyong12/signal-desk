'use client'
import { useEffect, useState, useCallback } from 'react'
import { newsApi } from '@/lib/api'
import { NewsArticle } from '@/types'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Plus, RefreshCw, ExternalLink } from 'lucide-react'

type FormData = { title: string; source: string; url: string; content: string; category: string; publishedAt: string }
const defaultForm: FormData = { title: '', source: '', url: '', content: '', category: '', publishedAt: '' }

export default function NewsPage() {
  const [articles, setArticles] = useState<NewsArticle[]>([])
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState<FormData>(defaultForm)
  const [loading, setLoading] = useState(false)
  const [summarizing, setSummarizing] = useState(false)

  const load = useCallback(async () => {
    const data = await newsApi.list()
    setArticles(data)
  }, [])

  useEffect(() => { load() }, [load])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const payload = {
        ...form,
        publishedAt: form.publishedAt ? new Date(form.publishedAt).toISOString() : undefined,
      }
      await newsApi.create(payload)
      setForm(defaultForm)
      setShowForm(false)
      await load()
    } finally {
      setLoading(false)
    }
  }

  const handleSummarize = async () => {
    setSummarizing(true)
    try {
      await newsApi.summarize()
      await load()
    } finally {
      setSummarizing(false)
    }
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold text-slate-800">뉴스 브리핑</h1>
        <div className="flex gap-2">
          <Button variant="secondary" size="sm" onClick={handleSummarize} disabled={summarizing}>
            <RefreshCw className={`w-4 h-4 mr-1 ${summarizing ? 'animate-spin' : ''}`} />
            점수 계산
          </Button>
          <Button size="sm" onClick={() => setShowForm(!showForm)}>
            <Plus className="w-4 h-4 mr-1" />
            뉴스 추가
          </Button>
        </div>
      </div>

      {showForm && (
        <Card className="mb-6">
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
                  {['투자', '업무', '개발', '부동산', 'AI', '경제', '정치', '기타'].map((c) => (
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
                placeholder="본문 내용 (키워드 매칭에 활용됩니다)"
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
        {articles.length === 0 ? (
          <Card>
            <CardContent className="py-10 text-center text-slate-400 text-sm">
              뉴스가 없습니다. 뉴스를 추가하거나 수집해보세요.
            </CardContent>
          </Card>
        ) : (
          articles
            .sort((a, b) => b.importanceScore - a.importanceScore)
            .map((article) => (
              <Card key={article.id} className="hover:shadow-md transition-shadow">
                <CardContent className="py-4">
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        {article.category && (
                          <Badge className="bg-slate-100 text-slate-500 border-slate-200">{article.category}</Badge>
                        )}
                        {article.source && (
                          <span className="text-xs text-slate-400">{article.source}</span>
                        )}
                      </div>
                      <p className="text-sm font-medium text-slate-800 leading-snug">{article.title}</p>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {article.importanceScore > 0 && (
                        <span className={`text-xs font-bold px-2 py-1 rounded-full ${
                          article.importanceScore >= 70 ? 'bg-red-100 text-red-600' :
                          article.importanceScore >= 40 ? 'bg-orange-100 text-orange-600' :
                          'bg-slate-100 text-slate-500'
                        }`}>
                          {article.importanceScore}
                        </span>
                      )}
                      {article.url && (
                        <a href={article.url} target="_blank" rel="noopener noreferrer"
                          className="text-slate-400 hover:text-brand-500">
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      )}
                    </div>
                  </div>
                  {article.summary && (
                    <p className="text-xs text-slate-600 mb-2 leading-relaxed">{article.summary}</p>
                  )}
                  {article.whyItMatters && (
                    <p className="text-xs text-slate-500 mb-1">
                      <span className="font-medium text-slate-600">왜 중요한가:</span> {article.whyItMatters}
                    </p>
                  )}
                  {article.recommendedAction && (
                    <p className="text-xs text-brand-600">
                      <span className="font-medium">추천 행동:</span> {article.recommendedAction}
                    </p>
                  )}
                </CardContent>
              </Card>
            ))
        )}
      </div>
    </div>
  )
}
