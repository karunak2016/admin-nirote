import { useEffect, useState } from 'react'
import { Save, Check } from 'lucide-react'
import { settingsApi } from '../../api/settings'
import { Spinner } from '../../components/ui/Spinner'

const KEYS = [
  'contact_heading', 'contact_subheading', 'contact_email', 'contact_phone',
  'contact_whatsapp', 'contact_address', 'contact_hours', 'contact_mapUrl',
  'contact_formEnabled',
]

interface ContactState {
  heading: string; subheading: string; email: string; phone: string
  whatsapp: string; address: string; hours: string; mapUrl: string; formEnabled: string
}

const DEFAULTS: ContactState = {
  heading: 'Get In Touch', subheading: 'We\'d love to hear from you. Send us a message and we\'ll get back to you as soon as possible.',
  email: 'hello.nirote@gmail.com', phone: '', whatsapp: '',
  address: 'Niroté Jewellery, 123 Main Street, Mumbai, Maharashtra 400001, India',
  hours: 'Monday – Saturday: 10 AM – 7 PM\nSunday: Closed',
  mapUrl: '', formEnabled: 'true',
}

export function ContactPage() {
  const [state, setState] = useState<ContactState>(DEFAULTS)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    Promise.all(KEYS.map(k => settingsApi.get(k))).then(results => {
      const map: Record<string, string> = {}
      results.forEach((r, i) => { map[KEYS[i].replace('contact_', '')] = r.value })
      setState(prev => ({ ...prev, ...map as Partial<ContactState> }))
      setLoading(false)
    })
  }, [])

  async function save() {
    setSaving(true)
    try {
      await Promise.all([
        ...KEYS.map(k => settingsApi.set(k, state[k.replace('contact_', '') as keyof ContactState] ?? '')),
        // also keep WhatsappNumber in sync — used by the floating WhatsApp chat button
        settingsApi.set('WhatsappNumber', state.whatsapp),
      ])
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    } finally { setSaving(false) }
  }

  function F({ label, field, textarea = false, rows = 3 }: { label: string; field: keyof ContactState; textarea?: boolean; rows?: number }) {
    return (
      <div>
        <label className="text-xs font-medium text-gray-600 mb-1 block">{label}</label>
        {textarea
          ? <textarea value={state[field]} onChange={e => setState(p => ({ ...p, [field]: e.target.value }))} rows={rows}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-yellow-400 resize-none" />
          : <input value={state[field]} onChange={e => setState(p => ({ ...p, [field]: e.target.value }))}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-yellow-400" />
        }
      </div>
    )
  }

  if (loading) return <div className="p-8 flex justify-center"><Spinner /></div>

  return (
    <div className="p-6 max-w-3xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Contact Page</h1>
          <p className="text-sm text-gray-500">Edit all content on the Contact page.</p>
        </div>
        <button onClick={save} disabled={saving}
          className="flex items-center gap-2 bg-yellow-400 hover:bg-yellow-500 text-black font-semibold px-4 py-2 rounded-xl text-sm disabled:opacity-60">
          {saving ? <Spinner size="sm" /> : saved ? <Check className="h-4 w-4" /> : <Save className="h-4 w-4" />}
          {saved ? 'Saved!' : 'Save Page'}
        </button>
      </div>

      <div className="space-y-4">
        <div className="bg-white border border-gray-200 rounded-2xl p-5 space-y-4">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Page Header</p>
          <F label="Page Heading" field="heading" />
          <F label="Subheading / Description" field="subheading" textarea rows={2} />
        </div>

        <div className="bg-white border border-gray-200 rounded-2xl p-5 space-y-4">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Contact Details</p>
          <div className="grid grid-cols-2 gap-4">
            <F label="Email Address" field="email" />
            <F label="Phone Number" field="phone" />
            <F label="WhatsApp Number" field="whatsapp" />
          </div>
          <F label="Business Address" field="address" textarea rows={3} />
          <F label="Business Hours" field="hours" textarea rows={3} />
        </div>

        <div className="bg-white border border-gray-200 rounded-2xl p-5 space-y-4">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Map & Form</p>
          <F label="Google Maps Embed URL" field="mapUrl" />
          {state.mapUrl && (
            <p className="text-xs text-gray-500">Paste the full Google Maps embed URL from Share → Embed a map.</p>
          )}
          <div className="flex items-center gap-3">
            <label className="text-sm font-medium text-gray-700">Show Contact Form</label>
            <button onClick={() => setState(p => ({ ...p, formEnabled: p.formEnabled === 'true' ? 'false' : 'true' }))}
              className={`relative inline-flex h-6 w-11 rounded-full transition-colors ${state.formEnabled === 'true' ? 'bg-yellow-400' : 'bg-gray-200'}`}>
              <span className={`inline-block h-5 w-5 rounded-full bg-white shadow transition-transform mt-0.5 ${state.formEnabled === 'true' ? 'translate-x-5' : 'translate-x-0.5'}`} />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
