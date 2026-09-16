import { useEffect, useState } from 'react'
import { Plus, Pencil, ToggleLeft, ToggleRight, Tag, Calendar, IndianRupee, Percent, Mail } from 'lucide-react'
import type { Coupon, CreateCouponPayload } from '../types'
import { couponsApi } from '../api/coupons'
import { Button } from '../components/ui/Button'
import { Badge } from '../components/ui/Badge'
import { Input } from '../components/ui/Input'
import { Spinner } from '../components/ui/Spinner'
import { SortTh } from '../components/ui/SortTh'
import { useSortable } from '../hooks/useSortable'

const EMPTY_FORM: CreateCouponPayload & { isActive: boolean } = {
  code: '', description: '', discountType: 'Percentage', discountValue: 0,
  minCartAmount: undefined, maxDiscount: undefined,
  startDate: '', endDate: '', usageLimit: undefined,
  festivalName: '', bankName: '', isActive: true,
}

export function Coupons() {
  const [coupons, setCoupons] = useState<Coupon[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<Coupon | null>(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [sending, setSending] = useState<number | null>(null)
  const [sentResult, setSentResult] = useState<{ id: number; count: number } | null>(null)
  const { sortCol, sortDir, handleSort, sort } = useSortable('code', 'asc')

  useEffect(() => {
    couponsApi.list().then(setCoupons).finally(() => setLoading(false))
  }, [])

  function openCreate() {
    setEditing(null)
    setForm(EMPTY_FORM)
    setError('')
    setShowForm(true)
  }

  function openEdit(c: Coupon) {
    setEditing(c)
    setForm({
      code: c.code ?? '',
      description: c.description,
      discountType: c.discountType,
      discountValue: c.discountValue,
      minCartAmount: c.minCartAmount ?? undefined,
      maxDiscount: c.maxDiscount ?? undefined,
      startDate: c.startDate ? c.startDate.slice(0, 10) : '',
      endDate: c.endDate ? c.endDate.slice(0, 10) : '',
      usageLimit: c.usageLimit ?? undefined,
      festivalName: c.festivalName ?? '',
      bankName: c.bankName ?? '',
      isActive: c.isActive,
    })
    setError('')
    setShowForm(true)
  }

  async function handleSave() {
    if (!form.description || !form.discountValue) {
      setError('Description and discount value are required.')
      return
    }
    if (form.startDate && form.endDate && form.endDate < form.startDate) {
      setError('End date must be on or after the start date.')
      return
    }
    setSaving(true)
    setError('')
    try {
      const payload = {
        ...form,
        code: form.code || undefined,
        festivalName: form.festivalName || undefined,
        startDate: form.startDate || undefined,
        endDate: form.endDate || undefined,
      }
      if (editing) {
        const updated = await couponsApi.update(editing.id, payload)
        setCoupons((prev) => prev.map((c) => (c.id === updated.id ? updated : c)))
      } else {
        const created = await couponsApi.create(payload)
        setCoupons((prev) => [created, ...prev])
      }
      setShowForm(false)
    } catch {
      setError('Failed to save. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  async function handleToggle(c: Coupon) {
    try {
      const updated = await couponsApi.update(c.id, {
        code: c.code ?? undefined, description: c.description,
        discountType: c.discountType, discountValue: c.discountValue,
        minCartAmount: c.minCartAmount ?? undefined, maxDiscount: c.maxDiscount ?? undefined,
        startDate: c.startDate ?? undefined, endDate: c.endDate ?? undefined,
        usageLimit: c.usageLimit ?? undefined, festivalName: c.festivalName ?? undefined,
        isActive: !c.isActive,
      })
      setCoupons((prev) => prev.map((x) => (x.id === updated.id ? updated : x)))
    } catch {
      // silent
    }
  }

  async function handleSendEmail(c: Coupon) {
    if (!confirm(`Send "${c.description}" coupon email to all customers?\n\nThis will email every customer who has an account.`)) return
    setSending(c.id)
    try {
      const { sent } = await couponsApi.sendEmail(c.id)
      setSentResult({ id: c.id, count: sent })
      setTimeout(() => setSentResult(null), 5000)
    } catch {
      alert('Failed to send emails. Please check your SMTP settings and try again.')
    } finally {
      setSending(null)
    }
  }

  const field = (key: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm((f) => ({ ...f, [key]: e.target.value }))

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500">{coupons.length} coupon{coupons.length !== 1 ? 's' : ''}</p>
        <Button size="sm" onClick={openCreate}>
          <Plus className="h-4 w-4" /> New Coupon
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><Spinner /></div>
      ) : coupons.length === 0 ? (
        <p className="py-16 text-center text-sm text-gray-400">No coupons yet. Create your first one!</p>
      ) : (
        <div className="rounded-xl border border-gray-200 bg-white overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                {(() => { const th = { sortCol, sortDir, onSort: handleSort }; return (
                <tr>
                  <SortTh label="Code / Offer" col="code"     {...th} />
                  <SortTh label="Discount"     col="discount" {...th} />
                  <SortTh label="Min Cart"     col="minCart"  {...th} />
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Validity</th>
                  <SortTh label="Usage"  col="usage"  {...th} align="center" />
                  <SortTh label="Status" col="status" {...th} align="center" />
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
                )})()}
              </thead>
              <tbody className="divide-y divide-gray-100">
                {sort(coupons, (c, col) => {
                  if (col === 'code')     return c.code ?? ''
                  if (col === 'discount') return c.discountValue
                  if (col === 'minCart')  return c.minCartAmount ?? 0
                  if (col === 'usage')    return c.usedCount
                  if (col === 'status')   return c.isActive ? 'Active' : 'Inactive'
                  return ''
                }).map((c) => (
                  <tr key={c.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        {c.festivalName && <span className="text-base" title={c.festivalName}>🪔</span>}
                        {c.bankName && (
                          <span className="inline-flex items-center rounded bg-blue-50 border border-blue-200 px-1.5 py-0.5 text-[10px] font-semibold text-blue-700 uppercase tracking-wide">
                            🏦 {c.bankName}
                          </span>
                        )}
                        <div>
                          {c.code
                            ? <span className="font-mono font-semibold text-primary-800">{c.code}</span>
                            : <span className="text-xs text-gray-400 italic">Auto-apply</span>}
                          <p className="text-xs text-gray-500 mt-0.5">{c.description}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center gap-1 font-medium text-gray-900">
                        {c.discountType === 'Percentage'
                          ? <><Percent className="h-3.5 w-3.5 text-green-600" />{c.discountValue}%</>
                          : <><IndianRupee className="h-3.5 w-3.5 text-green-600" />{c.discountValue.toLocaleString('en-IN')}</>}
                      </span>
                      {c.maxDiscount && (
                        <p className="text-xs text-gray-400">Max ₹{c.maxDiscount.toLocaleString('en-IN')}</p>
                      )}
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {c.minCartAmount ? `₹${c.minCartAmount.toLocaleString('en-IN')}` : '—'}
                    </td>
                    <td className="px-4 py-3">
                      {c.startDate || c.endDate ? (
                        <div className="flex items-center gap-1 text-xs text-gray-500">
                          <Calendar className="h-3 w-3" />
                          {c.startDate ? new Date(c.startDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) : '∞'}
                          {' – '}
                          {c.endDate ? new Date(c.endDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: '2-digit' }) : '∞'}
                        </div>
                      ) : (
                        <span className="text-xs text-gray-400">No expiry</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-center text-xs text-gray-600">
                      {c.usedCount}{c.usageLimit ? `/${c.usageLimit}` : ''}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <Badge variant={c.isActive ? 'success' : 'danger'}>
                        {c.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => handleSendEmail(c)}
                          disabled={sending === c.id}
                          title="Send to all customers"
                          className="rounded p-1.5 text-gray-400 hover:bg-blue-50 hover:text-blue-600 disabled:opacity-40"
                        >
                          {sending === c.id
                            ? <Spinner size="sm" />
                            : <Mail className="h-4 w-4" />}
                        </button>
                        <button onClick={() => openEdit(c)} className="rounded p-1.5 text-gray-400 hover:bg-gray-100 hover:text-primary-800">
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button onClick={() => handleToggle(c)} title={c.isActive ? 'Deactivate' : 'Activate'}
                          className="rounded p-1.5 text-gray-400 hover:bg-gray-100 hover:text-primary-800">
                          {c.isActive
                            ? <ToggleRight className="h-4 w-4 text-green-500" />
                            : <ToggleLeft className="h-4 w-4" />}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Send success toast */}
      {sentResult && (
        <div className="fixed bottom-6 right-6 z-50 rounded-xl bg-green-600 text-white px-5 py-3 shadow-xl text-sm font-medium flex items-center gap-2">
          <Mail className="h-4 w-4" />
          Coupon email sent to {sentResult.count} customer{sentResult.count !== 1 ? 's' : ''}!
        </div>
      )}

      {/* Slide-over form */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex">
          <div className="fixed inset-0 bg-black/40" onClick={() => setShowForm(false)} />
          <div className="relative ml-auto flex h-full w-full max-w-md flex-col bg-white shadow-xl">
            <div className="flex items-center justify-between border-b px-6 py-4">
              <h2 className="text-base font-semibold text-gray-900 flex items-center gap-2">
                <Tag className="h-4 w-4 text-primary-800" />
                {editing ? 'Edit Coupon' : 'New Coupon / Offer'}
              </h2>
              <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-600 text-xl leading-none">&times;</button>
            </div>

            <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
              {error && (
                <div className="rounded-lg bg-red-50 border border-red-200 px-3 py-2 text-sm text-red-700">{error}</div>
              )}

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Coupon Code <span className="text-gray-400">(leave blank for auto-apply festival offer)</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. DIWALI20"
                  value={form.code}
                  onChange={field('code')}
                  className="w-full rounded-md border border-gray-200 px-3 py-2 text-sm font-mono uppercase focus:border-primary-800 focus:outline-none"
                />
              </div>

              <Input label="Description" value={form.description}
                onChange={field('description')} placeholder="e.g. Diwali Special — 20% off" />

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Festival Name <span className="text-gray-400">(optional)</span></label>
                  <input type="text" placeholder="e.g. Diwali, Navratri" value={form.festivalName}
                    onChange={field('festivalName')}
                    className="w-full rounded-md border border-gray-200 px-3 py-2 text-sm focus:border-primary-800 focus:outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Bank Name <span className="text-gray-400">(optional)</span></label>
                  <input type="text" placeholder="e.g. HDFC, SBI, Axis" value={form.bankName ?? ''}
                    onChange={field('bankName')}
                    className="w-full rounded-md border border-gray-200 px-3 py-2 text-sm focus:border-primary-800 focus:outline-none" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Discount Type</label>
                  <select value={form.discountType} onChange={field('discountType')}
                    className="w-full rounded-md border border-gray-200 px-3 py-2 text-sm focus:border-primary-800 focus:outline-none">
                    <option value="Percentage">Percentage (%)</option>
                    <option value="Fixed">Fixed Amount (₹)</option>
                  </select>
                </div>
                <Input label={form.discountType === 'Percentage' ? 'Discount %' : 'Discount ₹'}
                  type="number" value={String(form.discountValue)}
                  onChange={(e) => setForm((f) => ({ ...f, discountValue: Number(e.target.value) }))} />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <Input label="Min Cart Amount (₹)" type="number"
                  value={form.minCartAmount != null ? String(form.minCartAmount) : ''}
                  onChange={(e) => setForm((f) => ({ ...f, minCartAmount: e.target.value ? Number(e.target.value) : undefined }))} />
                {form.discountType === 'Percentage' && (
                  <Input label="Max Discount (₹)" type="number"
                    value={form.maxDiscount != null ? String(form.maxDiscount) : ''}
                    onChange={(e) => setForm((f) => ({ ...f, maxDiscount: e.target.value ? Number(e.target.value) : undefined }))} />
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Start Date</label>
                  <input type="date" value={form.startDate} onChange={(e) => {
                      setForm((f) => ({ ...f, startDate: e.target.value, endDate: f.endDate && f.endDate < e.target.value ? '' : f.endDate }))
                    }}
                    className="w-full rounded-md border border-gray-200 px-3 py-2 text-sm focus:border-primary-800 focus:outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">End Date</label>
                  <input type="date" value={form.endDate} onChange={field('endDate')}
                    min={form.startDate || undefined}
                    className={`w-full rounded-md border px-3 py-2 text-sm focus:outline-none ${
                      form.startDate && form.endDate && form.endDate < form.startDate
                        ? 'border-red-400 focus:border-red-500'
                        : 'border-gray-200 focus:border-primary-800'
                    }`} />
                  {form.startDate && form.endDate && form.endDate < form.startDate && (
                    <p className="mt-1 text-xs text-red-600">End date must be after start date</p>
                  )}
                </div>
              </div>

              <Input label="Usage Limit (blank = unlimited)" type="number"
                value={form.usageLimit != null ? String(form.usageLimit) : ''}
                onChange={(e) => setForm((f) => ({ ...f, usageLimit: e.target.value ? Number(e.target.value) : undefined }))} />

              {editing && (
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={form.isActive}
                    onChange={(e) => setForm((f) => ({ ...f, isActive: e.target.checked }))}
                    className="accent-primary-800 h-4 w-4" />
                  <span className="text-sm text-gray-700">Active</span>
                </label>
              )}
            </div>

            <div className="border-t px-6 py-4 flex gap-3">
              <Button onClick={handleSave} loading={saving} className="flex-1">
                {editing ? 'Save Changes' : 'Create Coupon'}
              </Button>
              <Button variant="ghost" onClick={() => setShowForm(false)}>Cancel</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
