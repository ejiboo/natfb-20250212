'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/lib/hooks/useAuth'
import { useRouter } from 'next/navigation'
import { Restaurant } from '@/lib/types/blog'
import { doc, getDoc, updateDoc } from 'firebase/firestore'
import { db } from '@/lib/firebase/firebase'

type SocialPlatform = 'website' | 'googleMaps' | 'yelp' | 'facebook' | 'instagram' | 'tiktok' | 'twitter'

export default function RestaurantEditPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [restaurant, setRestaurant] = useState<Restaurant>({
    id: '',
    name: '',
    domain: '',
    cuisineTypes: [],
    location: {
      address: '',
      city: '',
      state: '',
      zip: '',
    },
    socialLinks: {
      website: '',
      googleMaps: '',
      yelp: '',
      facebook: '',
      instagram: '',
      tiktok: '',
      twitter: ''
    }
  })

  useEffect(() => {
    if (!user?.email) {
      router.push('/auth')
      return
    }

    const domain = user.email.split('@')[1]
    // Fetch restaurant by domain
    const fetchRestaurant = async () => {
      const restaurantsRef = doc(db, 'restaurants', domain)
      const snapshot = await getDoc(restaurantsRef)
      if (snapshot.exists()) {
        setRestaurant(snapshot.data() as Restaurant)
      }
    }

    fetchRestaurant()
  }, [user, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user?.email) return

    const domain = user.email.split('@')[1]
    const restaurantRef = doc(db, 'restaurants', domain)
    
    try {
      await updateDoc(restaurantRef, restaurant)
      router.push('/profile')
    } catch (error) {
      console.error('Error updating restaurant:', error)
    }
  }

  const platforms: SocialPlatform[] = ['website', 'googleMaps', 'yelp', 'facebook', 'instagram', 'tiktok', 'twitter']

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Edit Restaurant Profile</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Restaurant Name
          </label>
          <input
            type="text"
            value={restaurant.name}
            onChange={(e) => setRestaurant({ ...restaurant, name: e.target.value })}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
            required
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Address
            </label>
            <input
              type="text"
              value={restaurant.location?.address}
              onChange={(e) => setRestaurant({
                ...restaurant,
                location: { ...restaurant.location, address: e.target.value }
              })}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              City
            </label>
            <input
              type="text"
              value={restaurant.location?.city}
              onChange={(e) => setRestaurant({
                ...restaurant,
                location: { ...restaurant.location, city: e.target.value }
              })}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Social Links
          </label>
          <div className="space-y-2">
            {platforms.map((platform) => (
              <input
                key={platform}
                type="url"
                placeholder={platform}
                value={restaurant.socialLinks[platform] || ''}
                onChange={(e) => setRestaurant({
                  ...restaurant,
                  socialLinks: { ...restaurant.socialLinks, [platform]: e.target.value }
                })}
                className="block w-full rounded-md border border-gray-300 px-3 py-2"
              />
            ))}
          </div>
        </div>

        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700"
        >
          Save Changes
        </button>
      </form>
    </div>
  )
} 