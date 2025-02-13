'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function ClaimRestaurant() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [restaurantId, setRestaurantId] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [verificationSent, setVerificationSent] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const response = await fetch('/api/verify-restaurant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, restaurantId })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to initiate verification')
      }

      setVerificationSent(true)
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  if (verificationSent) {
    return (
      <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">Verification Email Sent</h2>
        <p className="text-gray-600">
          Please check your email for the verification code. The code will expire in 24 hours.
        </p>
        <button
          onClick={() => router.push('/restaurant/verify')}
          className="mt-4 w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700"
        >
          Enter Verification Code
        </button>
      </div>
    )
  }

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow">
      <h2 className="text-xl font-semibold mb-4">Claim Your Restaurant</h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Business Email
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
            required
          />
          <p className="mt-1 text-sm text-gray-500">
            Must match your restaurant&apos;s domain
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Restaurant ID
          </label>
          <input
            type="text"
            value={restaurantId}
            onChange={(e) => setRestaurantId(e.target.value)}
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
          {loading ? 'Sending...' : 'Send Verification Email'}
        </button>
      </form>
    </div>
  )
} 