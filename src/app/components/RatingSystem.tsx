'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/lib/hooks/useAuth'
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore'
import { db } from '@/lib/firebase/firebase'

interface RatingProps {
  postId: string
  initialRating?: number
  onRatingChange?: (rating: number) => void
}

export default function RatingSystem({ postId, initialRating, onRatingChange }: RatingProps) {
  const { user } = useAuth()
  const [rating, setRating] = useState<number | null>(null)
  const [hoveredRating, setHoveredRating] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchUserRating = async () => {
      if (!user) {
        setLoading(false)
        return
      }

      try {
        const ratingRef = doc(db, 'ratings', `${user.uid}_${postId}`)
        const ratingDoc = await getDoc(ratingRef)
        
        if (ratingDoc.exists()) {
          setRating(ratingDoc.data().rating)
        }
      } catch (error) {
        console.error('Error fetching rating:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchUserRating()
  }, [user, postId])

  const handleRating = async (value: number) => {
    if (!user) return

    try {
      const ratingRef = doc(db, 'ratings', `${user.uid}_${postId}`)
      await setDoc(ratingRef, {
        userId: user.uid,
        postId,
        rating: value,
        updatedAt: new Date()
      })

      setRating(value)
      onRatingChange?.(value)
    } catch (error) {
      console.error('Error setting rating:', error)
    }
  }

  if (loading) {
    return <div className="animate-pulse">Loading rating...</div>
  }

  return (
    <div className="flex items-center space-x-2">
      <div className="flex">
        {[1, 2, 3, 4, 5].map((value) => (
          <button
            key={value}
            onClick={() => handleRating(value * 20)}
            onMouseEnter={() => setHoveredRating(value)}
            onMouseLeave={() => setHoveredRating(null)}
            className="text-2xl focus:outline-none"
          >
            {value <= ((hoveredRating || rating || 0) / 20) ? '★' : '☆'}
          </button>
        ))}
      </div>
      <span className="text-sm text-gray-500">
        {rating ? `${rating}/100` : 'Not rated'}
      </span>
    </div>
  )
} 