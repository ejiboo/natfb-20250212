import { NextResponse } from 'next/server'
import { db } from '@/lib/firebase/firebase'
import { doc, getDoc, updateDoc } from 'firebase/firestore'
import { generateVerificationEmail, sendEmail } from '@/lib/utils/notifications'
import { Restaurant } from '@/lib/types/blog'

export async function POST(req: Request) {
  try {
    const { email, restaurantId } = await req.json()

    // Verify email domain matches restaurant domain
    const restaurantRef = doc(db, 'restaurants', restaurantId)
    const restaurantDoc = await getDoc(restaurantRef)

    if (!restaurantDoc.exists()) {
      return NextResponse.json(
        { error: 'Restaurant not found' },
        { status: 404 }
      )
    }

    const restaurantData = {
      id: restaurantDoc.id,
      ...restaurantDoc.data()
    } as Restaurant

    const emailDomain = email.split('@')[1]
    const restaurantDomain = restaurantData.domain

    if (emailDomain !== restaurantDomain) {
      return NextResponse.json(
        { error: 'Email domain does not match restaurant domain' },
        { status: 400 }
      )
    }

    // Generate verification code
    const verificationCode = Math.random().toString(36).substring(2, 8).toUpperCase()
    
    // Store verification code
    await updateDoc(restaurantRef, {
      verificationCode,
      verificationCodeExpires: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
      verificationEmail: email
    })

    // Send verification email
    await sendEmail(email, generateVerificationEmail(restaurantData, verificationCode))

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Verification error:', error)
    return NextResponse.json(
      { error: 'Failed to initiate verification' },
      { status: 500 }
    )
  }
} 