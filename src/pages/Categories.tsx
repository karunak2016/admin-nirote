import { useEffect, useRef, useState } from 'react'
import { Plus, Pencil, Trash2, X, ChevronRight, Upload, ImageOff } from 'lucide-react'
import type { Category } from '../types'
import { categoriesApi } from '../api/categories'
import { uploadApi } from '../api/upload'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { Spinner } from '../components/ui/Spinner'
import { Badge } from '../components/ui/Badge'

const emptyForm = { name: '', description: '', imageUrl: '', parentId: null as number | null, showOnHomepage: false }

function ImageUploadField({ value, onChange }: { value: string; onChange: (url: string) => void }) {
  const ref = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)

  async function handleFile(file: File) {
    setUploading(true)
    try { onChange(await uploadApi.uploadImage(file)) }
    catch { alert('Image upload failed. Please try again.') }
    finally { setUploading(false) }
  }

  return (
    <div>
      <label className="text-xs font-medium text-gray-600 uppercase tracking-wide">Image (optional)</label>
      <div className="mt-1 flex items-center gap-3">
        {value ? (
          <div className="relative flex-shrink-0">
            <img src={value} alt="" className="h-14 w-14 rounded-lg object-cover border border-gray-200" />
            <button type="button" onClick={() => onChange('')}
              className="absolute -top-1.5 -right-1.5 h-4 w-4 rounded-full bg-red-500 text-white flex items-center justify-center hover:bg-red-600">
              <X className="h-2.5 w-2.5" />
            </button>
          </div>
        ) : (
          <div className="h-14 w-14 rounded-lg bg-gray-100 border border-dashed border-gray-300 flex items-center justify-center flex-shrink-0">
            <ImageOff className="h-5 w-5 text-gray-300" />
          </div>
        )}
        <div className="flex-1">
          <button type="button" onClick={() => ref.current?.click()} disabled={uploading}
            className="flex items-center gap-2 rounded-md border border-gray-200 bg-white px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-50 disabled:opacity-50 transition-colors">
            {uploading ? <Spinner /> : <Upload className="h-4 w-4" />}
            {uploading ? 'Uploading...' : value ? 'Change image' : 'Browse image'}
          </button>
          <input ref={ref} type="file" accept="image/*" className="hidden"
            onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); e.target.value = '' }} />
        </div>
      </div>
    </div>
  )
}

export function Categories() {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [showAdd, setShowAdd] = useState(false)
  const [editCat, setEditCat] = useState<Category | null>(null)
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)
  const editPanelRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    categoriesApi.list(true).then(setCategories).finally(() => setLoading(false))
  }, [])

  const parents = categories.filter((c) => !c.parentId)

  async function handleCreate() {
    if (!form.name.trim()) return
    setSaving(true)
    try {
      const created = await categoriesApi.create({
        name: form.name, description: form.description || undefined,
        imageUrl: form.imageUrl || undefined, parentId: form.parentId, showOnHomepage: form.showOnHomepage,
      })
      setCategories((prev) => [created, ...prev])
      setForm(emptyForm); setShowAdd(false)
    } finally { setSaving(false) }
  }

  async function handleUpdate() {
    if (!editCat || !form.name.trim()) return
    setSaving(true)
    try {
      const updated = await categoriesApi.update(editCat.id, {
        name: form.name, description: form.description || undefined,
        imageUrl: form.imageUrl || undefined, parentId: form.parentId,
        isActive: editCat.isActive, showOnHomepage: form.showOnHomepage,
      })
      setCategories((prev) => prev.map((c) => (c.id === editCat.id ? updated : c)))
      setEditCat(null)
    } finally { setSaving(false) }
  }

  async function handleToggleActive(cat: Category) {
    const updated = await categoriesApi.update(cat.id, {
      name: cat.name, description: cat.description, parentId: cat.parentId,
      isActive: !cat.isActive, showOnHomepage: cat.showOnHomepage,
    })
    setCategories((prev) => prev.map((c) => (c.id === cat.id ? updated : c)))
    if (editCat?.id === cat.id) setEditCat({ ...editCat, isActive: !cat.isActive })
  }

  async function handleToggleHomepage(cat: Category) {
    const updated = await categoriesApi.update(cat.id, {
      name: cat.name, description: cat.description, parentId: cat.parentId,
      isActive: cat.isActive, showOnHomepage: !cat.showOnHomepage,
    })
    setCategories((prev) => prev.map((c) => (c.id === cat.id ? updated : c)))
  }

  async function handleDelete(id: number) {
    if (categories.some((c) => c.parentId === id)) {
      alert('Cannot delete a category that has sub-categories. Delete the sub-categories first.')
      return
    }
    if (!confirm('Delete this category?')) return
    await categoriesApi.remove(id)
    setCategories((prev) => prev.filter((c) => c.id !== id))
    if (editCat?.id === id) setEditCat(null)
  }

  function startEdit(cat: Category) {
    setEditCat(cat)
    setForm({ name: cat.name, description: cat.description ?? '', imageUrl: cat.imageUrl ?? '', parentId: cat.parentId ?? null, showOnHomepage: cat.showOnHomepage })
    setShowAdd(false)
    setTimeout(() => editPanelRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 50)
  }

  const f = (key: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm((prev) => ({ ...prev, [key]: e.target.value }))

  const inp = 'w-full rounded-md border border-gray-200 px-3 py-2 text-sm focus:border-primary-800 focus:outline-none'
  const lbl = 'text-xs font-medium text-gray-600 uppercase tracking-wide block mb-1'

  function CategoryRow({ cat, indent = false }: { cat: Category; indent?: boolean }) {
    const isSelected = editCat?.id === cat.id
    return (
      <tr className={`hover:bg-gray-50 ${isSelected ? 'bg-primary-50 ring-1 ring-inset ring-primary-200' : ''}`}>
        <td className="px-5 py-3">
          <div className={`flex items-center gap-1.5 ${indent ? 'pl-6' : ''}`}>
            {indent && <ChevronRight className="h-3.5 w-3.5 text-gray-300 flex-shrink-0" />}
            <span className={`font-medium text-gray-900 ${indent ? 'text-sm' : ''}`}>{cat.name}</span>
          </div>
        </td>
        <td className="px-5 py-3 text-gray-500 text-sm">
          <div className="flex items-center gap-2">
            {cat.imageUrl
              ? <img src={cat.imageUrl} alt="" className="h-8 w-8 rounded-full object-cover border border-gray-200 flex-shrink-0" />
              : <span className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center text-xs text-gray-400 font-bold border border-gray-200 flex-shrink-0">{cat.name[0]}</span>
            }
            <span className="truncate">{cat.description ?? '—'}</span>
          </div>
        </td>
        <td className="px-5 py-3 text-sm text-gray-500">
          {cat.parentId ? (categories.find((c) => c.id === cat.parentId)?.name ?? '—') : <span className="text-gray-400">—</span>}
        </td>
        <td className="px-5 py-3 text-center">
          <button onClick={() => handleToggleActive(cat)} className="focus:outline-none">
            <Badge variant={cat.isActive ? 'success' : 'danger'}>{cat.isActive ? 'Active' : 'Inactive'}</Badge>
          </button>
        </td>
        <td className="px-5 py-3 text-center">
          <button onClick={() => handleToggleHomepage(cat)} className="focus:outline-none">
            <Badge variant={cat.showOnHomepage ? 'success' : 'default'}>{cat.showOnHomepage ? 'Yes' : 'No'}</Badge>
          </button>
        </td>
        <td className="px-5 py-3">
          <div className="flex items-center justify-end gap-2">
            <button onClick={() => isSelected ? setEditCat(null) : startEdit(cat)}
              className={`rounded p-1.5 transition-colors ${isSelected ? 'text-primary-800 bg-primary-100' : 'text-gray-400 hover:bg-gray-100 hover:text-primary-800'}`}>
              <Pencil className="h-4 w-4" />
            </button>
            <button onClick={() => handleDelete(cat.id)}
              className="rounded p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-600">
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        </td>
      </tr>
    )
  }

  return (
    <div className="max-w-3xl space-y-4">
      {!showAdd && (
        <div className="flex justify-end">
          <Button size="sm" onClick={() => { setShowAdd(true); setEditCat(null); setForm(emptyForm) }}>
            <Plus className="h-4 w-4" /> Add Category
          </Button>
        </div>
      )}

      {showAdd && (
        <div className="rounded-xl border border-gray-200 bg-white p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-gray-700">New Category</h2>
            <button onClick={() => setShowAdd(false)} className="text-gray-400 hover:text-gray-600"><X className="h-4 w-4" /></button>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input id="catName" label="Name" placeholder="e.g. Chandbali Earrings" value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
            <Input id="catDesc" label="Description (optional)" placeholder="Brief description..."
              value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} />
          </div>
          <div className="grid grid-cols-2 gap-4 items-start">
            <ImageUploadField value={form.imageUrl} onChange={(url) => setForm((f) => ({ ...f, imageUrl: url }))} />
            <div>
              <label className={lbl}>Parent Category</label>
              <select value={form.parentId ?? ''} onChange={(e) => setForm((f) => ({ ...f, parentId: e.target.value ? Number(e.target.value) : null }))} className={inp}>
                <option value="">None (top-level)</option>
                {parents.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </div>
          </div>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={form.showOnHomepage} onChange={(e) => setForm((f) => ({ ...f, showOnHomepage: e.target.checked }))}
              className="h-4 w-4 rounded border-gray-300 accent-primary-800" />
            <span className="text-sm text-gray-700">Show in homepage "Shop by Category"</span>
          </label>
          <div className="flex gap-2">
            <Button size="sm" loading={saving} onClick={handleCreate}>Save</Button>
            <Button size="sm" variant="ghost" onClick={() => setShowAdd(false)}>Cancel</Button>
          </div>
        </div>
      )}

      {/* Grid */}
      <div className="rounded-xl border border-gray-200 bg-white overflow-hidden">
        {loading ? (
          <div className="flex justify-center py-12"><Spinner /></div>
        ) : categories.length === 0 ? (
          <p className="py-12 text-center text-sm text-gray-400">No categories yet.</p>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Parent</th>
                <th className="px-5 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-5 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Homepage</th>
                <th className="px-5 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {parents.map((parent) => (
                <>
                  <CategoryRow key={parent.id} cat={parent} />
                  {categories.filter((c) => c.parentId === parent.id).map((child) => (
                    <CategoryRow key={child.id} cat={child} indent />
                  ))}
                </>
              ))}
              {categories.filter((c) => c.parentId && !categories.find((p) => p.id === c.parentId)).map((c) => (
                <CategoryRow key={c.id} cat={c} />
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Edit panel — appears below grid */}
      {editCat && (
        <div ref={editPanelRef} className="rounded-xl border border-primary-200 bg-white p-5 space-y-4 shadow-sm">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-gray-700">Edit — {editCat.name}</h2>
            <button onClick={() => setEditCat(null)} className="text-gray-400 hover:text-gray-600"><X className="h-4 w-4" /></button>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={lbl}>Name</label>
              <input value={form.name} onChange={f('name')} placeholder="Category name" className={inp} autoFocus />
            </div>
            <div>
              <label className={lbl}>Description (optional)</label>
              <input value={form.description} onChange={f('description')} placeholder="Brief description..." className={inp} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 items-start">
            <ImageUploadField value={form.imageUrl} onChange={(url) => setForm((prev) => ({ ...prev, imageUrl: url }))} />
            <div>
              <label className={lbl}>Parent Category</label>
              <select value={form.parentId ?? ''}
                onChange={(e) => setForm((prev) => ({ ...prev, parentId: e.target.value ? Number(e.target.value) : null }))}
                className={inp}>
                <option value="">None (top-level)</option>
                {parents.filter((p) => p.id !== editCat.id).map((p) => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={form.showOnHomepage}
                onChange={(e) => setForm((prev) => ({ ...prev, showOnHomepage: e.target.checked }))}
                className="h-4 w-4 rounded border-gray-300 accent-primary-800" />
              <span className="text-sm text-gray-700">Show on homepage</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={editCat.isActive} onChange={() => handleToggleActive(editCat)}
                className="h-4 w-4 rounded border-gray-300 accent-primary-800" />
              <span className="text-sm text-gray-700">Active</span>
            </label>
          </div>

          <div className="flex gap-2 pt-1">
            <Button size="sm" loading={saving} onClick={handleUpdate}>Save Changes</Button>
            <Button size="sm" variant="ghost" onClick={() => setEditCat(null)}>Cancel</Button>
          </div>
        </div>
      )}
    </div>
  )
}
