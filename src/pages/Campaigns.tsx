import { useEffect, useState } from 'react'
import { Plus, Pencil, ToggleLeft, ToggleRight, Megaphone, Calendar, Percent, IndianRupee } from 'lucide-react'
import type { Campaign, Category, CreateCampaignPayload } from '../types'
import { campaignsApi } from '../api/campaigns'
import { categoriesApi } from '../api/categories'
import { Button } from '../components/ui/Button'
import { Badge } from '../components/ui/Badge'
import { Input } from '../components/ui/Input'
import { Spinner } from '../components/ui/Spinner'

const EMPTY_FORM: CreateCampaignPayload & { isActive: boolean } = {
  name: '', description: '', discountType: 'Percentage', discountValue: 0,
  categoryId: undefined, startDate: '', endDate: '', isActive: true,
}

export function Campaigns() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<Campaign | null>(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    Promise.all([campaignsApi.list(), categoriesApi.list()])
      .then(([c, cats]) => { setCampaigns(c); setCategories(cats) })
      .finally(() => setLoading(false))
  }, [])

  function openCreate() {
    setEditing(null); setForm(EMPTY_FORM); setError(''); setShowForm(true)
  }

  function openEdit(c: Campaign) {
    setEditing(c)
    setForm({
      name: c.name, description: c.description ?? '',
      discountType: c.discountType, discountValue: c.discountValue,
      categoryId: c.categoryId ?? undefined,
      startDate: c.startDate ? c.startDate.slice(0, 10) : '',
      endDate: c.endDate ? c.endDate.slice(0, 10) : '',
      isActive: c.isActive,
    })
    setError(''); setShowForm(true)
  }

  async function handleSave() {
    if (!form.name || !form.discountValue) { setError('Name and discount value are required.'); return }
    if (form.startDate && form.endDate && form.endDate < form.startDate) {
      setError('End date must be on or after the start date.'); return
    }
    setSaving(true); setError('')
    try {
      const payload = {
        ...form,
        description: form.description || undefined,
        startDate: form.startDate || undefined,
        endDate: form.endDate || undefined,
      }
      if (editing) {
        const updated = await campaignsApi.update(editing.id, payload)
        setCampaigns((prev) => prev.map((c) => (c.id === updated.id ? updated : c)))
      } else {
        const created = await campaignsApi.create(payload)
        setCampaigns((prev) => [created, ...prev])
      }
      setShowForm(false)
    } catch { setError('Failed to save. Please try again.') }
    finally { setSaving(false) }
  }

  async function handleToggle(c: Campaign) {
    try {
      const updated = await campaignsApi.update(c.id, {
        name: c.name, description: c.description, categoryId: c.categoryId ?? undefined,
        discountType: c.discountType, discountValue: c.discountValue,
        startDate: c.startDate ?? undefined, endDate: c.endDate ?? undefined,
        isActive: !c.isActive,
      })
      setCampaigns((prev) => prev.map((x) => (x.id === updated.id ? updated : x)))
    } catch { /* silent */ }
  }

  const field = (key: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [key]: e.target.value }))

  const categoryName = (id: number | null) => categories.find((c) => c.id === id)?.name ?? 'All categories'

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500">{campaigns.length} campaign{campaigns.length !== 1 ? 's' : ''}</p>
        <Button size="sm" onClick={openCreate}><Plus className="h-4 w-4" /> New Campaign</Button>
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><Spinner /></div>
      ) : campaigns.length === 0 ? (
        <p className="py-16 text-center text-sm text-gray-400">No campaigns yet. Create your first sale!</p>
      ) : (
        <div className="rounded-xl border border-gray-200 bg-white overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Campaign</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Discount</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Validity</th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {campaigns.map((c) => (
                  <tr key={c.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <p className="font-medium text-gray-900">{c.name}</p>
                      {c.description && <p className="text-xs text-gray-500 mt-0.5">{c.description}</p>}
                    </td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center gap-1 font-medium text-gray-900">
                        {c.discountType === 'Percentage'
                          ? <><Percent className="h-3.5 w-3.5 text-green-600" />{c.discountValue}%</>
                          : <><IndianRupee className="h-3.5 w-3.5 text-green-600" />{c.discountValue.toLocaleString('en-IN')}</>}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-600 text-xs">{categoryName(c.categoryId)}</td>
                    <td className="px-4 py-3">
                      {c.startDate || c.endDate ? (
                        <div className="flex items-center gap-1 text-xs text-gray-500">
                          <Calendar className="h-3 w-3" />
                          {c.startDate ? new Date(c.startDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) : '∞'}
                          {' – '}
                          {c.endDate ? new Date(c.endDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: '2-digit' }) : '∞'}
                        </div>
                      ) : <span className="text-xs text-gray-400">No expiry</span>}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <Badge variant={c.isActive ? 'success' : 'danger'}>{c.isActive ? 'Active' : 'Inactive'}</Badge>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => openEdit(c)} className="rounded p-1.5 text-gray-400 hover:bg-gray-100 hover:text-primary-800">
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button onClick={() => handleToggle(c)} className="rounded p-1.5 text-gray-400 hover:bg-gray-100 hover:text-primary-800">
                          {c.isActive ? <ToggleRight className="h-4 w-4 text-green-500" /> : <ToggleLeft className="h-4 w-4" />}
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

      {showForm && (
        <div className="fixed inset-0 z-50 flex">
          <div className="fixed inset-0 bg-black/40" onClick={() => setShowForm(false)} />
          <div className="relative ml-auto flex h-full w-full max-w-md flex-col bg-white shadow-xl">
            <div className="flex items-center justify-between border-b px-6 py-4">
              <h2 className="text-base font-semibold text-gray-900 flex items-center gap-2">
                <Megaphone className="h-4 w-4 text-primary-800" />
                {editing ? 'Edit Campaign' : 'New Sale Campaign'}
              </h2>
              <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-600 text-xl leading-none">&times;</button>
            </div>

            <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
              {error && <div className="rounded-lg bg-red-50 border border-red-200 px-3 py-2 text-sm text-red-700">{error}</div>}

              <Input label="Campaign Name" value={form.name} onChange={field('name')} placeholder="e.g. Diwali Sale, End of Season" />

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Description <span className="text-gray-400">(optional)</span></label>
                <textarea value={form.description ?? ''} onChange={field('description')} rows={2}
                  placeholder="Short description shown to customers"
                  className="w-full rounded-md border border-gray-200 px-3 py-2 text-sm focus:border-primary-800 focus:outline-none resize-none" />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Category <span className="text-gray-400">(blank = all categories)</span></label>
                <select value={form.categoryId ?? ''}
                  onChange={(e) => setForm((f) => ({ ...f, categoryId: e.target.value ? Number(e.target.value) : undefined }))}
                  className="w-full rounded-md border border-gray-200 px-3 py-2 text-sm focus:border-primary-800 focus:outline-none">
                  <option value="">All Categories</option>
                  {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
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
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Start Date</label>
                  <input type="date" value={form.startDate ?? ''} onChange={(e) => {
                      setForm((f) => ({ ...f, startDate: e.target.value, endDate: f.endDate && f.endDate < e.target.value ? '' : f.endDate }))
                    }}
                    className="w-full rounded-md border border-gray-200 px-3 py-2 text-sm focus:border-primary-800 focus:outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">End Date</label>
                  <input type="date" value={form.endDate ?? ''} onChange={field('endDate')}
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
                {editing ? 'Save Changes' : 'Create Campaign'}
              </Button>
              <Button variant="ghost" onClick={() => setShowForm(false)}>Cancel</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
