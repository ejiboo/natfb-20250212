'use client'

import { useState } from 'react'
import FilterBar from '../components/FilterBar'
import BlogPost from '../components/BlogPost'

export default function FindRestaurantPage() {
  const [searchResults, setSearchResults] = useState([])

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Find a Restaurant</h1>
      
      <FilterBar />
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {searchResults.map((result) => (
          <BlogPost key={result.id} post={result} />
        ))}
      </div>
    </div>
  )
} 