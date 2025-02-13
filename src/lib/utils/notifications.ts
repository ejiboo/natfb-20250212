import { BlogPost, Restaurant, UserProfile } from '../types/blog'

// In a real app, you'd use a proper email service like SendGrid or AWS SES
const EMAIL_API_KEY = process.env.EMAIL_API_KEY

interface EmailTemplate {
  subject: string
  body: string
}

export async function sendEmail(to: string, template: EmailTemplate) {
  // Implementation would depend on your email service
  console.log(`Sending email to ${to}:`, template)
}

export function generateVerificationEmail(restaurant: Restaurant, code: string): EmailTemplate {
  return {
    subject: 'Verify Your Restaurant on DC Food Blog',
    body: `
      Hello ${restaurant.name},
      
      Please use the following code to verify your restaurant ownership:
      
      ${code}
      
      This code will expire in 24 hours.
      
      Best regards,
      DC Food Blog Team
    `
  }
}

export function generateNewPostNotification(post: BlogPost, restaurant: Restaurant): EmailTemplate {
  return {
    subject: `New Review: ${restaurant.name}`,
    body: `
      A new review has been posted for ${restaurant.name}:
      
      "${post.title}"
      Rating: ${post.rating}
      
      View the full review on DC Food Blog.
    `
  }
}

export function generateWeeklyDigest(user: UserProfile, recommendations: Restaurant[]): EmailTemplate {
  const recommendationsList = recommendations
    .slice(0, 5)
    .map(r => `- ${r.name} (${r.cuisineTypes.join(', ')})`)
    .join('\n')

  return {
    subject: 'Your Weekly DC Food Blog Digest',
    body: `
      Hi ${user.name},
      
      Here are some restaurants we think you'll love:
      
      ${recommendationsList}
      
      Visit DC Food Blog to see more recommendations!
    `
  }
} 