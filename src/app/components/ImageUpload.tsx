'use client'

import { useState, useRef } from 'react'
import Image from 'next/image'
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage'
import { v4 as uuidv4 } from 'uuid'

interface ImageUploadProps {
  onUpload: (url: string) => void
  maxImages?: number
}

export default function ImageUpload({ onUpload, maxImages = 5 }: ImageUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [images, setImages] = useState<string[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || images.length >= maxImages) return

    setUploading(true)
    const file = e.target.files[0]
    const storage = getStorage()
    const fileRef = ref(storage, `blog-images/${uuidv4()}-${file.name}`)

    try {
      const snapshot = await uploadBytes(fileRef, file)
      const url = await getDownloadURL(snapshot.ref)
      setImages([...images, url])
      onUpload(url)
    } catch (error) {
      console.error('Error uploading image:', error)
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-4">
        {images.map((url, index) => (
          <div key={index} className="relative w-24 h-24">
            <Image
              src={url}
              alt={`Uploaded image ${index + 1}`}
              fill
              className="object-cover rounded-lg"
            />
          </div>
        ))}
      </div>

      {images.length < maxImages && (
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="px-4 py-2 border-2 border-dashed border-gray-300 rounded-lg hover:border-gray-400"
        >
          {uploading ? 'Uploading...' : 'Add Image'}
        </button>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleUpload}
        className="hidden"
      />
    </div>
  )
} 