import { BlogPost, Restaurant, UserProfile } from '@/lib/types/blog'

interface RecommendationScore {
  restaurantId: string
  score: number
  matchReasons: string[]
}

export function generateUserRecommendations(
  restaurants: Restaurant[],
  userProfile: UserProfile,
  userPosts: BlogPost[],
  recentViews: string[]
): Restaurant[] {
  const scores: RecommendationScore[] = restaurants.map(restaurant => {
    let score = 0
    const matchReasons: string[] = []

    // Match cuisine preferences
    const cuisineMatches = restaurant.cuisineTypes.filter(cuisine => 
      userProfile.favoriteCuisines.includes(cuisine)
    )
    if (cuisineMatches.length > 0) {
      score += cuisineMatches.length * 2
      matchReasons.push(`Matches ${cuisineMatches.length} of your favorite cuisines`)
    }

    // Match location preferences
    if (userProfile.preferredLocations.includes(restaurant.location.city)) {
      score += 3
      matchReasons.push('In your preferred location')
    }

    // Consider past ratings
    const userRatings = userPosts.filter(post => 
      typeof post.rating === 'number' && 
      post.restaurantId !== restaurant.id
    )
    const similarRestaurants = userRatings.filter(post => {
      const ratedRestaurant = restaurants.find(r => r.id === post.restaurantId)
      return ratedRestaurant && 
        ratedRestaurant.cuisineTypes.some(c => restaurant.cuisineTypes.includes(c))
    })
    
    if (similarRestaurants.length > 0) {
      const averageRating = similarRestaurants.reduce((sum, post) => 
        sum + (typeof post.rating === 'number' ? post.rating : 0), 0
      ) / similarRestaurants.length
      
      if (averageRating > 80) {
        score += 2
        matchReasons.push('Similar to restaurants you rated highly')
      }
    }

    // Avoid recently viewed
    if (recentViews.includes(restaurant.id)) {
      score -= 1
    }

    // Consider restaurant rating
    if (restaurant.averageRating && restaurant.averageRating > 85) {
      score += 1
      matchReasons.push('Highly rated by the community')
    }

    return {
      restaurantId: restaurant.id,
      score,
      matchReasons
    }
  })

  // Sort by score and return top restaurants with their match reasons
  return scores
    .sort((a, b) => b.score - a.score)
    .slice(0, 10)
    .map(score => ({
      ...restaurants.find(r => r.id === score.restaurantId)!,
      matchReasons: score.matchReasons
    })) as Restaurant[]
} 