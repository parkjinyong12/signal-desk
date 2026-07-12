import { Task, UserInterest, NewsArticle, DailyBriefing, Goal } from '@/types'

const BASE = '/api'

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  })
  if (!res.ok) throw new Error(`API error: ${res.status}`)
  if (res.status === 204) return undefined as T
  return res.json()
}

export const tasksApi = {
  list: () => request<Task[]>('/tasks'),
  get: (id: number) => request<Task>(`/tasks/${id}`),
  create: (data: Partial<Task>) => request<Task>('/tasks', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: number, data: Partial<Task>) =>
    request<Task>(`/tasks/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  updateStatus: (id: number, status: string) =>
    request<Task>(`/tasks/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) }),
  delete: (id: number) => request<void>(`/tasks/${id}`, { method: 'DELETE' }),
}

export const goalsApi = {
  list: () => request<Goal[]>('/goals'),
  get: (id: number) => request<Goal>(`/goals/${id}`),
  children: (id: number) => request<Goal[]>(`/goals/${id}/children`),
  tasks: (id: number) => request<Task[]>(`/goals/${id}/tasks`),
  create: (data: Partial<Goal>) => request<Goal>('/goals', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: number, data: Partial<Goal>) =>
    request<Goal>(`/goals/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  updateStatus: (id: number, status: string) =>
    request<Goal>(`/goals/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) }),
  delete: (id: number) => request<void>(`/goals/${id}`, { method: 'DELETE' }),
}

export const interestsApi = {
  list: () => request<UserInterest[]>('/interests'),
  create: (data: Partial<UserInterest>) =>
    request<UserInterest>('/interests', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: number, data: Partial<UserInterest>) =>
    request<UserInterest>(`/interests/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id: number) => request<void>(`/interests/${id}`, { method: 'DELETE' }),
}

export const newsApi = {
  list: () => request<NewsArticle[]>('/news'),
  today: () => request<NewsArticle[]>('/news/today'),
  create: (data: Partial<NewsArticle>) =>
    request<NewsArticle>('/news', { method: 'POST', body: JSON.stringify(data) }),
  summarize: () => request<NewsArticle[]>('/news/summarize', { method: 'POST' }),
}

export const briefingApi = {
  today: () => request<DailyBriefing>('/briefings/today'),
  generate: () => request<DailyBriefing>('/briefings/generate', { method: 'POST' }),
  byDate: (date: string) => request<DailyBriefing>(`/briefings/${date}`),
}

export interface BriefingRequest {
  id: number
  content: string
  targetDate: string
  processed: boolean
  createdAt: string
}

export const briefingRequestsApi = {
  tomorrow: () => request<BriefingRequest[]>('/briefing-requests/tomorrow'),
  today: () => request<BriefingRequest[]>('/briefing-requests/today'),
  create: (content: string, targetDate?: string) =>
    request<BriefingRequest>('/briefing-requests', {
      method: 'POST',
      body: JSON.stringify({ content, targetDate }),
    }),
  delete: (id: number) => request<void>(`/briefing-requests/${id}`, { method: 'DELETE' }),
}

export interface RssFeed {
  id: number
  name: string
  url: string
  category?: string
  enabled: boolean
}

export const rssFeedsApi = {
  list: () => request<RssFeed[]>('/rss-feeds'),
  create: (data: Partial<RssFeed>) =>
    request<RssFeed>('/rss-feeds', { method: 'POST', body: JSON.stringify(data) }),
  toggle: (id: number) => request<RssFeed>(`/rss-feeds/${id}/toggle`, { method: 'PATCH' }),
  delete: (id: number) => request<void>(`/rss-feeds/${id}`, { method: 'DELETE' }),
  collect: () => request<{ collected: number }>('/rss-feeds/collect', { method: 'POST' }),
}
