'use client'

import { useState } from 'react'
import Image from 'next/image'
import { Dialog } from '@headlessui/react'

interface ImageGalleryProps {
  images: string[]
  alt?: string
}

export default function ImageGallery({ images, alt }: ImageGalleryProps) {
  const [selectedImage, setSelectedImage] = useState<string | null>(null)

  return (
    <>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {images.map((image, index) => (
          <div
            key={index}
            className="relative aspect-square cursor-pointer hover:opacity-90"
            onClick={() => setSelectedImage(image)}
          >
            <Image
              src={image}
              alt={`${alt || 'Gallery image'} ${index + 1}`}
              fill
              className="object-cover rounded-lg"
            />
          </div>
        ))}
      </div>

      <Dialog
        open={!!selectedImage}
        onClose={() => setSelectedImage(null)}
        className="relative z-50"
      >
        <div className="fixed inset-0 bg-black/70" aria-hidden="true" />

        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Dialog.Panel className="relative max-w-4xl w-full">
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute -top-10 right-0 text-white hover:text-gray-300"
            >
              Close
            </button>

            {selectedImage && (
              <div className="relative aspect-video">
                <Image
                  src={selectedImage}
                  alt={alt || 'Gallery image'}
                  fill
                  className="object-contain"
                />
              </div>
            )}
          </Dialog.Panel>
        </div>
      </Dialog>
    </>
  )
} 