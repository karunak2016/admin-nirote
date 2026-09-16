import { useEffect, useState } from 'react'
import { Plus, Pencil, Trash2, Check, X, ChevronUp, ChevronDown } from 'lucide-react'
import { optionsApi, type ProductOption } from '../api/options'
import { Button } from '../components/ui/Button'
import { Spinner } from '../components/ui/Spinner'

interface OptionPanelProps {
  title: string
  items: ProductOption[]
  loading: boolean
  onCreate: (value: string) => Promise<void>
  onUpdate: (id: number, value: string) => Promise<void>
  onReorder: (id: number, direction: 'up' | 'down') => Promise<void>
  onDelete: (id: number) => Promise<void>
}

function OptionPanel({ title, items, loading, onCreate, onUpdate, onReorder, onDelete }: OptionPanelProps) {
  const [showAdd, setShowAdd] = useState(false)
  const [newValue, setNewValue] = useState('')
  const [editId, setEditId] = useState<number | null>(null)
  const [editValue, setEditValue] = useState('')
  const [saving, setSaving] = useState(false)

  const sorted = [...items].sort((a, b) => a.displayOrder - b.displayOrder)

  async function handleCreate() {
    if (!newValue.trim()) return
    setSaving(true)
    try {
      await onCreate(newValue.trim())
      setNewValue('')
      setShowAdd(false)
    } finally {
      setSaving(false)
    }
  }

  async function handleUpdate() {
    if (!editValue.trim() || editId === null) return
    setSaving(true)
    try {
      await onUpdate(editId, editValue.trim())
      setEditId(null)
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(id: number) {
    if (!confirm(`Delete this ${title.slice(0, -1).toLowerCase()}?`)) return
    await onDelete(id)
  }

  function startEdit(item: ProductOption) {
    setEditId(item.id)
    setEditValue(item.value)
    setShowAdd(false)
  }

  return (
    <div className="flex-1 min-w-0">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">{title}</h2>
        {!showAdd && (
          <Button size="sm" onClick={() => { setShowAdd(true); setEditId(null); setNewValue('') }}>
            <Plus className="h-4 w-4" /> Add
          </Button>
        )}
      </div>

      {showAdd && (
        <div className="mb-3 flex gap-2">
          <input
            value={newValue}
            onChange={(e) => setNewValue(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
            placeholder={`New ${title.slice(0, -1).toLowerCase()}...`}
            className="flex-1 rounded-md border border-gray-200 px-3 py-2 text-sm focus:border-primary-800 focus:outline-none"
            autoFocus
          />
          <button onClick={handleCreate} disabled={saving} className="rounded-md bg-primary-800 px-3 py-2 text-white hover:bg-primary-900 disabled:opacity-50">
            {saving ? <Spinner size="sm" /> : <Check className="h-4 w-4" />}
          </button>
          <button onClick={() => setShowAdd(false)} className="rounded-md border border-gray-200 px-3 py-2 text-gray-500 hover:bg-gray-50">
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      <div className="rounded-xl border border-gray-200 bg-white overflow-hidden">
        {loading ? (
          <div className="flex justify-center py-10"><Spinner /></div>
        ) : items.length === 0 ? (
          <p className="py-10 text-center text-sm text-gray-400">No {title.toLowerCase()} yet.</p>
        ) : (
          <ul className="divide-y divide-gray-100">
            {sorted.map((item, idx) => (
              <li key={item.id} className="flex items-center gap-2 px-4 py-2.5 hover:bg-gray-50">
                {editId === item.id ? (
                  <>
                    <input
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleUpdate()}
                      className="flex-1 rounded border border-gray-200 px-2 py-1 text-sm focus:border-primary-800 focus:outline-none"
                      autoFocus
                    />
                    <button onClick={handleUpdate} disabled={saving} className="rounded p-1.5 text-green-600 hover:bg-green-50 disabled:opacity-50">
                      {saving ? <Spinner size="sm" /> : <Check className="h-4 w-4" />}
                    </button>
                    <button onClick={() => setEditId(null)} className="rounded p-1.5 text-gray-400 hover:bg-gray-100">
                      <X className="h-4 w-4" />
                    </button>
                  </>
                ) : (
                  <>
                    <div className="flex flex-col mr-1">
                      <button
                        onClick={() => onReorder(item.id, 'up')}
                        disabled={idx === 0}
                        className="rounded p-0.5 text-gray-300 hover:text-gray-600 disabled:opacity-0"
                      >
                        <ChevronUp className="h-3 w-3" />
                      </button>
                      <button
                        onClick={() => onReorder(item.id, 'down')}
                        disabled={idx === sorted.length - 1}
                        className="rounded p-0.5 text-gray-300 hover:text-gray-600 disabled:opacity-0"
                      >
                        <ChevronDown className="h-3 w-3" />
                      </button>
                    </div>
                    <span className="flex-1 text-sm text-gray-800">{item.value}</span>
                    <button onClick={() => startEdit(item)} className="rounded p-1.5 text-gray-400 hover:bg-gray-100 hover:text-primary-800">
                      <Pencil className="h-3.5 w-3.5" />
                    </button>
                    <button onClick={() => handleDelete(item.id)} className="rounded p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-600">
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}

export function Options() {
  const [fabrics, setFabrics] = useState<ProductOption[]>([])
  const [colors, setColors] = useState<ProductOption[]>([])
  const [loadingFabrics, setLoadingFabrics] = useState(true)
  const [loadingColors, setLoadingColors] = useState(true)

  useEffect(() => {
    optionsApi.getFabrics().then(setFabrics).finally(() => setLoadingFabrics(false))
    optionsApi.getColors().then(setColors).finally(() => setLoadingColors(false))
  }, [])

  async function createFabric(value: string) {
    const created = await optionsApi.createFabric(value)
    setFabrics((prev) => [created, ...prev])
  }

  async function createColor(value: string) {
    const created = await optionsApi.createColor(value)
    setColors((prev) => [created, ...prev])
  }

  async function updateFabric(id: number, value: string) {
    const updated = await optionsApi.updateFabric(id, value)
    setFabrics((prev) => prev.map((f) => (f.id === id ? updated : f)))
  }

  async function updateColor(id: number, value: string) {
    const updated = await optionsApi.updateColor(id, value)
    setColors((prev) => prev.map((c) => (c.id === id ? updated : c)))
  }

  async function reorderFabric(id: number, direction: 'up' | 'down') {
    const sorted = [...fabrics].sort((a, b) => a.displayOrder - b.displayOrder)
    const idx = sorted.findIndex((f) => f.id === id)
    const swapIdx = direction === 'up' ? idx - 1 : idx + 1
    if (swapIdx < 0 || swapIdx >= sorted.length) return
    const current = sorted[idx]
    const neighbor = sorted[swapIdx]
    const newOrder = neighbor.displayOrder === current.displayOrder ? swapIdx : neighbor.displayOrder
    const swapOrder = neighbor.displayOrder === current.displayOrder ? idx : current.displayOrder
    setFabrics((prev) =>
      prev.map((f) =>
        f.id === current.id ? { ...f, displayOrder: newOrder }
        : f.id === neighbor.id ? { ...f, displayOrder: swapOrder }
        : f
      )
    )
    await Promise.all([
      optionsApi.reorderFabric(current.id, newOrder),
      optionsApi.reorderFabric(neighbor.id, swapOrder),
    ])
  }

  async function reorderColor(id: number, direction: 'up' | 'down') {
    const sorted = [...colors].sort((a, b) => a.displayOrder - b.displayOrder)
    const idx = sorted.findIndex((c) => c.id === id)
    const swapIdx = direction === 'up' ? idx - 1 : idx + 1
    if (swapIdx < 0 || swapIdx >= sorted.length) return
    const current = sorted[idx]
    const neighbor = sorted[swapIdx]
    const newOrder = neighbor.displayOrder === current.displayOrder ? swapIdx : neighbor.displayOrder
    const swapOrder = neighbor.displayOrder === current.displayOrder ? idx : current.displayOrder
    setColors((prev) =>
      prev.map((c) =>
        c.id === current.id ? { ...c, displayOrder: newOrder }
        : c.id === neighbor.id ? { ...c, displayOrder: swapOrder }
        : c
      )
    )
    await Promise.all([
      optionsApi.reorderColor(current.id, newOrder),
      optionsApi.reorderColor(neighbor.id, swapOrder),
    ])
  }

  async function deleteFabric(id: number) {
    await optionsApi.deleteFabric(id)
    setFabrics((prev) => prev.filter((f) => f.id !== id))
  }

  async function deleteColor(id: number) {
    await optionsApi.deleteColor(id)
    setColors((prev) => prev.filter((c) => c.id !== id))
  }

  return (
    <div className="space-y-2">
      <p className="text-sm text-gray-500 mb-4">Manage the material and color options available when adding or editing a product.</p>
      <div className="flex gap-6">
        <OptionPanel
          title="Materials"
          items={fabrics}
          loading={loadingFabrics}
          onCreate={createFabric}
          onUpdate={updateFabric}
          onReorder={reorderFabric}
          onDelete={deleteFabric}
        />
        <OptionPanel
          title="Colors"
          items={colors}
          loading={loadingColors}
          onCreate={createColor}
          onUpdate={updateColor}
          onReorder={reorderColor}
          onDelete={deleteColor}
        />
      </div>
    </div>
  )
}
