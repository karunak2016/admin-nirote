const MAX_DIMENSION = 2400 // px on longest side — safe for full-bleed banners
const QUALITY = 0.88       // 0.88 WebP = visually lossless, ~60-70% smaller than raw JPEG

export async function compressImage(file: File): Promise<File> {
  // Skip compression for SVG and GIF (animation / vector)
  if (file.type === 'image/svg+xml' || file.type === 'image/gif') return file

  return new Promise((resolve) => {
    const url = URL.createObjectURL(file)
    const img = new Image()

    img.onerror = () => {
      URL.revokeObjectURL(url)
      resolve(file) // fallback: send original
    }

    img.onload = () => {
      URL.revokeObjectURL(url)

      // Scale down only if needed — never upscale
      let { naturalWidth: w, naturalHeight: h } = img
      if (w > MAX_DIMENSION || h > MAX_DIMENSION) {
        const ratio = MAX_DIMENSION / Math.max(w, h)
        w = Math.round(w * ratio)
        h = Math.round(h * ratio)
      }

      const canvas = document.createElement('canvas')
      canvas.width = w
      canvas.height = h

      const ctx = canvas.getContext('2d')
      if (!ctx) { resolve(file); return }

      // White background for JPEG fallback (WebP handles transparency natively)
      ctx.fillStyle = '#ffffff'
      ctx.fillRect(0, 0, w, h)
      ctx.drawImage(img, 0, 0, w, h)

      const outputMime = 'image/webp'

      canvas.toBlob(
        (blob) => {
          if (!blob) { resolve(file); return }

          // If WebP is somehow larger, keep the original
          if (blob.size >= file.size) { resolve(file); return }

          const ext = file.name.replace(/\.[^.]+$/, '')
          const compressed = new File([blob], `${ext}.webp`, { type: outputMime, lastModified: Date.now() })
          resolve(compressed)
        },
        outputMime,
        QUALITY,
      )
    }

    img.src = url
  })
}
