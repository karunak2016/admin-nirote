import { useEffect, useRef, useState } from 'react'
import { Plus, Pencil, Trash2, X, ImagePlus } from 'lucide-react'
import { cmsCollectionsApi, type CmsCollection } from '../../api/cms'
import { uploadApi } from '../../api/upload'
import { Spinner } from '../../components/ui/Spinner'

const EMPTY: Omit<CmsCollection, 'id'> = {
  name: '', slug: '', bannerUrl: '', imageUrl: '', description: '',
  seoTitle: '', seoDesc: '', displayOrder: 0, isActive: true,
}

function slugify(s: string) {
  return s.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
}

export function CmsCollections() {
  const [items, setItems] = useState<CmsCollection[]>([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState<(Partial<CmsCollection> & { id: number }) | null>(null)
  const [saving, setSaving] = useState(false)
  const [uploadingBanner, setUploadingBanner] = useState(false)
  const [uploadingImg, setUploadingImg] = useState(false)
  const bannerRef = useRef<HTMLInputElement>(null)
  const imgRef = useRef<HTMLInputElement>(null)

  useEffect(() => { cmsCollectionsApi.getAll().then(data => { setItems(data); setLoading(false) }) }, [])

  async function save() {
    if (!editing?.name || !editing?.slug) return
    setSaving(true)
    try {
      const { id } = await cmsCollectionsApi.save(editing as CmsCollection & { id: number })
      if (editing.id === 0) setItems(prev => [...prev, { ...(editing as CmsCollection), id }])
      else setItems(prev => prev.map(c => c.id === id ? { ...(editing as CmsCollection), id } : c))
      setEditing(null)
    } finally { setSaving(false) }
  }

  async function del(id: number) {
    if (!confirm('Delete this collection?')) return
    await cmsCollectionsApi.delete(id)
    setItems(prev => prev.filter(c => c.id !== id))
  }

  if (loading) return <div className="p-8 flex justify-center"><Spinner /></div>

  return (
    <div className="p-6 max-w-5xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Collections</h1>
          <p className="text-sm text-gray-500">Create curated collections like "Festive Favourites" or "Gifting Edit".</p>
        </div>
        <button onClick={() => setEditing({ id: 0, ...EMPTY, displayOrder: items.length })}
          className="flex items-center gap-2 bg-yellow-400 hover:bg-yellow-500 text-black font-semibold px-4 py-2 rounded-xl text-sm">
          <Plus className="h-4 w-4" /> New Collection
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {items.map(c => (
          <div key={c.id} className="bg-white border border-gray-200 rounded-xl overflow-hidden">
            <div className="h-32 bg-gray-100 relative overflow-hidden">
              {c.bannerUrl
                ? <img src={c.bannerUrl} className="w-full h-full object-cover" alt={c.name} />
                : <div className="w-full h-full flex items-center justify-center text-gray-300 text-3xl">✦</div>}
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
              <p className="absolute bottom-2 left-3 text-white font-bold text-sm">{c.name}</p>
            </div>
            <div className="p-3">
              <p className="text-xs text-gray-500 mb-2 font-mono">/{c.slug}</p>
              <div className="flex items-center justify-between">
                <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${c.isActive ? 'bg-green-50 text-green-600' : 'bg-gray-100 text-gray-400'}`}>
                  {c.isActive ? 'Active' : 'Hidden'}
                </span>
                <div className="flex gap-1">
                  <button onClick={() => setEditing({ ...c })} className="p-1.5 hover:bg-gray-100 rounded-lg"><Pencil className="h-3.5 w-3.5 text-gray-400" /></button>
                  <button onClick={() => del(c.id)} className="p-1.5 hover:bg-red-50 rounded-lg"><Trash2 className="h-3.5 w-3.5 text-red-400" /></button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {editing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex items-center justify-between p-5 border-b border-gray-100">
              <h2 className="font-bold text-gray-900">{editing.id === 0 ? 'New Collection' : 'Edit Collection'}</h2>
              <button onClick={() => setEditing(null)}><X className="h-5 w-5 text-gray-400" /></button>
            </div>
            <div className="p-5 space-y-4">
              {/* Images */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-medium text-gray-600 mb-1.5 block">Banner Image (wide)</label>
                  <div className="h-24 bg-gray-50 border-2 border-dashed border-gray-200 rounded-xl flex items-center justify-center cursor-pointer hover:border-yellow-400 overflow-hidden"
                    onClick={() => bannerRef.current?.click()}>
                    {editing.bannerUrl ? <img src={editing.bannerUrl} className="w-full h-full object-cover" alt="" />
                      : uploadingBanner ? <Spinner /> : <ImagePlus className="h-6 w-6 text-gray-300" />}
                  </div>
                  <input ref={bannerRef} type="file" accept="image/*" className="hidden" onChange={async e => {
                    if (!e.target.files?.[0]) return
                    setUploadingBanner(true)
                    const url = await uploadApi.uploadImage(e.target.files[0])
                    setEditing(p => p ? { ...p, bannerUrl: url } : p)
                    setUploadingBanner(false)
                  }} />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-600 mb-1.5 block">Card Image (square)</label>
                  <div className="h-24 bg-gray-50 border-2 border-dashed border-gray-200 rounded-xl flex items-center justify-center cursor-pointer hover:border-yellow-400 overflow-hidden"
                    onClick={() => imgRef.current?.click()}>
                    {editing.imageUrl ? <img src={editing.imageUrl} className="w-full h-full object-cover" alt="" />
                      : uploadingImg ? <Spinner /> : <ImagePlus className="h-6 w-6 text-gray-300" />}
                  </div>
                  <input ref={imgRef} type="file" accept="image/*" className="hidden" onChange={async e => {
                    if (!e.target.files?.[0]) return
                    setUploadingImg(true)
                    const url = await uploadApi.uploadImage(e.target.files[0])
                    setEditing(p => p ? { ...p, imageUrl: url } : p)
                    setUploadingImg(false)
                  }} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-gray-600 mb-1 block">Collection Name *</label>
                  <input value={editing.name ?? ''} onChange={e => setEditing({ ...editing, name: e.target.value, slug: editing.id === 0 ? slugify(e.target.value) : editing.slug })}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-yellow-400" />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-600 mb-1 block">Slug *</label>
                  <input value={editing.slug ?? ''} onChange={e => setEditing({ ...editing, slug: slugify(e.target.value) })}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm font-mono focus:outline-none focus:border-yellow-400" placeholder="e.g. festive-favourites" />
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-gray-600 mb-1 block">Description</label>
                <textarea value={editing.description ?? ''} onChange={e => setEditing({ ...editing, description: e.target.value })} rows={3}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-yellow-400 resize-none" />
              </div>

              <hr className="border-gray-100" />
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">SEO</p>
              <div>
                <label className="text-xs font-medium text-gray-600 mb-1 block">SEO Title</label>
                <input value={editing.seoTitle ?? ''} onChange={e => setEditing({ ...editing, seoTitle: e.target.value })}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none" />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-600 mb-1 block">SEO Description</label>
                <textarea value={editing.seoDesc ?? ''} onChange={e => setEditing({ ...editing, seoDesc: e.target.value })} rows={2}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none resize-none" />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-xs font-medium text-gray-600 mb-1 block">Display Order</label>
                  <input type="number" value={editing.displayOrder ?? 0} onChange={e => setEditing({ ...editing, displayOrder: +e.target.value })}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none" />
                </div>
                <div className="col-span-2 flex flex-col justify-end pb-1">
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
              <button onClick={save} disabled={saving || !editing.name || !editing.slug}
                className="flex-1 bg-yellow-400 hover:bg-yellow-500 text-black font-semibold py-2.5 rounded-xl text-sm disabled:opacity-60 flex items-center justify-center gap-2">
                {saving ? <Spinner size="sm" /> : null} Save Collection
              </button>
              <button onClick={() => setEditing(null)} className="px-4 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-600">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
