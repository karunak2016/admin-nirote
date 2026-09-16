import { useEffect, useState } from 'react'
import { Plus, Pencil, Trash2, X, ChevronDown, ChevronRight } from 'lucide-react'
import { cmsFaqApi, type FaqCategory, type FaqItem } from '../../api/cms'
import { Spinner } from '../../components/ui/Spinner'

export function FaqManager() {
  const [categories, setCategories] = useState<FaqCategory[]>([])
  const [items, setItems] = useState<FaqItem[]>([])
  const [loading, setLoading] = useState(true)
  const [expanded, setExpanded] = useState<number | null>(null)
  const [editingCat, setEditingCat] = useState<(Partial<FaqCategory> & { id: number }) | null>(null)
  const [editingItem, setEditingItem] = useState<(Partial<FaqItem> & { id: number }) | null>(null)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    cmsFaqApi.getAll().then(data => {
      setCategories(data.categories)
      setItems(data.items)
      setLoading(false)
    })
  }, [])

  async function saveCategory() {
    if (!editingCat?.name) return
    setSaving(true)
    try {
      const { id } = await cmsFaqApi.saveCategory(editingCat as FaqCategory & { id: number })
      if (editingCat.id === 0) setCategories(prev => [...prev, { ...(editingCat as FaqCategory), id }])
      else setCategories(prev => prev.map(c => c.id === id ? { ...(editingCat as FaqCategory), id } : c))
      setEditingCat(null)
    } finally { setSaving(false) }
  }

  async function deleteCategory(id: number) {
    if (!confirm('Delete this category and all its questions?')) return
    await cmsFaqApi.deleteCategory(id)
    setCategories(prev => prev.filter(c => c.id !== id))
    setItems(prev => prev.filter(i => i.categoryId !== id))
  }

  async function saveItem() {
    if (!editingItem?.question || !editingItem?.answer) return
    setSaving(true)
    try {
      const { id } = await cmsFaqApi.saveItem(editingItem as FaqItem & { id: number })
      if (editingItem.id === 0) setItems(prev => [...prev, { ...(editingItem as FaqItem), id }])
      else setItems(prev => prev.map(i => i.id === id ? { ...(editingItem as FaqItem), id } : i))
      setEditingItem(null)
    } finally { setSaving(false) }
  }

  async function deleteItem(id: number) {
    if (!confirm('Delete this question?')) return
    await cmsFaqApi.deleteItem(id)
    setItems(prev => prev.filter(i => i.id !== id))
  }

  if (loading) return <div className="p-8 flex justify-center"><Spinner /></div>

  return (
    <div className="p-6 max-w-3xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-gray-900">FAQ Manager</h1>
          <p className="text-sm text-gray-500">Organize FAQs into categories.</p>
        </div>
        <button onClick={() => setEditingCat({ id: 0, name: '', displayOrder: categories.length, isActive: true })}
          className="flex items-center gap-2 bg-yellow-400 hover:bg-yellow-500 text-black font-semibold px-4 py-2 rounded-xl text-sm">
          <Plus className="h-4 w-4" /> Add Category
        </button>
      </div>

      <div className="space-y-3">
        {categories.sort((a, b) => a.displayOrder - b.displayOrder).map(cat => {
          const catItems = items.filter(i => i.categoryId === cat.id).sort((a, b) => a.displayOrder - b.displayOrder)
          const isOpen = expanded === cat.id
          return (
            <div key={cat.id} className="bg-white border border-gray-200 rounded-xl overflow-hidden">
              <div className="flex items-center gap-3 px-4 py-3">
                <button onClick={() => setExpanded(isOpen ? null : cat.id)} className="flex-1 flex items-center gap-2 text-left">
                  {isOpen ? <ChevronDown className="h-4 w-4 text-gray-400" /> : <ChevronRight className="h-4 w-4 text-gray-400" />}
                  <span className="text-sm font-semibold text-gray-800">{cat.name}</span>
                  <span className="text-xs text-gray-400">({catItems.length})</span>
                </button>
                <div className="flex gap-1">
                  <button onClick={() => setEditingCat({ ...cat })} className="p-1.5 hover:bg-gray-100 rounded-lg"><Pencil className="h-3.5 w-3.5 text-gray-400" /></button>
                  <button onClick={() => setEditingItem({ id: 0, categoryId: cat.id, question: '', answer: '', displayOrder: catItems.length, isActive: true })}
                    className="p-1.5 hover:bg-yellow-50 rounded-lg" title="Add question"><Plus className="h-3.5 w-3.5 text-yellow-500" /></button>
                  <button onClick={() => deleteCategory(cat.id)} className="p-1.5 hover:bg-red-50 rounded-lg"><Trash2 className="h-3.5 w-3.5 text-red-400" /></button>
                </div>
              </div>
              {isOpen && (
                <div className="border-t border-gray-100 divide-y divide-gray-50">
                  {catItems.length === 0 && (
                    <p className="text-xs text-gray-400 px-4 py-3">No questions yet. Click + to add one.</p>
                  )}
                  {catItems.map(item => (
                    <div key={item.id} className="px-4 py-3 flex gap-2">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-800">{item.question}</p>
                        <p className="text-xs text-gray-500 mt-1 line-clamp-2">{item.answer}</p>
                      </div>
                      <div className="flex gap-0.5 flex-shrink-0">
                        <button onClick={() => setEditingItem({ ...item })} className="p-1.5 hover:bg-gray-100 rounded-lg"><Pencil className="h-3.5 w-3.5 text-gray-400" /></button>
                        <button onClick={() => deleteItem(item.id)} className="p-1.5 hover:bg-red-50 rounded-lg"><Trash2 className="h-3.5 w-3.5 text-red-400" /></button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Category modal */}
      {editingCat && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl">
            <div className="flex items-center justify-between p-5 border-b border-gray-100">
              <h2 className="font-bold text-gray-900">{editingCat.id === 0 ? 'Add Category' : 'Edit Category'}</h2>
              <button onClick={() => setEditingCat(null)}><X className="h-5 w-5 text-gray-400" /></button>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <label className="text-xs font-medium text-gray-600 mb-1 block">Category Name *</label>
                <input value={editingCat.name ?? ''} onChange={e => setEditingCat({ ...editingCat, name: e.target.value })}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-yellow-400" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-gray-600 mb-1 block">Display Order</label>
                  <input type="number" value={editingCat.displayOrder ?? 0} onChange={e => setEditingCat({ ...editingCat, displayOrder: +e.target.value })}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none" />
                </div>
                <div className="flex flex-col justify-end pb-1">
                  <div className="flex items-center gap-2">
                    <label className="text-sm text-gray-700">Active</label>
                    <button onClick={() => setEditingCat({ ...editingCat, isActive: !editingCat.isActive })}
                      className={`relative inline-flex h-6 w-11 rounded-full transition-colors ${editingCat.isActive ? 'bg-yellow-400' : 'bg-gray-200'}`}>
                      <span className={`inline-block h-5 w-5 rounded-full bg-white shadow transition-transform mt-0.5 ${editingCat.isActive ? 'translate-x-5' : 'translate-x-0.5'}`} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex gap-2 p-5 border-t border-gray-100">
              <button onClick={saveCategory} disabled={saving || !editingCat.name}
                className="flex-1 bg-yellow-400 hover:bg-yellow-500 text-black font-semibold py-2.5 rounded-xl text-sm disabled:opacity-60">
                {saving ? <Spinner size="sm" /> : 'Save'}
              </button>
              <button onClick={() => setEditingCat(null)} className="px-4 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-600">Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Item modal */}
      {editingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl">
            <div className="flex items-center justify-between p-5 border-b border-gray-100">
              <h2 className="font-bold text-gray-900">{editingItem.id === 0 ? 'Add Question' : 'Edit Question'}</h2>
              <button onClick={() => setEditingItem(null)}><X className="h-5 w-5 text-gray-400" /></button>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <label className="text-xs font-medium text-gray-600 mb-1 block">Category</label>
                <select value={editingItem.categoryId ?? ''} onChange={e => setEditingItem({ ...editingItem, categoryId: +e.target.value })}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none">
                  {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-600 mb-1 block">Question *</label>
                <input value={editingItem.question ?? ''} onChange={e => setEditingItem({ ...editingItem, question: e.target.value })}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-yellow-400" />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-600 mb-1 block">Answer *</label>
                <textarea value={editingItem.answer ?? ''} onChange={e => setEditingItem({ ...editingItem, answer: e.target.value })} rows={4}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-yellow-400 resize-none" />
              </div>
            </div>
            <div className="flex gap-2 p-5 border-t border-gray-100">
              <button onClick={saveItem} disabled={saving || !editingItem.question || !editingItem.answer}
                className="flex-1 bg-yellow-400 hover:bg-yellow-500 text-black font-semibold py-2.5 rounded-xl text-sm disabled:opacity-60 flex items-center justify-center gap-2">
                {saving ? <Spinner size="sm" /> : null} Save
              </button>
              <button onClick={() => setEditingItem(null)} className="px-4 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-600">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
