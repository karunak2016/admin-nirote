import { useEffect, useState } from 'react'
import { Star, Trash2, CheckCircle } from 'lucide-react'
import type { Review } from '../types'
import { reviewsApi } from '../api/reviews'
import { Spinner } from '../components/ui/Spinner'
import { Badge } from '../components/ui/Badge'
import { SortTh } from '../components/ui/SortTh'
import { useSortable } from '../hooks/useSortable'

function StarDisplay({ rating }: { rating: number }) {
  return (
    <span className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <Star key={s} className={`h-3.5 w-3.5 ${s <= rating ? 'fill-amber-400 text-amber-400' : 'text-gray-200'}`} />
      ))}
    </span>
  )
}

export function Reviews() {
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved'>('all')
  const { sortCol, sortDir, handleSort, sort } = useSortable('date')

  useEffect(() => {
    reviewsApi.list().then(setReviews).finally(() => setLoading(false))
  }, [])

  async function handleApprove(r: Review) {
    await reviewsApi.approve(r.id)
    setReviews((prev) => prev.map((x) => x.id === r.id ? { ...x, isApproved: true } : x))
  }

  async function handleDelete(r: Review) {
    if (!confirm(`Delete review by ${r.userName}?`)) return
    await reviewsApi.delete(r.id)
    setReviews((prev) => prev.filter((x) => x.id !== r.id))
  }

  const filtered = reviews.filter((r) => {
    if (filter === 'pending') return !r.isApproved
    if (filter === 'approved') return r.isApproved
    return true
  })

  const sorted = sort(filtered, (r, col) => {
    if (col === 'customer') return r.userName
    if (col === 'rating')   return r.rating
    if (col === 'product')  return r.productId
    if (col === 'status')   return r.isApproved ? 'Approved' : 'Pending'
    if (col === 'date')     return new Date(r.createdAt).getTime()
    return ''
  })

  const pendingCount = reviews.filter((r) => !r.isApproved).length
  const th = { sortCol, sortDir, onSort: handleSort }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <p className="text-sm text-gray-500">{reviews.length} review{reviews.length !== 1 ? 's' : ''}</p>
        {pendingCount > 0 && (
          <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-700">
            {pendingCount} pending approval
          </span>
        )}
        <div className="ml-auto flex gap-1">
          {(['all', 'pending', 'approved'] as const).map((f) => (
            <button key={f} onClick={() => setFilter(f)}
              className={`rounded-lg px-3 py-1.5 text-xs font-medium capitalize transition-colors ${
                filter === f ? 'bg-primary-800 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}>
              {f}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><Spinner /></div>
      ) : sorted.length === 0 ? (
        <p className="py-16 text-center text-sm text-gray-400">No reviews found.</p>
      ) : (
        <div className="rounded-xl border border-gray-200 bg-white overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <SortTh label="Customer" col="customer" {...th} />
                <SortTh label="Rating"   col="rating"   {...th} />
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Review</th>
                <SortTh label="Product" col="product" {...th} />
                <SortTh label="Status"  col="status"  {...th} align="center" />
                <SortTh label="Date"    col="date"    {...th} />
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {sorted.map((r) => (
                <tr key={r.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-900">{r.userName}</td>
                  <td className="px-4 py-3"><StarDisplay rating={r.rating} /></td>
                  <td className="px-4 py-3 max-w-xs">
                    {r.title && <p className="font-medium text-gray-800 text-xs">{r.title}</p>}
                    <p className="text-xs text-gray-500 line-clamp-2">{r.body}</p>
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-500">#{r.productId}</td>
                  <td className="px-4 py-3 text-center">
                    {r.isApproved
                      ? <Badge variant="success">Approved</Badge>
                      : <Badge variant="warning">Pending</Badge>}
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-500">
                    {new Date(r.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: '2-digit' })}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      {!r.isApproved && (
                        <button onClick={() => handleApprove(r)} title="Approve"
                          className="rounded p-1.5 text-gray-400 hover:bg-green-50 hover:text-green-600">
                          <CheckCircle className="h-4 w-4" />
                        </button>
                      )}
                      {r.isApproved && (
                        <span className="rounded p-1.5 text-green-400">
                          <CheckCircle className="h-4 w-4" />
                        </span>
                      )}
                      <button onClick={() => handleDelete(r)} title="Delete"
                        className="rounded p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-600">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
