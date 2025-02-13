interface EmailData {
  subject: string
  body: string
}

export function getEmailTemplate(
  type: 'welcome' | 'review' | 'verification' | 'digest' | 'reservation',
  data: Record<string, any>
): EmailData {
  const templates = {
    welcome: {
      subject: `Welcome to DC Food Blog, ${data.name}!`,
      body: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1>Welcome to DC Food Blog!</h1>
          <p>Hi ${data.name},</p>
          <p>Thank you for joining DC Food Blog. We're excited to have you as part of our community!</p>
          <p>Here's what you can do:</p>
          <ul>
            <li>Discover new restaurants</li>
            <li>Read and write reviews</li>
            <li>Create your favorite lists</li>
            <li>Follow other foodies</li>
          </ul>
          <p>Get started by exploring restaurants in your area:</p>
          <a href="${data.exploreUrl}" style="background: #2563eb; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
            Explore Restaurants
          </a>
        </div>
      `
    },
    review: {
      subject: `New Review for ${data.restaurantName}`,
      body: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>New Review Posted</h2>
          <p>A new review has been posted for ${data.restaurantName}:</p>
          <div style="background: #f3f4f6; padding: 15px; border-radius: 5px; margin: 15px 0;">
            <p style="font-weight: bold;">${data.reviewTitle}</p>
            <p>Rating: ${data.rating}/100</p>
            <p>${data.reviewExcerpt}...</p>
          </div>
          <a href="${data.reviewUrl}" style="background: #2563eb; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
            Read Full Review
          </a>
        </div>
      `
    },
    verification: {
      subject: 'Verify Your Restaurant on DC Food Blog',
      body: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Restaurant Verification</h2>
          <p>Your verification code is:</p>
          <div style="background: #f3f4f6; padding: 15px; border-radius: 5px; margin: 15px 0; text-align: center; font-size: 24px; font-weight: bold;">
            ${data.code}
          </div>
          <p>This code will expire in 24 hours.</p>
          <p>If you didn't request this verification, please ignore this email.</p>
        </div>
      `
    },
    digest: {
      subject: 'Your Weekly DC Food Blog Digest',
      body: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Your Weekly Food Digest</h2>
          <p>Here are this week's highlights:</p>
          
          <h3>New Reviews in Your Area</h3>
          <div style="margin: 15px 0;">
            ${data.reviews.map((review: any) => `
              <div style="margin-bottom: 10px;">
                <a href="${review.url}" style="color: #2563eb; text-decoration: none;">
                  ${review.restaurantName} - ${review.rating}/100
                </a>
              </div>
            `).join('')}
          </div>

          <h3>Recommended for You</h3>
          <div style="margin: 15px 0;">
            ${data.recommendations.map((restaurant: any) => `
              <div style="margin-bottom: 10px;">
                <a href="${restaurant.url}" style="color: #2563eb; text-decoration: none;">
                  ${restaurant.name} - ${restaurant.cuisine}
                </a>
              </div>
            `).join('')}
          </div>
        </div>
      `
    },
    reservation: {
      subject: 'Reservation Confirmation',
      body: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Reservation Confirmed!</h2>
          <div style="background: #f3f4f6; padding: 15px; border-radius: 5px; margin: 15px 0;">
            <p><strong>Restaurant:</strong> ${data.restaurantName}</p>
            <p><strong>Date:</strong> ${data.date}</p>
            <p><strong>Time:</strong> ${data.time}</p>
            <p><strong>Party Size:</strong> ${data.partySize}</p>
          </div>
          <p>Need to modify your reservation?</p>
          <a href="${data.manageUrl}" style="background: #2563eb; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
            Manage Reservation
          </a>
        </div>
      `
    }
  }

  return templates[type]
}

export function renderTemplate(template: EmailData, data: Record<string, any>): EmailData {
  let { subject, body } = template

  // Replace variables in subject and body
  Object.entries(data).forEach(([key, value]) => {
    const regex = new RegExp(`\\{\\{\\s*${key}\\s*\\}\\}`, 'g')
    subject = subject.replace(regex, String(value))
    body = body.replace(regex, String(value))
  })

  return { subject, body }
} 