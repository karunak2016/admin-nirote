import { useEffect, useState } from 'react'
import { Mail, Trash2, ChevronLeft, ChevronRight, ToggleLeft, ToggleRight, Download } from 'lucide-react'
import { newsletterAdminApi, Subscriber } from '../api/newsletter'

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
}
function fmtDateTime(iso: string) {
  return new Date(iso).toLocaleString('en-IN', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' })
}

export function NewsletterSubscribers() {
  const [subscribers, setSubscribers] = useState<Subscriber[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)

  const pageSize = 50
  const totalPages = Math.max(1, Math.ceil(total / pageSize))
  const activeCount = subscribers.filter(s => s.isActive).length

  async function load(p = page) {
    setLoading(true)
    try {
      const data = await newsletterAdminApi.list(p, pageSize)
      setSubscribers(data.items)
      setTotal(data.total)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [page])

  async function handleToggle(sub: Subscriber) {
    await newsletterAdminApi.toggle(sub.id, !sub.isActive)
    setSubscribers(prev => prev.map(s => s.id === sub.id ? { ...s, isActive: !s.isActive } : s))
  }

  async function handleDelete(id: number) {
    if (!confirm('Remove this subscriber?')) return
    await newsletterAdminApi.delete(id)
    await load()
  }

  function handleExport() {
    const rows = ['Email,Status,Subscribed At']
    subscribers.forEach(s => {
      rows.push(`${s.email},${s.isActive ? 'Active' : 'Inactive'},${fmtDateTime(s.subscribedAt)}`)
    })
    const blob = new Blob([rows.join('\n')], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `nirote-subscribers-${new Date().toISOString().slice(0, 10)}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Newsletter Subscribers</h1>
          <p className="text-sm text-gray-500 mt-1">
            {total} subscriber{total !== 1 ? 's' : ''} &mdash; {activeCount} active
          </p>
        </div>
        <button
          onClick={handleExport}
          className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition-colors"
        >
          <Download className="h-4 w-4" />
          Export CSV
        </button>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-400">Loading…</div>
        ) : subscribers.length === 0 ? (
          <div className="p-12 text-center">
            <Mail className="h-10 w-10 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">No subscribers yet</p>
          </div>
        ) : (
          <>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  <th className="px-5 py-3">Email</th>
                  <th className="px-5 py-3">Subscribed</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {subscribers.map(sub => (
                  <tr key={sub.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-3 text-gray-800 font-medium">{sub.email}</td>
                    <td className="px-5 py-3 text-gray-500">
                      {fmtDate(sub.subscribedAt)}
                    </td>
                    <td className="px-5 py-3">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${sub.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                        {sub.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleToggle(sub)}
                          title={sub.isActive ? 'Deactivate' : 'Activate'}
                          className={`p-1.5 rounded transition-colors ${sub.isActive ? 'text-green-600 hover:bg-green-50' : 'text-gray-400 hover:bg-gray-100'}`}
                        >
                          {sub.isActive
                            ? <ToggleRight className="h-5 w-5" />
                            : <ToggleLeft className="h-5 w-5" />}
                        </button>
                        <button
                          onClick={() => handleDelete(sub.id)}
                          className="p-1.5 rounded text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {totalPages > 1 && (
              <div className="px-5 py-3 border-t border-gray-100 flex items-center justify-between">
                <span className="text-sm text-gray-500">Page {page} of {totalPages}</span>
                <div className="flex gap-2">
                  <button
                    disabled={page === 1}
                    onClick={() => setPage(p => p - 1)}
                    className="p-1.5 rounded border border-gray-200 disabled:opacity-40 hover:bg-gray-50"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  <button
                    disabled={page === totalPages}
                    onClick={() => setPage(p => p + 1)}
                    className="p-1.5 rounded border border-gray-200 disabled:opacity-40 hover:bg-gray-50"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
