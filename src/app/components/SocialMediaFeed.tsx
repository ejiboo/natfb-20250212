'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { Restaurant } from '@/lib/types/blog'

interface SocialPost {
  id: string
  platform: 'instagram' | 'facebook' | 'twitter'
  content: string
  imageUrl?: string
  url: string
  createdAt: Date
}

interface SocialMediaFeedProps {
  restaurant: Restaurant
}

export default function SocialMediaFeed({ restaurant }: SocialMediaFeedProps) {
  const [posts, setPosts] = useState<SocialPost[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchSocialPosts = async () => {
      try {
        // In a real app, you'd fetch from social media APIs
        const mockPosts: SocialPost[] = [
          {
            id: '1',
            platform: 'instagram',
            content: 'Check out our new menu items! 🍽️',
            imageUrl: '/mock/instagram-1.jpg',
            url: restaurant.socialLinks.instagram || '',
            createdAt: new Date()
          },
          // Add more mock posts
        ]
        setPosts(mockPosts)
      } catch (error) {
        console.error('Error fetching social posts:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchSocialPosts()
  }, [restaurant])

  if (loading) {
    return <div className="animate-pulse">Loading social media...</div>
  }

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">Social Media</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {posts.map((post) => (
          <a
            key={post.id}
            href={post.url}
            target="_blank"
            rel="noopener noreferrer"
            className="block bg-white rounded-lg shadow hover:shadow-md transition-shadow"
          >
            {post.imageUrl && (
              <div className="relative aspect-square">
                <Image
                  src={post.imageUrl}
                  alt={post.content}
                  fill
                  className="object-cover rounded-t-lg"
                />
              </div>
            )}
            <div className="p-4">
              <p className="text-sm text-gray-600">{post.content}</p>
              <div className="mt-2 flex items-center text-xs text-gray-500">
                <span className="capitalize">{post.platform}</span>
                <span className="mx-2">•</span>
                <span>{post.createdAt.toLocaleDateString()}</span>
              </div>
            </div>
          </a>
        ))}
      </div>
    </div>
  )
} 