import { useState } from 'react'

export function useSortable(defaultCol: string, defaultDir: 'asc' | 'desc' = 'desc') {
  const [sortCol, setSortCol] = useState(defaultCol)
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>(defaultDir)

  function handleSort(col: string) {
    if (sortCol === col) {
      setSortDir(d => (d === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortCol(col)
      setSortDir('desc')
    }
  }

  function sort<T>(items: T[], getValue: (item: T, col: string) => string | number | boolean): T[] {
    return [...items].sort((a, b) => {
      const va = getValue(a, sortCol)
      const vb = getValue(b, sortCol)
      let cmp = 0
      if (typeof va === 'number' && typeof vb === 'number') cmp = va - vb
      else cmp = String(va).localeCompare(String(vb))
      return sortDir === 'asc' ? cmp : -cmp
    })
  }

  return { sortCol, sortDir, handleSort, sort }
}
