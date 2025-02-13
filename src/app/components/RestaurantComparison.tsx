'use client'

import { useState, useEffect } from 'react'
import { collection, query, where, getDocs } from 'firebase/firestore'
import { db } from '@/lib/firebase/firebase'
import { Restaurant, BlogPost } from '@/lib/types/blog'
import Image from 'next/image'

interface ComparisonData {
  averageRating: number
  totalReviews: number
  priceLevel: string
  topDishes: string[]
  recentReviews: BlogPost[]
  features: string[]
}

interface ComparisonMap {
  [key: string]: ComparisonData
}

export default function RestaurantComparison({ 
  restaurantIds 
}: { 
  restaurantIds: string[] 
}) {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([])
  const [comparisonData, setComparisonData] = useState<ComparisonMap>({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchComparisonData = async () => {
      try {
        // Fetch restaurants
        const restaurantsRef = collection(db, 'restaurants')
        const restaurantsSnapshot = await getDocs(
          query(restaurantsRef, where('id', 'in', restaurantIds))
        )
        const restaurantData = restaurantsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Restaurant[]
        setRestaurants(restaurantData)

        // Fetch reviews and calculate comparison data
        const data: ComparisonMap = {}
        await Promise.all(
          restaurantIds.map(async (id) => {
            const reviewsRef = collection(db, 'posts')
            const reviewsSnapshot = await getDocs(
              query(reviewsRef, where('restaurantId', '==', id))
            )
            const reviews = reviewsSnapshot.docs.map(doc => ({
              id: doc.id,
              ...doc.data()
            })) as BlogPost[]

            data[id] = {
              averageRating: calculateAverageRating(reviews),
              totalReviews: reviews.length,
              priceLevel: '$$$', // This should come from restaurant data
              topDishes: ['Dish 1', 'Dish 2', 'Dish 3'], // This should be calculated
              recentReviews: reviews.slice(0, 3),
              features: restaurantData.find(r => r.id === id)?.features || []
            }
          })
        )

        setComparisonData(data)
      } catch (error) {
        console.error('Error fetching comparison data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchComparisonData()
  }, [restaurantIds])

  if (loading) {
    return <div className="animate-pulse">Loading comparison...</div>
  }

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {restaurants.map(restaurant => (
          <div key={restaurant.id} className="bg-white rounded-lg shadow">
            <div className="relative h-48">
              <Image
                src={restaurant.imageUrl || '/placeholder.jpg'}
                alt={restaurant.name}
                fill
                className="object-cover rounded-t-lg"
              />
            </div>
            
            <div className="p-4">
              <h3 className="text-lg font-semibold">{restaurant.name}</h3>
              <p className="text-sm text-gray-600">
                {restaurant.cuisineTypes.join(', ')}
              </p>

              <div className="mt-4 space-y-2">
                <div className="flex justify-between">
                  <span>Rating</span>
                  <span className="font-medium">
                    {comparisonData[restaurant.id]?.averageRating.toFixed(1)}/100
                  </span>
                </div>

                <div className="flex justify-between">
                  <span>Reviews</span>
                  <span className="font-medium">
                    {comparisonData[restaurant.id]?.totalReviews}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span>Price</span>
                  <span className="font-medium">
                    {comparisonData[restaurant.id]?.priceLevel}
                  </span>
                </div>
              </div>

              <div className="mt-4">
                <h4 className="font-medium mb-2">Features</h4>
                <div className="flex flex-wrap gap-2">
                  {comparisonData[restaurant.id]?.features.map(feature => (
                    <span
                      key={feature}
                      className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs"
                    >
                      {feature}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function calculateAverageRating(reviews: BlogPost[]): number {
  const ratings = reviews
    .map(r => typeof r.rating === 'number' ? r.rating : 0)
    .filter(r => r > 0)
  
  return ratings.length > 0
    ? ratings.reduce((a, b) => a + b, 0) / ratings.length
    : 0
} 