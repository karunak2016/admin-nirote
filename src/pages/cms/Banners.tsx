import { useEffect, useRef, useState } from 'react'
import { Plus, Pencil, Trash2, X, ImagePlus, Save } from 'lucide-react'
import { cmsBannersApi, type Banner } from '../../api/cms'
import { uploadApi } from '../../api/upload'
import { Spinner } from '../../components/ui/Spinner'

const EMPTY: Omit<Banner, 'id'> = {
  badge: '', heading: '', subheading: '', imageUrl: '', mobileImageUrl: '',
  textAlign: 'left', btn1Text: 'Shop Now', btn1Url: '/products',
  btn2Text: 'New Arrivals', btn2Url: '/products/sortBy/newest',
  isActive: true, scheduledStart: undefined, scheduledEnd: undefined,
  displayOrder: 0, priority: 0,
}

function toInput(dt?: string) { return dt ? dt.slice(0, 16) : '' }
function toIso(s: string) { return s ? new Date(s).toISOString() : undefined }

export function Banners() {
  const [banners, setBanners] = useState<Banner[]>([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState<(Partial<Banner> & { id: number }) | null>(null)
  const [saving, setSaving] = useState(false)
  const [uploadingDesk, setUploadingDesk] = useState(false)
  const [uploadingMob, setUploadingMob] = useState(false)
  const deskRef = useRef<HTMLInputElement>(null)
  const mobRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    cmsBannersApi.getAll().then(data => { setBanners(data); setLoading(false) })
  }, [])

  function openNew() { setEditing({ id: 0, ...EMPTY }) }
  function openEdit(b: Banner) { setEditing({ ...b }) }

  async function uploadImage(file: File, field: 'imageUrl' | 'mobileImageUrl') {
    const setter = field === 'imageUrl' ? setUploadingDesk : setUploadingMob
    setter(true)
    try {
      const url = await uploadApi.uploadImage(file)
      setEditing(prev => prev ? { ...prev, [field]: url } : prev)
    } finally { setter(false) }
  }

  async function save() {
    if (!editing || !editing.heading) return
    setSaving(true)
    try {
      const payload = {
        ...editing,
        scheduledStart: editing.scheduledStart ? toIso(editing.scheduledStart as string) : undefined,
        scheduledEnd: editing.scheduledEnd ? toIso(editing.scheduledEnd as string) : undefined,
      } as Banner & { id: number }
      const { id } = await cmsBannersApi.save(payload)
      if (editing.id === 0) {
        setBanners(prev => [...prev, { ...payload, id }])
      } else {
        setBanners(prev => prev.map(b => b.id === id ? { ...payload, id } : b))
      }
      setEditing(null)
    } finally { setSaving(false) }
  }

  async function deleteBanner(id: number) {
    if (!confirm('Delete this banner?')) return
    await cmsBannersApi.delete(id)
    setBanners(prev => prev.filter(b => b.id !== id))
  }

  if (loading) return <div className="p-8 flex justify-center"><Spinner /></div>

  return (
    <div className="p-6 max-w-5xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Banner Management</h1>
          <p className="text-sm text-gray-500">Schedule banners with desktop & mobile images and custom buttons.</p>
        </div>
        <button onClick={openNew} className="flex items-center gap-2 bg-yellow-400 hover:bg-yellow-500 text-black font-semibold px-4 py-2 rounded-xl text-sm">
          <Plus className="h-4 w-4" /> Add Banner
        </button>
      </div>

      <div className="grid gap-4">
        {banners.length === 0 && <p className="text-sm text-gray-400 py-8 text-center">No banners yet. Add your first banner.</p>}
        {banners.map(b => (
          <div key={b.id} className="bg-white border border-gray-200 rounded-xl overflow-hidden">
            <div className="flex gap-4">
              {b.imageUrl && (
                <img src={b.imageUrl} alt="" className="w-32 h-20 object-cover flex-shrink-0" />
              )}
              <div className="flex-1 p-4 flex flex-col justify-between min-w-0">
                <div>
                  {b.badge && <span className="text-[10px] font-semibold text-yellow-700 bg-yellow-50 px-2 py-0.5 rounded-full mr-2">{b.badge}</span>}
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${b.isActive ? 'text-green-700 bg-green-50' : 'text-gray-500 bg-gray-100'}`}>
                    {b.isActive ? 'Active' : 'Inactive'}
                  </span>
                  <p className="text-sm font-semibold text-gray-900 mt-1 truncate">{b.heading}</p>
                  {b.subheading && <p className="text-xs text-gray-500 truncate">{b.subheading}</p>}
                  {(b.scheduledStart || b.scheduledEnd) && (
                    <p className="text-[10px] text-blue-500 mt-1">
                      {b.scheduledStart && `From ${new Date(b.scheduledStart).toLocaleDateString('en-IN')}`}
                      {b.scheduledEnd && ` → ${new Date(b.scheduledEnd).toLocaleDateString('en-IN')}`}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-[10px] text-gray-400">Priority: {b.priority}</span>
                  <span className="text-[10px] text-gray-400">· Order: {b.displayOrder}</span>
                </div>
              </div>
              <div className="flex flex-col gap-1 p-3 flex-shrink-0">
                <button onClick={() => openEdit(b)} className="p-2 hover:bg-gray-100 rounded-lg"><Pencil className="h-4 w-4 text-gray-500" /></button>
                <button onClick={() => deleteBanner(b.id)} className="p-2 hover:bg-red-50 rounded-lg"><Trash2 className="h-4 w-4 text-red-400" /></button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {editing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex items-center justify-between p-5 border-b border-gray-100">
              <h2 className="font-bold text-gray-900">{editing.id === 0 ? 'Add Banner' : 'Edit Banner'}</h2>
              <button onClick={() => setEditing(null)}><X className="h-5 w-5 text-gray-400" /></button>
            </div>
            <div className="p-5 space-y-4">
              {/* Images */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-medium text-gray-600 mb-1.5 block">Desktop Image</label>
                  <div className="relative h-24 bg-gray-50 border-2 border-dashed border-gray-200 rounded-xl flex items-center justify-center cursor-pointer hover:border-yellow-400 overflow-hidden"
                    onClick={() => deskRef.current?.click()}>
                    {editing.imageUrl
                      ? <img src={editing.imageUrl} className="w-full h-full object-cover" alt="" />
                      : uploadingDesk ? <Spinner /> : <ImagePlus className="h-6 w-6 text-gray-300" />}
                  </div>
                  <input ref={deskRef} type="file" accept="image/*" className="hidden" onChange={e => e.target.files?.[0] && uploadImage(e.target.files[0], 'imageUrl')} />
                  {editing.imageUrl && (
                    <input value={editing.imageUrl} onChange={e => setEditing({ ...editing, imageUrl: e.target.value })}
                      className="mt-1 w-full text-[11px] border border-gray-200 rounded px-2 py-1 focus:outline-none" placeholder="Or paste URL" />
                  )}
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-600 mb-1.5 block">Mobile Image</label>
                  <div className="relative h-24 bg-gray-50 border-2 border-dashed border-gray-200 rounded-xl flex items-center justify-center cursor-pointer hover:border-yellow-400 overflow-hidden"
                    onClick={() => mobRef.current?.click()}>
                    {editing.mobileImageUrl
                      ? <img src={editing.mobileImageUrl} className="w-full h-full object-cover" alt="" />
                      : uploadingMob ? <Spinner /> : <ImagePlus className="h-6 w-6 text-gray-300" />}
                  </div>
                  <input ref={mobRef} type="file" accept="image/*" className="hidden" onChange={e => e.target.files?.[0] && uploadImage(e.target.files[0], 'mobileImageUrl')} />
                </div>
              </div>

              {/* Text fields */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-gray-600 mb-1 block">Badge Text</label>
                  <input value={editing.badge ?? ''} onChange={e => setEditing({ ...editing, badge: e.target.value })}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-yellow-400" placeholder="e.g. New Collection 2026" />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-600 mb-1 block">Text Align</label>
                  <select value={editing.textAlign ?? 'left'} onChange={e => setEditing({ ...editing, textAlign: e.target.value })}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none">
                    <option value="left">Left</option>
                    <option value="center">Center</option>
                    <option value="right">Right</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-600 mb-1 block">Heading *</label>
                <input value={editing.heading ?? ''} onChange={e => setEditing({ ...editing, heading: e.target.value })}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-yellow-400" placeholder="Main heading" />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-600 mb-1 block">Subheading</label>
                <textarea value={editing.subheading ?? ''} onChange={e => setEditing({ ...editing, subheading: e.target.value })} rows={2}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-yellow-400 resize-none" placeholder="Subheading text" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-gray-600 mb-1 block">Button 1 Text</label>
                  <input value={editing.btn1Text ?? ''} onChange={e => setEditing({ ...editing, btn1Text: e.target.value })}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none" />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-600 mb-1 block">Button 1 URL</label>
                  <input value={editing.btn1Url ?? ''} onChange={e => setEditing({ ...editing, btn1Url: e.target.value })}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none" />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-600 mb-1 block">Button 2 Text</label>
                  <input value={editing.btn2Text ?? ''} onChange={e => setEditing({ ...editing, btn2Text: e.target.value })}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none" />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-600 mb-1 block">Button 2 URL</label>
                  <input value={editing.btn2Url ?? ''} onChange={e => setEditing({ ...editing, btn2Url: e.target.value })}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none" />
                </div>
              </div>

              {/* Schedule */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-gray-600 mb-1 block">Schedule Start</label>
                  <input type="datetime-local" value={toInput(editing.scheduledStart as string)}
                    onChange={e => setEditing({ ...editing, scheduledStart: e.target.value })}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none" />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-600 mb-1 block">Schedule End</label>
                  <input type="datetime-local" value={toInput(editing.scheduledEnd as string)}
                    onChange={e => setEditing({ ...editing, scheduledEnd: e.target.value })}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none" />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-xs font-medium text-gray-600 mb-1 block">Display Order</label>
                  <input type="number" value={editing.displayOrder ?? 0} onChange={e => setEditing({ ...editing, displayOrder: +e.target.value })}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none" />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-600 mb-1 block">Priority</label>
                  <input type="number" value={editing.priority ?? 0} onChange={e => setEditing({ ...editing, priority: +e.target.value })}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none" />
                </div>
                <div className="flex flex-col justify-end">
                  <div className="flex items-center gap-2 pb-2">
                    <label className="text-sm font-medium text-gray-700">Active</label>
                    <button onClick={() => setEditing({ ...editing, isActive: !editing.isActive })}
                      className={`relative inline-flex h-6 w-11 rounded-full transition-colors ${editing.isActive ? 'bg-yellow-400' : 'bg-gray-200'}`}>
                      <span className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform mt-0.5 ${editing.isActive ? 'translate-x-5' : 'translate-x-0.5'}`} />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-2 p-5 border-t border-gray-100">
              <button onClick={save} disabled={saving || !editing.heading}
                className="flex-1 bg-yellow-400 hover:bg-yellow-500 text-black font-semibold py-2.5 rounded-xl text-sm flex items-center justify-center gap-2 disabled:opacity-60">
                {saving ? <Spinner size="sm" /> : <Save className="h-4 w-4" />} Save Banner
              </button>
              <button onClick={() => setEditing(null)} className="px-4 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-600 hover:bg-gray-50">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
