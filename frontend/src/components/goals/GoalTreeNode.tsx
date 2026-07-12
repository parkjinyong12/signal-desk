'use client'
import Link from 'next/link'
import { Goal } from '@/types'
import { Badge } from '@/components/ui/badge'
import { goalTypeLabel, goalTypeColor, goalStatusLabel, goalStatusColor } from '@/lib/utils'
import { ChevronRight, ChevronDown } from 'lucide-react'

interface GoalTreeNodeProps {
  goal: Goal
  depth: number
  childrenByParentId: Map<number, Goal[]>
  collapsed: Set<number>
  onToggle: (id: number) => void
}

export function GoalTreeNode({ goal, depth, childrenByParentId, collapsed, onToggle }: GoalTreeNodeProps) {
  const children = childrenByParentId.get(goal.id) ?? []
  const hasChildren = children.length > 0
  const isExpanded = !collapsed.has(goal.id)

  return (
    <div>
      <div
        className="flex items-center gap-1.5 py-2 border-b border-slate-50 last:border-0 hover:bg-slate-50 rounded-lg px-1"
        style={{ paddingLeft: depth * 20 }}
      >
        {hasChildren ? (
          <button
            onClick={() => onToggle(goal.id)}
            className="flex-shrink-0 p-0.5 text-slate-400 hover:text-slate-600"
          >
            {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
          </button>
        ) : (
          <span className="w-5 flex-shrink-0" />
        )}
        <Link href={`/planning/${goal.id}`} className="flex-1 min-w-0 flex items-center gap-2 flex-wrap py-0.5">
          <span className="text-sm font-medium text-slate-800">{goal.title}</span>
          <Badge className={goalTypeColor(goal.goalType)}>{goalTypeLabel(goal.goalType)}</Badge>
          {goal.status !== 'ACTIVE' && (
            <Badge className={goalStatusColor(goal.status)}>{goalStatusLabel(goal.status)}</Badge>
          )}
          <span className="w-24 h-1.5 bg-slate-100 rounded-full overflow-hidden flex-shrink-0 inline-block">
            <span className="h-full bg-brand-500 rounded-full block" style={{ width: `${goal.progress}%` }} />
          </span>
          <span className="text-xs text-slate-400">{goal.progress}%</span>
        </Link>
      </div>
      {hasChildren && isExpanded && (
        <div>
          {children.map((child) => (
            <GoalTreeNode
              key={child.id}
              goal={child}
              depth={depth + 1}
              childrenByParentId={childrenByParentId}
              collapsed={collapsed}
              onToggle={onToggle}
            />
          ))}
        </div>
      )}
    </div>
  )
}
