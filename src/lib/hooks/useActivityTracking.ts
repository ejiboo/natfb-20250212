import { useEffect } from 'react'
import { useAuth } from './useAuth'
import { collection, addDoc } from 'firebase/firestore'
import { db } from '@/lib/firebase/firebase'

type ActivityType = 'view' | 'like' | 'comment' | 'bookmark' | 'share'

interface TrackingOptions {
  targetId: string
  targetType: 'post' | 'restaurant' | 'menu'
  metadata?: Record<string, any>
}

export function useActivityTracking() {
  const { user } = useAuth()

  const trackActivity = async (type: ActivityType, options: TrackingOptions) => {
    if (!user) return

    try {
      const activityRef = collection(db, 'activities')
      await addDoc(activityRef, {
        userId: user.uid,
        type,
        targetId: options.targetId,
        targetType: options.targetType,
        metadata: options.metadata,
        timestamp: new Date()
      })
    } catch (error) {
      console.error('Error tracking activity:', error)
    }
  }

  const trackPageView = async (options: TrackingOptions) => {
    await trackActivity('view', options)
  }

  useEffect(() => {
    return () => {
      // Cleanup if needed
    }
  }, [])

  return {
    trackActivity,
    trackPageView
  }
} 