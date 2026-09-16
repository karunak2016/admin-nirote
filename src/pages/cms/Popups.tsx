import { useEffect, useRef, useState } from 'react'
import { Save, Check, ImagePlus } from 'lucide-react'
import { cmsPopupsApi, type Popup } from '../../api/cms'
import { uploadApi } from '../../api/upload'
import { Spinner } from '../../components/ui/Spinner'

const POPUP_META = [
  { type: 'newsletter', label: 'Newsletter Popup', desc: 'Shown to visitors to collect emails' },
  { type: 'offer', label: 'Offer / Coupon Popup', desc: 'Promotional popup with coupon code' },
  { type: 'festival', label: 'Festival Sale Popup', desc: 'Seasonal / festival offers' },
  { type: 'exit-intent', label: 'Exit Intent Popup', desc: 'Shown when user is about to leave' },
]

export function Popups() {
  const [popups, setPopups] = useState<Popup[]>([])
  const [loading, setLoading] = useState(true)
  const [activeType, setActiveType] = useState('newsletter')
  const [form, setForm] = useState<Omit<Popup, 'id' | 'popupType' | 'updatedAt'>>({
    heading: '', subheading: '', imageUrl: '', buttonText: '', buttonUrl: '', couponCode: '', isEnabled: false, triggerDelay: 5,
  })
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [uploading, setUploading] = useState(false)
  const imgRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    cmsPopupsApi.getAll().then(data => { setPopups(data); setLoading(false) })
  }, [])

  useEffect(() => {
    const popup = popups.find(p => p.popupType === activeType)
    if (popup) {
      setForm({
        heading: popup.heading ?? '', subheading: popup.subheading ?? '', imageUrl: popup.imageUrl ?? '',
        buttonText: popup.buttonText ?? '', buttonUrl: popup.buttonUrl ?? '', couponCode: popup.couponCode ?? '',
        isEnabled: popup.isEnabled, triggerDelay: popup.triggerDelay,
      })
    } else {
      setForm({ heading: '', subheading: '', imageUrl: '', buttonText: '', buttonUrl: '', couponCode: '', isEnabled: false, triggerDelay: 5 })
    }
  }, [activeType, popups])

  async function save() {
    setSaving(true)
    try {
      await cmsPopupsApi.save(activeType, form)
      setPopups(prev => {
        const exists = prev.find(p => p.popupType === activeType)
        if (exists) return prev.map(p => p.popupType === activeType ? { ...p, ...form } : p)
        return [...prev, { id: 0, popupType: activeType, ...form }]
      })
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    } finally { setSaving(false) }
  }

  if (loading) return <div className="p-8 flex justify-center"><Spinner /></div>

  const meta = POPUP_META.find(m => m.type === activeType)!

  return (
    <div className="p-6 max-w-3xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Popup Management</h1>
          <p className="text-sm text-gray-500">Configure popups shown on the storefront.</p>
        </div>
        <button onClick={save} disabled={saving}
          className="flex items-center gap-2 bg-yellow-400 hover:bg-yellow-500 text-black font-semibold px-4 py-2 rounded-xl text-sm disabled:opacity-60">
          {saving ? <Spinner size="sm" /> : saved ? <Check className="h-4 w-4" /> : <Save className="h-4 w-4" />}
          {saved ? 'Saved!' : 'Save Popup'}
        </button>
      </div>

      {/* Type selector */}
      <div className="grid grid-cols-2 gap-2 mb-6">
        {POPUP_META.map(pm => {
          const popup = popups.find(p => p.popupType === pm.type)
          return (
            <button key={pm.type} onClick={() => setActiveType(pm.type)}
              className={`text-left p-3 rounded-xl border transition-colors ${activeType === pm.type ? 'border-yellow-400 bg-yellow-50' : 'border-gray-200 bg-white hover:border-gray-300'}`}>
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-gray-800">{pm.label}</p>
                <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${popup?.isEnabled ? 'bg-green-50 text-green-600' : 'bg-gray-100 text-gray-400'}`}>
                  {popup?.isEnabled ? 'On' : 'Off'}
                </span>
              </div>
              <p className="text-xs text-gray-500 mt-0.5">{pm.desc}</p>
            </button>
          )
        })}
      </div>

      <div className="bg-white border border-gray-200 rounded-2xl p-5 space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-semibold text-gray-900">{meta.label}</p>
            <p className="text-xs text-gray-500">{meta.desc}</p>
          </div>
          <div className="flex items-center gap-2">
            <label className="text-sm text-gray-700">Enable</label>
            <button onClick={() => setForm(p => ({ ...p, isEnabled: !p.isEnabled }))}
              className={`relative inline-flex h-6 w-11 rounded-full transition-colors ${form.isEnabled ? 'bg-yellow-400' : 'bg-gray-200'}`}>
              <span className={`inline-block h-5 w-5 rounded-full bg-white shadow transition-transform mt-0.5 ${form.isEnabled ? 'translate-x-5' : 'translate-x-0.5'}`} />
            </button>
          </div>
        </div>

        {/* Image */}
        <div>
          <label className="text-xs font-medium text-gray-600 mb-1.5 block">Popup Image (optional)</label>
          <div className="flex gap-3">
            <div className="h-20 w-28 bg-gray-50 border-2 border-dashed border-gray-200 rounded-xl flex items-center justify-center cursor-pointer hover:border-yellow-400 overflow-hidden flex-shrink-0"
              onClick={() => imgRef.current?.click()}>
              {form.imageUrl ? <img src={form.imageUrl} className="w-full h-full object-cover" alt="" />
                : uploading ? <Spinner /> : <ImagePlus className="h-5 w-5 text-gray-300" />}
            </div>
            <input ref={imgRef} type="file" accept="image/*" className="hidden" onChange={async e => {
              if (!e.target.files?.[0]) return
              setUploading(true)
              const url = await uploadApi.uploadImage(e.target.files[0])
              setForm(p => ({ ...p, imageUrl: url }))
              setUploading(false)
            }} />
            <input value={form.imageUrl ?? ''} onChange={e => setForm(p => ({ ...p, imageUrl: e.target.value }))}
              className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none"
              placeholder="Or paste image URL" />
          </div>
        </div>

        <div>
          <label className="text-xs font-medium text-gray-600 mb-1 block">Heading</label>
          <input value={form.heading ?? ''} onChange={e => setForm(p => ({ ...p, heading: e.target.value }))}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-yellow-400" placeholder="Popup heading" />
        </div>
        <div>
          <label className="text-xs font-medium text-gray-600 mb-1 block">Subheading</label>
          <textarea value={form.subheading ?? ''} onChange={e => setForm(p => ({ ...p, subheading: e.target.value }))} rows={2}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-yellow-400 resize-none" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-medium text-gray-600 mb-1 block">Button Text</label>
            <input value={form.buttonText ?? ''} onChange={e => setForm(p => ({ ...p, buttonText: e.target.value }))}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none" />
          </div>
          <div>
            <label className="text-xs font-medium text-gray-600 mb-1 block">Button URL</label>
            <input value={form.buttonUrl ?? ''} onChange={e => setForm(p => ({ ...p, buttonUrl: e.target.value }))}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none" placeholder="/products" />
          </div>
          <div>
            <label className="text-xs font-medium text-gray-600 mb-1 block">Coupon Code</label>
            <input value={form.couponCode ?? ''} onChange={e => setForm(p => ({ ...p, couponCode: e.target.value }))}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm font-mono focus:outline-none" placeholder="e.g. SAVE20" />
          </div>
          <div>
            <label className="text-xs font-medium text-gray-600 mb-1 block">Trigger Delay (seconds)</label>
            <input type="number" min={0} value={form.triggerDelay ?? 5} onChange={e => setForm(p => ({ ...p, triggerDelay: +e.target.value }))}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none" />
          </div>
        </div>
      </div>
    </div>
  )
}
