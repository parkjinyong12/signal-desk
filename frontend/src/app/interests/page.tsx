'use client'
import { useEffect, useState, useCallback } from 'react'
import { interestsApi } from '@/lib/api'
import { UserInterest } from '@/types'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Plus, Trash2, ToggleLeft, ToggleRight } from 'lucide-react'

type FormData = { category: string; keyword: string; weight: number; enabled: boolean }
const defaultForm: FormData = { category: '', keyword: '', weight: 5, enabled: true }

const CATEGORY_COLORS: Record<string, string> = {
  투자: 'bg-amber-100 text-amber-700 border-amber-200',
  업무: 'bg-blue-100 text-blue-700 border-blue-200',
  개발: 'bg-purple-100 text-purple-700 border-purple-200',
  부동산: 'bg-green-100 text-green-700 border-green-200',
  AI: 'bg-pink-100 text-pink-700 border-pink-200',
}

export default function InterestsPage() {
  const [interests, setInterests] = useState<UserInterest[]>([])
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState<FormData>(defaultForm)
  const [loading, setLoading] = useState(false)

  const load = useCallback(async () => {
    const data = await interestsApi.list()
    setInterests(data)
  }, [])

  useEffect(() => { load() }, [load])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      await interestsApi.create(form)
      setForm(defaultForm)
      setShowForm(false)
      await load()
    } finally {
      setLoading(false)
    }
  }

  const handleToggle = async (interest: UserInterest) => {
    await interestsApi.update(interest.id, { ...interest, enabled: !interest.enabled })
    await load()
  }

  const handleDelete = async (id: number) => {
    if (!confirm('삭제하시겠습니까?')) return
    await interestsApi.delete(id)
    await load()
  }

  const grouped = interests.reduce<Record<string, UserInterest[]>>((acc, i) => {
    ;(acc[i.category] = acc[i.category] ?? []).push(i)
    return acc
  }, {})

  return (
    <div className="max-w-3xl mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold text-slate-800">관심 키워드</h1>
        <Button onClick={() => setShowForm(!showForm)} size="sm">
          <Plus className="w-4 h-4 mr-1" />
          키워드 추가
        </Button>
      </div>

      {showForm && (
        <Card className="mb-6">
          <CardContent className="pt-5">
            <h2 className="font-semibold text-slate-800 mb-4">새 관심 키워드</h2>
            <form onSubmit={handleSubmit} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-slate-500 block mb-1">카테고리</label>
                  <input
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                    placeholder="예: 투자, 업무, 개발"
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                    required
                    list="category-list"
                  />
                  <datalist id="category-list">
                    {['투자', '업무', '개발', '부동산', 'AI', '건강', '기타'].map((c) => (
                      <option key={c} value={c} />
                    ))}
                  </datalist>
                </div>
                <div>
                  <label className="text-xs text-slate-500 block mb-1">키워드</label>
                  <input
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                    placeholder="예: HBM, Spring AI"
                    value={form.keyword}
                    onChange={(e) => setForm({ ...form, keyword: e.target.value })}
                    required
                  />
                </div>
              </div>
              <div>
                <label className="text-xs text-slate-500 block mb-1">가중치: {form.weight}</label>
                <input
                  type="range"
                  min={1}
                  max={10}
                  className="w-full accent-brand-500"
                  value={form.weight}
                  onChange={(e) => setForm({ ...form, weight: Number(e.target.value) })}
                />
                <div className="flex justify-between text-xs text-slate-400 mt-0.5">
                  <span>낮음 (1)</span>
                  <span>높음 (10)</span>
                </div>
              </div>
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

      <div className="space-y-4">
        {Object.entries(grouped).map(([category, items]) => (
          <Card key={category}>
            <CardContent className="pt-4">
              <div className="flex items-center gap-2 mb-3">
                <Badge className={CATEGORY_COLORS[category] ?? 'bg-slate-100 text-slate-600 border-slate-200'}>
                  {category}
                </Badge>
                <span className="text-xs text-slate-400">{items.length}개</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {items.map((interest) => (
                  <div
                    key={interest.id}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-sm transition-opacity ${
                      interest.enabled ? 'bg-white border-slate-200' : 'bg-slate-50 border-slate-100 opacity-50'
                    }`}
                  >
                    <span className={interest.enabled ? 'text-slate-700' : 'text-slate-400'}>
                      {interest.keyword}
                    </span>
                    <span className="text-xs text-slate-400">({interest.weight})</span>
                    <button onClick={() => handleToggle(interest)} className="text-slate-400 hover:text-brand-500">
                      {interest.enabled
                        ? <ToggleRight className="w-4 h-4 text-brand-500" />
                        : <ToggleLeft className="w-4 h-4" />
                      }
                    </button>
                    <button onClick={() => handleDelete(interest.id)} className="text-slate-300 hover:text-red-400">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
        {Object.keys(grouped).length === 0 && (
          <Card>
            <CardContent className="py-10 text-center text-slate-400 text-sm">
              관심 키워드가 없습니다. 추가해보세요.
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
