import { apiClient } from './client'
import { compressImage } from '../utils/compressImage'

export const uploadApi = {
  uploadImage: async (file: File): Promise<string> => {
    const compressed = await compressImage(file)
    const formData = new FormData()
    formData.append('file', compressed)
    return apiClient
      .post<{ url: string }>('/upload/image', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      .then((r) => r.data.url)
  },

  uploadVideo: async (file: File, onProgress?: (pct: number) => void): Promise<string> => {
    const formData = new FormData()
    formData.append('file', file)
    return apiClient
      .post<{ url: string }>('/upload/video', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (e) => {
          if (onProgress && e.total) onProgress(Math.round((e.loaded * 100) / e.total))
        },
      })
      .then((r) => r.data.url)
  },
}
