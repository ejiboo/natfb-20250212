import { BlogPost, Restaurant } from '@/lib/types/blog'

interface SearchableDocument {
  id: string
  type: 'restaurant' | 'post'
  text: string
  metadata: Record<string, any>
}

export function createSearchableDocument(
  item: Restaurant | BlogPost
): SearchableDocument {
  if ('cuisineTypes' in item) {
    // Item is a Restaurant
    return {
      id: item.id,
      type: 'restaurant',
      text: `
        ${item.name}
        ${item.cuisineTypes.join(' ')}
        ${item.location.city} ${item.location.state}
        ${item.features?.join(' ') || ''}
      `.toLowerCase(),
      metadata: {
        name: item.name,
        cuisine: item.cuisineTypes,
        location: item.location,
        rating: item.averageRating
      }
    }
  } else {
    // Item is a BlogPost
    return {
      id: item.id,
      type: 'post',
      text: `
        ${item.title}
        ${item.content}
        ${item.cuisineTags.join(' ')}
        ${item.locationTags.join(' ')}
      `.toLowerCase(),
      metadata: {
        title: item.title,
        rating: item.rating,
        authorId: item.authorId,
        restaurantId: item.restaurantId
      }
    }
  }
}

export function searchDocuments(
  documents: SearchableDocument[],
  query: string,
  filters?: {
    type?: 'restaurant' | 'post'
    cuisine?: string[]
    location?: string[]
    minRating?: number
  }
): SearchableDocument[] {
  const searchTerms = query.toLowerCase().split(' ').filter(Boolean)
  
  return documents
    .filter(doc => {
      // Apply filters
      if (filters?.type && doc.type !== filters.type) return false
      if (filters?.cuisine && doc.type === 'restaurant') {
        const cuisines = doc.metadata.cuisine as string[]
        if (!filters.cuisine.some(c => cuisines.includes(c))) return false
      }
      if (filters?.location && doc.type === 'restaurant') {
        const location = doc.metadata.location.city as string
        if (!filters.location.includes(location)) return false
      }
      if (filters?.minRating && doc.metadata.rating < filters.minRating) return false

      // Search text
      return searchTerms.every(term => doc.text.includes(term))
    })
    .sort((a, b) => {
      // Sort by relevance (number of term matches)
      const aMatches = searchTerms.filter(term => a.text.includes(term)).length
      const bMatches = searchTerms.filter(term => b.text.includes(term)).length
      return bMatches - aMatches
    })
} 