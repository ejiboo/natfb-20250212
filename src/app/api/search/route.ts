import { NextResponse } from 'next/server'
import { db } from '@/lib/firebase/firebase'
import { collection, query, where, getDocs } from 'firebase/firestore'
import { Restaurant } from '@/lib/types/blog'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const q = searchParams.get('q')?.toLowerCase()
  const cuisine = searchParams.get('cuisine')
  const location = searchParams.get('location')

  if (!q && !cuisine && !location) {
    return NextResponse.json({ error: 'No search parameters provided' }, { status: 400 })
  }

  try {
    const restaurantsRef = collection(db, 'restaurants')
    let firestoreQuery = query(restaurantsRef)

    if (cuisine) {
      firestoreQuery = query(firestoreQuery, where('cuisineTypes', 'array-contains', cuisine))
    }
    if (location) {
      firestoreQuery = query(firestoreQuery, where('location.city', '==', location))
    }

    const snapshot = await getDocs(firestoreQuery)
    let restaurants = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Restaurant[]

    // If there's a text query, filter results client-side
    if (q) {
      restaurants = restaurants.filter(restaurant => 
        restaurant.name.toLowerCase().includes(q) ||
        restaurant.cuisineTypes.some(cuisine => cuisine.toLowerCase().includes(q)) ||
        restaurant.location.city.toLowerCase().includes(q)
      )
    }

    return NextResponse.json(restaurants)
  } catch (error) {
    console.error('Search error:', error)
    return NextResponse.json(
      { error: 'Failed to search restaurants' },
      { status: 500 }
    )
  }
} 