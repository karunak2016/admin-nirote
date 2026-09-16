const MAX_BYTES = 1 * 1024 * 1024 // 1 MB
const MAX_BANNER_BYTES = 10 * 1024 * 1024 // 10 MB — hero/promo banners only

export function validateImageSize(file: File): string | null {
  if (file.size > MAX_BYTES) {
    const sizeMb = (file.size / 1024 / 1024).toFixed(1)
    return `Image is ${sizeMb} MB. Please upload an image under 1 MB.`
  }
  return null
}

export function validateBannerImageSize(file: File): string | null {
  if (file.size > MAX_BANNER_BYTES) {
    const sizeMb = (file.size / 1024 / 1024).toFixed(1)
    return `Image is ${sizeMb} MB. Please upload an image under 10 MB.`
  }
  return null
}
