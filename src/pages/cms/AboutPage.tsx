import { useEffect, useRef, useState } from 'react'
import { Save, Check, ImagePlus, Plus, Trash2 } from 'lucide-react'
import { settingsApi } from '../../api/settings'
import { uploadApi } from '../../api/upload'
import { Spinner } from '../../components/ui/Spinner'

// Keys that map directly to string fields in AboutState
const SIMPLE_KEYS = [
  'about_heroImage', 'about_heading', 'about_subtitle', 'about_story',
  'about_mission', 'about_vision', 'about_promise', 'about_ctaText', 'about_ctaUrl',
  'about_image1', 'about_image2',
  'about_heroLabel',
  'about_storyLabel', 'about_storyHeading',
  'about_missionLabel', 'about_missionHeading',
  'about_missionCardLabel', 'about_visionCardLabel', 'about_promiseCardLabel',
  'about_craftLabel', 'about_craftHeading',
  'about_ctaLabel', 'about_ctaHeading', 'about_ctaBody',
  'about_faqLabel', 'about_faqHeading',
  'about_testimonialsLabel', 'about_testimonialsHeading',
]

interface AboutState {
  heroImage: string; heading: string; subtitle: string; story: string
  mission: string; vision: string; promise: string; ctaText: string; ctaUrl: string
  image1: string; image2: string
  heroLabel: string
  storyLabel: string; storyHeading: string
  missionLabel: string; missionHeading: string
  missionCardLabel: string; visionCardLabel: string; promiseCardLabel: string
  craftLabel: string; craftHeading: string
  ctaLabel: string; ctaHeading: string; ctaBody: string
  faqLabel: string; faqHeading: string
  testimonialsLabel: string; testimonialsHeading: string
}

const DEFAULTS: AboutState = {
  heroImage: '', heading: 'Our Story', subtitle: 'Curated with passion, worn with pride.',
  story: "NIROTÉ was born from a love of beautiful jewellery and a desire to make premium craftsmanship accessible to every woman. Founded in Jamshedpur, Jharkhand, we believe that every woman deserves to feel extraordinary — without compromise.\n\nOur journey began with a simple belief: that artificial jewellery, when made with the right materials and care, can be just as beautiful and meaningful as the real thing. Each piece in our collection is thoughtfully designed and quality-tested to ensure it stands the test of time.",
  mission: "Our mission is to craft premium artificial jewellery that celebrates the modern Indian woman — making everyday moments feel extraordinary.",
  vision: "To become the most loved jewellery brand for the modern Indian woman, known for quality, beauty, and meaningful craftsmanship.",
  promise: "Every piece is handpicked, quality-tested, and delivered with care. We stand behind everything we create.",
  ctaText: 'Shop Earrings', ctaUrl: '/products',
  image1: '', image2: '',
  heroLabel: 'Our Story',
  storyLabel: 'How We Started', storyHeading: 'The NIROTÉ Story',
  missionLabel: 'Who We Are', missionHeading: 'Our Mission & Vision',
  missionCardLabel: 'Our Mission', visionCardLabel: 'Our Vision', promiseCardLabel: 'Our Promise',
  craftLabel: 'What Sets Us Apart', craftHeading: 'The NIROTÉ Difference',
  ctaLabel: 'Ready to Explore?', ctaHeading: 'Find Your Perfect Piece',
  ctaBody: 'Every piece in our collection is handpicked for quality, beauty, and lasting craftsmanship. Shop our earring collection today.',
  faqLabel: 'FAQ', faqHeading: 'Common Questions',
  testimonialsLabel: 'Testimonials', testimonialsHeading: 'Loved by Our Customers',
}

const DEFAULT_VALUES = [
  { title: 'Premium Materials', desc: 'We use only high-quality alloys, gold-plating, and finish techniques that resist tarnish and last.' },
  { title: 'Thoughtful Design', desc: 'Every design is curated by our in-house team, drawing inspiration from Indian heritage and modern fashion.' },
  { title: 'Customer First',    desc: 'Your satisfaction is our north star. From packaging to after-sale support, we care at every step.' },
  { title: 'Community Driven', desc: "We listen to our community and design pieces that reflect real women's real lives and celebrations." },
]

const DEFAULT_FAQS = [
  { q: 'What materials do you use in your jewellery?',  a: 'We use high-quality alloys with premium gold plating and finishing techniques designed to resist tarnish. Each piece is carefully selected for durability and beauty.' },
  { q: 'Is NIROTÉ jewellery safe for sensitive skin?',  a: 'Most of our pieces are nickel-free and safe for regular wear. We recommend avoiding prolonged contact with water, sweat, and perfume to maintain the finish.' },
  { q: 'How long does shipping take?',                  a: 'We deliver across India within 5–7 business days. Express options are available at checkout. All orders are dispatched within 24 hours of placement.' },
  { q: 'What is your return policy?',                   a: 'We offer hassle-free 48-hour returns on all unused products in original packaging. Contact us via email or WhatsApp to initiate a return or exchange.' },
  { q: 'Can I get a bulk order or customisation?',      a: 'Yes! We welcome bulk orders for events, gifting, and weddings. Reach out to us at hello.nirote@gmail.com or on WhatsApp for personalised assistance.' },
]

function ImgUpload({ label, value, uploading, onChange, onUrlChange }: {
  label: string; value: string; uploading: boolean
  onChange: (file: File) => void; onUrlChange: (v: string) => void
}) {
  const ref = useRef<HTMLInputElement>(null)
  return (
    <div>
      <label className="text-xs font-medium text-gray-600 mb-1.5 block">{label}</label>
      <div className="h-24 bg-gray-50 border-2 border-dashed border-gray-200 rounded-xl flex items-center justify-center cursor-pointer hover:border-yellow-400 overflow-hidden"
        onClick={() => ref.current?.click()}>
        {value ? <img src={value} className="w-full h-full object-cover" alt={label} />
          : uploading ? <Spinner /> : <ImagePlus className="h-6 w-6 text-gray-300" />}
      </div>
      <input ref={ref} type="file" accept="image/*" className="hidden" onChange={e => e.target.files?.[0] && onChange(e.target.files[0])} />
      <input value={value} onChange={e => onUrlChange(e.target.value)}
        className="mt-1 w-full text-xs border border-gray-200 rounded px-2 py-1 focus:outline-none" placeholder="Or paste URL" />
    </div>
  )
}

export function AboutPage() {
  const [state, setState] = useState<AboutState>(DEFAULTS)
  const [craftValues, setCraftValues] = useState(DEFAULT_VALUES)
  const [faqs, setFaqs] = useState(DEFAULT_FAQS)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [uploading, setUploading] = useState<string | null>(null)

  useEffect(() => {
    const allKeys = [...SIMPLE_KEYS, 'about_values', 'about_faqs']
    Promise.all(allKeys.map(k => settingsApi.get(k).catch(() => ({ value: '' })))).then(results => {
      const map: Record<string, string> = {}
      results.forEach((r, i) => { map[allKeys[i].replace('about_', '')] = r.value })
      setState(prev => {
        const updated = { ...prev }
        SIMPLE_KEYS.forEach(k => {
          const field = k.replace('about_', '') as keyof AboutState
          if (map[field]) updated[field] = map[field]
        })
        return updated
      })
      if (map['values']) { try { setCraftValues(JSON.parse(map['values'])) } catch {} }
      if (map['faqs'])   { try { setFaqs(JSON.parse(map['faqs']))         } catch {} }
      setLoading(false)
    })
  }, [])

  async function save() {
    setSaving(true)
    try {
      await Promise.all([
        ...SIMPLE_KEYS.map(k => settingsApi.set(k, state[k.replace('about_', '') as keyof AboutState] ?? '')),
        settingsApi.set('about_values', JSON.stringify(craftValues)),
        settingsApi.set('about_faqs',   JSON.stringify(faqs)),
      ])
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    } finally { setSaving(false) }
  }

  async function uploadField(file: File, field: keyof AboutState) {
    setUploading(field)
    const url = await uploadApi.uploadImage(file)
    setState(p => ({ ...p, [field]: url }))
    setUploading(null)
  }

  function F({ label, field }: { label: string; field: keyof AboutState }) {
    return (
      <div>
        <label className="text-xs font-medium text-gray-600 mb-1 block">{label}</label>
        <input value={state[field] as string} onChange={e => setState(p => ({ ...p, [field]: e.target.value }))}
          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-yellow-400" />
      </div>
    )
  }

  function TA({ label, field, rows = 3 }: { label: string; field: keyof AboutState; rows?: number }) {
    return (
      <div>
        <label className="text-xs font-medium text-gray-600 mb-1 block">{label}</label>
        <textarea value={state[field] as string} onChange={e => setState(p => ({ ...p, [field]: e.target.value }))} rows={rows}
          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-yellow-400 resize-none" />
      </div>
    )
  }

  const card = 'bg-white border border-gray-200 rounded-2xl p-5 space-y-4'
  const sec  = 'text-xs font-semibold text-gray-400 uppercase tracking-wider'
  const inp  = 'w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-yellow-400'
  const lbl  = 'text-xs font-medium text-gray-600 mb-1 block'

  if (loading) return <div className="p-8 flex justify-center"><Spinner /></div>

  return (
    <div className="p-6 max-w-3xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-gray-900">About Page</h1>
          <p className="text-sm text-gray-500">Edit all content on the About Us page.</p>
        </div>
        <button onClick={save} disabled={saving}
          className="flex items-center gap-2 bg-yellow-400 hover:bg-yellow-500 text-black font-semibold px-4 py-2 rounded-xl text-sm disabled:opacity-60">
          {saving ? <Spinner size="sm" /> : saved ? <Check className="h-4 w-4" /> : <Save className="h-4 w-4" />}
          {saved ? 'Saved!' : 'Save Page'}
        </button>
      </div>

      <div className="space-y-4">

        {/* Hero */}
        <div className={card}>
          <p className={sec}>Hero Section</p>
          <ImgUpload label="Hero Background Image (optional)" value={state.heroImage}
            uploading={uploading === 'heroImage'} onChange={f => uploadField(f, 'heroImage')} onUrlChange={v => setState(p => ({ ...p, heroImage: v }))} />
          <div className="grid grid-cols-2 gap-3">
            <F label="Eyebrow Label" field="heroLabel" />
            <F label="Page Heading" field="heading" />
          </div>
          <F label="Subtitle" field="subtitle" />
        </div>

        {/* Our Story */}
        <div className={card}>
          <p className={sec}>Our Story Section</p>
          <div className="grid grid-cols-2 gap-3">
            <F label="Section Eyebrow" field="storyLabel" />
            <F label="Section Heading" field="storyHeading" />
          </div>
          <TA label="Story Text (use blank line to split paragraphs)" field="story" rows={6} />
          <ImgUpload label="Story Image (right side)" value={state.image1}
            uploading={uploading === 'image1'} onChange={f => uploadField(f, 'image1')} onUrlChange={v => setState(p => ({ ...p, image1: v }))} />
        </div>

        {/* Mission & Vision */}
        <div className={card}>
          <p className={sec}>Mission & Vision Section</p>
          <div className="grid grid-cols-2 gap-3">
            <F label="Section Eyebrow" field="missionLabel" />
            <F label="Section Heading" field="missionHeading" />
          </div>
          <div className="grid grid-cols-3 gap-3">
            <F label="Card 1 Title" field="missionCardLabel" />
            <F label="Card 2 Title" field="visionCardLabel" />
            <F label="Card 3 Title" field="promiseCardLabel" />
          </div>
          <TA label="Mission Body" field="mission" />
          <TA label="Vision Body" field="vision" />
          <TA label="Promise Body" field="promise" />
        </div>

        {/* Craft Values */}
        <div className={card}>
          <p className={sec}>Craft Values Section</p>
          <div className="grid grid-cols-2 gap-3">
            <F label="Section Eyebrow" field="craftLabel" />
            <F label="Section Heading" field="craftHeading" />
          </div>
          <div className="space-y-3">
            {craftValues.map((v, i) => (
              <div key={i} className="border border-gray-100 rounded-xl p-4 space-y-2 bg-gray-50">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-semibold text-gray-500">Value {i + 1}</span>
                  {craftValues.length > 1 && (
                    <button onClick={() => setCraftValues(cv => cv.filter((_, j) => j !== i))}
                      className="text-red-400 hover:text-red-600 transition-colors">
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
                <div>
                  <label className={lbl}>Title</label>
                  <input value={v.title} onChange={e => setCraftValues(cv => cv.map((c, j) => j === i ? { ...c, title: e.target.value } : c))}
                    className={inp} placeholder="e.g. Premium Materials" />
                </div>
                <div>
                  <label className={lbl}>Description</label>
                  <textarea value={v.desc} rows={2} onChange={e => setCraftValues(cv => cv.map((c, j) => j === i ? { ...c, desc: e.target.value } : c))}
                    className={`${inp} resize-none`} placeholder="Short description..." />
                </div>
              </div>
            ))}
            <button onClick={() => setCraftValues(cv => [...cv, { title: '', desc: '' }])}
              className="flex items-center gap-1.5 text-xs text-yellow-700 hover:text-yellow-900 font-medium">
              <Plus className="h-3.5 w-3.5" /> Add Value
            </button>
          </div>
        </div>

        {/* CTA Section */}
        <div className={card}>
          <p className={sec}>CTA Section</p>
          <div className="grid grid-cols-2 gap-3">
            <F label="Section Eyebrow" field="ctaLabel" />
            <F label="Section Heading" field="ctaHeading" />
          </div>
          <TA label="Body Text" field="ctaBody" rows={2} />
          <ImgUpload label="CTA Image (left side)" value={state.image2}
            uploading={uploading === 'image2'} onChange={f => uploadField(f, 'image2')} onUrlChange={v => setState(p => ({ ...p, image2: v }))} />
          <div className="grid grid-cols-2 gap-3">
            <F label="Button Text" field="ctaText" />
            <F label="Button URL" field="ctaUrl" />
          </div>
        </div>

        {/* Testimonials Labels */}
        <div className={card}>
          <p className={sec}>Testimonials Section</p>
          <p className="text-xs text-gray-400">Reviews are pulled automatically. Edit the section labels here.</p>
          <div className="grid grid-cols-2 gap-3">
            <F label="Section Eyebrow" field="testimonialsLabel" />
            <F label="Section Heading" field="testimonialsHeading" />
          </div>
        </div>

        {/* FAQ */}
        <div className={card}>
          <p className={sec}>FAQ Section</p>
          <div className="grid grid-cols-2 gap-3">
            <F label="Section Eyebrow" field="faqLabel" />
            <F label="Section Heading" field="faqHeading" />
          </div>
          <div className="space-y-3">
            {faqs.map((faq, i) => (
              <div key={i} className="border border-gray-100 rounded-xl p-4 space-y-2 bg-gray-50">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-semibold text-gray-500">FAQ {i + 1}</span>
                  {faqs.length > 1 && (
                    <button onClick={() => setFaqs(f => f.filter((_, j) => j !== i))}
                      className="text-red-400 hover:text-red-600 transition-colors">
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
                <div>
                  <label className={lbl}>Question</label>
                  <input value={faq.q} onChange={e => setFaqs(f => f.map((x, j) => j === i ? { ...x, q: e.target.value } : x))}
                    className={inp} placeholder="Question..." />
                </div>
                <div>
                  <label className={lbl}>Answer</label>
                  <textarea value={faq.a} rows={2} onChange={e => setFaqs(f => f.map((x, j) => j === i ? { ...x, a: e.target.value } : x))}
                    className={`${inp} resize-none`} placeholder="Answer..." />
                </div>
              </div>
            ))}
            <button onClick={() => setFaqs(f => [...f, { q: '', a: '' }])}
              className="flex items-center gap-1.5 text-xs text-yellow-700 hover:text-yellow-900 font-medium">
              <Plus className="h-3.5 w-3.5" /> Add FAQ
            </button>
          </div>
        </div>

      </div>
    </div>
  )
}
