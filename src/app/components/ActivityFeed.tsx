'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/lib/hooks/useAuth'
import { collection, query, where, orderBy, limit, onSnapshot } from 'firebase/firestore'
import { db } from '@/lib/firebase/firebase'
import Link from 'next/link'

interface Activity {
  id: string
  userId: string
  userName: string
  type: 'post' | 'comment' | 'rating' | 'bookmark'
  targetId: string
  targetTitle: string
  createdAt: Date
}

export default function ActivityFeed() {
  const { user } = useAuth()
  const [activities, setActivities] = useState<Activity[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return

    const activitiesRef = collection(db, 'activities')
    const activitiesQuery = query(
      activitiesRef,
      where('userId', '==', user.uid),
      orderBy('createdAt', 'desc'),
      limit(20)
    )

    const unsubscribe = onSnapshot(activitiesQuery, (snapshot) => {
      const newActivities = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt.toDate()
      })) as Activity[]
      setActivities(newActivities)
      setLoading(false)
    })

    return () => unsubscribe()
  }, [user])

  const getActivityText = (activity: Activity) => {
    switch (activity.type) {
      case 'post':
        return 'wrote a review'
      case 'comment':
        return 'commented on'
      case 'rating':
        return 'rated'
      case 'bookmark':
        return 'bookmarked'
      default:
        return 'interacted with'
    }
  }

  if (loading) {
    return <div className="animate-pulse">Loading activity...</div>
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Your Activity</h2>
      
      <div className="space-y-4">
        {activities.map((activity) => (
          <div key={activity.id} className="bg-white p-4 rounded-lg shadow">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm">
                  You {getActivityText(activity)}{' '}
                  <Link
                    href={`/posts/${activity.targetId}`}
                    className="text-blue-600 hover:underline"
                  >
                    {activity.targetTitle}
                  </Link>
                </p>
                <p className="text-xs text-gray-500">
                  {activity.createdAt.toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
} 