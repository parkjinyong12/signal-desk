'use client'
import Link from 'next/link'
import { Goal } from '@/types'
import { Badge } from '@/components/ui/badge'
import {
  goalTypeLabel,
  goalTypeDotColor,
  goalTypeTextColor,
  goalTypeColor,
  goalStatusLabel,
  goalStatusColor,
  goalDDayLabel,
  goalDDayBadgeColor,
  stripTargetDateSuffix,
} from '@/lib/utils'
import { goalPeriodLabel } from '@/lib/goalPeriod'
import { ChevronRight, ChevronDown, Clock, AlertTriangle } from 'lucide-react'

interface GoalTreeNodeProps {
  goal: Goal
  depth: number
  childrenByParentId: Map<number, Goal[]>
  expanded: Set<number>
  onToggle: (id: number) => void
  parentTargetDate?: string
}

const TITLE_SIZE_CLASS = 'text-sm font-medium'

export function GoalTreeNode({
  goal,
  depth,
  childrenByParentId,
  expanded,
  onToggle,
  parentTargetDate,
}: GoalTreeNodeProps) {
  const children = childrenByParentId.get(goal.id) ?? []
  const hasChildren = children.length > 0
  const isExpanded = expanded.has(goal.id)
  const overflowsParent =
    goal.status === 'ACTIVE' && !!goal.targetDate && !!parentTargetDate && goal.targetDate > parentTargetDate

  return (
    <div>
      <div className="flex items-start gap-1.5 py-1.5 hover:bg-slate-50 rounded-lg px-1">
        {hasChildren ? (
          <button
            onClick={() => onToggle(goal.id)}
            className="flex-shrink-0 mt-2.5 p-0.5 text-slate-400 hover:text-slate-600"
          >
            {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
          </button>
        ) : (
          <span className="w-5 flex-shrink-0" />
        )}
        <Link href={`/planning/${goal.id}`} className="flex-1 min-w-0 py-0.5">
          <div className="flex items-center gap-2 flex-wrap">
            <span className={`w-2 h-2 rounded-full flex-shrink-0 ${goalTypeDotColor(goal.goalType)}`} />
            <span
              className={`inline-block rounded-md px-2 py-0.5 shadow-sm border border-opacity-30 ${TITLE_SIZE_CLASS} ${goalTypeColor(goal.goalType)}`}
            >
              {stripTargetDateSuffix(goal.title)}
              {goal.targetDate && (
                <span className="text-[10px] font-normal opacity-70">
                  {' '}
                  ({goalPeriodLabel(goal.goalType, goal.targetDate)})
                </span>
              )}
            </span>
            {goal.status !== 'ACTIVE' && (
              <Badge className={goalStatusColor(goal.status)}>{goalStatusLabel(goal.status)}</Badge>
            )}
          </div>
          <div className="flex items-center gap-2 mt-1 pl-4">
            <span className={`text-xs font-medium flex-shrink-0 ${goalTypeTextColor(goal.goalType)}`}>
              {goalTypeLabel(goal.goalType)}
            </span>
            {goal.targetDate && goal.status === 'ACTIVE' && (
              <span
                className={`text-xs flex items-center gap-0.5 flex-shrink-0 px-1.5 py-0.5 rounded-full border font-medium ${goalDDayBadgeColor(goal.targetDate)}`}
              >
                <Clock className="w-3 h-3" />
                {goalDDayLabel(goal.targetDate)}
              </span>
            )}
            {overflowsParent && (
              <span className="text-xs flex items-center gap-0.5 flex-shrink-0 text-red-500 font-medium">
                <AlertTriangle className="w-3 h-3" />
                기간 초과
              </span>
            )}
            <span className="flex-1 max-w-[100px] h-1 bg-slate-100 rounded-full overflow-hidden">
              <span className="h-full bg-brand-400 rounded-full block" style={{ width: `${goal.progress}%` }} />
            </span>
            <span className="text-xs text-slate-400 flex-shrink-0">{goal.progress}%</span>
          </div>
        </Link>
      </div>
      {hasChildren && isExpanded && (
        <div className="ml-[13px] pl-3 border-l border-slate-200">
          {children.map((child) => (
            <GoalTreeNode
              key={child.id}
              goal={child}
              depth={depth + 1}
              childrenByParentId={childrenByParentId}
              expanded={expanded}
              onToggle={onToggle}
              parentTargetDate={goal.targetDate}
            />
          ))}
        </div>
      )}
    </div>
  )
}
