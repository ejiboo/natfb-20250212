import { BlogPost, Restaurant, UserProfile } from '../types/blog'

interface RecommendationScore {
  restaurantId: string
  score: number
}

export function generateRecommendations(
  restaurants: Restaurant[],
  userProfile: UserProfile,
  recentPosts: BlogPost[]
): Restaurant[] {
  const scores: RecommendationScore[] = restaurants.map(restaurant => {
    let score = 0

    // Match user cuisine preferences
    const cuisineMatch = restaurant.cuisineTypes.some(cuisine =>
      userProfile.favoriteCuisines.includes(cuisine)
    )
    if (cuisineMatch) score += 3

    // Match user location preferences
    const locationMatch = userProfile.preferredLocations.includes(restaurant.location.city)
    if (locationMatch) score += 2

    // Consider recent popular posts
    const recentPostsForRestaurant = recentPosts.filter(
      post => post.restaurantId === restaurant.id
    )
    if (recentPostsForRestaurant.length > 0) {
      const averageRating = recentPostsForRestaurant.reduce((sum, post) => {
        return sum + (post.rating === 'TBD' ? 0 : post.rating)
      }, 0) / recentPostsForRestaurant.length

      score += (averageRating / 20) // Add up to 5 points based on rating
    }

    // Consider user's past interactions
    const hasBookmarked = userProfile.bookmarks.some(bookmarkId =>
      recentPostsForRestaurant.some(post => post.id === bookmarkId)
    )
    if (hasBookmarked) score += 1

    return { restaurantId: restaurant.id, score }
  })

  // Sort by score and return restaurants
  return scores
    .sort((a, b) => b.score - a.score)
    .map(score => restaurants.find(r => r.id === score.restaurantId)!)
    .filter(Boolean)
} 