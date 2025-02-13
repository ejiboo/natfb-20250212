'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/hooks/useAuth'
import { createBlogPost } from '@/lib/firebase/blogUtils'
import { BlogPost } from '@/lib/types/blog'

export default function CreatePostPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    rating: '',
    cuisineTags: '',
    locationTags: '',
    restaurantId: '',
    images: [] as string[],
    videoUrl: ''
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    setIsLoading(true)
    try {
      const post: Omit<BlogPost, 'id' | 'createdAt' | 'updatedAt'> = {
        title: formData.title,
        content: formData.content,
        rating: formData.rating === 'TBD' ? 'TBD' : Number(formData.rating),
        cuisineTags: formData.cuisineTags.split(',').map(tag => tag.trim()),
        locationTags: formData.locationTags.split(',').map(tag => tag.trim()),
        restaurantId: formData.restaurantId,
        images: formData.images,
        videoUrl: formData.videoUrl,
        authorId: user.uid,
        isAIGenerated: false
      }

      await createBlogPost(post)
      router.push('/')
    } catch (error) {
      console.error('Error creating post:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Create New Blog Post</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700">Title</label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Content</label>
          <textarea
            value={formData.content}
            onChange={(e) => setFormData({ ...formData, content: e.target.value })}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
            rows={10}
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Rating (0-100 or TBD)</label>
            <input
              type="text"
              value={formData.rating}
              onChange={(e) => setFormData({ ...formData, rating: e.target.value })}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
              pattern="^(TBD|100|[0-9]{1,2})$"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Cuisine Tags (comma-separated)
            </label>
            <input
              type="text"
              value={formData.cuisineTags}
              onChange={(e) => setFormData({ ...formData, cuisineTags: e.target.value })}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
              required
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:bg-blue-300"
        >
          {isLoading ? 'Creating...' : 'Create Post'}
        </button>
      </form>
    </div>
  )
} 