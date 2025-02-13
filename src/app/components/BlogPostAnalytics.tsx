'use client'

import { useState, useEffect } from 'react'
import { collection, query, where, getDocs } from 'firebase/firestore'
import { db } from '@/lib/firebase/firebase'
import { BlogPost } from '@/lib/types/blog'

interface Analytics {
  totalViews: number
  uniqueVisitors: number
  averageRating: number
  totalBookmarks: number
  topCuisines: { cuisine: string; count: number }[]
}

export default function BlogPostAnalytics({ postId }: { postId: string }) {
  const [analytics, setAnalytics] = useState<Analytics>({
    totalViews: 0,
    uniqueVisitors: 0,
    averageRating: 0,
    totalBookmarks: 0,
    topCuisines: []
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        // Get post views
        const viewsRef = collection(db, 'postViews')
        const viewsQuery = query(viewsRef, where('postId', '==', postId))
        const viewsSnapshot = await getDocs(viewsQuery)
        const totalViews = viewsSnapshot.size
        const uniqueVisitors = new Set(viewsSnapshot.docs.map(doc => doc.data().userId)).size

        // Get post ratings
        const ratingsRef = collection(db, 'ratings')
        const ratingsQuery = query(ratingsRef, where('postId', '==', postId))
        const ratingsSnapshot = await getDocs(ratingsQuery)
        const ratings = ratingsSnapshot.docs.map(doc => doc.data().rating)
        const averageRating = ratings.length > 0 
          ? ratings.reduce((a, b) => a + b, 0) / ratings.length 
          : 0

        // Get bookmarks
        const bookmarksRef = collection(db, 'users')
        const bookmarksSnapshot = await getDocs(bookmarksRef)
        const totalBookmarks = bookmarksSnapshot.docs.reduce((count, doc) => {
          const bookmarks = doc.data().bookmarks || []
          return count + (bookmarks.includes(postId) ? 1 : 0)
        }, 0)

        setAnalytics({
          totalViews,
          uniqueVisitors,
          averageRating,
          totalBookmarks,
          topCuisines: [] // TODO: Implement cuisine analytics
        })
      } catch (error) {
        console.error('Error fetching analytics:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchAnalytics()
  }, [postId])

  if (loading) {
    return <div className="animate-pulse">Loading analytics...</div>
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <div className="bg-white p-4 rounded-lg shadow">
        <h3 className="text-sm font-medium text-gray-500">Total Views</h3>
        <p className="text-2xl font-bold">{analytics.totalViews}</p>
      </div>

      <div className="bg-white p-4 rounded-lg shadow">
        <h3 className="text-sm font-medium text-gray-500">Unique Visitors</h3>
        <p className="text-2xl font-bold">{analytics.uniqueVisitors}</p>
      </div>

      <div className="bg-white p-4 rounded-lg shadow">
        <h3 className="text-sm font-medium text-gray-500">Average Rating</h3>
        <p className="text-2xl font-bold">{analytics.averageRating.toFixed(1)}</p>
      </div>

      <div className="bg-white p-4 rounded-lg shadow">
        <h3 className="text-sm font-medium text-gray-500">Bookmarks</h3>
        <p className="text-2xl font-bold">{analytics.totalBookmarks}</p>
      </div>
    </div>
  )
} 