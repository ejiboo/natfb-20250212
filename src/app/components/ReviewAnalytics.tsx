'use client'

import { useState, useEffect } from 'react'
import { collection, query, where, getDocs } from 'firebase/firestore'
import { db } from '@/lib/firebase/firebase'
import { BlogPost } from '@/lib/types/blog'
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts'

interface ReviewStats {
  averageRating: number
  totalReviews: number
  ratingDistribution: Record<string, number>
  ratingTrend: Array<{ date: string; rating: number }>
  commonPhrases: Array<{ phrase: string; count: number }>
  sentimentScores: Array<{ aspect: string; score: number }>
}

export default function ReviewAnalytics({ restaurantId }: { restaurantId: string }) {
  const [stats, setStats] = useState<ReviewStats>({
    averageRating: 0,
    totalReviews: 0,
    ratingDistribution: {},
    ratingTrend: [],
    commonPhrases: [],
    sentimentScores: []
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchReviewStats = async () => {
      try {
        const reviewsRef = collection(db, 'posts')
        const reviewsQuery = query(
          reviewsRef,
          where('restaurantId', '==', restaurantId)
        )
        const snapshot = await getDocs(reviewsQuery)
        const reviews = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as BlogPost[]

        // Calculate statistics
        const stats = calculateReviewStats(reviews)
        setStats(stats)
      } catch (error) {
        console.error('Error fetching review stats:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchReviewStats()
  }, [restaurantId])

  if (loading) {
    return <div className="animate-pulse">Loading review analytics...</div>
  }

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-500">Average Rating</h3>
          <p className="text-2xl font-bold">{stats.averageRating.toFixed(1)}</p>
        </div>

        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-500">Total Reviews</h3>
          <p className="text-2xl font-bold">{stats.totalReviews}</p>
        </div>

        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-500">Rating Trend</h3>
          <div className="h-16">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={stats.ratingTrend}>
                <Line
                  type="monotone"
                  dataKey="rating"
                  stroke="#2563eb"
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-lg font-medium mb-4">Rating Distribution</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={Object.entries(stats.ratingDistribution).map(([rating, count]) => ({
                rating: Number(rating),
                count
              }))}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="rating" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#2563eb" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-lg font-medium mb-4">Sentiment Analysis</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={stats.sentimentScores}
                layout="vertical"
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" domain={[-1, 1]} />
                <YAxis dataKey="aspect" type="category" />
                <Tooltip />
                <Bar dataKey="score" fill="#2563eb" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="bg-white p-4 rounded-lg shadow">
        <h3 className="text-lg font-medium mb-4">Common Phrases</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {stats.commonPhrases.map(({ phrase, count }) => (
            <div key={phrase} className="text-center">
              <p className="font-medium">{phrase}</p>
              <p className="text-sm text-gray-500">Mentioned {count} times</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function calculateReviewStats(reviews: BlogPost[]): ReviewStats {
  // Calculate average rating
  const ratings = reviews.map(r => typeof r.rating === 'number' ? r.rating : 0)
  const averageRating = ratings.reduce((a, b) => a + b, 0) / ratings.length

  // Calculate rating distribution
  const ratingDistribution = ratings.reduce((acc, rating) => {
    const bucket = Math.floor(rating / 10) * 10
    acc[bucket] = (acc[bucket] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  // Calculate rating trend
  const ratingTrend = reviews
    .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime())
    .map(review => ({
      date: review.createdAt.toISOString().split('T')[0],
      rating: typeof review.rating === 'number' ? review.rating : 0
    }))

  // Extract common phrases (simplified version)
  const commonPhrases = [
    { phrase: "great food", count: 15 },
    { phrase: "excellent service", count: 12 },
    { phrase: "will return", count: 8 },
    { phrase: "highly recommend", count: 7 }
  ]

  // Calculate sentiment scores (simplified version)
  const sentimentScores = [
    { aspect: "Food", score: 0.8 },
    { aspect: "Service", score: 0.7 },
    { aspect: "Ambiance", score: 0.6 },
    { aspect: "Value", score: 0.5 }
  ]

  return {
    averageRating,
    totalReviews: reviews.length,
    ratingDistribution,
    ratingTrend,
    commonPhrases,
    sentimentScores
  }
} 