import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import type { ReturnRequest } from '../types'
import { returnsApi } from '../api/returns'
import { Spinner } from '../components/ui/Spinner'
import { Button } from '../components/ui/Button'

type Tab = 'all' | 'Pending' | 'Approved' | 'Rejected'
type RefundFilter = 'all' | 'None' | 'Processing' | 'Issued' | 'Failed'

function StatusBadge({ status }: { status: string }) {
  const cls =
    status === 'Approved' ? 'bg-green-100 text-green-700' :
    status === 'Rejected' ? 'bg-red-100 text-red-700' :
    'bg-yellow-100 text-yellow-700'
  return <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${cls}`}>{status}</span>
}

function RefundBadge({ status }: { status: string }) {
  const cls =
    status === 'Issued' ? 'bg-green-100 text-green-700' :
    status === 'Processing' ? 'bg-blue-100 text-blue-700' :
    status === 'Failed' ? 'bg-red-100 text-red-700' :
    'bg-gray-100 text-gray-500'
  return <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${cls}`}>{status === 'None' ? 'No Refund' : status}</span>
}

export function Returns() {
  const [requests, setRequests] = useState<ReturnRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState<Tab>('Pending')
  const [refundFilter, setRefundFilter] = useState<RefundFilter>('all')
  const [selected, setSelected] = useState<ReturnRequest | null>(null)
  const [adminNote, setAdminNote] = useState('')
  const [updating, setUpdating] = useState(false)
  const [refunding, setRefunding] = useState(false)
  const [refundError, setRefundError] = useState('')

  useEffect(() => {
    returnsApi.list().then(setRequests).finally(() => setLoading(false))
  }, [])

  async function handleUpdateStatus(status: 'Approved' | 'Rejected') {
    if (!selected) return
    setUpdating(true)
    try {
      await returnsApi.updateStatus(selected.id, status, adminNote.trim() || undefined)
      const updated = { ...selected, status, adminNote: adminNote.trim() || selected.adminNote }
      setRequests((prev) => prev.map((r) => r.id === selected.id ? updated : r))
      setSelected(updated)
    } finally {
      setUpdating(false)
    }
  }

  async function handleIssueRefund() {
    if (!selected) return
    setRefunding(true)
    setRefundError('')
    try {
      await returnsApi.issueRefund(selected.id)
      const updated = { ...selected, refundStatus: 'Issued' as const }
      setRequests((prev) => prev.map((r) => r.id === selected.id ? updated : r))
      setSelected(updated)
    } catch (err: any) {
      setRefundError(err?.response?.data?.error ?? 'Refund failed. Please try again.')
    } finally {
      setRefunding(false)
    }
  }

  const byTab = tab === 'all' ? requests : requests.filter((r) => r.status === tab)
  const filtered = refundFilter === 'all' ? byTab : byTab.filter((r) => (r.refundStatus ?? 'None') === refundFilter)
  const pendingCount = requests.filter((r) => r.status === 'Pending').length
  const needsRefundCount = requests.filter((r) => r.status === 'Approved' && (r.refundStatus === 'None' || r.refundStatus === 'Failed')).length

  if (loading) return <div className="flex justify-center py-32"><Spinner size="lg" /></div>

  return (
    <div className="space-y-6">
      {/* Tabs */}
      <div className="flex gap-1 border-b border-gray-200">
        {(['Pending', 'Approved', 'Rejected', 'all'] as Tab[]).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2 text-sm font-medium capitalize transition-colors border-b-2 -mb-px ${
              tab === t ? 'border-primary-800 text-primary-800' : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            {t === 'all' ? 'All' : t}
            {t === 'Pending' && pendingCount > 0 && (
              <span className="ml-1.5 rounded-full bg-yellow-100 px-1.5 py-0.5 text-xs text-yellow-700">{pendingCount}</span>
            )}
          </button>
        ))}
      </div>

      {/* Refund filter */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">Refund:</span>
        {([
          { value: 'all', label: 'All' },
          { value: 'None', label: 'Pending Refund' },
          { value: 'Processing', label: 'Processing' },
          { value: 'Issued', label: 'Issued' },
          { value: 'Failed', label: 'Failed' },
        ] as { value: RefundFilter; label: string }[]).map(({ value, label }) => (
          <button
            key={value}
            onClick={() => setRefundFilter(value)}
            className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
              refundFilter === value
                ? 'bg-primary-800 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {label}
            {value === 'None' && needsRefundCount > 0 && (
              <span className="ml-1 rounded-full bg-red-500 px-1.5 text-white">{needsRefundCount}</span>
            )}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="py-20 text-center text-gray-400">No {tab === 'all' ? '' : tab.toLowerCase()} return requests.</div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white">
          <table className="w-full text-sm">
            <thead className="border-b border-gray-100 bg-gray-50 text-xs uppercase tracking-wider text-gray-500">
              <tr>
                <th className="px-4 py-3 text-left">Order</th>
                <th className="px-4 py-3 text-left">Customer</th>
                <th className="px-4 py-3 text-left">Reason</th>
                <th className="px-4 py-3 text-left">Date</th>
                <th className="px-4 py-3 text-left">Status</th>
                <th className="px-4 py-3 text-left">Refund</th>
                <th className="px-4 py-3 text-left">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map((r) => (
                <tr key={r.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-primary-800">
                    <Link to={`/orders/${r.orderId}`} className="hover:underline">#{r.orderId}</Link>
                  </td>
                  <td className="px-4 py-3 text-gray-700">{r.userName}</td>
                  <td className="px-4 py-3 text-gray-600 max-w-xs">
                    <p className="truncate">{r.reason}</p>
                    {r.description && <p className="text-xs text-gray-400 truncate">{r.description}</p>}
                  </td>
                  <td className="px-4 py-3 text-gray-500 whitespace-nowrap">
                    {new Date(r.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </td>
                  <td className="px-4 py-3"><StatusBadge status={r.status} /></td>
                  <td className="px-4 py-3"><RefundBadge status={r.refundStatus ?? 'None'} /></td>
                  <td className="px-4 py-3">
                    {r.status === 'Pending' ? (
                      <button
                        onClick={() => { setSelected(r); setAdminNote(r.adminNote ?? ''); setRefundError('') }}
                        className="text-xs font-medium text-primary-800 hover:underline"
                      >
                        Review
                      </button>
                    ) : (
                      <button
                        onClick={() => { setSelected(r); setAdminNote(r.adminNote ?? ''); setRefundError('') }}
                        className="text-xs text-gray-400 hover:text-gray-600"
                      >
                        View
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Review / Detail modal */}
      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">Return Request — Order #{selected.orderId}</h2>
              <button onClick={() => setSelected(null)} className="text-gray-400 hover:text-gray-600 text-xl leading-none">&times;</button>
            </div>

            <div className="space-y-2 text-sm">
              <p><span className="font-medium text-gray-700">Customer:</span> <span className="text-gray-600">{selected.userName}</span></p>
              <p><span className="font-medium text-gray-700">Reason:</span> <span className="text-gray-600">{selected.reason}</span></p>
              {selected.description && (
                <p><span className="font-medium text-gray-700">Details:</span> <span className="text-gray-600">{selected.description}</span></p>
              )}
              <div className="flex items-center gap-2">
                <span className="font-medium text-gray-700">Status:</span>
                <StatusBadge status={selected.status} />
              </div>
              {selected.status === 'Approved' && (
                <div className="flex items-center gap-2">
                  <span className="font-medium text-gray-700">Refund:</span>
                  <RefundBadge status={selected.refundStatus ?? 'None'} />
                  {selected.razorpayRefundId && (
                    <span className="text-xs text-gray-400 font-mono">{selected.razorpayRefundId}</span>
                  )}
                </div>
              )}
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Admin Note (shown to customer)</label>
              <textarea
                rows={3}
                placeholder="e.g. Please ship the item back to our warehouse..."
                value={adminNote}
                onChange={(e) => setAdminNote(e.target.value)}
                disabled={selected.status !== 'Pending'}
                className="w-full rounded-md border border-gray-200 px-3 py-2 text-sm focus:border-primary-800 focus:outline-none resize-none disabled:bg-gray-50 disabled:text-gray-400"
              />
            </div>

            {selected.status === 'Pending' && (
              <div className="flex gap-3 pt-1">
                <Button loading={updating} onClick={() => handleUpdateStatus('Approved')}
                  className="flex-1 bg-green-700 hover:bg-green-800">
                  Approve Return
                </Button>
                <Button loading={updating} variant="danger" onClick={() => handleUpdateStatus('Rejected')} className="flex-1">
                  Reject
                </Button>
              </div>
            )}

            {selected.status === 'Approved' && (selected.refundStatus === 'None' || selected.refundStatus === 'Failed') && (
              <div className="pt-1 space-y-2">
                {refundError && <p className="text-xs text-red-600">{refundError}</p>}
                {selected.refundStatus === 'Failed' && (
                  <p className="text-xs text-red-500">Previous refund attempt failed. Click below to retry.</p>
                )}
                <Button
                  loading={refunding}
                  onClick={handleIssueRefund}
                  className="w-full bg-blue-700 hover:bg-blue-800"
                >
                  💸 Issue Refund
                </Button>
                <p className="text-xs text-gray-400 text-center">
                  For Razorpay payments, refund is processed automatically. For COD, please do bank transfer manually then click.
                </p>
              </div>
            )}

            {selected.status === 'Approved' && selected.refundStatus === 'Issued' && (
              <div className="rounded-lg bg-green-50 border border-green-200 p-3 text-sm text-green-700">
                ✅ Refund issued. Customer has been notified via email.
              </div>
            )}

            {(selected.status !== 'Pending') && (
              <Button variant="outline" className="w-full" onClick={() => setSelected(null)}>Close</Button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
