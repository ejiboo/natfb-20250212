'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/lib/hooks/useAuth'
import { collection, query, where, getDocs, updateDoc, doc } from 'firebase/firestore'
import { db } from '@/lib/firebase/firebase'
import { BlogPost } from '@/lib/types/blog'

interface ReviewModerationProps {
  restaurantId: string
}

export default function ReviewModeration({ restaurantId }: ReviewModerationProps) {
  const { user } = useAuth()
  const [reviews, setReviews] = useState<BlogPost[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchReviews = async () => {
      if (!user) return

      try {
        const reviewsRef = collection(db, 'posts')
        const reviewsQuery = query(
          reviewsRef,
          where('restaurantId', '==', restaurantId),
          where('needsModeration', '==', true)
        )
        const snapshot = await getDocs(reviewsQuery)
        const reviewData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as BlogPost[]
        setReviews(reviewData)
      } catch (error) {
        console.error('Error fetching reviews:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchReviews()
  }, [user, restaurantId])

  const handleModeration = async (reviewId: string, action: 'approve' | 'reject') => {
    try {
      const reviewRef = doc(db, 'posts', reviewId)
      await updateDoc(reviewRef, {
        needsModeration: false,
        status: action,
        moderatedAt: new Date(),
        moderatedBy: user?.uid
      })

      setReviews(prev => prev.filter(review => review.id !== reviewId))
    } catch (error) {
      console.error('Error moderating review:', error)
    }
  }

  if (loading) {
    return <div className="animate-pulse">Loading reviews...</div>
  }

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">Review Moderation</h2>

      {reviews.length === 0 ? (
        <p className="text-gray-600">No reviews need moderation.</p>
      ) : (
        <div className="space-y-4">
          {reviews.map((review) => (
            <div key={review.id} className="bg-white p-4 rounded-lg shadow">
              <h3 className="font-medium">{review.title}</h3>
              <p className="mt-2 text-gray-600">{review.content}</p>
              
              <div className="mt-4 flex gap-4">
                <button
                  onClick={() => handleModeration(review.id, 'approve')}
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                >
                  Approve
                </button>
                <button
                  onClick={() => handleModeration(review.id, 'reject')}
                  className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                >
                  Reject
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
} 