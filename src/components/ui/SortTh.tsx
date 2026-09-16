import { ChevronUp, ChevronDown, ChevronsUpDown } from 'lucide-react'

interface Props {
  label: string
  col: string
  sortCol: string
  sortDir: 'asc' | 'desc'
  onSort: (col: string) => void
  align?: 'left' | 'right' | 'center'
}

export function SortTh({ label, col, sortCol, sortDir, onSort, align = 'left' }: Props) {
  const active = col === sortCol
  const justifyClass = align === 'right' ? 'justify-end' : align === 'center' ? 'justify-center' : 'justify-start'
  return (
    <th
      onClick={() => onSort(col)}
      className={`px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer select-none hover:bg-gray-100 transition-colors text-${align}`}
    >
      <span className={`flex items-center gap-1 ${justifyClass}`}>
        {label}
        {active
          ? sortDir === 'asc'
            ? <ChevronUp className="h-3 w-3 text-primary-800 flex-shrink-0" />
            : <ChevronDown className="h-3 w-3 text-primary-800 flex-shrink-0" />
          : <ChevronsUpDown className="h-3 w-3 text-gray-400 flex-shrink-0" />}
      </span>
    </th>
  )
}
