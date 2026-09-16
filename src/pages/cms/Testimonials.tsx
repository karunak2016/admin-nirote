import { useEffect, useRef, useState } from 'react'
import { Plus, Pencil, Trash2, X, ImagePlus, Star } from 'lucide-react'
import { cmsTestimonialsApi, type Testimonial } from '../../api/cms'
import { uploadApi } from '../../api/upload'
import { Spinner } from '../../components/ui/Spinner'

const EMPTY: Omit<Testimonial, 'id'> = {
  authorName: '', authorCity: '', authorImage: '', text: '', rating: 5, isActive: true, displayOrder: 0,
}

export function Testimonials() {
  const [items, setItems] = useState<Testimonial[]>([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState<(Partial<Testimonial> & { id: number }) | null>(null)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const imgRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    cmsTestimonialsApi.getAll().then(data => { setItems(data); setLoading(false) })
  }, [])

  async function save() {
    if (!editing || !editing.authorName || !editing.text) return
    setSaving(true)
    try {
      const { id } = await cmsTestimonialsApi.save(editing as Testimonial & { id: number })
      if (editing.id === 0) setItems(prev => [...prev, { ...(editing as Testimonial), id }])
      else setItems(prev => prev.map(t => t.id === id ? { ...(editing as Testimonial), id } : t))
      setEditing(null)
    } finally { setSaving(false) }
  }

  async function del(id: number) {
    if (!confirm('Delete this testimonial?')) return
    await cmsTestimonialsApi.delete(id)
    setItems(prev => prev.filter(t => t.id !== id))
  }

  if (loading) return <div className="p-8 flex justify-center"><Spinner /></div>

  return (
    <div className="p-6 max-w-4xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Testimonials</h1>
          <p className="text-sm text-gray-500">Manage customer reviews shown on the homepage.</p>
        </div>
        <button onClick={() => setEditing({ id: 0, ...EMPTY })}
          className="flex items-center gap-2 bg-yellow-400 hover:bg-yellow-500 text-black font-semibold px-4 py-2 rounded-xl text-sm">
          <Plus className="h-4 w-4" /> Add Testimonial
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {items.map(t => (
          <div key={t.id} className="bg-white border border-gray-200 rounded-xl p-4">
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-3">
                {t.authorImage
                  ? <img src={t.authorImage} className="w-10 h-10 rounded-full object-cover" alt={t.authorName} />
                  : <div className="w-10 h-10 rounded-full bg-yellow-50 flex items-center justify-center text-yellow-600 font-bold text-sm">{t.authorName[0]}</div>
                }
                <div>
                  <p className="text-sm font-semibold text-gray-800">{t.authorName}</p>
                  {t.authorCity && <p className="text-xs text-gray-400">{t.authorCity}</p>}
                </div>
              </div>
              <div className="flex gap-1">
                <button onClick={() => setEditing({ ...t })} className="p-1.5 hover:bg-gray-100 rounded-lg"><Pencil className="h-3.5 w-3.5 text-gray-400" /></button>
                <button onClick={() => del(t.id)} className="p-1.5 hover:bg-red-50 rounded-lg"><Trash2 className="h-3.5 w-3.5 text-red-400" /></button>
              </div>
            </div>
            <div className="flex mt-2">
              {[1,2,3,4,5].map(s => <Star key={s} className={`h-3 w-3 ${s <= t.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-200'}`} />)}
            </div>
            <p className="text-xs text-gray-600 mt-2 line-clamp-3">"{t.text}"</p>
            <div className="flex items-center gap-2 mt-2">
              <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${t.isActive ? 'bg-green-50 text-green-600' : 'bg-gray-100 text-gray-400'}`}>
                {t.isActive ? 'Active' : 'Hidden'}
              </span>
              <span className="text-[10px] text-gray-400">Order: {t.displayOrder}</span>
            </div>
          </div>
        ))}
      </div>

      {editing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl">
            <div className="flex items-center justify-between p-5 border-b border-gray-100">
              <h2 className="font-bold text-gray-900">{editing.id === 0 ? 'Add Testimonial' : 'Edit Testimonial'}</h2>
              <button onClick={() => setEditing(null)}><X className="h-5 w-5 text-gray-400" /></button>
            </div>
            <div className="p-5 space-y-4">
              {/* Photo */}
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-gray-100 overflow-hidden flex items-center justify-center cursor-pointer border-2 border-dashed border-gray-200 hover:border-yellow-400"
                  onClick={() => imgRef.current?.click()}>
                  {editing.authorImage
                    ? <img src={editing.authorImage} className="w-full h-full object-cover" alt="" />
                    : uploading ? <Spinner size="sm" /> : <ImagePlus className="h-5 w-5 text-gray-300" />
                  }
                </div>
                <input ref={imgRef} type="file" accept="image/*" className="hidden" onChange={async e => {
                  if (!e.target.files?.[0]) return
                  setUploading(true)
                  const url = await uploadApi.uploadImage(e.target.files[0])
                  setEditing(prev => prev ? { ...prev, authorImage: url } : prev)
                  setUploading(false)
                }} />
                <div className="flex-1">
                  <input value={editing.authorImage ?? ''} onChange={e => setEditing({ ...editing, authorImage: e.target.value })}
                    className="w-full text-xs border border-gray-200 rounded-lg px-3 py-2 focus:outline-none" placeholder="Or paste photo URL" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-gray-600 mb-1 block">Customer Name *</label>
                  <input value={editing.authorName ?? ''} onChange={e => setEditing({ ...editing, authorName: e.target.value })}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-yellow-400" />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-600 mb-1 block">City</label>
                  <input value={editing.authorCity ?? ''} onChange={e => setEditing({ ...editing, authorCity: e.target.value })}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-yellow-400" />
                </div>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-600 mb-1 block">Review *</label>
                <textarea value={editing.text ?? ''} onChange={e => setEditing({ ...editing, text: e.target.value })} rows={3}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-yellow-400 resize-none" />
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-xs font-medium text-gray-600 mb-1 block">Rating</label>
                  <select value={editing.rating ?? 5} onChange={e => setEditing({ ...editing, rating: +e.target.value })}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none">
                    {[5,4,3,2,1].map(r => <option key={r} value={r}>{r} Star{r>1?'s':''}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-600 mb-1 block">Order</label>
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
              <button onClick={save} disabled={saving || !editing.authorName || !editing.text}
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
