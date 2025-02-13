'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/lib/hooks/useAuth'
import { useRouter } from 'next/navigation'
import { collection, query, getDocs, where } from 'firebase/firestore'
import { db } from '@/lib/firebase/firebase'
import { BlogPost, Restaurant, UserProfile } from '@/lib/types/blog'

const ADMIN_EMAILS = ['admin@dcfoodblog.com'] // Store this in env variables in production

export default function AdminDashboard() {
  const { user } = useAuth()
  const router = useRouter()
  const [stats, setStats] = useState({
    totalPosts: 0,
    totalRestaurants: 0,
    totalUsers: 0,
    pendingVerifications: 0
  })
  const [recentPosts, setRecentPosts] = useState<BlogPost[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user || !ADMIN_EMAILS.includes(user.email!)) {
      router.push('/')
      return
    }

    const fetchDashboardData = async () => {
      try {
        // Fetch posts
        const postsRef = collection(db, 'posts')
        const postsSnapshot = await getDocs(postsRef)
        const posts = postsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as BlogPost[]

        // Fetch restaurants
        const restaurantsRef = collection(db, 'restaurants')
        const restaurantsSnapshot = await getDocs(restaurantsRef)
        const pendingVerifications = restaurantsSnapshot.docs.filter(
          doc => !doc.data().isVerified
        ).length

        // Fetch users
        const usersRef = collection(db, 'users')
        const usersSnapshot = await getDocs(usersRef)

        setStats({
          totalPosts: postsSnapshot.size,
          totalRestaurants: restaurantsSnapshot.size,
          totalUsers: usersSnapshot.size,
          pendingVerifications
        })

        setRecentPosts(posts.slice(0, 5))
      } catch (error) {
        console.error('Error fetching dashboard data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchDashboardData()
  }, [user, router])

  if (loading) {
    return <div className="animate-pulse">Loading dashboard...</div>
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Admin Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-500">Total Posts</h3>
          <p className="text-2xl font-bold">{stats.totalPosts}</p>
        </div>

        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-500">Total Restaurants</h3>
          <p className="text-2xl font-bold">{stats.totalRestaurants}</p>
        </div>

        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-500">Total Users</h3>
          <p className="text-2xl font-bold">{stats.totalUsers}</p>
        </div>

        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-500">Pending Verifications</h3>
          <p className="text-2xl font-bold">{stats.pendingVerifications}</p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold mb-4">Recent Posts</h2>
        <div className="space-y-4">
          {recentPosts.map(post => (
            <div key={post.id} className="border-b pb-4">
              <h3 className="font-medium">{post.title}</h3>
              <p className="text-sm text-gray-500">
                Rating: {post.rating} | Created: {post.createdAt.toLocaleDateString()}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
} 