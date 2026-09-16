import { useEffect, useState } from 'react'
import { Save, Check } from 'lucide-react'
import { cmsSeoApi, type SeoPage } from '../../api/cms'
import { Spinner } from '../../components/ui/Spinner'

const PAGE_KEYS = [
  { key: 'home', label: 'Homepage' },
  { key: 'products', label: 'Products / Shop' },
  { key: 'about', label: 'About Us' },
  { key: 'contact', label: 'Contact' },
  { key: 'faq', label: 'FAQ' },
  { key: 'collections', label: 'Collections' },
  { key: 'shipping', label: 'Shipping Policy' },
  { key: 'returns', label: 'Returns Policy' },
  { key: 'privacy', label: 'Privacy Policy' },
  { key: 'terms', label: 'Terms & Conditions' },
]

export function SeoSettings() {
  const [all, setAll] = useState<Record<string, SeoPage>>({})
  const [activeKey, setActiveKey] = useState('home')
  const [form, setForm] = useState<Omit<SeoPage, 'id' | 'pageKey' | 'updatedAt'>>({ metaTitle: '', metaDesc: '', keywords: '', ogImage: '' })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    cmsSeoApi.getAll().then(pages => {
      const map: Record<string, SeoPage> = {}
      pages.forEach(p => { map[p.pageKey] = p })
      setAll(map)
      setLoading(false)
    })
  }, [])

  useEffect(() => {
    const page = all[activeKey]
    setForm({
      metaTitle: page?.metaTitle ?? '',
      metaDesc: page?.metaDesc ?? '',
      keywords: page?.keywords ?? '',
      ogImage: page?.ogImage ?? '',
    })
  }, [activeKey, all])

  async function save() {
    setSaving(true)
    try {
      await cmsSeoApi.save(activeKey, form)
      setAll(prev => ({ ...prev, [activeKey]: { ...prev[activeKey], pageKey: activeKey, ...form } }))
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    } finally { setSaving(false) }
  }

  if (loading) return <div className="p-8 flex justify-center"><Spinner /></div>

  const pct = Math.min(100, Math.round((form.metaDesc?.length ?? 0) / 1.6))
  const titlePct = Math.min(100, Math.round((form.metaTitle?.length ?? 0) / 0.6))

  return (
    <div className="p-6 max-w-4xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-gray-900">SEO Settings</h1>
          <p className="text-sm text-gray-500">Manage meta title, description, keywords, and OG image per page.</p>
        </div>
        <button onClick={save} disabled={saving}
          className="flex items-center gap-2 bg-yellow-400 hover:bg-yellow-500 text-black font-semibold px-4 py-2 rounded-xl text-sm disabled:opacity-60">
          {saving ? <Spinner size="sm" /> : saved ? <Check className="h-4 w-4" /> : <Save className="h-4 w-4" />}
          {saved ? 'Saved!' : 'Save SEO'}
        </button>
      </div>

      <div className="flex gap-2 mb-6 flex-wrap">
        {PAGE_KEYS.map(p => (
          <button key={p.key} onClick={() => setActiveKey(p.key)}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-colors ${activeKey === p.key ? 'bg-gray-900 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:border-gray-300'}`}>
            {p.label}
          </button>
        ))}
      </div>

      {/* Preview snippet */}
      <div className="bg-white border border-gray-200 rounded-xl p-4 mb-4">
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Google Preview</p>
        <div className="max-w-lg">
          <p className="text-lg text-blue-600 hover:underline truncate cursor-pointer">{form.metaTitle || 'Page Title'}</p>
          <p className="text-xs text-green-700">nirote.com › {activeKey === 'home' ? '' : activeKey}</p>
          <p className="text-sm text-gray-600 mt-1 line-clamp-2">{form.metaDesc || 'Page description will appear here.'}</p>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl p-5 space-y-5">
        <div>
          <div className="flex justify-between mb-1">
            <label className="text-xs font-medium text-gray-600">Meta Title</label>
            <span className={`text-xs ${titlePct > 100 ? 'text-red-500' : 'text-gray-400'}`}>{form.metaTitle?.length ?? 0}/60</span>
          </div>
          <input value={form.metaTitle ?? ''} onChange={e => setForm(p => ({ ...p, metaTitle: e.target.value }))}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-yellow-400"
            placeholder="Page title for search engines" />
          <div className="h-1 bg-gray-100 rounded-full mt-1.5 overflow-hidden">
            <div className={`h-full rounded-full transition-all ${titlePct > 100 ? 'bg-red-400' : titlePct > 70 ? 'bg-green-400' : 'bg-yellow-400'}`} style={{ width: `${titlePct}%` }} />
          </div>
        </div>
        <div>
          <div className="flex justify-between mb-1">
            <label className="text-xs font-medium text-gray-600">Meta Description</label>
            <span className={`text-xs ${pct > 100 ? 'text-red-500' : 'text-gray-400'}`}>{form.metaDesc?.length ?? 0}/160</span>
          </div>
          <textarea value={form.metaDesc ?? ''} onChange={e => setForm(p => ({ ...p, metaDesc: e.target.value }))} rows={3}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-yellow-400 resize-none"
            placeholder="Describe this page for search engines (150–160 chars)" />
          <div className="h-1 bg-gray-100 rounded-full mt-1.5 overflow-hidden">
            <div className={`h-full rounded-full transition-all ${pct > 100 ? 'bg-red-400' : pct > 70 ? 'bg-green-400' : 'bg-yellow-400'}`} style={{ width: `${pct}%` }} />
          </div>
        </div>
        <div>
          <label className="text-xs font-medium text-gray-600 mb-1 block">Keywords</label>
          <input value={form.keywords ?? ''} onChange={e => setForm(p => ({ ...p, keywords: e.target.value }))}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-yellow-400"
            placeholder="keyword1, keyword2, keyword3" />
        </div>
        <div>
          <label className="text-xs font-medium text-gray-600 mb-1 block">OG Image URL</label>
          <input value={form.ogImage ?? ''} onChange={e => setForm(p => ({ ...p, ogImage: e.target.value }))}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-yellow-400"
            placeholder="https://..." />
          {form.ogImage && (
            <img src={form.ogImage} alt="OG Preview" className="mt-2 h-20 w-auto object-contain rounded-lg border border-gray-200" onError={e => { (e.target as HTMLImageElement).style.display = 'none' }} />
          )}
        </div>
      </div>
    </div>
  )
}
