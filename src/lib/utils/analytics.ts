import { collection, query, where, getDocs } from 'firebase/firestore'
import { db } from '@/lib/firebase/firebase'

interface Activity {
  id: string
  type: string
  timestamp: Date
  userId: string
  targetId: string
  metadata?: Record<string, any>
}

interface ViewData {
  date: string
  views: number
}

interface EngagementData {
  name: string
  value: number
}

interface PopularDish {
  name: string
  orders: number
}

interface PeakHourData {
  hour: number
  visitors: number
}

export function processViewTrends(activities: Activity[]): ViewData[] {
  const viewsByDay = activities.reduce((acc, activity) => {
    if (activity.type === 'view') {
      const date = activity.timestamp.toISOString().split('T')[0]
      acc[date] = (acc[date] || 0) + 1
    }
    return acc
  }, {} as Record<string, number>)

  return Object.entries(viewsByDay).map(([date, views]) => ({
    date,
    views
  }))
}

export function processEngagement(activities: Activity[]): EngagementData[] {
  const engagementCounts = activities.reduce((acc, activity) => {
    acc[activity.type] = (acc[activity.type] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  return Object.entries(engagementCounts).map(([name, value]) => ({
    name,
    value
  }))
}

export async function fetchPopularDishes(restaurantId: string): Promise<PopularDish[]> {
  const ordersRef = collection(db, 'restaurants', restaurantId, 'orders')
  const snapshot = await getDocs(ordersRef)
  
  const dishCounts = snapshot.docs.reduce((acc, doc) => {
    const items = doc.data().items || []
    items.forEach((item: { name: string }) => {
      acc[item.name] = (acc[item.name] || 0) + 1
    })
    return acc
  }, {} as Record<string, number>)

  return Object.entries(dishCounts)
    .map(([name, orders]) => ({ name, orders }))
    .sort((a, b) => b.orders - a.orders)
    .slice(0, 10)
}

export function processPeakHours(activities: Activity[]): PeakHourData[] {
  const hourCounts = activities.reduce((acc, activity) => {
    const hour = new Date(activity.timestamp).getHours()
    acc[hour] = (acc[hour] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  return Array.from({ length: 24 }, (_, hour) => ({
    hour,
    visitors: hourCounts[hour] || 0
  }))
}

export async function processCustomerSegments(restaurantId: string) {
  const usersRef = collection(db, 'users')
  const snapshot = await getDocs(usersRef)
  
  const segments = {
    newCustomers: 0,
    returning: 0,
    frequent: 0,
    inactive: 0
  }

  const now = new Date()
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)

  await Promise.all(
    snapshot.docs.map(async (doc) => {
      const visitsRef = collection(db, 'activities')
      const visitsQuery = query(
        visitsRef,
        where('userId', '==', doc.id),
        where('targetId', '==', restaurantId),
        where('type', '==', 'visit')
      )
      const visitsSnapshot = await getDocs(visitsQuery)
      const visits = visitsSnapshot.docs.length

      const recentVisitsQuery = query(
        visitsRef,
        where('userId', '==', doc.id),
        where('targetId', '==', restaurantId),
        where('type', '==', 'visit'),
        where('timestamp', '>=', thirtyDaysAgo)
      )
      const recentVisitsSnapshot = await getDocs(recentVisitsQuery)
      const recentVisits = recentVisitsSnapshot.docs.length

      if (visits === 0) {
        segments.newCustomers++
      } else if (recentVisits === 0) {
        segments.inactive++
      } else if (recentVisits > 3) {
        segments.frequent++
      } else {
        segments.returning++
      }
    })
  )

  return Object.entries(segments).map(([name, value]) => ({
    name,
    value
  }))
} 