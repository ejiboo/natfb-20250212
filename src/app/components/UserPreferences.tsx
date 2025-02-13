'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/lib/hooks/useAuth'
import { getUserProfile, updateUserProfile } from '@/lib/firebase/blogUtils'

const CUISINE_OPTIONS = [
  'American', 'Italian', 'Japanese', 'Chinese', 'Mexican', 
  'Thai', 'Indian', 'Mediterranean', 'French', 'Korean'
]

const LOCATION_OPTIONS = [
  'Washington DC', 'Georgetown', 'Adams Morgan', 'Capitol Hill',
  'Arlington', 'Alexandria', 'Bethesda', 'Silver Spring'
]

export default function UserPreferences() {
  const { user } = useAuth()
  const [preferences, setPreferences] = useState({
    favoriteCuisines: [] as string[],
    preferredLocations: [] as string[]
  })
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    const fetchPreferences = async () => {
      if (!user) return
      const profile = await getUserProfile(user.uid)
      if (profile) {
        setPreferences({
          favoriteCuisines: profile.favoriteCuisines || [],
          preferredLocations: profile.preferredLocations || []
        })
      }
    }

    fetchPreferences()
  }, [user])

  const handleToggleCuisine = (cuisine: string) => {
    setPreferences(prev => ({
      ...prev,
      favoriteCuisines: prev.favoriteCuisines.includes(cuisine)
        ? prev.favoriteCuisines.filter(c => c !== cuisine)
        : [...prev.favoriteCuisines, cuisine]
    }))
  }

  const handleToggleLocation = (location: string) => {
    setPreferences(prev => ({
      ...prev,
      preferredLocations: prev.preferredLocations.includes(location)
        ? prev.preferredLocations.filter(l => l !== location)
        : [...prev.preferredLocations, location]
    }))
  }

  const handleSave = async () => {
    if (!user) return
    setSaving(true)
    try {
      await updateUserProfile(user.uid, preferences)
    } catch (error) {
      console.error('Error saving preferences:', error)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-3">Favorite Cuisines</h3>
        <div className="flex flex-wrap gap-2">
          {CUISINE_OPTIONS.map(cuisine => (
            <button
              key={cuisine}
              onClick={() => handleToggleCuisine(cuisine)}
              className={`px-3 py-1 rounded-full text-sm ${
                preferences.favoriteCuisines.includes(cuisine)
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 text-gray-700'
              }`}
            >
              {cuisine}
            </button>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-3">Preferred Locations</h3>
        <div className="flex flex-wrap gap-2">
          {LOCATION_OPTIONS.map(location => (
            <button
              key={location}
              onClick={() => handleToggleLocation(location)}
              className={`px-3 py-1 rounded-full text-sm ${
                preferences.preferredLocations.includes(location)
                  ? 'bg-green-500 text-white'
                  : 'bg-gray-100 text-gray-700'
              }`}
            >
              {location}
            </button>
          ))}
        </div>
      </div>

      <button
        onClick={handleSave}
        disabled={saving}
        className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:bg-blue-300"
      >
        {saving ? 'Saving...' : 'Save Preferences'}
      </button>
    </div>
  )
} 