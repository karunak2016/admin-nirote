import { useEffect, useState } from 'react'
import { Save, Check, Eye, EyeOff } from 'lucide-react'
import { cmsEmailApi, type EmailTemplate } from '../../api/cms'
import { Spinner } from '../../components/ui/Spinner'

const TEMPLATE_META = [
  { type: 'order-confirmation', label: 'Order Confirmed', desc: 'Sent when an order is placed' },
  { type: 'order-shipped', label: 'Order Shipped', desc: 'Sent when order is dispatched' },
  { type: 'order-delivered', label: 'Order Delivered', desc: 'Sent when order is delivered' },
  { type: 'order-cancelled', label: 'Order Cancelled', desc: 'Sent when order is cancelled' },
  { type: 'refund', label: 'Refund Processed', desc: 'Sent after refund is issued' },
  { type: 'welcome', label: 'Welcome Email', desc: 'Sent on new account registration' },
  { type: 'password-reset', label: 'Password Reset', desc: 'Password reset link email' },
]

const VARIABLES: Record<string, string[]> = {
  'order-confirmation': ['{{CustomerName}}', '#{OrderNumber}', '{{OrderTotal}}'],
  'order-shipped': ['{{CustomerName}}', '#{OrderNumber}', '{{TrackingNumber}}', '{{ExpectedDelivery}}'],
  'order-delivered': ['{{CustomerName}}', '#{OrderNumber}'],
  'order-cancelled': ['{{CustomerName}}', '#{OrderNumber}'],
  'refund': ['{{CustomerName}}', '#{OrderNumber}', '{{RefundAmount}}'],
  'welcome': ['{{CustomerName}}'],
  'password-reset': ['{{CustomerName}}', '{{ResetLink}}'],
}

export function EmailTemplates() {
  const [templates, setTemplates] = useState<EmailTemplate[]>([])
  const [loading, setLoading] = useState(true)
  const [activeType, setActiveType] = useState('order-confirmation')
  const [form, setForm] = useState({ subject: '', body: '', isEnabled: true })
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [preview, setPreview] = useState(false)

  useEffect(() => {
    cmsEmailApi.getAll().then(data => { setTemplates(data); setLoading(false) })
  }, [])

  useEffect(() => {
    const t = templates.find(t => t.templateType === activeType)
    if (t) setForm({ subject: t.subject, body: t.body, isEnabled: t.isEnabled })
    else setForm({ subject: '', body: '', isEnabled: true })
  }, [activeType, templates])

  async function save() {
    setSaving(true)
    try {
      await cmsEmailApi.save(activeType, form)
      setTemplates(prev => {
        const exists = prev.find(t => t.templateType === activeType)
        if (exists) return prev.map(t => t.templateType === activeType ? { ...t, ...form } : t)
        return [...prev, { id: 0, templateType: activeType, ...form }]
      })
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    } finally { setSaving(false) }
  }

  if (loading) return <div className="p-8 flex justify-center"><Spinner /></div>

  const vars = VARIABLES[activeType] ?? []

  return (
    <div className="p-6 max-w-5xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Email Templates</h1>
          <p className="text-sm text-gray-500">Customize transactional email content sent to customers.</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setPreview(!preview)} className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-xl text-sm text-gray-600 hover:bg-gray-50">
            {preview ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            {preview ? 'Edit' : 'Preview'}
          </button>
          <button onClick={save} disabled={saving}
            className="flex items-center gap-2 bg-yellow-400 hover:bg-yellow-500 text-black font-semibold px-4 py-2 rounded-xl text-sm disabled:opacity-60">
            {saving ? <Spinner size="sm" /> : saved ? <Check className="h-4 w-4" /> : <Save className="h-4 w-4" />}
            {saved ? 'Saved!' : 'Save Template'}
          </button>
        </div>
      </div>

      <div className="flex gap-6">
        {/* Sidebar list */}
        <div className="w-52 flex-shrink-0 space-y-1">
          {TEMPLATE_META.map(m => {
            const t = templates.find(t => t.templateType === m.type)
            return (
              <button key={m.type} onClick={() => setActiveType(m.type)}
                className={`w-full text-left px-3 py-2.5 rounded-xl transition-colors ${activeType === m.type ? 'bg-yellow-50 border border-yellow-200' : 'hover:bg-gray-50'}`}>
                <div className="flex items-center justify-between">
                  <p className="text-xs font-semibold text-gray-800">{m.label}</p>
                  <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${t?.isEnabled !== false ? 'text-green-600 bg-green-50' : 'text-gray-400 bg-gray-100'}`}>
                    {t?.isEnabled !== false ? 'ON' : 'OFF'}
                  </span>
                </div>
                <p className="text-[10px] text-gray-400 mt-0.5">{m.desc}</p>
              </button>
            )
          })}
        </div>

        {/* Editor */}
        <div className="flex-1 min-w-0 space-y-4">
          <div className="bg-white border border-gray-200 rounded-xl p-4">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-semibold text-gray-800">{TEMPLATE_META.find(m => m.type === activeType)?.label}</p>
              <div className="flex items-center gap-2">
                <label className="text-xs text-gray-600">Enabled</label>
                <button onClick={() => setForm(p => ({ ...p, isEnabled: !p.isEnabled }))}
                  className={`relative inline-flex h-5 w-9 rounded-full transition-colors ${form.isEnabled ? 'bg-yellow-400' : 'bg-gray-200'}`}>
                  <span className={`inline-block h-4 w-4 rounded-full bg-white shadow transition-transform mt-0.5 ${form.isEnabled ? 'translate-x-4' : 'translate-x-0.5'}`} />
                </button>
              </div>
            </div>
            <div>
              <label className="text-xs font-medium text-gray-600 mb-1 block">Subject Line</label>
              <input value={form.subject} onChange={e => setForm(p => ({ ...p, subject: e.target.value }))}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-yellow-400" placeholder="Email subject" />
            </div>
          </div>

          {vars.length > 0 && (
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs text-gray-500">Available variables:</span>
              {vars.map(v => (
                <button key={v} onClick={() => setForm(p => ({ ...p, body: p.body + v }))}
                  className="text-xs font-mono bg-gray-100 hover:bg-yellow-50 text-gray-600 px-2 py-0.5 rounded border border-gray-200 hover:border-yellow-300">
                  {v}
                </button>
              ))}
            </div>
          )}

          {preview ? (
            <div className="bg-white border border-gray-200 rounded-xl p-5 min-h-64">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Email Preview</p>
              <div className="prose prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: form.body }} />
            </div>
          ) : (
            <div className="bg-white border border-gray-200 rounded-xl p-4">
              <label className="text-xs font-medium text-gray-600 mb-1.5 block">Email Body (HTML)</label>
              <textarea value={form.body} onChange={e => setForm(p => ({ ...p, body: e.target.value }))} rows={16}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-xs font-mono focus:outline-none focus:border-yellow-400 resize-y"
                placeholder="<h2>Hello {{CustomerName}}</h2>..." />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
