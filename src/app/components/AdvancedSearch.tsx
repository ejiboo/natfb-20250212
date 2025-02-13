'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore'
import { db } from '@/lib/firebase/firebase'
import { Restaurant } from '@/lib/types/blog'

interface SearchFilters {
  cuisine: string[]
  location: string[]
  priceRange: string
  rating: string
  features: string[]
}

export default function AdvancedSearch() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [filters, setFilters] = useState<SearchFilters>({
    cuisine: [],
    location: [],
    priceRange: '',
    rating: '',
    features: []
  })
  const [results, setResults] = useState<Restaurant[]>([])
  const [loading, setLoading] = useState(false)

  const FEATURES = [
    'Outdoor Seating',
    'Delivery',
    'Takeout',
    'Reservations',
    'Wheelchair Accessible',
    'Full Bar',
    'Vegetarian Options',
    'Vegan Options',
    'Gluten-Free Options'
  ]

  const handleSearch = async () => {
    setLoading(true)
    try {
      let searchQuery = query(collection(db, 'restaurants'))

      if (filters.cuisine.length > 0) {
        searchQuery = query(
          searchQuery,
          where('cuisineTypes', 'array-contains-any', filters.cuisine)
        )
      }

      if (filters.location.length > 0) {
        searchQuery = query(
          searchQuery,
          where('location.city', 'in', filters.location)
        )
      }

      if (filters.rating) {
        searchQuery = query(
          searchQuery,
          where('averageRating', '>=', Number(filters.rating))
        )
      }

      const snapshot = await getDocs(searchQuery)
      let restaurants = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Restaurant[]

      // Client-side filtering for features
      if (filters.features.length > 0) {
        restaurants = restaurants.filter(restaurant =>
          filters.features.every(feature =>
            restaurant.features?.includes(feature)
          )
        )
      }

      setResults(restaurants)
    } catch (error) {
      console.error('Search error:', error)
    } finally {
      setLoading(false)
    }
  }

  const toggleFilter = (type: keyof SearchFilters, value: string) => {
    setFilters(prev => {
      if (Array.isArray(prev[type])) {
        const array = prev[type] as string[]
        return {
          ...prev,
          [type]: array.includes(value)
            ? array.filter(v => v !== value)
            : [...array, value]
        }
      }
      return {
        ...prev,
        [type]: value
      }
    })
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <h3 className="text-sm font-medium text-gray-700 mb-2">Cuisine</h3>
          <div className="space-y-2">
            {/* Add cuisine checkboxes */}
          </div>
        </div>

        <div>
          <h3 className="text-sm font-medium text-gray-700 mb-2">Location</h3>
          <div className="space-y-2">
            {/* Add location checkboxes */}
          </div>
        </div>

        <div>
          <h3 className="text-sm font-medium text-gray-700 mb-2">Features</h3>
          <div className="space-y-2">
            {FEATURES.map(feature => (
              <label key={feature} className="flex items-center">
                <input
                  type="checkbox"
                  checked={filters.features.includes(feature)}
                  onChange={() => toggleFilter('features', feature)}
                  className="rounded border-gray-300"
                />
                <span className="ml-2 text-sm">{feature}</span>
              </label>
            ))}
          </div>
        </div>
      </div>

      <div className="flex gap-4">
        <select
          value={filters.rating}
          onChange={(e) => setFilters(prev => ({ ...prev, rating: e.target.value }))}
          className="rounded-md border border-gray-300 px-3 py-2"
        >
          <option value="">Any Rating</option>
          <option value="90">90+</option>
          <option value="80">80+</option>
          <option value="70">70+</option>
        </select>

        <select
          value={filters.priceRange}
          onChange={(e) => setFilters(prev => ({ ...prev, priceRange: e.target.value }))}
          className="rounded-md border border-gray-300 px-3 py-2"
        >
          <option value="">Any Price</option>
          <option value="$">$</option>
          <option value="$$">$$</option>
          <option value="$$$">$$$</option>
          <option value="$$$$">$$$$</option>
        </select>
      </div>

      <button
        onClick={handleSearch}
        disabled={loading}
        className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:bg-blue-300"
      >
        {loading ? 'Searching...' : 'Search'}
      </button>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {results.map(restaurant => (
          <div key={restaurant.id} className="bg-white p-4 rounded-lg shadow">
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