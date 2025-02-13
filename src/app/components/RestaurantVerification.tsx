'use client'

import { useState } from 'react'
import { useAuth } from '@/lib/hooks/useAuth'
import { doc, updateDoc, getDoc } from 'firebase/firestore'
import { db } from '@/lib/firebase/firebase'

export default function RestaurantVerification() {
  const { user } = useAuth()
  const [verificationCode, setVerificationCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleVerification = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user?.email) return

    setLoading(true)
    setError('')

    try {
      const domain = user.email.split('@')[1]
      const restaurantRef = doc(db, 'restaurants', domain)
      const restaurantDoc = await getDoc(restaurantRef)

      if (!restaurantDoc.exists()) {
        throw new Error('Restaurant not found')
      }

      // In a real app, you'd verify the code against one sent to the restaurant
      if (verificationCode === 'TEST123') {
        await updateDoc(restaurantRef, {
          isVerified: true,
          verifiedAt: new Date(),
          verifiedEmail: user.email
        })
      } else {
        throw new Error('Invalid verification code')
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Verification failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow">
      <h2 className="text-xl font-semibold mb-4">Verify Restaurant Ownership</h2>
      
      <form onSubmit={handleVerification} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Verification Code
          </label>
          <input
            type="text"
            value={verificationCode}
            onChange={(e) => setVerificationCode(e.target.value)}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
            required
          />
        </div>

        {error && (
          <p className="text-red-600 text-sm">{error}</p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:bg-blue-300"
        >
          {loading ? 'Verifying...' : 'Verify Restaurant'}
        </button>
      </form>

      <p className="mt-4 text-sm text-gray-600">
        Please enter the verification code sent to your restaurant&apos;s official email address.
      </p>
    </div>
  )
} 