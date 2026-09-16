import { useEffect, useState } from 'react'
import { Save, Check, Plus, Trash2 } from 'lucide-react'
import { settingsApi } from '../../api/settings'
import { Spinner } from '../../components/ui/Spinner'

interface QuickLink { label: string; url: string }
interface SocialLink { platform: string; url: string }

interface FooterState {
  description: string
  quickLinks: QuickLink[]
  socialLinks: SocialLink[]
  copyright: string
  tagline: string
  showPaymentIcons: string
}

const DEFAULTS: FooterState = {
  description: "Premium handcrafted artificial jewellery for the modern Indian woman.",
  quickLinks: [
    { label: 'Shop All', url: '/products' },
    { label: 'New Arrivals', url: '/products/sortBy/newest' },
    { label: 'Collections', url: '/collections' },
    { label: 'About Us', url: '/about' },
    { label: 'Contact', url: '/contact' },
  ],
  socialLinks: [
    { platform: 'Instagram', url: '' },
    { platform: 'Facebook', url: '' },
  ],
  copyright: '© 2026 NIROTÉ. All rights reserved.',
  tagline: 'Made with ❤ in India',
  showPaymentIcons: 'true',
}

export function FooterSettings() {
  const [state, setState] = useState<FooterState>(DEFAULTS)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    Promise.all([
      settingsApi.get('footer_description'),
      settingsApi.get('footer_quickLinks'),
      settingsApi.get('footer_socialLinks'),
      settingsApi.get('footer_copyright'),
      settingsApi.get('footer_tagline'),
      settingsApi.get('footer_showPaymentIcons'),
    ]).then(([desc, ql, sl, copy, tag, pay]) => {
      setState({
        description: desc.value || DEFAULTS.description,
        quickLinks: ql.value ? JSON.parse(ql.value) : DEFAULTS.quickLinks,
        socialLinks: sl.value ? JSON.parse(sl.value) : DEFAULTS.socialLinks,
        copyright: copy.value || DEFAULTS.copyright,
        tagline: tag.value || DEFAULTS.tagline,
        showPaymentIcons: pay.value || 'true',
      })
      setLoading(false)
    })
  }, [])

  async function save() {
    setSaving(true)
    try {
      await Promise.all([
        settingsApi.set('footer_description', state.description),
        settingsApi.set('footer_quickLinks', JSON.stringify(state.quickLinks)),
        settingsApi.set('footer_socialLinks', JSON.stringify(state.socialLinks)),
        settingsApi.set('footer_copyright', state.copyright),
        settingsApi.set('footer_tagline', state.tagline),
        settingsApi.set('footer_showPaymentIcons', state.showPaymentIcons),
      ])
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    } finally { setSaving(false) }
  }

  if (loading) return <div className="p-8 flex justify-center"><Spinner /></div>

  return (
    <div className="p-6 max-w-3xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Footer Settings</h1>
          <p className="text-sm text-gray-500">Edit the store footer content.</p>
        </div>
        <button onClick={save} disabled={saving}
          className="flex items-center gap-2 bg-yellow-400 hover:bg-yellow-500 text-black font-semibold px-4 py-2 rounded-xl text-sm disabled:opacity-60">
          {saving ? <Spinner size="sm" /> : saved ? <Check className="h-4 w-4" /> : <Save className="h-4 w-4" />}
          {saved ? 'Saved!' : 'Save Footer'}
        </button>
      </div>

      <div className="space-y-4">
        {/* Brand */}
        <div className="bg-white border border-gray-200 rounded-2xl p-5 space-y-4">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Brand Description</p>
          <textarea value={state.description} onChange={e => setState(p => ({ ...p, description: e.target.value }))} rows={3}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-yellow-400 resize-none" />
        </div>

        {/* Quick Links */}
        <div className="bg-white border border-gray-200 rounded-2xl p-5 space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Quick Links</p>
            <button onClick={() => setState(p => ({ ...p, quickLinks: [...p.quickLinks, { label: '', url: '' }] }))}
              className="flex items-center gap-1 text-xs text-yellow-600 hover:text-yellow-700 font-semibold">
              <Plus className="h-3.5 w-3.5" /> Add Link
            </button>
          </div>
          {state.quickLinks.map((link, idx) => (
            <div key={idx} className="flex gap-2">
              <input value={link.label} onChange={e => setState(p => ({ ...p, quickLinks: p.quickLinks.map((l, i) => i === idx ? { ...l, label: e.target.value } : l) }))}
                className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-yellow-400" placeholder="Label" />
              <input value={link.url} onChange={e => setState(p => ({ ...p, quickLinks: p.quickLinks.map((l, i) => i === idx ? { ...l, url: e.target.value } : l) }))}
                className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-yellow-400" placeholder="/url" />
              <button onClick={() => setState(p => ({ ...p, quickLinks: p.quickLinks.filter((_, i) => i !== idx) }))}
                className="p-2 hover:bg-red-50 rounded-lg"><Trash2 className="h-4 w-4 text-red-400" /></button>
            </div>
          ))}
        </div>

        {/* Social Links */}
        <div className="bg-white border border-gray-200 rounded-2xl p-5 space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Social Media Links</p>
            <button onClick={() => setState(p => ({ ...p, socialLinks: [...p.socialLinks, { platform: 'Twitter', url: '' }] }))}
              className="flex items-center gap-1 text-xs text-yellow-600 hover:text-yellow-700 font-semibold">
              <Plus className="h-3.5 w-3.5" /> Add Social
            </button>
          </div>
          {state.socialLinks.map((social, idx) => (
            <div key={idx} className="flex gap-2">
              <select value={social.platform} onChange={e => setState(p => ({ ...p, socialLinks: p.socialLinks.map((s, i) => i === idx ? { ...s, platform: e.target.value } : s) }))}
                className="w-32 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none flex-shrink-0">
                {['Instagram', 'Facebook', 'Twitter', 'Pinterest', 'YouTube', 'WhatsApp'].map(pl => <option key={pl}>{pl}</option>)}
              </select>
              <input value={social.url} onChange={e => setState(p => ({ ...p, socialLinks: p.socialLinks.map((s, i) => i === idx ? { ...s, url: e.target.value } : s) }))}
                className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-yellow-400" placeholder="https://..." />
              <button onClick={() => setState(p => ({ ...p, socialLinks: p.socialLinks.filter((_, i) => i !== idx) }))}
                className="p-2 hover:bg-red-50 rounded-lg"><Trash2 className="h-4 w-4 text-red-400" /></button>
            </div>
          ))}
        </div>

        {/* Copyright & Settings */}
        <div className="bg-white border border-gray-200 rounded-2xl p-5 space-y-4">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Copyright & Settings</p>
          <div>
            <label className="text-xs font-medium text-gray-600 mb-1 block">Copyright Text</label>
            <input value={state.copyright} onChange={e => setState(p => ({ ...p, copyright: e.target.value }))}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-yellow-400" />
          </div>
          <div>
            <label className="text-xs font-medium text-gray-600 mb-1 block">Bottom Tagline</label>
            <input value={state.tagline} onChange={e => setState(p => ({ ...p, tagline: e.target.value }))}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-yellow-400"
              placeholder="Made with ❤ in India" />
            <p className="mt-1 text-xs text-gray-400">Shown bottom-right of the footer bar.</p>
          </div>
          <div className="flex items-center gap-3">
            <label className="text-sm font-medium text-gray-700">Show Payment Method Icons</label>
            <button onClick={() => setState(p => ({ ...p, showPaymentIcons: p.showPaymentIcons === 'true' ? 'false' : 'true' }))}
              className={`relative inline-flex h-6 w-11 rounded-full transition-colors ${state.showPaymentIcons === 'true' ? 'bg-yellow-400' : 'bg-gray-200'}`}>
              <span className={`inline-block h-5 w-5 rounded-full bg-white shadow transition-transform mt-0.5 ${state.showPaymentIcons === 'true' ? 'translate-x-5' : 'translate-x-0.5'}`} />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
