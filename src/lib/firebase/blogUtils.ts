import { db } from './firebase'
import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  addDoc, 
  updateDoc, 
  query, 
  where,
  orderBy,
  limit 
} from 'firebase/firestore'
import { BlogPost, Restaurant, UserProfile } from '../types/blog'

export const createBlogPost = async (post: Omit<BlogPost, 'id' | 'createdAt' | 'updatedAt'>) => {
  const postsRef = collection(db, 'posts')
  const newPost = {
    ...post,
    createdAt: new Date(),
    updatedAt: new Date()
  }
  const docRef = await addDoc(postsRef, newPost)
  return { id: docRef.id, ...newPost }
}

export const getBlogPosts = async (filters?: {
  cuisine?: string
  location?: string
  minRating?: number
}) => {
  const postsRef = collection(db, 'posts')
  let q = query(postsRef, orderBy('createdAt', 'desc'))

  if (filters?.cuisine) {
    q = query(q, where('cuisineTags', 'array-contains', filters.cuisine))
  }
  if (filters?.location) {
    q = query(q, where('locationTags', 'array-contains', filters.location))
  }
  if (filters?.minRating) {
    q = query(q, where('rating', '>=', filters.minRating))
  }

  const snapshot = await getDocs(q)
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as BlogPost[]
}

export const updateUserProfile = async (uid: string, profile: Partial<UserProfile>) => {
  const userRef = doc(db, 'users', uid)
  await updateDoc(userRef, { ...profile, updatedAt: new Date() })
}

export const getUserProfile = async (uid: string) => {
  const userRef = doc(db, 'users', uid)
  const snapshot = await getDoc(userRef)
  return snapshot.exists() ? snapshot.data() as UserProfile : null
}

export const toggleBookmark = async (uid: string, postId: string) => {
  const userRef = doc(db, 'users', uid)
  const userDoc = await getDoc(userRef)
  const userData = userDoc.data() as UserProfile
  
  const bookmarks = userData.bookmarks || []
  const newBookmarks = bookmarks.includes(postId)
    ? bookmarks.filter(id => id !== postId)
    : [...bookmarks, postId]
  
  await updateDoc(userRef, { bookmarks: newBookmarks })
  return newBookmarks
} 