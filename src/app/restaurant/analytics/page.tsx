'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/lib/hooks/useAuth'
import { useRouter } from 'next/navigation'
import { collection, query, where, getDocs } from 'firebase/firestore'
import { db } from '@/lib/firebase/firebase'
import { BlogPost, Restaurant } from '@/lib/types/blog'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts'

interface AnalyticsData {
  views: { [date: string]: number }
  ratings: { [date: string]: number[] }
  bookmarks: number
  comments: number
}

export default function RestaurantAnalytics() {
  const { user } = useAuth()
  const router = useRouter()
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null)
  const [analytics, setAnalytics] = useState<AnalyticsData>({
    views: {},
    ratings: {},
    bookmarks: 0,
    comments: 0
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user?.email) {
      router.push('/auth')
      return
    }

    const fetchAnalytics = async () => {
      try {
        const domain = user.email.split('@')[1]
        const restaurantRef = collection(db, 'restaurants')
        const restaurantQuery = query(restaurantRef, where('domain', '==', domain))
        const restaurantSnapshot = await getDocs(restaurantQuery)
        
        if (restaurantSnapshot.empty) {
          throw new Error('Restaurant not found')
        }

        const restaurantData = {
          id: restaurantSnapshot.docs[0].id,
          ...restaurantSnapshot.docs[0].data()
        } as Restaurant

        setRestaurant(restaurantData)

        // Fetch posts for this restaurant
        const postsRef = collection(db, 'posts')
        const postsQuery = query(postsRef, where('restaurantId', '==', restaurantData.id))
        const postsSnapshot = await getDocs(postsQuery)
        const posts = postsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as BlogPost[]

        // Process analytics data
        const analyticsData: AnalyticsData = {
          views: {},
          ratings: {},
          bookmarks: 0,
          comments: 0
        }

        // Process each post
        for (const post of posts) {
          const date = new Date(post.createdAt).toISOString().split('T')[0]
          
          // Add views
          analyticsData.views[date] = (analyticsData.views[date] || 0) + 1

          // Add ratings
          if (post.rating !== 'TBD') {
            if (!analyticsData.ratings[date]) {
              analyticsData.ratings[date] = []
            }
            analyticsData.ratings[date].push(Number(post.rating))
          }
        }

        setAnalytics(analyticsData)
      } catch (error) {
        console.error('Error fetching analytics:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchAnalytics()
  }, [user, router])

  if (loading) {
    return <div className="animate-pulse">Loading analytics...</div>
  }

  const chartData = Object.entries(analytics.views).map(([date, views]) => ({
    date,
    views,
    averageRating: analytics.ratings[date]
      ? analytics.ratings[date].reduce((a, b) => a + b, 0) / analytics.ratings[date].length
      : null
  }))

  return (
    <div className="max-w-7xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">
        Analytics for {restaurant?.name}
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-500">Total Views</h3>
          <p className="text-2xl font-bold">
            {Object.values(analytics.views).reduce((a, b) => a + b, 0)}
          </p>
        </div>

        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-500">Average Rating</h3>
          <p className="text-2xl font-bold">
            {Object.values(analytics.ratings)
              .flat()
              .reduce((a, b) => a + b, 0) / Object.values(analytics.ratings).flat().length}
          </p>
        </div>

        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-500">Total Reviews</h3>
          <p className="text-2xl font-bold">{Object.keys(analytics.views).length}</p>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-lg font-semibold mb-4">Views & Ratings Over Time</h2>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis yAxisId="left" />
              <YAxis yAxisId="right" orientation="right" />
              <Tooltip />
              <Line
                yAxisId="left"
                type="monotone"
                dataKey="views"
                stroke="#2563eb"
                name="Views"
              />
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="averageRating"
                stroke="#16a34a"
                name="Average Rating"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
} 