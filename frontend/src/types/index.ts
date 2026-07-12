export type PriorityLevel =
  | 'A_MUST_DO_TODAY'
  | 'B_SHOULD_DO_TODAY'
  | 'C_THIS_WEEK'
  | 'D_WAITING'
  | 'E_LATER_OR_DELETE'

export type TaskStatus = 'TODO' | 'IN_PROGRESS' | 'DONE' | 'DEFERRED' | 'CANCELLED'
export type EnergyLevel = 'LOW' | 'MEDIUM' | 'HIGH'
export type BlockType =
  | 'FOCUS_WORK'
  | 'LIGHT_WORK'
  | 'MEETING_PREP'
  | 'LEARNING'
  | 'INVESTMENT_CHECK'
  | 'REVIEW'
  | 'BREAK'

export interface Task {
  id: number
  title: string
  description?: string
  category?: string
  deadline?: string
  estimatedMinutes: number
  importanceScore: number
  urgencyScore: number
  priorityScore?: number
  priorityLevel: PriorityLevel
  energyLevel: EnergyLevel
  status: TaskStatus
  recommendedStartTime?: string
  recommendedEndTime?: string
  reason?: string
  createdAt: string
  goalIds: number[]
}

export type GoalType = 'LIFE' | 'MID_TERM' | 'YEARLY' | 'QUARTERLY' | 'MONTHLY' | 'WEEKLY'
export type GoalStatus = 'ACTIVE' | 'COMPLETED' | 'ARCHIVED'

export interface Goal {
  id: number
  title: string
  description?: string
  goalType: GoalType
  status: GoalStatus
  parentId?: number
  parentTitle?: string
  targetDate?: string
  progress: number
  linkedTaskCount: number
  completedTaskCount: number
  createdAt: string
}

export interface UserInterest {
  id: number
  category: string
  keyword: string
  weight: number
  enabled: boolean
  createdAt: string
}

export interface NewsArticle {
  id: number
  source?: string
  title: string
  url?: string
  publishedAt?: string
  summary?: string
  category?: string
  importanceScore: number
  whyItMatters?: string
  recommendedAction?: string
}

export interface DailyBriefingItem {
  id: number
  itemType: 'TASK' | 'NEWS' | 'SCHEDULE' | 'JUDGEMENT' | 'REMINDER'
  title: string
  summary?: string
  reason?: string
  recommendedAction?: string
  score?: number
  relatedTaskId?: number
  relatedNewsId?: number
}

export interface DailyPlanBlock {
  id: number
  title: string
  startTime: string
  endTime: string
  blockType: BlockType
  relatedTaskId?: number
  reason?: string
}

export interface DailyBriefing {
  id: number
  briefingDate: string
  summary?: string
  mustDoCount: number
  totalTaskCount: number
  generatedAt?: string
  items: DailyBriefingItem[]
  planBlocks: DailyPlanBlock[]
}
