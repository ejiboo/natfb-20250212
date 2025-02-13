'use client'

import { useAuth } from '@/lib/hooks/useAuth'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

interface UserProfile {
  name: string
  bio: string
  favoritesCuisines: string[]
  preferredLocations: string[]
}

export default function ProfilePage() {
  const { user } = useAuth()
  const router = useRouter()
  const [profile, setProfile] = useState<UserProfile>({
    name: '',
    bio: '',
    favoritesCuisines: [],
    preferredLocations: [],
  })

  useEffect(() => {
    if (!user) {
      router.push('/auth')
      return
    }
    // TODO: Fetch user profile from Firebase
  }, [user, router])

  const handleSave = async () => {
    // TODO: Save profile to Firebase
  }

  return (
    <div className="max-w-2xl mx-auto bg-white p-6 rounded-lg shadow">
      <h1 className="text-2xl font-bold mb-6">Profile</h1>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Name</label>
          <input
            type="text"
            value={profile.name}
            onChange={(e) => setProfile({ ...profile, name: e.target.value })}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Bio</label>
          <textarea
            value={profile.bio}
            onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
            rows={4}
          />
        </div>

        <button
          onClick={handleSave}
          className="bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700"
        >
          Save Profile
        </button>
      </div>
    </div>
  )
} 