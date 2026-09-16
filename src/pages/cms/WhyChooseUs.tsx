import { useEffect, useState } from 'react'
import { Plus, Pencil, Trash2, X } from 'lucide-react'
import { cmsWhyApi, type WhyItem } from '../../api/cms'
import { Spinner } from '../../components/ui/Spinner'

const ICONS = ['Gem', 'Shield', 'Truck', 'RotateCcw', 'Headphones', 'Heart', 'Star', 'Award', 'Zap', 'Package', 'Gift', 'Clock']

const EMPTY: Omit<WhyItem, 'id'> = { iconName: 'Gem', title: '', description: '', displayOrder: 0, isActive: true }

export function WhyChooseUs() {
  const [items, setItems] = useState<WhyItem[]>([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState<(Partial<WhyItem> & { id: number }) | null>(null)
  const [saving, setSaving] = useState(false)

  useEffect(() => { cmsWhyApi.getAll().then(data => { setItems(data); setLoading(false) }) }, [])

  async function save() {
    if (!editing?.title || !editing?.description) return
    setSaving(true)
    try {
      const { id } = await cmsWhyApi.save(editing as WhyItem & { id: number })
      if (editing.id === 0) setItems(prev => [...prev, { ...(editing as WhyItem), id }])
      else setItems(prev => prev.map(i => i.id === id ? { ...(editing as WhyItem), id } : i))
      setEditing(null)
    } finally { setSaving(false) }
  }

  async function del(id: number) {
    if (!confirm('Delete this item?')) return
    await cmsWhyApi.delete(id)
    setItems(prev => prev.filter(i => i.id !== id))
  }

  if (loading) return <div className="p-8 flex justify-center"><Spinner /></div>

  return (
    <div className="p-6 max-w-4xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Why Choose Us</h1>
          <p className="text-sm text-gray-500">Feature cards shown in the "Why Choose NIROTÉ" homepage section.</p>
        </div>
        <button onClick={() => setEditing({ id: 0, ...EMPTY, displayOrder: items.length })}
          className="flex items-center gap-2 bg-yellow-400 hover:bg-yellow-500 text-black font-semibold px-4 py-2 rounded-xl text-sm">
          <Plus className="h-4 w-4" /> Add Card
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {items.map(item => (
          <div key={item.id} className="bg-white border border-gray-200 rounded-xl p-4">
            <div className="flex items-start justify-between gap-2">
              <div className="w-9 h-9 rounded-lg bg-yellow-50 flex items-center justify-center flex-shrink-0">
                <span className="text-[10px] font-mono text-yellow-600">{item.iconName.slice(0, 3)}</span>
              </div>
              <div className="flex gap-0.5">
                <button onClick={() => setEditing({ ...item })} className="p-1.5 hover:bg-gray-100 rounded-lg"><Pencil className="h-3.5 w-3.5 text-gray-400" /></button>
                <button onClick={() => del(item.id)} className="p-1.5 hover:bg-red-50 rounded-lg"><Trash2 className="h-3.5 w-3.5 text-red-400" /></button>
              </div>
            </div>
            <p className="text-sm font-semibold text-gray-800 mt-3">{item.title}</p>
            <p className="text-xs text-gray-500 mt-1 line-clamp-2">{item.description}</p>
            <div className="flex items-center gap-2 mt-2">
              <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${item.isActive ? 'bg-green-50 text-green-600' : 'bg-gray-100 text-gray-400'}`}>
                {item.isActive ? 'Active' : 'Hidden'}
              </span>
              <span className="text-[10px] text-gray-400">Order: {item.displayOrder}</span>
            </div>
          </div>
        ))}
      </div>

      {editing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl">
            <div className="flex items-center justify-between p-5 border-b border-gray-100">
              <h2 className="font-bold text-gray-900">{editing.id === 0 ? 'Add Card' : 'Edit Card'}</h2>
              <button onClick={() => setEditing(null)}><X className="h-5 w-5 text-gray-400" /></button>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <label className="text-xs font-medium text-gray-600 mb-2 block">Icon</label>
                <div className="flex flex-wrap gap-2">
                  {ICONS.map(icon => (
                    <button key={icon} onClick={() => setEditing({ ...editing, iconName: icon })}
                      className={`px-3 py-1.5 text-xs rounded-lg border transition-colors ${editing.iconName === icon ? 'border-yellow-400 bg-yellow-50 text-yellow-700 font-semibold' : 'border-gray-200 text-gray-500 hover:border-gray-300'}`}>
                      {icon}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-600 mb-1 block">Title *</label>
                <input value={editing.title ?? ''} onChange={e => setEditing({ ...editing, title: e.target.value })}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-yellow-400" placeholder="e.g. Premium Quality" />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-600 mb-1 block">Description *</label>
                <textarea value={editing.description ?? ''} onChange={e => setEditing({ ...editing, description: e.target.value })} rows={3}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-yellow-400 resize-none" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-gray-600 mb-1 block">Display Order</label>
                  <input type="number" value={editing.displayOrder ?? 0} onChange={e => setEditing({ ...editing, displayOrder: +e.target.value })}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none" />
                </div>
                <div className="flex flex-col justify-end pb-1">
                  <div className="flex items-center gap-2">
                    <label className="text-sm text-gray-700">Active</label>
                    <button onClick={() => setEditing({ ...editing, isActive: !editing.isActive })}
                      className={`relative inline-flex h-6 w-11 rounded-full transition-colors ${editing.isActive ? 'bg-yellow-400' : 'bg-gray-200'}`}>
                      <span className={`inline-block h-5 w-5 rounded-full bg-white shadow transition-transform mt-0.5 ${editing.isActive ? 'translate-x-5' : 'translate-x-0.5'}`} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex gap-2 p-5 border-t border-gray-100">
              <button onClick={save} disabled={saving || !editing.title || !editing.description}
                className="flex-1 bg-yellow-400 hover:bg-yellow-500 text-black font-semibold py-2.5 rounded-xl text-sm disabled:opacity-60 flex items-center justify-center gap-2">
                {saving ? <Spinner size="sm" /> : null} Save
              </button>
              <button onClick={() => setEditing(null)} className="px-4 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-600">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
