import { useEffect, useRef, useState } from 'react'
import { Plus, Trash2, Save, Check, ExternalLink } from 'lucide-react'
import { cmsInstagramApi, type InstagramPost } from '../../api/cms'
import { settingsApi } from '../../api/settings'
import { uploadApi } from '../../api/upload'
import { Spinner } from '../../components/ui/Spinner'

export function Instagram() {
  const [posts, setPosts] = useState<InstagramPost[]>([])
  const [loading, setLoading] = useState(true)
  const [instagramUrl, setInstagramUrl] = useState('')
  const [sectionHeading, setSectionHeading] = useState('Follow Us on Instagram')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [uploading, setUploading] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    Promise.all([
      cmsInstagramApi.getAll(),
      settingsApi.get('instagram_url'),
      settingsApi.get('instagram_heading'),
    ]).then(([data, url, heading]) => {
      setPosts(data)
      setInstagramUrl(url.value)
      setSectionHeading(heading.value || 'Follow Us on Instagram')
      setLoading(false)
    })
  }, [])

  async function saveSettings() {
    setSaving(true)
    try {
      await Promise.all([
        settingsApi.set('instagram_url', instagramUrl),
        settingsApi.set('instagram_heading', sectionHeading),
      ])
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    } finally { setSaving(false) }
  }

  async function addPost(imageUrl: string) {
    const { id } = await cmsInstagramApi.save({
      id: 0, imageUrl, postUrl: '', caption: '', displayOrder: posts.length, isActive: true,
    })
    setPosts(prev => [...prev, { id, imageUrl, postUrl: '', caption: '', displayOrder: prev.length, isActive: true }])
  }

  async function updatePost(idx: number, field: keyof InstagramPost, value: string | boolean) {
    const post = { ...posts[idx], [field]: value }
    setPosts(prev => prev.map((p, i) => i === idx ? post : p))
    await cmsInstagramApi.save({ ...post, id: post.id })
  }

  async function del(id: number) {
    await cmsInstagramApi.delete(id)
    setPosts(prev => prev.filter(p => p.id !== id))
  }

  if (loading) return <div className="p-8 flex justify-center"><Spinner /></div>

  return (
    <div className="p-6 max-w-4xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Instagram Section</h1>
          <p className="text-sm text-gray-500">Manage the Instagram feed shown on the homepage.</p>
        </div>
        <button onClick={saveSettings} disabled={saving}
          className="flex items-center gap-2 bg-yellow-400 hover:bg-yellow-500 text-black font-semibold px-4 py-2 rounded-xl text-sm disabled:opacity-60">
          {saving ? <Spinner size="sm" /> : saved ? <Check className="h-4 w-4" /> : <Save className="h-4 w-4" />}
          {saved ? 'Saved!' : 'Save Settings'}
        </button>
      </div>

      {/* Settings */}
      <div className="bg-white border border-gray-200 rounded-2xl p-5 space-y-4 mb-6">
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Section Settings</p>
        <div>
          <label className="text-xs font-medium text-gray-600 mb-1 block">Section Heading</label>
          <input value={sectionHeading} onChange={e => setSectionHeading(e.target.value)}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-yellow-400" />
        </div>
        <div>
          <label className="text-xs font-medium text-gray-600 mb-1 block">Instagram Profile URL</label>
          <div className="flex gap-2">
            <input value={instagramUrl} onChange={e => setInstagramUrl(e.target.value)}
              className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-yellow-400"
              placeholder="https://instagram.com/nirote_jewellery" />
            {instagramUrl && (
              <a href={instagramUrl} target="_blank" rel="noopener noreferrer"
                className="px-3 py-2 border border-gray-200 rounded-lg text-gray-500 hover:bg-gray-50">
                <ExternalLink className="h-4 w-4" />
              </a>
            )}
          </div>
        </div>
      </div>

      {/* Posts grid */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-3">
          <p className="text-sm font-semibold text-gray-700">Photos ({posts.length})</p>
          <button onClick={() => fileRef.current?.click()}
            className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-xl text-sm text-gray-600 hover:bg-gray-50">
            {uploading ? <Spinner size="sm" /> : <Plus className="h-4 w-4" />} Add Photo
          </button>
          <input ref={fileRef} type="file" accept="image/*" multiple className="hidden" onChange={async e => {
            const files = Array.from(e.target.files ?? [])
            setUploading(true)
            for (const file of files) {
              const url = await uploadApi.uploadImage(file)
              await addPost(url)
            }
            setUploading(false)
          }} />
        </div>

        <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
          {posts.sort((a, b) => a.displayOrder - b.displayOrder).map((post, idx) => (
            <div key={post.id} className="group relative aspect-square rounded-xl overflow-hidden bg-gray-100">
              <img src={post.imageUrl} alt="" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
                <button onClick={() => del(post.id)} className="p-2 bg-white rounded-full"><Trash2 className="h-4 w-4 text-red-500" /></button>
              </div>
              <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/60">
                <input value={post.postUrl ?? ''} onChange={e => updatePost(idx, 'postUrl', e.target.value)} onClick={e => e.stopPropagation()}
                  className="w-full text-[10px] bg-transparent text-white placeholder:text-white/60 border-b border-white/30 focus:outline-none focus:border-white"
                  placeholder="Instagram post URL" />
              </div>
            </div>
          ))}
          {posts.length === 0 && (
            <div className="col-span-full py-12 text-center text-sm text-gray-400">
              No photos yet. Click "Add Photo" to upload images.
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
