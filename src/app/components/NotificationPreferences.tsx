'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/lib/hooks/useAuth'
import { doc, getDoc, updateDoc } from 'firebase/firestore'
import { db } from '@/lib/firebase/firebase'

interface NotificationSettings {
  emailDigest: boolean
  newReviews: boolean
  comments: boolean
  restaurantUpdates: boolean
}

export default function NotificationPreferences() {
  const { user } = useAuth()
  const [settings, setSettings] = useState<NotificationSettings>({
    emailDigest: true,
    newReviews: true,
    comments: true,
    restaurantUpdates: true
  })
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    const fetchSettings = async () => {
      if (!user) return

      const userRef = doc(db, 'users', user.uid)
      const userDoc = await getDoc(userRef)
      if (userDoc.exists() && userDoc.data().notificationSettings) {
        setSettings(userDoc.data().notificationSettings)
      }
    }

    fetchSettings()
  }, [user])

  const handleToggle = (key: keyof NotificationSettings) => {
    setSettings(prev => ({
      ...prev,
      [key]: !prev[key]
    }))
  }

  const handleSave = async () => {
    if (!user) return

    setSaving(true)
    try {
      const userRef = doc(db, 'users', user.uid)
      await updateDoc(userRef, {
        notificationSettings: settings
      })
    } catch (error) {
      console.error('Error saving notification settings:', error)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">Notification Preferences</h2>

      <div className="space-y-4">
        {Object.entries(settings).map(([key, value]) => (
          <div key={key} className="flex items-center justify-between">
            <label className="text-sm font-medium text-gray-700">
              {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
            </label>
            <button
              onClick={() => handleToggle(key as keyof NotificationSettings)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full ${
                value ? 'bg-blue-600' : 'bg-gray-200'
              }`}
            >
              <span className="sr-only">Toggle {key}</span>
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                  value ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        ))}
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