import { useEffect, useState } from 'react'
import { Plus, Pencil, Trash2, X, ArrowUp, ArrowDown, ExternalLink } from 'lucide-react'
import { cmsNavApi, type NavItem } from '../../api/cms'
import { Spinner } from '../../components/ui/Spinner'

const EMPTY: Omit<NavItem, 'id'> = {
  label: '', url: '/', parentId: null, displayOrder: 0, isEnabled: true, openInNewTab: false,
}

export function Navigation() {
  const [items, setItems] = useState<NavItem[]>([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState<(Partial<NavItem> & { id: number }) | null>(null)
  const [saving, setSaving] = useState(false)

  const roots = items.filter(n => !n.parentId).sort((a, b) => a.displayOrder - b.displayOrder)
  const childrenOf = (id: number) => items.filter(n => n.parentId === id).sort((a, b) => a.displayOrder - b.displayOrder)

  useEffect(() => {
    cmsNavApi.getAll().then(data => { setItems(data); setLoading(false) })
  }, [])

  async function save() {
    if (!editing?.label) return
    setSaving(true)
    try {
      const { id } = await cmsNavApi.save(editing as NavItem & { id: number })
      if (editing.id === 0) setItems(prev => [...prev, { ...(editing as NavItem), id }])
      else setItems(prev => prev.map(n => n.id === id ? { ...(editing as NavItem), id } : n))
      setEditing(null)
    } finally { setSaving(false) }
  }

  async function del(id: number) {
    if (!confirm('Delete this item and its children?')) return
    await cmsNavApi.delete(id)
    setItems(prev => prev.filter(n => n.id !== id && n.parentId !== id))
  }

  async function move(id: number, dir: -1 | 1) {
    const sorted = [...items].sort((a, b) => a.displayOrder - b.displayOrder)
    const idx = sorted.findIndex(n => n.id === id)
    if (idx === -1) return
    const swap = idx + dir
    if (swap < 0 || swap >= sorted.length) return
    const a = sorted[idx]; const b = sorted[swap]
    const reordered = sorted.map((n, i) => {
      if (i === idx) return { ...n, displayOrder: b.displayOrder }
      if (i === swap) return { ...n, displayOrder: a.displayOrder }
      return n
    })
    setItems(reordered)
    await cmsNavApi.reorder([{ id: a.id, displayOrder: b.displayOrder }, { id: b.id, displayOrder: a.displayOrder }])
  }

  if (loading) return <div className="p-8 flex justify-center"><Spinner /></div>

  function NavRow({ item, indent = 0 }: { item: NavItem; indent?: number }) {
    const children = childrenOf(item.id)
    return (
      <div>
        <div className={`flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-4 py-3 ${indent > 0 ? 'ml-6 mt-2' : ''}`}>
          {indent > 0 && <div className="w-3 h-px bg-gray-300 flex-shrink-0" />}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-gray-800">{item.label}</p>
            <p className="text-xs text-gray-400 truncate flex items-center gap-1">
              {item.url} {item.openInNewTab && <ExternalLink className="h-2.5 w-2.5" />}
            </p>
          </div>
          <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${item.isEnabled ? 'bg-green-50 text-green-600' : 'bg-gray-100 text-gray-400'}`}>
            {item.isEnabled ? 'On' : 'Off'}
          </span>
          <div className="flex gap-0.5">
            <button onClick={() => move(item.id, -1)} className="p-1.5 hover:bg-gray-100 rounded-lg"><ArrowUp className="h-3.5 w-3.5 text-gray-400" /></button>
            <button onClick={() => move(item.id, 1)} className="p-1.5 hover:bg-gray-100 rounded-lg"><ArrowDown className="h-3.5 w-3.5 text-gray-400" /></button>
            <button onClick={() => setEditing({ ...item })} className="p-1.5 hover:bg-gray-100 rounded-lg"><Pencil className="h-3.5 w-3.5 text-gray-400" /></button>
            {indent === 0 && (
              <button onClick={() => setEditing({ id: 0, ...EMPTY, parentId: item.id, displayOrder: children.length })}
                className="p-1.5 hover:bg-yellow-50 rounded-lg" title="Add child">
                <Plus className="h-3.5 w-3.5 text-yellow-500" />
              </button>
            )}
            <button onClick={() => del(item.id)} className="p-1.5 hover:bg-red-50 rounded-lg"><Trash2 className="h-3.5 w-3.5 text-red-400" /></button>
          </div>
        </div>
        {children.map(child => <NavRow key={child.id} item={child} indent={indent + 1} />)}
      </div>
    )
  }

  return (
    <div className="p-6 max-w-3xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Navigation Management</h1>
          <p className="text-sm text-gray-500">Manage header menu items. Click + next to any item to add a dropdown child.</p>
        </div>
        <button onClick={() => setEditing({ id: 0, ...EMPTY, displayOrder: roots.length })}
          className="flex items-center gap-2 bg-yellow-400 hover:bg-yellow-500 text-black font-semibold px-4 py-2 rounded-xl text-sm">
          <Plus className="h-4 w-4" /> Add Menu Item
        </button>
      </div>

      <div className="space-y-2">
        {roots.length === 0 && <p className="text-sm text-gray-400 py-8 text-center">No navigation items yet.</p>}
        {roots.map(item => <NavRow key={item.id} item={item} />)}
      </div>

      {editing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl">
            <div className="flex items-center justify-between p-5 border-b border-gray-100">
              <h2 className="font-bold text-gray-900">{editing.id === 0 ? 'Add Menu Item' : 'Edit Menu Item'}</h2>
              <button onClick={() => setEditing(null)}><X className="h-5 w-5 text-gray-400" /></button>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <label className="text-xs font-medium text-gray-600 mb-1 block">Label *</label>
                <input value={editing.label ?? ''} onChange={e => setEditing({ ...editing, label: e.target.value })}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-yellow-400" placeholder="e.g. Shop" />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-600 mb-1 block">URL</label>
                <input value={editing.url ?? ''} onChange={e => setEditing({ ...editing, url: e.target.value })}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-yellow-400" placeholder="/products" />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-600 mb-1 block">Parent Item</label>
                <select value={editing.parentId ?? ''} onChange={e => setEditing({ ...editing, parentId: e.target.value ? +e.target.value : null })}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none">
                  <option value="">None (top-level)</option>
                  {roots.filter(r => r.id !== editing.id).map(r => <option key={r.id} value={r.id}>{r.label}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-gray-600 mb-1 block">Display Order</label>
                  <input type="number" value={editing.displayOrder ?? 0} onChange={e => setEditing({ ...editing, displayOrder: +e.target.value })}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none" />
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <label className="text-sm text-gray-700">Enabled</label>
                  <button onClick={() => setEditing({ ...editing, isEnabled: !editing.isEnabled })}
                    className={`relative inline-flex h-6 w-11 rounded-full transition-colors ${editing.isEnabled ? 'bg-yellow-400' : 'bg-gray-200'}`}>
                    <span className={`inline-block h-5 w-5 rounded-full bg-white shadow transition-transform mt-0.5 ${editing.isEnabled ? 'translate-x-5' : 'translate-x-0.5'}`} />
                  </button>
                </div>
                <div className="flex items-center gap-2">
                  <label className="text-sm text-gray-700">Open in new tab</label>
                  <button onClick={() => setEditing({ ...editing, openInNewTab: !editing.openInNewTab })}
                    className={`relative inline-flex h-6 w-11 rounded-full transition-colors ${editing.openInNewTab ? 'bg-yellow-400' : 'bg-gray-200'}`}>
                    <span className={`inline-block h-5 w-5 rounded-full bg-white shadow transition-transform mt-0.5 ${editing.openInNewTab ? 'translate-x-5' : 'translate-x-0.5'}`} />
                  </button>
                </div>
              </div>
            </div>
            <div className="flex gap-2 p-5 border-t border-gray-100">
              <button onClick={save} disabled={saving || !editing.label}
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
