import { useEffect, useRef, useState } from 'react'
import { Save, Check, ImagePlus } from 'lucide-react'
import { settingsApi } from '../../api/settings'
import { uploadApi } from '../../api/upload'
import { Spinner } from '../../components/ui/Spinner'

const FONTS = [
  'Inter', 'Playfair Display', 'Cormorant Garamond', 'Libre Baskerville',
  'Raleway', 'Montserrat', 'DM Serif Display', 'Lora',
]
const BTN_STYLES = [
  { value: '9999px', label: 'Pill (rounded-full)' },
  { value: '12px', label: 'Rounded' },
  { value: '8px', label: 'Slightly Rounded' },
  { value: '0px', label: 'Square' },
]

interface ThemeState {
  primaryColor: string; secondaryColor: string; bgColor: string; textColor: string
  btnRadius: string; font: string; logoUrl: string; faviconUrl: string
}

const DEFAULTS: ThemeState = {
  primaryColor: '#C9A227', secondaryColor: '#6A6A6A', bgColor: '#FAF8F4',
  textColor: '#1A1A1A', btnRadius: '9999px', font: 'Inter', logoUrl: '', faviconUrl: '',
}

export function Theme() {
  const [theme, setTheme] = useState<ThemeState>(DEFAULTS)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const logoRef = useRef<HTMLInputElement>(null)
  const favRef = useRef<HTMLInputElement>(null)
  const [uploadingLogo, setUploadingLogo] = useState(false)
  const [uploadingFav, setUploadingFav] = useState(false)

  useEffect(() => {
    Promise.all([
      settingsApi.get('theme_primaryColor'),
      settingsApi.get('theme_secondaryColor'),
      settingsApi.get('theme_bgColor'),
      settingsApi.get('theme_textColor'),
      settingsApi.get('theme_btnRadius'),
      settingsApi.get('theme_font'),
      settingsApi.get('theme_logoUrl'),
      settingsApi.get('theme_faviconUrl'),
    ]).then(([pc, sc, bg, tc, br, font, logo, fav]) => {
      setTheme({
        primaryColor: pc.value || DEFAULTS.primaryColor,
        secondaryColor: sc.value || DEFAULTS.secondaryColor,
        bgColor: bg.value || DEFAULTS.bgColor,
        textColor: tc.value || DEFAULTS.textColor,
        btnRadius: br.value || DEFAULTS.btnRadius,
        font: font.value || DEFAULTS.font,
        logoUrl: logo.value || '',
        faviconUrl: fav.value || '',
      })
      setLoading(false)
    })
  }, [])

  async function save() {
    setSaving(true)
    try {
      await Promise.all([
        settingsApi.set('theme_primaryColor', theme.primaryColor),
        settingsApi.set('theme_secondaryColor', theme.secondaryColor),
        settingsApi.set('theme_bgColor', theme.bgColor),
        settingsApi.set('theme_textColor', theme.textColor),
        settingsApi.set('theme_btnRadius', theme.btnRadius),
        settingsApi.set('theme_font', theme.font),
        settingsApi.set('theme_logoUrl', theme.logoUrl),
        settingsApi.set('theme_faviconUrl', theme.faviconUrl),
      ])
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    } finally { setSaving(false) }
  }

  if (loading) return <div className="p-8 flex justify-center"><Spinner /></div>

  function Field({ label, children }: { label: string; children: React.ReactNode }) {
    return (
      <div>
        <label className="text-xs font-medium text-gray-600 mb-1.5 block">{label}</label>
        {children}
      </div>
    )
  }

  return (
    <div className="p-6 max-w-3xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Theme Settings</h1>
          <p className="text-sm text-gray-500">Customize the storefront's visual identity.</p>
        </div>
        <button onClick={save} disabled={saving}
          className="flex items-center gap-2 bg-yellow-400 hover:bg-yellow-500 text-black font-semibold px-4 py-2 rounded-xl text-sm disabled:opacity-60">
          {saving ? <Spinner size="sm" /> : saved ? <Check className="h-4 w-4" /> : <Save className="h-4 w-4" />}
          {saved ? 'Saved!' : 'Save Theme'}
        </button>
      </div>

      {/* Preview */}
      <div className="rounded-2xl border border-gray-200 p-5 mb-6" style={{ background: theme.bgColor }}>
        <p className="text-xs font-semibold mb-3" style={{ color: theme.secondaryColor }}>Live Preview</p>
        <p className="text-2xl font-bold mb-1" style={{ color: theme.textColor, fontFamily: theme.font }}>Premium Jewellery</p>
        <p className="text-sm mb-4" style={{ color: theme.secondaryColor }}>Handcrafted with love</p>
        <button className="px-5 py-2 text-sm font-semibold text-black"
          style={{ background: theme.primaryColor, borderRadius: theme.btnRadius }}>
          Shop Now
        </button>
      </div>

      <div className="bg-white border border-gray-200 rounded-2xl p-6 space-y-5">
        {/* Colours */}
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Colours</p>
        <div className="grid grid-cols-2 gap-4">
          <Field label="Primary (Gold) Colour">
            <div className="flex gap-2">
              <input type="color" value={theme.primaryColor} onChange={e => setTheme(p => ({ ...p, primaryColor: e.target.value }))}
                className="h-10 w-12 rounded-lg border border-gray-200 cursor-pointer p-0.5" />
              <input value={theme.primaryColor} onChange={e => setTheme(p => ({ ...p, primaryColor: e.target.value }))}
                className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm font-mono focus:outline-none focus:border-yellow-400" />
            </div>
          </Field>
          <Field label="Secondary Text Colour">
            <div className="flex gap-2">
              <input type="color" value={theme.secondaryColor} onChange={e => setTheme(p => ({ ...p, secondaryColor: e.target.value }))}
                className="h-10 w-12 rounded-lg border border-gray-200 cursor-pointer p-0.5" />
              <input value={theme.secondaryColor} onChange={e => setTheme(p => ({ ...p, secondaryColor: e.target.value }))}
                className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm font-mono focus:outline-none" />
            </div>
          </Field>
          <Field label="Background Colour">
            <div className="flex gap-2">
              <input type="color" value={theme.bgColor} onChange={e => setTheme(p => ({ ...p, bgColor: e.target.value }))}
                className="h-10 w-12 rounded-lg border border-gray-200 cursor-pointer p-0.5" />
              <input value={theme.bgColor} onChange={e => setTheme(p => ({ ...p, bgColor: e.target.value }))}
                className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm font-mono focus:outline-none" />
            </div>
          </Field>
          <Field label="Heading / Body Text Colour">
            <div className="flex gap-2">
              <input type="color" value={theme.textColor} onChange={e => setTheme(p => ({ ...p, textColor: e.target.value }))}
                className="h-10 w-12 rounded-lg border border-gray-200 cursor-pointer p-0.5" />
              <input value={theme.textColor} onChange={e => setTheme(p => ({ ...p, textColor: e.target.value }))}
                className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm font-mono focus:outline-none" />
            </div>
          </Field>
        </div>

        <hr className="border-gray-100" />

        {/* Typography & Buttons */}
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Typography & Buttons</p>
        <div className="grid grid-cols-2 gap-4">
          <Field label="Font Family">
            <select value={theme.font} onChange={e => setTheme(p => ({ ...p, font: e.target.value }))}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none">
              {FONTS.map(f => <option key={f} value={f}>{f}</option>)}
            </select>
          </Field>
          <Field label="Button Style">
            <select value={theme.btnRadius} onChange={e => setTheme(p => ({ ...p, btnRadius: e.target.value }))}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none">
              {BTN_STYLES.map(b => <option key={b.value} value={b.value}>{b.label}</option>)}
            </select>
          </Field>
        </div>

        <hr className="border-gray-100" />

        {/* Logo & Favicon */}
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Branding</p>
        <div className="grid grid-cols-2 gap-4">
          <Field label="Logo">
            <div className="h-20 bg-gray-50 border-2 border-dashed border-gray-200 rounded-xl flex items-center justify-center cursor-pointer hover:border-yellow-400 overflow-hidden"
              onClick={() => logoRef.current?.click()}>
              {theme.logoUrl
                ? <img src={theme.logoUrl} alt="Logo" className="max-h-full max-w-full object-contain p-2" />
                : uploadingLogo ? <Spinner /> : <div className="text-center"><ImagePlus className="h-6 w-6 text-gray-300 mx-auto" /><p className="text-xs text-gray-400 mt-1">Upload Logo</p></div>}
            </div>
            <input ref={logoRef} type="file" accept="image/*" className="hidden" onChange={async e => {
              if (!e.target.files?.[0]) return
              setUploadingLogo(true)
              const url = await uploadApi.uploadImage(e.target.files[0])
              setTheme(p => ({ ...p, logoUrl: url }))
              setUploadingLogo(false)
            }} />
          </Field>
          <Field label="Favicon">
            <div className="h-20 bg-gray-50 border-2 border-dashed border-gray-200 rounded-xl flex items-center justify-center cursor-pointer hover:border-yellow-400 overflow-hidden"
              onClick={() => favRef.current?.click()}>
              {theme.faviconUrl
                ? <img src={theme.faviconUrl} alt="Favicon" className="max-h-full max-w-full object-contain p-2" />
                : uploadingFav ? <Spinner /> : <div className="text-center"><ImagePlus className="h-6 w-6 text-gray-300 mx-auto" /><p className="text-xs text-gray-400 mt-1">Upload Favicon</p></div>}
            </div>
            <input ref={favRef} type="file" accept="image/*" className="hidden" onChange={async e => {
              if (!e.target.files?.[0]) return
              setUploadingFav(true)
              const url = await uploadApi.uploadImage(e.target.files[0])
              setTheme(p => ({ ...p, faviconUrl: url }))
              setUploadingFav(false)
            }} />
          </Field>
        </div>
      </div>
    </div>
  )
}
