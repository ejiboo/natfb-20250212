'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/hooks/useAuth'
import RichTextEditor from '@/app/components/RichTextEditor'
import ImageUpload from '@/app/components/ImageUpload'
import { createBlogPost } from '@/lib/firebase/blogUtils'
import { collection, getDocs } from 'firebase/firestore'
import { db } from '@/lib/firebase'

export default function NewBlogPost() {
  const { user } = useAuth()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    rating: '',
    cuisineTags: '',
    locationTags: '',
    images: [] as string[],
    videoUrl: ''
  })
  const [selectedRestaurant, setSelectedRestaurant] = useState('')
  const [restaurants, setRestaurants] = useState<Restaurant[]>([])

  useEffect(() => {
    // Fetch available restaurants
    const fetchRestaurants = async () => {
      const restaurantsRef = collection(db, 'restaurants')
      const snapshot = await getDocs(restaurantsRef)
      const restaurantList = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Restaurant[]
      setRestaurants(restaurantList)
    }

    fetchRestaurants()
  }, [])

  const handleImageUpload = (url: string) => {
    setFormData(prev => ({
      ...prev,
      images: [...prev.images, url]
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user || !selectedRestaurant) return

    setLoading(true)
    try {
      const post = {
        title: formData.title,
        content: formData.content,
        rating: formData.rating === 'TBD' ? 'TBD' : Number(formData.rating),
        cuisineTags: formData.cuisineTags.split(',').map(tag => tag.trim()),
        locationTags: formData.locationTags.split(',').map(tag => tag.trim()),
        images: formData.images,
        videoUrl: formData.videoUrl,
        authorId: user.uid,
        restaurantId: selectedRestaurant,
        isAIGenerated: false
      }

      await createBlogPost(post)
      router.push('/')
    } catch (error) {
      console.error('Error creating post:', error)
    } finally {
      setLoading(false)
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
          <RichTextEditor
            value={formData.content}
            onChange={(content) => setFormData({ ...formData, content })}
            placeholder="Write your blog post..."
          />
        </div>

        <ImageUpload onUpload={handleImageUpload} maxImages={5} />

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Rating (0-100 or TBD)
            </label>
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

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700">
            Restaurant
          </label>
          <select
            value={selectedRestaurant}
            onChange={(e) => setSelectedRestaurant(e.target.value)}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
            required
          >
            <option value="">Select a restaurant</option>
            {restaurants.map((restaurant) => (
              <option key={restaurant.id} value={restaurant.id}>
                {restaurant.name}
              </option>
            ))}
          </select>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:bg-blue-300"
        >
          {loading ? 'Creating...' : 'Create Post'}
        </button>
      </form>
    </div>
  )
} 