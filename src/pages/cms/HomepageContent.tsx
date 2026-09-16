import { useEffect, useRef, useState } from 'react'
import { ImagePlus, X } from 'lucide-react'
import { settingsApi } from '../../api/settings'
import { uploadApi } from '../../api/upload'
import { Button } from '../../components/ui/Button'
import { Spinner } from '../../components/ui/Spinner'
import { validateBannerImageSize } from '../../utils/imageValidation'

export function HomepageContent() {
  const [loading, setLoading] = useState(true)

  // Hero Banner
  const [bannerTagline, setBannerTagline] = useState('New Collection 2026')
  const [bannerHeading, setBannerHeading] = useState('Timeless Jewellery, Crafted with Soul')
  const [bannerDescription, setBannerDescription] = useState('Handcrafted earrings that tell your story. Artisan-crafted pieces for every occasion.')
  const [bannerBtn1, setBannerBtn1] = useState('Shop Now')
  const [bannerBtn2, setBannerBtn2] = useState('New Arrivals')
  const [bannerImage, setBannerImage] = useState('')
  const [uploadingBannerImage, setUploadingBannerImage] = useState(false)
  const [savingBanner, setSavingBanner] = useState(false)
  const [bannerSaved, setBannerSaved] = useState(false)
  const bannerImageRef = useRef<HTMLInputElement>(null)

  // Offer Strip
  const [offerStrip1, setOfferStrip1] = useState('🎁 BUY 3 GET ₹200 OFF ON EARRINGS & NECKLACES')
  const [offerStrip2, setOfferStrip2] = useState('✦ FREE SHIPPING ON ORDERS ABOVE ₹999')
  const [offerStrip3, setOfferStrip3] = useState('◈ USE CODE NIROTE15 FOR EXTRA 15% OFF')
  const [savingOffer, setSavingOffer] = useState(false)
  const [offerSaved, setOfferSaved] = useState(false)

  // Marquee
  const [marqueeText, setMarqueeText] = useState('HANDCRAFTED EARRINGS  ✦  TIMELESS LUXURY  ✦  FREE SHIPPING ₹999+  ✦  EASY RETURNS  ✦  ARTISAN CRAFTED  ✦  PREMIUM QUALITY  ✦  ')
  const [savingMarquee, setSavingMarquee] = useState(false)
  const [marqueeSaved, setMarqueeSaved] = useState(false)

  // Promo Banner
  const [promoBannerHeading, setPromoBannerHeading] = useState('Monsoon Sparkle Sale')
  const [promoBannerDesc, setPromoBannerDesc] = useState('Extra 15% off on all orders · No minimum purchase · Valid this week only')
  const [promoBannerDiscount, setPromoBannerDiscount] = useState('15')
  const [savingPromo, setSavingPromo] = useState(false)
  const [promoSaved, setPromoSaved] = useState(false)

  // Brand Section
  const [brandTag, setBrandTag] = useState('Our Promise')
  const [brandHeading, setBrandHeading] = useState('Jewellery Curated\nwith Heart')
  const [brandBody, setBrandBody] = useState('Every piece is thoughtfully selected for its quality, style, and beauty — so you can express yourself with confidence.')
  const [brandImage, setBrandImage] = useState('')
  const [uploadingBrandImage, setUploadingBrandImage] = useState(false)
  const [brandBtn, setBrandBtn] = useState('Shop Now')
  const [savingBrand, setSavingBrand] = useState(false)
  const [brandSaved, setBrandSaved] = useState(false)
  const brandImageRef = useRef<HTMLInputElement>(null)

  // Newsletter
  const [nlHeading, setNlHeading] = useState('Join Our World')
  const [nlBody, setNlBody] = useState('Get early access to new arrivals, exclusive offers, and style inspiration.')
  const [savingNl, setSavingNl] = useState(false)
  const [nlSaved, setNlSaved] = useState(false)

  // Reviews Summary
  const [reviewsSummary, setReviewsSummary] = useState('4.9 out of 5 from 500+ reviews')
  const [savingReviewsSummary, setSavingReviewsSummary] = useState(false)
  const [reviewsSummarySaved, setReviewsSummarySaved] = useState(false)

  useEffect(() => {
    const g = (key: string) => settingsApi.get(key).catch(() => ({ value: '' }))
    Promise.all([
      g('BannerTagline'), g('BannerHeading'), g('BannerDescription'), g('BannerBtn1'), g('BannerBtn2'), g('BannerImage'),
      g('OfferStrip1'), g('OfferStrip2'), g('OfferStrip3'),
      g('MarqueeText'),
      g('PromoBannerHeading'), g('PromoBannerDesc'), g('PromoBannerDiscount'),
      g('BrandTag'), g('BrandHeading'), g('BrandBody'), g('BrandImage'), g('BrandBtn'),
      g('NewsletterHeading'), g('NewsletterBody'),
      g('ReviewsSummary'),
    ]).then(([tagline, heading, desc, btn1, btn2, img,
              os1, os2, os3,
              marq,
              pbh, pbd, pbdisc,
              bTag, bHeading, bBody, bImg, bBtn,
              nlh, nlb,
              rvs]) => {
      const v = (x: any) => (x as any).value || ''
      if (v(tagline)) setBannerTagline(v(tagline))
      if (v(heading)) setBannerHeading(v(heading))
      if (v(desc)) setBannerDescription(v(desc))
      if (v(btn1)) setBannerBtn1(v(btn1))
      if (v(btn2)) setBannerBtn2(v(btn2))
      if (v(img)) setBannerImage(v(img))
      if (v(os1)) setOfferStrip1(v(os1))
      if (v(os2)) setOfferStrip2(v(os2))
      if (v(os3)) setOfferStrip3(v(os3))
      if (v(marq)) setMarqueeText(v(marq))
      if (v(pbh)) setPromoBannerHeading(v(pbh))
      if (v(pbd)) setPromoBannerDesc(v(pbd))
      if (v(pbdisc)) setPromoBannerDiscount(v(pbdisc))
      if (v(bTag)) setBrandTag(v(bTag))
      if (v(bHeading)) setBrandHeading(v(bHeading))
      if (v(bBody)) setBrandBody(v(bBody))
      if (v(bImg)) setBrandImage(v(bImg))
      if (v(bBtn)) setBrandBtn(v(bBtn))
      if (v(nlh)) setNlHeading(v(nlh))
      if (v(nlb)) setNlBody(v(nlb))
      if (v(rvs)) setReviewsSummary(v(rvs))
    }).finally(() => setLoading(false))
  }, [])

  async function handleBannerImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]; if (!file) return
    const err = validateBannerImageSize(file); if (err) { alert(err); if (bannerImageRef.current) bannerImageRef.current.value = ''; return }
    setUploadingBannerImage(true)
    try { const url = await uploadApi.uploadImage(file); setBannerImage(url); await settingsApi.set('BannerImage', url) }
    finally { setUploadingBannerImage(false); if (bannerImageRef.current) bannerImageRef.current.value = '' }
  }

  async function handleBrandImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]; if (!file) return
    const err = validateBannerImageSize(file); if (err) { alert(err); if (brandImageRef.current) brandImageRef.current.value = ''; return }
    setUploadingBrandImage(true)
    try { const url = await uploadApi.uploadImage(file); setBrandImage(url); await settingsApi.set('BrandImage', url) }
    finally { setUploadingBrandImage(false); if (brandImageRef.current) brandImageRef.current.value = '' }
  }

  async function saveBanner() {
    setSavingBanner(true); setBannerSaved(false)
    try {
      await Promise.all([
        settingsApi.set('BannerTagline', bannerTagline),
        settingsApi.set('BannerHeading', bannerHeading),
        settingsApi.set('BannerDescription', bannerDescription),
        settingsApi.set('BannerBtn1', bannerBtn1),
        settingsApi.set('BannerBtn2', bannerBtn2),
      ])
      setBannerSaved(true); setTimeout(() => setBannerSaved(false), 3000)
    } finally { setSavingBanner(false) }
  }

  async function saveOffer() {
    setSavingOffer(true); setOfferSaved(false)
    try {
      await Promise.all([
        settingsApi.set('OfferStrip1', offerStrip1),
        settingsApi.set('OfferStrip2', offerStrip2),
        settingsApi.set('OfferStrip3', offerStrip3),
      ])
      setOfferSaved(true); setTimeout(() => setOfferSaved(false), 3000)
    } finally { setSavingOffer(false) }
  }

  async function saveMarquee() {
    setSavingMarquee(true); setMarqueeSaved(false)
    try { await settingsApi.set('MarqueeText', marqueeText); setMarqueeSaved(true); setTimeout(() => setMarqueeSaved(false), 3000) }
    finally { setSavingMarquee(false) }
  }

  async function savePromo() {
    setSavingPromo(true); setPromoSaved(false)
    try {
      await Promise.all([
        settingsApi.set('PromoBannerHeading', promoBannerHeading),
        settingsApi.set('PromoBannerDesc', promoBannerDesc),
        settingsApi.set('PromoBannerDiscount', promoBannerDiscount),
      ])
      setPromoSaved(true); setTimeout(() => setPromoSaved(false), 3000)
    } finally { setSavingPromo(false) }
  }

  async function saveBrand() {
    setSavingBrand(true); setBrandSaved(false)
    try {
      await Promise.all([
        settingsApi.set('BrandTag', brandTag),
        settingsApi.set('BrandHeading', brandHeading),
        settingsApi.set('BrandBody', brandBody),
        settingsApi.set('BrandBtn', brandBtn),
      ])
      setBrandSaved(true); setTimeout(() => setBrandSaved(false), 3000)
    } finally { setSavingBrand(false) }
  }

  async function saveNewsletter() {
    setSavingNl(true); setNlSaved(false)
    try {
      await Promise.all([settingsApi.set('NewsletterHeading', nlHeading), settingsApi.set('NewsletterBody', nlBody)])
      setNlSaved(true); setTimeout(() => setNlSaved(false), 3000)
    } finally { setSavingNl(false) }
  }

  async function saveReviewsSummary() {
    setSavingReviewsSummary(true); setReviewsSummarySaved(false)
    try {
      await settingsApi.set('ReviewsSummary', reviewsSummary)
      setReviewsSummarySaved(true); setTimeout(() => setReviewsSummarySaved(false), 3000)
    } finally { setSavingReviewsSummary(false) }
  }

  if (loading) return <div className="flex justify-center py-32"><Spinner size="lg" /></div>

  const card = 'rounded-xl border border-gray-200 bg-white p-6 space-y-4'
  const lbl = 'text-xs font-medium text-gray-600 block mb-1'
  const inp = 'w-full rounded-md border border-gray-200 px-3 py-2 text-sm focus:border-primary-800 focus:outline-none'
  const sec = 'text-sm font-semibold text-gray-700 uppercase tracking-wide'

  return (
    <div className="max-w-xl space-y-6">
      <p className="text-sm text-gray-500">Manage all homepage content visible to customers on the storefront.</p>

      {/* Hero Banner */}
      <div className={card}>
        <h2 className={sec}>Hero Banner</h2>
        <p className="text-xs text-gray-400">The large split-panel section at the top of the homepage.</p>
        <div>
          <label className={lbl}>Tagline (small text above heading)</label>
          <input type="text" value={bannerTagline} onChange={(e) => setBannerTagline(e.target.value)} placeholder="e.g. New Collection 2026" className={inp}/>
        </div>
        <div>
          <label className={lbl}>Heading</label>
          <input type="text" value={bannerHeading} onChange={(e) => setBannerHeading(e.target.value)} placeholder="e.g. Timeless Jewellery, Crafted with Soul" className={inp}/>
          <p className="mt-1 text-xs text-gray-400">Last 2 words appear in italic gold.</p>
        </div>
        <div>
          <label className={lbl}>Description</label>
          <textarea rows={2} value={bannerDescription} onChange={(e) => setBannerDescription(e.target.value)} className={`${inp} resize-none`}/>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={lbl}>Button 1 Label</label>
            <input type="text" value={bannerBtn1} onChange={(e) => setBannerBtn1(e.target.value)} placeholder="Shop Now" className={inp}/>
          </div>
          <div>
            <label className={lbl}>Button 2 Label</label>
            <input type="text" value={bannerBtn2} onChange={(e) => setBannerBtn2(e.target.value)} placeholder="New Arrivals" className={inp}/>
          </div>
        </div>
        <div>
          <label className={lbl}>Left Panel Image (optional)</label>
          {bannerImage ? (
            <div className="relative inline-block">
              <img src={bannerImage} alt="Banner" className="h-28 w-64 rounded-md object-cover border border-gray-200"/>
              <button onClick={async () => { setBannerImage(''); await settingsApi.set('BannerImage', '') }}
                className="absolute -right-2 -top-2 rounded-full bg-white border border-gray-200 p-0.5 shadow hover:bg-red-50">
                <X className="h-3.5 w-3.5 text-red-500"/>
              </button>
            </div>
          ) : (
            <button onClick={() => bannerImageRef.current?.click()} disabled={uploadingBannerImage}
              className="flex items-center gap-2 rounded-md border-2 border-dashed border-gray-200 px-5 py-4 text-sm text-gray-500 hover:border-primary-400 hover:text-primary-700 transition-colors disabled:opacity-60">
              {uploadingBannerImage ? <Spinner size="sm"/> : <ImagePlus className="h-4 w-4"/>}
              {uploadingBannerImage ? 'Uploading…' : 'Upload model/jewellery photo'}
            </button>
          )}
          <input ref={bannerImageRef} type="file" accept="image/*" className="hidden" onChange={handleBannerImageChange}/>
        </div>
        <div className="flex items-center gap-3">
          <Button size="sm" loading={savingBanner} onClick={saveBanner}>Save Banner</Button>
          {bannerSaved && <span className="text-xs text-green-600 font-medium">Saved!</span>}
        </div>
      </div>

      {/* Offer Strip */}
      <div className={card}>
        <h2 className={sec}>Offer Strip</h2>
        <p className="text-xs text-gray-400">Three deal messages in the dark bar below the hero. Use emoji. Clear a field to hide it.</p>
        {[
          { val: offerStrip1, set: setOfferStrip1, label: 'Offer 1' },
          { val: offerStrip2, set: setOfferStrip2, label: 'Offer 2' },
          { val: offerStrip3, set: setOfferStrip3, label: 'Offer 3' },
        ].map((f) => (
          <div key={f.label}>
            <label className={lbl}>{f.label}</label>
            <input type="text" value={f.val} onChange={(e) => f.set(e.target.value)} placeholder="e.g. 🎁 BUY 3 GET ₹200 OFF" className={inp}/>
          </div>
        ))}
        <div className="flex items-center gap-3">
          <Button size="sm" loading={savingOffer} onClick={saveOffer}>Save Offer Strip</Button>
          {offerSaved && <span className="text-xs text-green-600 font-medium">Saved!</span>}
        </div>
      </div>

      {/* Marquee */}
      <div className={card}>
        <h2 className={sec}>Scrolling Marquee</h2>
        <p className="text-xs text-gray-400">Gold scrolling text across the page. Use ✦, ◈, or | as separators between items.</p>
        <div>
          <label className={lbl}>Marquee Text</label>
          <textarea rows={2} value={marqueeText} onChange={(e) => setMarqueeText(e.target.value)} className={`${inp} resize-none`}/>
        </div>
        <div className="flex items-center gap-3">
          <Button size="sm" loading={savingMarquee} onClick={saveMarquee}>Save Marquee</Button>
          {marqueeSaved && <span className="text-xs text-green-600 font-medium">Saved!</span>}
        </div>
      </div>

      {/* Promo Sale Banner */}
      <div className={card}>
        <h2 className={sec}>Promo Sale Banner</h2>
        <p className="text-xs text-gray-400">Full-width promotional section in the middle of the homepage. Update for each sale event.</p>
        <div>
          <label className={lbl}>Sale Name / Heading</label>
          <input type="text" value={promoBannerHeading} onChange={(e) => setPromoBannerHeading(e.target.value)} placeholder="e.g. Diwali Sparkle Sale" className={inp}/>
          <p className="mt-1 text-xs text-gray-400">Last word appears in italic gold.</p>
        </div>
        <div>
          <label className={lbl}>Sub-text</label>
          <input type="text" value={promoBannerDesc} onChange={(e) => setPromoBannerDesc(e.target.value)} placeholder="Extra 15% off on all orders · No minimum purchase" className={inp}/>
        </div>
        <div>
          <label className={lbl}>Discount %</label>
          <div className="flex items-center gap-2">
            <input type="number" min="0" max="99" value={promoBannerDiscount} onChange={(e) => setPromoBannerDiscount(e.target.value)}
              className="w-24 rounded-md border border-gray-200 px-3 py-2 text-sm focus:border-primary-800 focus:outline-none"/>
            <span className="text-sm text-gray-500">% off</span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button size="sm" loading={savingPromo} onClick={savePromo}>Save Promo</Button>
          {promoSaved && <span className="text-xs text-green-600 font-medium">Saved!</span>}
        </div>
      </div>

      {/* Brand Section */}
      <div className={card}>
        <h2 className={sec}>Brand Section</h2>
        <p className="text-xs text-gray-400">Split image+text block in the middle of the homepage.</p>
        <div>
          <label className={lbl}>Tag (small label above heading)</label>
          <input type="text" value={brandTag} onChange={(e) => setBrandTag(e.target.value)} placeholder="e.g. Our Promise" className={inp}/>
        </div>
        <div>
          <label className={lbl}>Heading</label>
          <textarea rows={2} value={brandHeading} onChange={(e) => setBrandHeading(e.target.value)} placeholder="Jewellery Curated&#10;with Heart" className={`${inp} resize-none`}/>
          <p className="mt-1 text-xs text-gray-400">Use a new line to split into two lines.</p>
        </div>
        <div>
          <label className={lbl}>Body Text</label>
          <textarea rows={3} value={brandBody} onChange={(e) => setBrandBody(e.target.value)} className={`${inp} resize-none`}/>
        </div>
        <div>
          <label className={lbl}>Button Label</label>
          <input type="text" value={brandBtn} onChange={(e) => setBrandBtn(e.target.value)} placeholder="Shop Now" className={inp}/>
        </div>
        <div>
          <label className={lbl}>Image (optional)</label>
          {brandImage ? (
            <div className="relative inline-block">
              <img src={brandImage} alt="Brand" className="h-28 w-48 rounded-md object-cover border border-gray-200"/>
              <button onClick={async () => { setBrandImage(''); await settingsApi.set('BrandImage', '') }}
                className="absolute -right-2 -top-2 rounded-full bg-white border border-gray-200 p-0.5 shadow hover:bg-red-50">
                <X className="h-3.5 w-3.5 text-red-500"/>
              </button>
            </div>
          ) : (
            <button onClick={() => brandImageRef.current?.click()} disabled={uploadingBrandImage}
              className="flex items-center gap-2 rounded-md border-2 border-dashed border-gray-200 px-5 py-4 text-sm text-gray-500 hover:border-primary-400 hover:text-primary-700 transition-colors disabled:opacity-60">
              {uploadingBrandImage ? <Spinner size="sm"/> : <ImagePlus className="h-4 w-4"/>}
              {uploadingBrandImage ? 'Uploading…' : 'Upload jewellery/model photo'}
            </button>
          )}
          <input ref={brandImageRef} type="file" accept="image/*" className="hidden" onChange={handleBrandImageChange}/>
        </div>
        <div className="flex items-center gap-3">
          <Button size="sm" loading={savingBrand} onClick={saveBrand}>Save Brand Section</Button>
          {brandSaved && <span className="text-xs text-green-600 font-medium">Saved!</span>}
        </div>
      </div>

      {/* Newsletter */}
      <div className={card}>
        <h2 className={sec}>Newsletter Section</h2>
        <p className="text-xs text-gray-400">The dark subscribe strip at the bottom of the homepage.</p>
        <div>
          <label className={lbl}>Heading</label>
          <input type="text" value={nlHeading} onChange={(e) => setNlHeading(e.target.value)} placeholder="Join Our World" className={inp}/>
        </div>
        <div>
          <label className={lbl}>Sub-text</label>
          <textarea rows={2} value={nlBody} onChange={(e) => setNlBody(e.target.value)} placeholder="Get early access to new arrivals..." className={`${inp} resize-none`}/>
        </div>
        <div className="flex items-center gap-3">
          <Button size="sm" loading={savingNl} onClick={saveNewsletter}>Save Newsletter</Button>
          {nlSaved && <span className="text-xs text-green-600 font-medium">Saved!</span>}
        </div>
      </div>

      {/* Reviews Summary */}
      <div className={card}>
        <h2 className={sec}>Reviews Summary</h2>
        <div>
          <label className={lbl}>Summary Line</label>
          <input type="text" value={reviewsSummary} onChange={(e) => setReviewsSummary(e.target.value)} placeholder="4.9 out of 5 from 500+ reviews" className={inp}/>
          <p className="mt-1 text-xs text-gray-400">Shown below the star rating in the homepage testimonials section.</p>
        </div>
        <div className="flex items-center gap-3">
          <Button size="sm" loading={savingReviewsSummary} onClick={saveReviewsSummary}>Save</Button>
          {reviewsSummarySaved && <span className="text-xs text-green-600 font-medium">Saved!</span>}
        </div>
      </div>
    </div>
  )
}
