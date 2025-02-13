'use client'

import { useState, useEffect } from 'react'
import { collection, query, where, getDocs } from 'firebase/firestore'
import { db } from '@/lib/firebase/firebase'
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts'
import {
  processViewTrends,
  processEngagement,
  fetchPopularDishes,
  processPeakHours,
  processCustomerSegments
} from '@/lib/utils/analytics'

interface AnalyticsProps {
  restaurantId: string
  startDate: Date
  endDate: Date
}

export default function AdvancedAnalytics({ restaurantId, startDate, endDate }: AnalyticsProps) {
  const [data, setData] = useState({
    viewsByDay: [],
    engagementByType: [],
    popularDishes: [],
    peakHours: [],
    customerSegments: []
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        // Fetch activities
        const activitiesRef = collection(db, 'activities')
        const activitiesQuery = query(
          activitiesRef,
          where('targetId', '==', restaurantId),
          where('timestamp', '>=', startDate),
          where('timestamp', '<=', endDate)
        )
        const activitiesSnapshot = await getDocs(activitiesQuery)
        
        // Process data for different charts
        const activities = activitiesSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }))

        // Process view trends
        const viewsByDay = processViewTrends(activities)
        
        // Process engagement metrics
        const engagementByType = processEngagement(activities)
        
        // Process popular items
        const popularDishes = await fetchPopularDishes(restaurantId)
        
        // Process peak hours
        const peakHours = processPeakHours(activities)
        
        // Process customer segments
        const customerSegments = await processCustomerSegments(restaurantId)

        setData({
          viewsByDay,
          engagementByType,
          popularDishes,
          peakHours,
          customerSegments
        })
      } catch (error) {
        console.error('Error fetching analytics:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchAnalytics()
  }, [restaurantId, startDate, endDate])

  if (loading) {
    return <div className="animate-pulse">Loading analytics...</div>
  }

  return (
    <div className="space-y-8">
      <h2 className="text-xl font-semibold">Advanced Analytics</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* View Trends */}
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-lg font-medium mb-4">View Trends</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data.viewsByDay}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="views" stroke="#2563eb" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Engagement by Type */}
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-lg font-medium mb-4">Engagement Distribution</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data.engagementByType}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  label
                >
                  {data.engagementByType.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={`#${Math.floor(Math.random()*16777215).toString(16)}`} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Popular Dishes */}
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-lg font-medium mb-4">Popular Dishes</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.popularDishes}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="orders" fill="#2563eb" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Peak Hours */}
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-lg font-medium mb-4">Peak Hours</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data.peakHours}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="hour" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="visitors" stroke="#2563eb" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  )
} 