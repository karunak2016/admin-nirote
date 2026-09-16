import { LucideIcon } from 'lucide-react'
import { cn } from '../../utils/cn'

interface StatCardProps {
  title: string
  value: string | number
  icon: LucideIcon
  color?: 'red' | 'blue' | 'green' | 'yellow'
  sub?: string
}

const colors = {
  red:    { bg: 'bg-red-50',    icon: 'bg-red-100 text-red-700' },
  blue:   { bg: 'bg-blue-50',   icon: 'bg-blue-100 text-blue-700' },
  green:  { bg: 'bg-green-50',  icon: 'bg-green-100 text-green-700' },
  yellow: { bg: 'bg-yellow-50', icon: 'bg-yellow-100 text-yellow-700' },
}

export function StatCard({ title, value, icon: Icon, color = 'blue', sub }: StatCardProps) {
  const c = colors[color]
  return (
    <div className={cn('rounded-xl border border-gray-100 p-5 flex items-center gap-4', c.bg)}>
      <div className={cn('rounded-lg p-3 flex-shrink-0', c.icon)}>
        <Icon className="h-5 w-5" />
      </div>
      <div>
        <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">{title}</p>
        <p className="mt-0.5 text-2xl font-bold text-gray-900">{value}</p>
        {sub && <p className="mt-0.5 text-xs text-gray-500">{sub}</p>}
      </div>
    </div>
  )
}
