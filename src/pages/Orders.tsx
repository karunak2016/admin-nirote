import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Search } from 'lucide-react'
import type { Order } from '../types'
import { ordersApi } from '../api/orders'
import { Badge } from '../components/ui/Badge'
import { Spinner } from '../components/ui/Spinner'
import { SortTh } from '../components/ui/SortTh'
import { useSortable } from '../hooks/useSortable'

const STATUS_OPTIONS = ['', 'Pending', 'Confirmed', 'Shipped', 'Delivered', 'Cancelled'] as const

function orderBadge(status: string): 'warning' | 'info' | 'purple' | 'success' | 'danger' | 'default' {
  const map: Record<string, 'warning' | 'info' | 'purple' | 'success' | 'danger'> = {
    Pending: 'warning', Confirmed: 'info', Shipped: 'purple', Delivered: 'success', Cancelled: 'danger',
  }
  return map[status] ?? 'default'
}

function payBadge(s: string) {
  return s === 'Paid' ? 'success' : s === 'Failed' ? 'danger' : 'warning'
}

export function Orders() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const { sortCol, sortDir, handleSort, sort } = useSortable('date')

  useEffect(() => {
    ordersApi.list(1, 100).then((data) => setOrders(data.items ?? [])).finally(() => setLoading(false))
  }, [])

  const filtered = orders.filter((o) => {
    const matchStatus = !statusFilter || o.orderStatus === statusFilter
    const matchSearch = !search || String(o.id).includes(search) || o.customerEmail?.toLowerCase().includes(search.toLowerCase())
    return matchStatus && matchSearch
  })

  const sorted = sort(filtered, (o, col) => {
    if (col === 'id')       return o.id
    if (col === 'customer') return o.customerEmail ?? ''
    if (col === 'date')     return new Date(o.createdAt).getTime()
    if (col === 'total')    return o.finalAmount
    if (col === 'status')   return o.orderStatus
    if (col === 'payment')  return o.paymentStatus
    return 0
  })

  const th = { sortCol, sortDir, onSort: handleSort }

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative w-full sm:max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Order ID or customer email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-md border border-gray-200 py-2 pl-9 pr-3 text-sm focus:border-primary-800 focus:outline-none"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {STATUS_OPTIONS.map((opt) => (
            <button
              key={opt}
              onClick={() => setStatusFilter(opt)}
              className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                statusFilter === opt ? 'bg-primary-800 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {opt || 'All'}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="rounded-xl border border-gray-200 bg-white overflow-hidden">
        {loading ? (
          <div className="flex justify-center py-16"><Spinner /></div>
        ) : sorted.length === 0 ? (
          <p className="py-16 text-center text-sm text-gray-400">No orders found.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <SortTh label="Order"   col="id"      {...th} />
                  <SortTh label="Customer" col="customer" {...th} />
                  <SortTh label="Date"    col="date"    {...th} />
                  <SortTh label="Total"   col="total"   {...th} align="right" />
                  <SortTh label="Status"  col="status"  {...th} align="center" />
                  <SortTh label="Payment" col="payment" {...th} align="center" />
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {sorted.map((o) => (
                  <tr key={o.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium text-gray-900">#{o.id}</td>
                    <td className="px-4 py-3 text-gray-600">{o.customerEmail ?? o.customerName ?? `User #${o.userId}`}</td>
                    <td className="px-4 py-3 text-gray-500">
                      {new Date(o.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </td>
                    <td className="px-4 py-3 text-right font-medium text-gray-900">₹{o.finalAmount.toLocaleString('en-IN')}</td>
                    <td className="px-4 py-3 text-center">
                      <Badge variant={orderBadge(o.orderStatus) as 'warning' | 'info' | 'purple' | 'success' | 'danger' | 'default'}>{o.orderStatus}</Badge>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <Badge variant={payBadge(o.paymentStatus) as 'success' | 'danger' | 'warning'}>{o.paymentStatus}</Badge>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Link to={`/orders/${o.id}`} className="text-xs font-medium text-primary-800 hover:underline">
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
