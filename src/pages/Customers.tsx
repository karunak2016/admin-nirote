import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Search } from 'lucide-react'
import type { Customer } from '../types'
import { customersApi } from '../api/customers'
import { Spinner } from '../components/ui/Spinner'
import { SortTh } from '../components/ui/SortTh'
import { useSortable } from '../hooks/useSortable'

export function Customers() {
  const [customers, setCustomers] = useState<Customer[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const { sortCol, sortDir, handleSort, sort } = useSortable('joined')

  useEffect(() => {
    customersApi.list(1, 200).then((data) => setCustomers(data.items ?? [])).finally(() => setLoading(false))
  }, [])

  const q = search.toLowerCase()
  const filtered = q
    ? customers.filter((c) => c.name.toLowerCase().includes(q) || c.email.toLowerCase().includes(q))
    : customers

  const sorted = sort(filtered, (c, col) => {
    if (col === 'name')   return c.name
    if (col === 'email')  return c.email
    if (col === 'orders') return c.totalOrders
    if (col === 'spent')  return c.totalSpent ?? 0
    if (col === 'joined') return new Date(c.createdAt).getTime()
    return ''
  })

  const th = { sortCol, sortDir, onSort: handleSort }

  return (
    <div className="space-y-4">
      <div className="relative w-full sm:max-w-xs">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <input
          type="text"
          placeholder="Search by name or email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full rounded-md border border-gray-200 py-2 pl-9 pr-3 text-sm focus:border-primary-800 focus:outline-none"
        />
      </div>

      <div className="rounded-xl border border-gray-200 bg-white overflow-hidden">
        {loading ? (
          <div className="flex justify-center py-16"><Spinner /></div>
        ) : sorted.length === 0 ? (
          <p className="py-16 text-center text-sm text-gray-400">No customers found.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <SortTh label="Customer"    col="name"   {...th} />
                  <SortTh label="Email"       col="email"  {...th} />
                  <SortTh label="Orders"      col="orders" {...th} align="right" />
                  <SortTh label="Total Spent" col="spent"  {...th} align="right" />
                  <SortTh label="Joined"      col="joined" {...th} />
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {sorted.map((c) => (
                  <tr key={c.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-100 text-xs font-bold text-primary-800 flex-shrink-0">
                          {c.name[0]?.toUpperCase()}
                        </div>
                        <span className="font-medium text-gray-900">{c.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-600">{c.email}</td>
                    <td className="px-4 py-3 text-right text-gray-700">{c.totalOrders}</td>
                    <td className="px-4 py-3 text-right font-medium text-gray-900">₹{(c.totalSpent ?? 0).toLocaleString('en-IN')}</td>
                    <td className="px-4 py-3 text-gray-500">
                      {new Date(c.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Link to={`/customers/${c.id}`} className="text-xs font-medium text-primary-800 hover:underline">
                        View →
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
