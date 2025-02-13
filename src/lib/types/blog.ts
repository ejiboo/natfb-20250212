export interface Restaurant {
  id: string
  name: string
  domain?: string
  cuisineTypes: string[]
  location: {
    address: string
    city: string
    state: string
    zip: string
    coordinates?: {
      lat: number
      lng: number
    }
  }
  socialLinks: {
    website?: string
    googleMaps?: string
    yelp?: string
    facebook?: string
    instagram?: string
    tiktok?: string
    twitter?: string
  }
  features?: string[]
  averageRating?: number
}

export interface BlogPost {
  id: string
  restaurantId: string
  title: string
  content: string
  rating: number | 'TBD'
  cuisineTags: string[]
  locationTags: string[]
  images: string[]
  videoUrl?: string
  createdAt: Date
  updatedAt: Date
  authorId: string
  isAIGenerated: boolean
}

export interface UserProfile {
  uid: string
  email: string
  name: string
  bio?: string
  favoriteCuisines: string[]
  preferredLocations: string[]
  bookmarks: string[] // Post IDs
  lists: {
    id: string
    name: string
    posts: string[] // Post IDs
  }[]
  ratings: {
    postId: string
    rating: number
  }[]
} 