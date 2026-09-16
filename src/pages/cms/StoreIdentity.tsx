import { useEffect, useRef, useState } from 'react'
import { ImagePlus, X } from 'lucide-react'
import { settingsApi } from '../../api/settings'
import { uploadApi } from '../../api/upload'
import { Button } from '../../components/ui/Button'
import { Spinner } from '../../components/ui/Spinner'
import { validateImageSize } from '../../utils/imageValidation'

export function StoreIdentity() {
  const [loading, setLoading] = useState(true)
  const [siteName, setSiteName] = useState("Nirote'")
  const [logoUrl, setLogoUrl] = useState('')
  const [uploadingLogo, setUploadingLogo] = useState(false)
  const [announcementBar, setAnnouncementBar] = useState('Free shipping on orders above ₹999  |  Handcrafted artificial jewellery')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const logoRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const g = (key: string) => settingsApi.get(key).catch(() => ({ value: '' }))
    Promise.all([g('SiteName'), g('LogoUrl'), g('AnnouncementBar')]).then(([sName, logo, announcement]) => {
      const v = (x: any) => (x as any).value || ''
      if (v(sName)) setSiteName(v(sName))
      setLogoUrl(v(logo))
      if (v(announcement)) setAnnouncementBar(v(announcement))
    }).finally(() => setLoading(false))
  }, [])

  async function handleLogoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]; if (!file) return
    const err = validateImageSize(file); if (err) { alert(err); if (logoRef.current) logoRef.current.value = ''; return }
    setUploadingLogo(true)
    try { const url = await uploadApi.uploadImage(file); setLogoUrl(url); await settingsApi.set('LogoUrl', url) }
    finally { setUploadingLogo(false); if (logoRef.current) logoRef.current.value = '' }
  }

  async function handleRemoveLogo() {
    setLogoUrl(''); await settingsApi.set('LogoUrl', '')
  }

  async function handleSave() {
    setSaving(true); setSaved(false)
    try {
      await Promise.all([settingsApi.set('SiteName', siteName), settingsApi.set('AnnouncementBar', announcementBar)])
      setSaved(true); setTimeout(() => setSaved(false), 3000)
    } finally { setSaving(false) }
  }

  if (loading) return <div className="flex justify-center py-32"><Spinner size="lg" /></div>

  const card = 'rounded-xl border border-gray-200 bg-white p-6 space-y-5'
  const label = 'text-xs font-medium text-gray-600 block mb-1'
  const input = 'w-full rounded-md border border-gray-200 px-3 py-2 text-sm focus:border-primary-800 focus:outline-none'

  return (
    <div className="max-w-xl space-y-6">
      <p className="text-sm text-gray-500">Brand identity shown across the storefront — logo, name, and top bar message.</p>

      <div className={card}>
        <div>
          <label className={label}>Logo</label>
          {logoUrl ? (
            <div className="flex items-center gap-4">
              <img src={logoUrl} alt="Logo" className="h-12 w-auto max-w-[180px] rounded border border-gray-200 object-contain bg-gray-50 p-1" />
              <button onClick={handleRemoveLogo} className="flex items-center gap-1.5 text-xs text-red-500 hover:text-red-700">
                <X className="h-3.5 w-3.5" /> Remove logo
              </button>
            </div>
          ) : (
            <button onClick={() => logoRef.current?.click()} disabled={uploadingLogo}
              className="flex items-center gap-2 rounded-md border-2 border-dashed border-gray-200 px-5 py-4 text-sm text-gray-500 hover:border-primary-400 hover:text-primary-700 transition-colors disabled:opacity-60">
              {uploadingLogo ? <Spinner size="sm" /> : <ImagePlus className="h-4 w-4" />}
              {uploadingLogo ? 'Uploading…' : 'Upload logo image'}
            </button>
          )}
          <input ref={logoRef} type="file" accept="image/*" className="hidden" onChange={handleLogoChange} />
          <p className="mt-1.5 text-xs text-gray-400">PNG or SVG with transparent background recommended.</p>
        </div>

        <div>
          <label className={label}>Site Name</label>
          <input type="text" value={siteName} onChange={e => setSiteName(e.target.value)} placeholder="Niroté" className={input} />
        </div>

        <div>
          <label className={label}>Announcement Bar</label>
          <input type="text" value={announcementBar} onChange={e => setAnnouncementBar(e.target.value)}
            placeholder="Free shipping on orders above ₹999  |  Handcrafted jewellery" className={input} />
          <p className="mt-1 text-xs text-gray-400">Shown in the top bar across all pages. Clear to hide.</p>
        </div>

        <div className="flex items-center gap-3">
          <Button size="sm" loading={saving} onClick={handleSave}>Save</Button>
          {saved && <span className="text-xs text-green-600 font-medium">Saved!</span>}
        </div>
      </div>
    </div>
  )
}
