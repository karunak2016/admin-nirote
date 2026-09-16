import { apiClient } from './client'

// ─── Types ───────────────────────────────────────────────────────

export interface NavItem {
  id: number; label: string; url: string; parentId: number | null
  displayOrder: number; isEnabled: boolean; openInNewTab: boolean
}
export interface Banner {
  id: number; badge?: string; heading: string; subheading?: string
  imageUrl?: string; mobileImageUrl?: string; textAlign: string
  btn1Text?: string; btn1Url?: string; btn2Text?: string; btn2Url?: string
  isActive: boolean; scheduledStart?: string; scheduledEnd?: string
  displayOrder: number; priority: number; createdAt?: string; updatedAt?: string
}
export interface HomeSection {
  id: number; sectionKey: string; heading?: string; subheading?: string
  ctaText?: string; ctaUrl?: string; isEnabled: boolean; displayOrder: number
}
export interface Testimonial {
  id: number; authorName: string; authorCity?: string; authorImage?: string
  text: string; rating: number; isActive: boolean; displayOrder: number; createdAt?: string
}
export interface FaqCategory { id: number; name: string; displayOrder: number; isActive: boolean }
export interface FaqItem {
  id: number; categoryId: number; question: string; answer: string
  displayOrder: number; isActive: boolean; createdAt?: string
}
export interface PolicyPage { id: number; slug: string; title: string; sections: string; updatedAt: string }
export interface SeoPage {
  id?: number; pageKey: string; metaTitle?: string; metaDesc?: string
  keywords?: string; ogImage?: string; updatedAt?: string
}
export interface WhyItem {
  id: number; iconName: string; title: string; description: string
  displayOrder: number; isActive: boolean
}
export interface InstagramPost {
  id: number; imageUrl: string; postUrl?: string; caption?: string
  displayOrder: number; isActive: boolean; createdAt?: string
}
export interface Popup {
  id: number; popupType: string; heading?: string; subheading?: string
  imageUrl?: string; buttonText?: string; buttonUrl?: string; couponCode?: string
  isEnabled: boolean; triggerDelay: number; updatedAt?: string
}
export interface EmailTemplate {
  id: number; templateType: string; subject: string; body: string
  isEnabled: boolean; updatedAt?: string
}
export interface CmsCollection {
  id: number; name: string; slug: string; bannerUrl?: string; imageUrl?: string
  description?: string; seoTitle?: string; seoDesc?: string
  displayOrder: number; isActive: boolean; createdAt?: string; updatedAt?: string
}

// ─── Nav ─────────────────────────────────────────────────────────

export const cmsNavApi = {
  getAll: (): Promise<NavItem[]> =>
    apiClient.get('/cms/nav').then(r => r.data),
  save: (item: Partial<NavItem> & { id: number }): Promise<{ id: number }> =>
    apiClient.post('/cms/nav', item).then(r => r.data),
  delete: (id: number) =>
    apiClient.post(`/cms/nav/delete/${id}`).then(r => r.data),
  reorder: (items: { id: number; displayOrder: number }[]) =>
    apiClient.post('/cms/nav/reorder', items).then(r => r.data),
}

// ─── Banners ─────────────────────────────────────────────────────

export const cmsBannersApi = {
  getAll: (): Promise<Banner[]> =>
    apiClient.get('/cms/banners').then(r => r.data),
  save: (b: Partial<Banner> & { id: number }): Promise<{ id: number }> =>
    apiClient.post('/cms/banners', b).then(r => r.data),
  delete: (id: number) =>
    apiClient.post(`/cms/banners/delete/${id}`).then(r => r.data),
}

// ─── HomeSections ─────────────────────────────────────────────────

export const cmsSectionsApi = {
  getAll: (): Promise<HomeSection[]> =>
    apiClient.get('/cms/sections').then(r => r.data),
  save: (s: HomeSection) =>
    apiClient.post('/cms/sections', s).then(r => r.data),
  reorder: (items: { sectionKey: string; displayOrder: number }[]) =>
    apiClient.post('/cms/sections/reorder', items).then(r => r.data),
  toggle: (sectionKey: string, isEnabled: boolean) =>
    apiClient.post(`/cms/sections/toggle/${sectionKey}`, { isEnabled }).then(r => r.data),
}

// ─── Testimonials ─────────────────────────────────────────────────

export const cmsTestimonialsApi = {
  getAll: (): Promise<Testimonial[]> =>
    apiClient.get('/cms/testimonials/all').then(r => r.data),
  save: (t: Partial<Testimonial> & { id: number }): Promise<{ id: number }> =>
    apiClient.post('/cms/testimonials', t).then(r => r.data),
  delete: (id: number) =>
    apiClient.post(`/cms/testimonials/delete/${id}`).then(r => r.data),
}

// ─── FAQ ─────────────────────────────────────────────────────────

export const cmsFaqApi = {
  getAll: (): Promise<{ categories: FaqCategory[]; items: FaqItem[] }> =>
    apiClient.get('/cms/faq/all').then(r => r.data),
  saveCategory: (c: Partial<FaqCategory> & { id: number }): Promise<{ id: number }> =>
    apiClient.post('/cms/faq/categories', c).then(r => r.data),
  deleteCategory: (id: number) =>
    apiClient.post(`/cms/faq/categories/delete/${id}`).then(r => r.data),
  saveItem: (item: Partial<FaqItem> & { id: number }): Promise<{ id: number }> =>
    apiClient.post('/cms/faq/items', item).then(r => r.data),
  deleteItem: (id: number) =>
    apiClient.post(`/cms/faq/items/delete/${id}`).then(r => r.data),
}

// ─── Policies ─────────────────────────────────────────────────────

export const cmsPoliciesApi = {
  getAll: (): Promise<{ id: number; slug: string; title: string; updatedAt: string }[]> =>
    apiClient.get('/cms/policies').then(r => r.data),
  get: (slug: string): Promise<PolicyPage> =>
    apiClient.get(`/cms/policies/${slug}`).then(r => r.data),
  save: (slug: string, data: { title: string; sections: string }) =>
    apiClient.post(`/cms/policies/${slug}`, data).then(r => r.data),
}

// ─── SEO ─────────────────────────────────────────────────────────

export const cmsSeoApi = {
  getAll: (): Promise<SeoPage[]> =>
    apiClient.get('/cms/seo').then(r => r.data),
  get: (pageKey: string): Promise<SeoPage> =>
    apiClient.get(`/cms/seo/${pageKey}`).then(r => r.data),
  save: (pageKey: string, data: Omit<SeoPage, 'id' | 'pageKey' | 'updatedAt'>) =>
    apiClient.post(`/cms/seo/${pageKey}`, data).then(r => r.data),
}

// ─── WhyChooseUs ─────────────────────────────────────────────────

export const cmsWhyApi = {
  getAll: (): Promise<WhyItem[]> =>
    apiClient.get('/cms/why-choose-us/all').then(r => r.data),
  save: (item: Partial<WhyItem> & { id: number }): Promise<{ id: number }> =>
    apiClient.post('/cms/why-choose-us', item).then(r => r.data),
  delete: (id: number) =>
    apiClient.post(`/cms/why-choose-us/delete/${id}`).then(r => r.data),
}

// ─── Instagram ───────────────────────────────────────────────────

export const cmsInstagramApi = {
  getAll: (): Promise<InstagramPost[]> =>
    apiClient.get('/cms/instagram/all').then(r => r.data),
  save: (post: Partial<InstagramPost> & { id: number }): Promise<{ id: number }> =>
    apiClient.post('/cms/instagram', post).then(r => r.data),
  delete: (id: number) =>
    apiClient.post(`/cms/instagram/delete/${id}`).then(r => r.data),
}

// ─── Popups ──────────────────────────────────────────────────────

export const cmsPopupsApi = {
  getAll: (): Promise<Popup[]> =>
    apiClient.get('/cms/popups').then(r => r.data),
  save: (popupType: string, data: Omit<Popup, 'id' | 'popupType' | 'updatedAt'>) =>
    apiClient.post(`/cms/popups/${popupType}`, data).then(r => r.data),
}

// ─── Email Templates ─────────────────────────────────────────────

export const cmsEmailApi = {
  getAll: (): Promise<EmailTemplate[]> =>
    apiClient.get('/cms/email-templates').then(r => r.data),
  get: (templateType: string): Promise<EmailTemplate> =>
    apiClient.get(`/cms/email-templates/${templateType}`).then(r => r.data),
  save: (templateType: string, data: { subject: string; body: string; isEnabled: boolean }) =>
    apiClient.post(`/cms/email-templates/${templateType}`, data).then(r => r.data),
}

// ─── CMS Collections ─────────────────────────────────────────────

export const cmsCollectionsApi = {
  getAll: (): Promise<CmsCollection[]> =>
    apiClient.get('/cms/collections/all').then(r => r.data),
  save: (c: Partial<CmsCollection> & { id: number }): Promise<{ id: number }> =>
    apiClient.post('/cms/collections', c).then(r => r.data),
  delete: (id: number) =>
    apiClient.post(`/cms/collections/delete/${id}`).then(r => r.data),
  getByProduct: (productId: number): Promise<number[]> =>
    apiClient.get(`/cms/collections/by-product/${productId}`).then(r => r.data),
  setForProduct: (productId: number, collectionIds: number[]): Promise<void> =>
    apiClient.post(`/cms/collections/set-for-product/${productId}`, { collectionIds }).then(() => {}),
}
