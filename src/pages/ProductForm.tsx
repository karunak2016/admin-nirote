import { useEffect, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Star, Upload, Video, X } from 'lucide-react'
import type { Category, ProductImage, ProductRequest } from '../types'
import { productsApi } from '../api/products'
import { categoriesApi } from '../api/categories'
import { uploadApi } from '../api/upload'
import { optionsApi, type ProductOption } from '../api/options'
import { cmsCollectionsApi, type CmsCollection } from '../api/cms'
import { Input } from '../components/ui/Input'
import { Button } from '../components/ui/Button'
import { Spinner } from '../components/ui/Spinner'
import { validateImageSize } from '../utils/imageValidation'


const OCCASIONS = ['Casual', 'Party Wear', 'Bridal', 'Traditional', 'Festive', 'Formal', 'Office Wear', 'Wedding']

const empty: ProductRequest = { name: '', description: '', price: 0, categoryId: 0, fabric: '', color: '', occasion: '', careInstructions: '', stockQuantity: 0, state: '' }

export function ProductForm() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const isEdit = Boolean(id)

  const [form, setForm] = useState<ProductRequest>(empty)
  const [categories, setCategories] = useState<Category[]>([])
  const [fabrics, setFabrics] = useState<ProductOption[]>([])
  const [colors, setColors] = useState<ProductOption[]>([])
  const [images, setImages] = useState<ProductImage[]>([])
  const [pendingImages, setPendingImages] = useState<ProductImage[]>([])
  const [uploadingImage, setUploadingImage] = useState(false)
  const [deletingImageId, setDeletingImageId] = useState<number | null>(null)
  const [videoUrl, setVideoUrl] = useState('')
  const [uploadingVideo, setUploadingVideo] = useState(false)
  const [videoUploadPct, setVideoUploadPct] = useState(0)
  const videoInputRef = useRef<HTMLInputElement>(null)
  const [loading, setLoading] = useState(isEdit)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [allCollections, setAllCollections] = useState<CmsCollection[]>([])
  const [selectedCollectionIds, setSelectedCollectionIds] = useState<number[]>([])

  useEffect(() => {
    categoriesApi.list().then(setCategories).catch(() => {})
    optionsApi.getFabrics().then(setFabrics).catch(() => {})
    optionsApi.getColors().then(setColors).catch(() => {})
    cmsCollectionsApi.getAll().then(setAllCollections).catch(() => {})
    if (isEdit && id) {
      const pid = Number(id)
      Promise.all([
        productsApi.getById(pid),
        cmsCollectionsApi.getByProduct(pid).catch(() => [] as number[]),
      ]).then(([p, colIds]) => {
        setForm({ name: p.name, description: p.description, price: p.price, categoryId: p.categoryId, fabric: p.fabric, color: p.color, occasion: (p as any).occasion ?? '', careInstructions: p.careInstructions ?? '', state: p.state ?? '', stockQuantity: p.stockQuantity, deliveryDays: p.deliveryDays, videoUrl: (p as any).videoUrl ?? '' })
        if ((p as any).videoUrl) setVideoUrl((p as any).videoUrl)
        setImages(p.images ?? (p.imageUrls ?? []).map((url, i) => ({ id: -(i + 1), url, isDefault: url === p.defaultImageUrl || i === 0 })))
        setSelectedCollectionIds(colIds)
      }).finally(() => setLoading(false))
    }
  }, [id, isEdit])

  function field(key: keyof ProductRequest) {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      const val = ['price', 'categoryId', 'stockQuantity', 'deliveryDays', 'discountedPrice'].includes(key) ? Number(e.target.value) : e.target.value
      setForm((f) => ({ ...f, [key]: val }))
    }
  }

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    e.target.value = ''
    const sizeErr = validateImageSize(file)
    if (sizeErr) { setError(sizeErr); return }

    setUploadingImage(true)
    setError('')
    try {
      const url = await uploadApi.uploadImage(file)
      if (isEdit && id) {
        const isDefault = images.length === 0
        const imageId = await productsApi.addImage(Number(id), url, isDefault)
        setImages((prev) => [...prev, { id: imageId, url, isDefault }])
      } else {
        const tempId = -(pendingImages.length + 1)
        setPendingImages((prev) => [...prev, { id: tempId, url, isDefault: prev.length === 0 }])
      }
    } catch {
      setError('Image upload failed. Please try again.')
    } finally {
      setUploadingImage(false)
    }
  }

  async function handleDeleteImage(img: ProductImage) {
    if (isEdit && id) {
      if (img.id < 0) return
      setDeletingImageId(img.id)
      try {
        await productsApi.removeImage(Number(id), img.id)
        setImages((prev) => prev.filter((i) => i.id !== img.id))
      } catch {
        setError('Failed to delete image. Please try again.')
      } finally {
        setDeletingImageId(null)
      }
    } else {
      setPendingImages((prev) => {
        const updated = prev.filter((i) => i.id !== img.id)
        return updated.map((i, idx) => ({ ...i, isDefault: idx === 0 }))
      })
    }
  }

  async function handleVideoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    e.target.value = ''
    if (file.size > 100 * 1024 * 1024) { setError('Video must be under 100 MB.'); return }
    setUploadingVideo(true); setVideoUploadPct(0); setError('')
    try {
      const url = await uploadApi.uploadVideo(file, setVideoUploadPct)
      setVideoUrl(url)
      setForm(f => ({ ...f, videoUrl: url }))
    } catch {
      setError('Video upload failed. Please try again.')
    } finally {
      setUploadingVideo(false); setVideoUploadPct(0)
    }
  }

  async function handleSave() {
    if (!form.name || !form.categoryId || form.price <= 0) {
      setError('Name, category, and price are required.')
      return
    }
    setError('')
    setSaving(true)
    try {
      const formWithVideo = { ...form, videoUrl: videoUrl || undefined }
      if (isEdit && id) {
        const pid = Number(id)
        await productsApi.update(pid, formWithVideo)
        await cmsCollectionsApi.setForProduct(pid, selectedCollectionIds).catch(() => {})
      } else {
        const created = await productsApi.create(formWithVideo)
        for (let i = 0; i < pendingImages.length; i++) {
          await productsApi.addImage(created.id, pendingImages[i].url, i === 0)
        }
        if (selectedCollectionIds.length > 0)
          await cmsCollectionsApi.setForProduct(created.id, selectedCollectionIds).catch(() => {})
      }
      navigate('/products')
    } catch {
      setError('Failed to save product. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <div className="flex justify-center py-32"><Spinner size="lg" /></div>

  const displayImages = isEdit ? images : pendingImages

  return (
    <div className="max-w-2xl space-y-6">
      {error && (
        <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">{error}</div>
      )}

      {/* Basic details */}
      <div className="rounded-xl border border-gray-200 bg-white p-6 space-y-4">
        <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Product Details</h2>

        <Input id="name" label="Product Name" placeholder="Gold Plated Jhumka Earrings" value={form.name} onChange={field('name')} required />

        <div>
          <label className="text-xs font-medium text-gray-600 uppercase tracking-wide">Description</label>
          <textarea
            value={form.description}
            onChange={field('description')}
            rows={4}
            placeholder="Describe the jewellery piece..."
            className="mt-1 w-full rounded-md border border-gray-200 px-3 py-2 text-sm focus:border-primary-800 focus:outline-none resize-none"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-medium text-gray-600 uppercase tracking-wide">Category</label>
            <select
              value={form.categoryId}
              onChange={field('categoryId')}
              className="mt-1 w-full rounded-md border border-gray-200 px-3 py-2 text-sm focus:border-primary-800 focus:outline-none"
            >
              <option value={0}>Select category</option>
              {categories.filter((c) => !c.parentId).map((parent) => {
                const children = categories.filter((c) => c.parentId === parent.id)
                return children.length > 0 ? (
                  <optgroup key={parent.id} label={parent.name}>
                    {children.map((child) => (
                      <option key={child.id} value={child.id}>{child.name}</option>
                    ))}
                  </optgroup>
                ) : (
                  <option key={parent.id} value={parent.id}>{parent.name}</option>
                )
              })}
            </select>
          </div>
          <Input id="price" type="number" label="Price (₹)" placeholder="1999" value={form.price || ''} onChange={field('price')} min={0} />
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="text-xs font-medium text-gray-600 uppercase tracking-wide">Material</label>
            <select
              value={form.fabric}
              onChange={field('fabric')}
              className="mt-1 w-full rounded-md border border-gray-200 px-3 py-2 text-sm focus:border-primary-800 focus:outline-none"
            >
              <option value="">Select material</option>
              {fabrics.length > 0 ? fabrics.map((f) => (
                <option key={f.id} value={f.value}>{f.value}</option>
              )) : (
                <>
                  <option value="Gold Plated">Gold Plated</option>
                  <option value="Silver Plated">Silver Plated</option>
                  <option value="Rose Gold Plated">Rose Gold Plated</option>
                  <option value="Oxidized">Oxidized</option>
                  <option value="Brass">Brass</option>
                  <option value="Alloy">Alloy</option>
                  <option value="Kundan">Kundan</option>
                  <option value="Meenakari">Meenakari</option>
                </>
              )}
            </select>
          </div>
          <div>
            <label className="text-xs font-medium text-gray-600 uppercase tracking-wide">Color / Finish</label>
            <select
              value={form.color}
              onChange={field('color')}
              className="mt-1 w-full rounded-md border border-gray-200 px-3 py-2 text-sm focus:border-primary-800 focus:outline-none"
            >
              <option value="">Select color</option>
              {colors.length > 0 ? colors.map((c) => (
                <option key={c.id} value={c.value}>{c.value}</option>
              )) : (
                <>
                  <option value="Gold">Gold</option>
                  <option value="Silver">Silver</option>
                  <option value="Rose Gold">Rose Gold</option>
                  <option value="Antique Gold">Antique Gold</option>
                  <option value="Oxidized Silver">Oxidized Silver</option>
                  <option value="Multi Color">Multi Color</option>
                  <option value="Black">Black</option>
                  <option value="Red">Red</option>
                  <option value="Green">Green</option>
                  <option value="Blue">Blue</option>
                  <option value="White">White</option>
                  <option value="Pearl White">Pearl White</option>
                  <option value="Maroon">Maroon</option>
                  <option value="Pink">Pink</option>
                  <option value="Orange">Orange</option>
                </>
              )}
            </select>
          </div>
          <Input id="stockQuantity" type="number" label="Stock" placeholder="10" value={form.stockQuantity || ''} onChange={field('stockQuantity')} min={0} />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-medium text-gray-600 uppercase tracking-wide">Occasion <span className="text-gray-400 normal-case font-normal">(optional)</span></label>
            <select
              value={form.occasion ?? ''}
              onChange={field('occasion')}
              className="mt-1 w-full rounded-md border border-gray-200 px-3 py-2 text-sm focus:border-primary-800 focus:outline-none"
            >
              <option value="">Select occasion</option>
              {OCCASIONS.map((o) => (
                <option key={o} value={o}>{o}</option>
              ))}
            </select>
          </div>
          <Input id="discountedPrice" type="number" label="Sale Price (₹) (optional)" placeholder="e.g. 499" value={form.discountedPrice || ''} onChange={field('discountedPrice')} min={0} />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-medium text-gray-600 uppercase tracking-wide">Care Instructions <span className="text-gray-400 normal-case font-normal">(optional)</span></label>
            <input
              type="text"
              value={form.careInstructions ?? ''}
              onChange={field('careInstructions')}
              placeholder="e.g. Avoid contact with water and perfume"
              className="mt-1 w-full rounded-md border border-gray-200 px-3 py-2 text-sm focus:border-primary-800 focus:outline-none"
            />
          </div>
          <Input id="deliveryDays" type="number" label="Delivery Days" placeholder="5" value={form.deliveryDays || ''} onChange={field('deliveryDays')} min={0} />
        </div>
      </div>

      {/* Images */}
      <div className="rounded-xl border border-gray-200 bg-white p-6 space-y-4">
        <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Product Images</h2>

        {displayImages.length > 0 && (
          <div className="grid grid-cols-3 gap-3">
            {displayImages.map((img) => (
              <div key={img.id} className="relative group">
                <img src={img.url} alt="" className="h-24 w-full rounded-lg object-cover object-top" />
                {img.isDefault && (
                  <span className="absolute left-1 top-1 rounded bg-primary-800 px-1.5 py-0.5 text-[10px] text-white flex items-center gap-0.5">
                    <Star className="h-2.5 w-2.5" /> Primary
                  </span>
                )}
                <button
                  onClick={() => handleDeleteImage(img)}
                  disabled={deletingImageId === img.id}
                  className="absolute right-1 top-1 rounded-full bg-black/60 p-0.5 text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600 disabled:opacity-50"
                >
                  {deletingImageId === img.id
                    ? <Spinner size="sm" />
                    : <X className="h-3 w-3" />}
                </button>
              </div>
            ))}
          </div>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="hidden"
          onChange={handleFileChange}
        />
        <Button
          size="sm"
          variant="outline"
          onClick={() => fileInputRef.current?.click()}
          loading={uploadingImage}
        >
          <Upload className="h-4 w-4" />
          {uploadingImage ? 'Uploading...' : 'Upload Image'}
        </Button>
        <p className="text-xs text-gray-400">
          Accepted: JPEG, PNG, WebP. First image becomes the primary.
          {!isEdit && pendingImages.length > 0 && ` ${pendingImages.length} image${pendingImages.length > 1 ? 's' : ''} will be saved with the product.`}
        </p>
      </div>

      {/* Product Video */}
      <div className="rounded-xl border border-gray-200 bg-white p-6 space-y-4">
        <div>
          <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Product Video</h2>
          <p className="text-xs text-gray-400 mt-0.5">Optional short video shown on the product page. MP4 recommended, max 100 MB.</p>
        </div>

        {videoUrl ? (
          <div className="space-y-2">
            <video
              src={videoUrl}
              controls
              className="w-full max-h-56 rounded-lg border border-gray-200 bg-black object-contain"
            />
            <button
              onClick={() => { setVideoUrl(''); setForm(f => ({ ...f, videoUrl: undefined })) }}
              className="flex items-center gap-1.5 text-xs text-red-500 hover:text-red-700"
            >
              <X className="h-3.5 w-3.5" /> Remove video
            </button>
          </div>
        ) : (
          <div>
            <input
              ref={videoInputRef}
              type="file"
              accept="video/mp4,video/webm,video/quicktime"
              className="hidden"
              onChange={handleVideoChange}
            />
            <Button
              size="sm"
              variant="outline"
              onClick={() => videoInputRef.current?.click()}
              loading={uploadingVideo}
            >
              <Video className="h-4 w-4" />
              {uploadingVideo
                ? videoUploadPct > 0 ? `Uploading ${videoUploadPct}%…` : 'Uploading…'
                : 'Upload Video'}
            </Button>
            {uploadingVideo && videoUploadPct > 0 && (
              <div className="mt-2 h-1.5 w-full rounded-full bg-gray-100 overflow-hidden">
                <div
                  className="h-full bg-primary-800 transition-all duration-300 rounded-full"
                  style={{ width: `${videoUploadPct}%` }}
                />
              </div>
            )}
          </div>
        )}
      </div>

      {/* Collections */}
      {allCollections.length > 0 && (
        <div className="rounded-xl border border-gray-200 bg-white p-6 space-y-3">
          <div>
            <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Collections</h2>
            <p className="text-xs text-gray-400 mt-0.5">Assign this product to curated collections shown on the storefront</p>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {allCollections.map((col) => {
              const checked = selectedCollectionIds.includes(col.id)
              return (
                <label
                  key={col.id}
                  className={`flex items-center gap-3 rounded-lg border px-3 py-2.5 cursor-pointer transition-colors ${checked ? 'border-yellow-400 bg-yellow-50' : 'border-gray-200 hover:border-gray-300'}`}>
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() =>
                      setSelectedCollectionIds((prev) =>
                        prev.includes(col.id) ? prev.filter((x) => x !== col.id) : [...prev, col.id]
                      )
                    }
                    className="h-4 w-4 rounded border-gray-300 text-yellow-500 focus:ring-yellow-400"
                  />
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-gray-800 truncate">{col.name}</p>
                    {col.description && (
                      <p className="text-[11px] text-gray-400 truncate">{col.description}</p>
                    )}
                  </div>
                </label>
              )
            })}
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-3">
        <Button loading={saving} onClick={handleSave}>
          {isEdit ? 'Save Changes' : 'Create Product'}
        </Button>
        <Button variant="outline" onClick={() => navigate('/products')}>Cancel</Button>
      </div>
    </div>
  )
}
