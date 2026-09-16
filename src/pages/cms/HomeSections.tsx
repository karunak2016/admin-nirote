import { useEffect, useState } from 'react'
import { ArrowUp, ArrowDown, GripVertical } from 'lucide-react'
import { cmsSectionsApi, type HomeSection } from '../../api/cms'
import { Spinner } from '../../components/ui/Spinner'

const SECTION_LABELS: Record<string, string> = {
  announcement: 'Announcement Bar',
  hero: 'Hero / Banner Slider',
  marquee: 'Scrolling Marquee',
  categories: 'Shop by Category',
  featured: 'Best Sellers',
  'new-arrivals': 'New Arrivals',
  brand: 'Brand Section',
  'why-us': 'Why Choose Us',
  testimonials: 'Customer Testimonials',
  instagram: 'Instagram Feed',
  newsletter: 'Newsletter Section',
}

export function HomeSections() {
  const [sections, setSections] = useState<HomeSection[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState<string | null>(null)

  useEffect(() => {
    cmsSectionsApi.getAll().then(data => {
      setSections([...data].sort((a, b) => a.displayOrder - b.displayOrder))
      setLoading(false)
    })
  }, [])

  async function toggle(section: HomeSection) {
    setSaving(section.sectionKey)
    const updated = { ...section, isEnabled: !section.isEnabled }
    await cmsSectionsApi.toggle(section.sectionKey, updated.isEnabled)
    setSections(prev => prev.map(s => s.sectionKey === section.sectionKey ? updated : s))
    setSaving(null)
  }

  async function move(idx: number, dir: -1 | 1) {
    const next = [...sections]
    const swapIdx = idx + dir
    if (swapIdx < 0 || swapIdx >= next.length) return
    ;[next[idx], next[swapIdx]] = [next[swapIdx], next[idx]]
    const reordered = next.map((s, i) => ({ ...s, displayOrder: i }))
    setSections(reordered)
    await cmsSectionsApi.reorder(reordered.map(s => ({ sectionKey: s.sectionKey, displayOrder: s.displayOrder })))
  }

  if (loading) return <div className="p-8 flex justify-center"><Spinner /></div>

  return (
    <div className="p-6 max-w-3xl space-y-4">
      <div className="mb-2">
        <h1 className="text-xl font-bold text-gray-900">Homepage Sections</h1>
        <p className="text-sm text-gray-500">Reorder and show/hide sections on the storefront.</p>
      </div>

      <div className="space-y-2">
        {sections.map((section, idx) => (
          <div key={section.sectionKey} className="bg-white border border-gray-200 rounded-xl">
            <div className="flex items-center gap-3 px-4 py-3">
              <GripVertical className="h-4 w-4 text-gray-300 flex-shrink-0" />

              <p className="flex-1 text-sm font-semibold text-gray-800">
                {SECTION_LABELS[section.sectionKey] ?? section.sectionKey}
              </p>

              <div className="flex items-center gap-2">
                <button onClick={() => move(idx, -1)} disabled={idx === 0} className="p-1.5 rounded-lg hover:bg-gray-100 disabled:opacity-30">
                  <ArrowUp className="h-4 w-4 text-gray-500" />
                </button>
                <button onClick={() => move(idx, 1)} disabled={idx === sections.length - 1} className="p-1.5 rounded-lg hover:bg-gray-100 disabled:opacity-30">
                  <ArrowDown className="h-4 w-4 text-gray-500" />
                </button>

                {saving === section.sectionKey
                  ? <Spinner size="sm" />
                  : (
                    <button
                      onClick={() => toggle(section)}
                      className={`relative inline-flex h-6 w-11 rounded-full transition-colors ${section.isEnabled ? 'bg-yellow-400' : 'bg-gray-200'}`}
                    >
                      <span className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform mt-0.5 ${section.isEnabled ? 'translate-x-5' : 'translate-x-0.5'}`} />
                    </button>
                  )
                }
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
