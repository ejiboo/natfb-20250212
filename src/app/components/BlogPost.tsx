'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useState } from 'react'
import { useAuth } from '@/lib/hooks/useAuth'

interface SocialLinks {
  website?: string
  googleMaps?: string
  yelp?: string
  facebook?: string
  instagram?: string
  tiktok?: string
  twitter?: string
}

interface BlogPost {
  id: string
  title: string
  rating: number | 'TBD'
  cuisineTags: string[]
  locationTags: string[]
  description: string
  imageUrl: string
  socialLinks: SocialLinks
  createdAt: Date
}

export default function BlogPost({ post }: { post: BlogPost }) {
  const { user } = useAuth()
  const [isBookmarked, setIsBookmarked] = useState(false)

  const handleBookmark = async () => {
    if (!user) return
    setIsBookmarked(!isBookmarked)
    // TODO: Implement bookmark functionality with Firebase
  }

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="relative h-48">
        <Image
          src={post.imageUrl}
          alt={post.title}
          fill
          className="object-cover"
        />
      </div>
      
      <div className="p-4">
        <div className="flex justify-between items-start">
          <h2 className="text-xl font-semibold">{post.title}</h2>
          <button
            onClick={handleBookmark}
            className="text-gray-500 hover:text-yellow-500"
          >
            {isBookmarked ? '★' : '☆'}
          </button>
        </div>

        <div className="mt-2">
          <span className="text-lg font-bold text-orange-500">
            {post.rating === 'TBD' ? 'TBD' : `${post.rating}/100`}
          </span>
        </div>

        <div className="mt-2 flex flex-wrap gap-2">
          {post.cuisineTags.map((tag) => (
            <span
              key={tag}
              className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
            >
              {tag}
            </span>
          ))}
        </div>

        <div className="mt-2 flex flex-wrap gap-2">
          {post.locationTags.map((tag) => (
            <span
              key={tag}
              className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-sm"
            >
              {tag}
            </span>
          ))}
        </div>

        <p className="mt-3 text-gray-600 line-clamp-3">{post.description}</p>

        <div className="mt-4 flex gap-2">
          {Object.entries(post.socialLinks).map(([platform, url]) => (
            url && (
              <Link
                key={platform}
                href={url}
                target="_blank"
                className="text-gray-500 hover:text-gray-700"
              >
                {platform}
              </Link>
            )
          ))}
        </div>
      </div>
    </div>
  )
} 