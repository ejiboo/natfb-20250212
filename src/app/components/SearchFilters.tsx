'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

const SORT_OPTIONS = {
  'latest': 'Latest',
  'rating-high': 'Highest Rating',
  'rating-low': 'Lowest Rating',
  'popular': 'Most Popular'
}

export default function SearchFilters() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [filters, setFilters] = useState({
    cuisine: searchParams.get('cuisine') || '',
    location: searchParams.get('location') || '',
    rating: searchParams.get('rating') || '',
    sort: searchParams.get('sort') || 'latest'
  })

  const handleFilterChange = (key: string, value: string) => {
    const newFilters = { ...filters, [key]: value }
    setFilters(newFilters)
    
    const params = new URLSearchParams()
    Object.entries(newFilters).forEach(([k, v]) => {
      if (v) params.set(k, v)
    })
    
    router.push(`?${params.toString()}`)
  }

  return (
    <div className="bg-white p-4 rounded-lg shadow space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Cuisine
          </label>
          <select
            value={filters.cuisine}
            onChange={(e) => handleFilterChange('cuisine', e.target.value)}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
          >
            <option value="">All Cuisines</option>
            {/* Add cuisine options */}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Location
          </label>
          <select
            value={filters.location}
            onChange={(e) => handleFilterChange('location', e.target.value)}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
          >
            <option value="">All Locations</option>
            {/* Add location options */}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Minimum Rating
          </label>
          <select
            value={filters.rating}
            onChange={(e) => handleFilterChange('rating', e.target.value)}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
          >
            <option value="">Any Rating</option>
            <option value="90">90+</option>
            <option value="80">80+</option>
            <option value="70">70+</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Sort By
          </label>
          <select
            value={filters.sort}
            onChange={(e) => handleFilterChange('sort', e.target.value)}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
          >
            {Object.entries(SORT_OPTIONS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  )
} 