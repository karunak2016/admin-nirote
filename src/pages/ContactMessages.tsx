import { useEffect, useState } from 'react'
import { Mail, MailOpen, Trash2, ChevronLeft, ChevronRight, Phone, User, Send, CheckCircle, X, CheckCheck, Sparkles } from 'lucide-react'
import { contactsApi, ContactMessage } from '../api/contacts'

type Filter = 'all' | 'unread' | 'read'

function fmt(iso: string, short = false) {
  const d = new Date(iso)
  return short
    ? d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })
    : d.toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })
}

export function ContactMessages() {
  const [messages, setMessages]       = useState<ContactMessage[]>([])
  const [total, setTotal]             = useState(0)
  const [page, setPage]               = useState(1)
  const [filter, setFilter]           = useState<Filter>('all')
  const [loading, setLoading]         = useState(true)
  const [openMsg, setOpenMsg]         = useState<ContactMessage | null>(null)
  const [checkedIds, setCheckedIds]   = useState<Set<number>>(new Set())
  const [replyText, setReplyText]     = useState('')
  const [replying, setReplying]       = useState(false)
  const [replySent, setReplySent]     = useState(false)
  const [replyError, setReplyError]   = useState('')

  const pageSize   = 20
  const totalPages = Math.max(1, Math.ceil(total / pageSize))
  const unreadCount = messages.filter(m => !m.isRead).length
  const allChecked = messages.length > 0 && messages.every(m => checkedIds.has(m.id))

  async function load(p = page, f = filter) {
    setLoading(true)
    try {
      const data = await contactsApi.list(p, pageSize, f)
      setMessages(data.items)
      setTotal(data.total)
      setCheckedIds(new Set())
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load(page, filter) }, [page, filter])

  function changeFilter(f: Filter) {
    setFilter(f)
    setPage(1)
    setOpenMsg(null)
    setCheckedIds(new Set())
  }

  function toggleCheck(id: number, e: React.MouseEvent) {
    e.stopPropagation()
    setCheckedIds(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  function toggleAll() {
    if (allChecked) {
      setCheckedIds(new Set())
    } else {
      setCheckedIds(new Set(messages.map(m => m.id)))
    }
  }

  async function handleOpen(msg: ContactMessage) {
    setOpenMsg(msg)
    setReplyText('')
    setReplySent(false)
    setReplyError('')
    if (!msg.isRead) {
      await contactsApi.markRead(msg.id)
      setMessages(prev => prev.map(m => m.id === msg.id ? { ...m, isRead: true } : m))
    }
  }

  async function handleReply() {
    if (!openMsg || !replyText.trim()) return
    setReplying(true)
    setReplyError('')
    try {
      await contactsApi.reply(openMsg.id, replyText.trim())
      setReplySent(true)
      setReplyText('')
    } catch {
      setReplyError('Failed to send. Check SMTP settings and try again.')
    } finally {
      setReplying(false)
    }
  }

  async function handleDelete(id: number) {
    if (!confirm('Delete this message?')) return
    await contactsApi.delete(id)
    if (openMsg?.id === id) setOpenMsg(null)
    await load()
  }

  async function handleBulkDelete() {
    if (checkedIds.size === 0) return
    if (!confirm(`Delete ${checkedIds.size} selected message${checkedIds.size > 1 ? 's' : ''}?`)) return
    await contactsApi.deleteBulk([...checkedIds])
    if (openMsg && checkedIds.has(openMsg.id)) setOpenMsg(null)
    await load()
  }

  async function handleMarkAllRead() {
    await contactsApi.markAllRead()
    await load()
  }

  async function handleCleanup() {
    if (!confirm('Delete all read messages older than 30 days?')) return
    const res = await contactsApi.cleanup(30)
    alert(`Deleted ${res.deleted} old message${res.deleted !== 1 ? 's' : ''}.`)
    await load()
  }

  return (
    <div className="space-y-4">

      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Contact Messages</h1>
          <p className="text-sm text-gray-500 mt-1">
            {total} message{total !== 1 ? 's' : ''}
            {unreadCount > 0 && (
              <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                {unreadCount} unread
              </span>
            )}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <button onClick={handleMarkAllRead}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
              <CheckCheck className="h-3.5 w-3.5" /> Mark all read
            </button>
          )}
          <button onClick={handleCleanup}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            <Sparkles className="h-3.5 w-3.5" /> Clean up old
          </button>
        </div>
      </div>

      {/* Filter tabs */}
      <div className="flex items-center gap-1 border-b border-gray-200">
        {(['all', 'unread', 'read'] as Filter[]).map(f => (
          <button key={f} onClick={() => changeFilter(f)}
            className={`px-4 py-2 text-sm font-medium capitalize transition-colors border-b-2 -mb-px ${
              filter === f
                ? 'border-yellow-400 text-gray-900'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}>
            {f}
          </button>
        ))}
      </div>

      {/* Bulk action bar */}
      {checkedIds.size > 0 && (
        <div className="flex items-center gap-3 px-4 py-2.5 bg-yellow-50 border border-yellow-200 rounded-xl">
          <span className="text-sm font-medium text-gray-700">{checkedIds.size} selected</span>
          <button onClick={handleBulkDelete}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-red-600 border border-red-200 rounded-lg bg-white hover:bg-red-50 transition-colors">
            <Trash2 className="h-3.5 w-3.5" /> Delete selected
          </button>
          <button onClick={() => setCheckedIds(new Set())}
            className="text-xs text-gray-500 hover:text-gray-700 ml-auto">
            Clear selection
          </button>
        </div>
      )}

      {/* Two-column layout */}
      <div className="flex gap-4 items-start" style={{ minHeight: 560 }}>

        {/* Left — message list */}
        <div className={`bg-white rounded-xl border border-gray-200 overflow-hidden flex flex-col transition-all duration-200 ${openMsg ? 'w-80 flex-shrink-0' : 'flex-1'}`}>
          {loading ? (
            <div className="p-8 text-center text-gray-400">Loading…</div>
          ) : messages.length === 0 ? (
            <div className="p-12 text-center">
              <Mail className="h-10 w-10 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">No messages</p>
            </div>
          ) : (
            <>
              {/* Select all row */}
              <div className="flex items-center gap-3 px-4 py-2.5 border-b border-gray-100 bg-gray-50/60">
                <input type="checkbox" checked={allChecked} onChange={toggleAll}
                  className="rounded border-gray-300 text-yellow-400 focus:ring-yellow-400 cursor-pointer" />
                <span className="text-xs text-gray-400">Select all</span>
              </div>

              <div className="divide-y divide-gray-100 overflow-y-auto flex-1">
                {messages.map(msg => (
                  <div key={msg.id}
                    className={`flex items-start gap-3 px-4 py-3.5 cursor-pointer hover:bg-gray-50 transition-colors
                      ${!msg.isRead ? 'bg-blue-50/40' : ''}
                      ${openMsg?.id === msg.id ? 'bg-yellow-50 border-l-2 border-yellow-400' : ''}
                      ${checkedIds.has(msg.id) ? 'bg-yellow-50/60' : ''}`}
                    onClick={() => handleOpen(msg)}
                  >
                    <input type="checkbox" checked={checkedIds.has(msg.id)}
                      onClick={e => toggleCheck(msg.id, e)}
                      onChange={() => {}}
                      className="mt-1 rounded border-gray-300 text-yellow-400 focus:ring-yellow-400 flex-shrink-0 cursor-pointer" />
                    <div className="flex-shrink-0 mt-0.5">
                      {msg.isRead
                        ? <MailOpen className="h-4 w-4 text-gray-400" />
                        : <Mail className="h-4 w-4 text-blue-500" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className={`text-sm truncate ${msg.isRead ? 'font-medium text-gray-700' : 'font-semibold text-gray-900'}`}>
                          {msg.name}
                        </span>
                        {!msg.isRead && <span className="w-1.5 h-1.5 rounded-full bg-blue-500 flex-shrink-0" />}
                      </div>
                      {msg.subject && <p className="text-xs text-gray-500 mt-0.5 truncate">{msg.subject}</p>}
                      <p className="text-xs text-gray-400 mt-0.5 truncate">{msg.message}</p>
                      <p className="text-[11px] text-gray-300 mt-1">{fmt(msg.submittedAt, true)}</p>
                    </div>
                    <button onClick={e => { e.stopPropagation(); handleDelete(msg.id) }}
                      className="flex-shrink-0 p-1 rounded text-gray-300 hover:text-red-500 hover:bg-red-50 transition-colors">
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
              </div>

              {/* Pagination — always visible */}
              <div className="px-4 py-2.5 border-t border-gray-100 flex items-center justify-between bg-gray-50/60">
                <span className="text-xs text-gray-400">
                  Page {page} of {totalPages} · {total} total
                </span>
                <div className="flex gap-1.5">
                  <button disabled={page === 1} onClick={() => setPage(p => p - 1)}
                    className="p-1.5 rounded border border-gray-200 disabled:opacity-40 hover:bg-gray-100 transition-colors">
                    <ChevronLeft className="h-3.5 w-3.5" />
                  </button>
                  <button disabled={page === totalPages} onClick={() => setPage(p => p + 1)}
                    className="p-1.5 rounded border border-gray-200 disabled:opacity-40 hover:bg-gray-100 transition-colors">
                    <ChevronRight className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Right — detail panel */}
        {openMsg ? (
          <div className="flex-1 bg-white rounded-xl border border-gray-200 overflow-hidden flex flex-col">
            <div className="flex items-start justify-between px-6 py-4 border-b border-gray-100">
              <div>
                <h2 className="text-base font-semibold text-gray-900">{openMsg.subject || 'Contact Enquiry'}</h2>
                <p className="text-xs text-gray-400 mt-0.5">{fmt(openMsg.submittedAt)}</p>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => handleDelete(openMsg.id)}
                  className="flex items-center gap-1 px-2.5 py-1.5 text-xs text-red-600 border border-red-200 rounded-lg hover:bg-red-50 transition-colors">
                  <Trash2 className="h-3 w-3" /> Delete
                </button>
                <button onClick={() => setOpenMsg(null)}
                  className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 transition-colors">
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div className="flex flex-wrap gap-4 px-6 py-3 bg-gray-50 border-b border-gray-100 text-sm">
              <div className="flex items-center gap-2 text-gray-700">
                <User className="h-3.5 w-3.5 text-gray-400" />
                <span className="font-medium">{openMsg.name}</span>
              </div>
              <div className="flex items-center gap-2 text-gray-700">
                <Mail className="h-3.5 w-3.5 text-gray-400" />
                <a href={`mailto:${openMsg.email}`} className="text-blue-600 hover:underline text-xs">{openMsg.email}</a>
              </div>
              {openMsg.phone && (
                <div className="flex items-center gap-2 text-gray-700">
                  <Phone className="h-3.5 w-3.5 text-gray-400" />
                  <span className="text-xs">{openMsg.phone}</span>
                </div>
              )}
            </div>

            <div className="px-6 py-5 flex-1 overflow-y-auto">
              <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">{openMsg.message}</p>
            </div>

            <div className="px-6 py-4 border-t border-gray-100 bg-gray-50/50">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                Reply to {openMsg.name}
                <span className="normal-case font-normal text-gray-400 ml-1">— sends from hello.nirote@gmail.com</span>
              </p>
              {replySent ? (
                <div className="flex items-center gap-2 text-green-600 text-sm font-medium py-2">
                  <CheckCircle className="h-4 w-4" />
                  Reply sent successfully to {openMsg.email}
                </div>
              ) : (
                <>
                  <textarea value={replyText} onChange={e => setReplyText(e.target.value)} rows={4}
                    placeholder={`Write your reply to ${openMsg.name}...`}
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-yellow-400 resize-none bg-white" />
                  {replyError && <p className="text-xs text-red-500 mt-1">{replyError}</p>}
                  <div className="flex items-center gap-3 mt-3">
                    <button onClick={handleReply} disabled={replying || !replyText.trim()}
                      className="inline-flex items-center gap-2 px-5 py-2 bg-yellow-400 hover:bg-yellow-500 text-black text-sm font-semibold rounded-lg disabled:opacity-50 transition-colors">
                      <Send className="h-3.5 w-3.5" />
                      {replying ? 'Sending…' : 'Send Reply'}
                    </button>
                    <span className="text-xs text-gray-400">Sends to: {openMsg.email}</span>
                  </div>
                </>
              )}
            </div>
          </div>
        ) : (
          <div className="flex-1 bg-white rounded-xl border border-gray-200 border-dashed flex items-center justify-center">
            <div className="text-center text-gray-400">
              <Mail className="h-10 w-10 mx-auto mb-3 opacity-30" />
              <p className="text-sm">Select a message to read</p>
            </div>
          </div>
        )}

      </div>
    </div>
  )
}
