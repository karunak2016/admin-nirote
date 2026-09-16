import { useEffect, useState } from 'react'
import { Save, Check, Plus, Trash2 } from 'lucide-react'
import { cmsPoliciesApi, type PolicyPage } from '../../api/cms'
import { Spinner } from '../../components/ui/Spinner'

interface Section { title: string; body: string }

const SLUGS = [
  { slug: 'shipping', label: 'Shipping Policy' },
  { slug: 'returns', label: 'Return & Exchange Policy' },
  { slug: 'privacy', label: 'Privacy Policy' },
  { slug: 'terms', label: 'Terms & Conditions' },
]

export function Policies() {
  const [activeSlug, setActiveSlug] = useState('shipping')
  const [, setPolicy] = useState<PolicyPage | null>(null)
  const [sections, setSections] = useState<Section[]>([])
  const [title, setTitle] = useState('')
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    loadPolicy(activeSlug)
  }, [activeSlug])

  async function loadPolicy(slug: string) {
    setLoading(true)
    try {
      const data = await cmsPoliciesApi.get(slug)
      setPolicy(data)
      setTitle(data.title)
      setSections(JSON.parse(data.sections) as Section[])
    } catch {
      setTitle(SLUGS.find(s => s.slug === slug)?.label ?? slug)
      setSections([{ title: 'Overview', body: '' }])
    } finally {
      setLoading(false)
    }
  }

  async function save() {
    setSaving(true)
    try {
      await cmsPoliciesApi.save(activeSlug, { title, sections: JSON.stringify(sections) })
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    } finally { setSaving(false) }
  }

  function addSection() {
    setSections(prev => [...prev, { title: '', body: '' }])
  }

  function removeSection(idx: number) {
    setSections(prev => prev.filter((_, i) => i !== idx))
  }

  function updateSection(idx: number, field: keyof Section, value: string) {
    setSections(prev => prev.map((s, i) => i === idx ? { ...s, [field]: value } : s))
  }

  return (
    <div className="p-6 max-w-4xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Policy Pages</h1>
          <p className="text-sm text-gray-500">Edit policy content directly without touching code.</p>
        </div>
        <button onClick={save} disabled={saving}
          className="flex items-center gap-2 bg-yellow-400 hover:bg-yellow-500 text-black font-semibold px-4 py-2 rounded-xl text-sm disabled:opacity-60">
          {saving ? <Spinner size="sm" /> : saved ? <Check className="h-4 w-4" /> : <Save className="h-4 w-4" />}
          {saved ? 'Saved!' : 'Save Policy'}
        </button>
      </div>

      {/* Policy selector */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {SLUGS.map(s => (
          <button key={s.slug} onClick={() => setActiveSlug(s.slug)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${activeSlug === s.slug ? 'bg-gray-900 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:border-gray-300'}`}>
            {s.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><Spinner /></div>
      ) : (
        <div className="space-y-4">
          {/* Page title */}
          <div className="bg-white border border-gray-200 rounded-xl p-4">
            <label className="text-xs font-medium text-gray-600 mb-1.5 block">Page Title</label>
            <input value={title} onChange={e => setTitle(e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm font-semibold focus:outline-none focus:border-yellow-400"
              placeholder="Page title shown at top" />
          </div>

          {/* Sections */}
          {sections.map((section, idx) => (
            <div key={idx} className="bg-white border border-gray-200 rounded-xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Section {idx + 1}</span>
                <button onClick={() => removeSection(idx)} className="p-1 hover:bg-red-50 rounded-lg">
                  <Trash2 className="h-3.5 w-3.5 text-red-400" />
                </button>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-600 mb-1 block">Section Heading</label>
                <input value={section.title} onChange={e => updateSection(idx, 'title', e.target.value)}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm font-semibold focus:outline-none focus:border-yellow-400"
                  placeholder="Section heading" />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-600 mb-1 block">Content</label>
                <textarea value={section.body} onChange={e => updateSection(idx, 'body', e.target.value)} rows={5}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-yellow-400 resize-y"
                  placeholder="Section content... Use new lines for paragraphs." />
              </div>
            </div>
          ))}

          <button onClick={addSection}
            className="w-full py-3 border-2 border-dashed border-gray-200 rounded-xl text-sm text-gray-400 hover:border-yellow-300 hover:text-yellow-600 flex items-center justify-center gap-2 transition-colors">
            <Plus className="h-4 w-4" /> Add Section
          </button>
        </div>
      )}
    </div>
  )
}
