'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/lib/hooks/useAuth'
import { getUserProfile } from '@/lib/firebase/blogUtils'
import { Restaurant } from '@/lib/types/blog'
import BlogPost from './BlogPost'

export default function RestaurantRecommendations() {
  const { user } = useAuth()
  const [recommendations, setRecommendations] = useState<Restaurant[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchRecommendations = async () => {
      if (!user) return

      try {
        const userProfile = await getUserProfile(user.uid)
        if (!userProfile) return

        // Fetch restaurants based on user preferences
        const response = await fetch('/api/search?' + new URLSearchParams({
          cuisine: userProfile.favoriteCuisines.join(','),
          location: userProfile.preferredLocations.join(',')
        }))

        if (response.ok) {
          const data = await response.json()
          setRecommendations(data)
        }
      } catch (error) {
        console.error('Error fetching recommendations:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchRecommendations()
  }, [user])

  if (loading) {
    return <div className="animate-pulse">Loading recommendations...</div>
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Recommended for You</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {recommendations.map((restaurant) => (
          <div
            key={restaurant.id}
            className="bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition-shadow"
          >
            <h3 className="font-semibold">{restaurant.name}</h3>
            <p className="text-sm text-gray-600">
              {restaurant.cuisineTypes.join(', ')}
            </p>
            <p className="text-sm text-gray-500">
              {restaurant.location.city}, {restaurant.location.state}
            </p>
          </div>
        ))}
      </div>
    </div>
  )
} 