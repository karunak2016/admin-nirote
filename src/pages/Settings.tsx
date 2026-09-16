import { useEffect, useState } from 'react'
import { settingsApi } from '../api/settings'
import { Button } from '../components/ui/Button'
import { Spinner } from '../components/ui/Spinner'

function Toggle({ enabled, saving, onToggle }: { enabled: boolean; saving: boolean; onToggle: () => void }) {
  return (
    <button
      onClick={onToggle}
      disabled={saving}
      className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none disabled:opacity-60 ${
        enabled ? 'bg-primary-800' : 'bg-gray-200'
      }`}
    >
      {saving ? (
        <span className="absolute inset-0 flex items-center justify-center">
          <Spinner size="sm" />
        </span>
      ) : (
        <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${enabled ? 'translate-x-5' : 'translate-x-0'}`} />
      )}
    </button>
  )
}

export function Settings() {
  const [loading, setLoading] = useState(true)

  // Shipping
  const [shippingFee, setShippingFee] = useState('99')
  const [freeShippingThreshold, setFreeShippingThreshold] = useState('1999')
  const [savingShipping, setSavingShipping] = useState(false)
  const [shippingSaved, setShippingSaved] = useState(false)

  // Toggles
  const [stateFilterEnabled, setStateFilterEnabled] = useState(false)
  const [reviewApproval, setReviewApproval] = useState(false)
  const [savingToggle, setSavingToggle] = useState(false)
  const [savingReviewApproval, setSavingReviewApproval] = useState(false)

  useEffect(() => {
    const g = (key: string) => settingsApi.get(key).catch(() => ({ value: '' }))
    Promise.all([
      settingsApi.getShipping().catch(() => ({ shippingFee: 99, freeShippingThreshold: 1999 })),
      g('StateFilterEnabled'),
      g('ReviewApprovalRequired'),
    ]).then(([shipping, state, review]) => {
      const v = (x: any) => (x as any).value || ''
      setShippingFee(String((shipping as any).shippingFee ?? 99))
      setFreeShippingThreshold(String((shipping as any).freeShippingThreshold ?? 1999))
      setStateFilterEnabled(v(state) === 'true')
      setReviewApproval(v(review) === 'true')
    }).finally(() => setLoading(false))
  }, [])

  async function handleSaveShipping() {
    setSavingShipping(true); setShippingSaved(false)
    try {
      await Promise.all([
        settingsApi.set('ShippingFee', shippingFee || '0'),
        settingsApi.set('FreeShippingThreshold', freeShippingThreshold || '0'),
      ])
      setShippingSaved(true); setTimeout(() => setShippingSaved(false), 3000)
    } finally { setSavingShipping(false) }
  }

  async function handleToggleState() {
    const next = !stateFilterEnabled; setSavingToggle(true)
    try { await settingsApi.set('StateFilterEnabled', next ? 'true' : 'false'); setStateFilterEnabled(next) }
    finally { setSavingToggle(false) }
  }

  async function handleToggleReviewApproval() {
    const next = !reviewApproval; setSavingReviewApproval(true)
    try { await settingsApi.set('ReviewApprovalRequired', next ? 'true' : 'false'); setReviewApproval(next) }
    finally { setSavingReviewApproval(false) }
  }

  if (loading) return <div className="flex justify-center py-32"><Spinner size="lg" /></div>

  const card = 'rounded-xl border border-gray-200 bg-white p-6 space-y-4'
  const label = 'text-xs font-medium text-gray-600 block mb-1'
  const input = 'w-full rounded-md border border-gray-200 px-3 py-2 text-sm focus:border-primary-800 focus:outline-none'
  const sectionTitle = 'text-sm font-semibold text-gray-700 uppercase tracking-wide'

  return (
    <div className="max-w-xl space-y-6">
      <p className="text-sm text-gray-500">Store configuration — shipping rates and system behaviour.</p>

      {/* Shipping */}
      <div className={card}>
        <h2 className={sectionTitle}>Shipping</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={label}>Shipping Fee (₹)</label>
            <input type="number" min="0" value={shippingFee} onChange={e => setShippingFee(e.target.value)} className={input} />
          </div>
          <div>
            <label className={label}>Free Shipping Above (₹)</label>
            <input type="number" min="0" value={freeShippingThreshold} onChange={e => setFreeShippingThreshold(e.target.value)} className={input} />
          </div>
        </div>
        <p className="text-xs text-gray-400">
          Customers pay ₹{shippingFee} shipping. Free if order subtotal ≥ ₹{freeShippingThreshold}. Set fee to 0 for always-free shipping.
        </p>
        <div className="flex items-center gap-3">
          <Button size="sm" loading={savingShipping} onClick={handleSaveShipping}>Save Shipping</Button>
          {shippingSaved && <span className="text-xs text-green-600 font-medium">Saved!</span>}
        </div>
      </div>

      {/* System Toggles */}
      <div className={card}>
        <h2 className={sectionTitle}>System</h2>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-800">Review Approval Required</p>
            <p className="text-xs text-gray-500 mt-0.5">When ON, reviews are hidden until you approve them in the Reviews page.</p>
          </div>
          <Toggle enabled={reviewApproval} saving={savingReviewApproval} onToggle={handleToggleReviewApproval} />
        </div>
        <div className="border-t border-gray-100 pt-4 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-800">Enable State Filter</p>
            <p className="text-xs text-gray-500 mt-0.5">Shows a state dropdown on the products page so customers can filter by origin state.</p>
          </div>
          <Toggle enabled={stateFilterEnabled} saving={savingToggle} onToggle={handleToggleState} />
        </div>
      </div>
    </div>
  )
}
