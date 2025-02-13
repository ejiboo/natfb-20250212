'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/lib/hooks/useAuth'
import { collection, addDoc, query, where, orderBy, onSnapshot } from 'firebase/firestore'
import { db } from '@/lib/firebase/firebase'

interface Comment {
  id: string
  postId: string
  userId: string
  userName: string
  content: string
  createdAt: Date
}

export default function Comments({ postId }: { postId: string }) {
  const { user } = useAuth()
  const [comments, setComments] = useState<Comment[]>([])
  const [newComment, setNewComment] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    const commentsRef = collection(db, 'comments')
    const commentsQuery = query(
      commentsRef,
      where('postId', '==', postId),
      orderBy('createdAt', 'desc')
    )

    const unsubscribe = onSnapshot(commentsQuery, (snapshot) => {
      const newComments = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt.toDate()
      })) as Comment[]
      setComments(newComments)
    })

    return () => unsubscribe()
  }, [postId])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user || !newComment.trim()) return

    setSubmitting(true)
    try {
      await addDoc(collection(db, 'comments'), {
        postId,
        userId: user.uid,
        userName: user.displayName || 'Anonymous',
        content: newComment,
        createdAt: new Date()
      })
      setNewComment('')
    } catch (error) {
      console.error('Error posting comment:', error)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">Comments</h2>

      {user ? (
        <form onSubmit={handleSubmit} className="space-y-3">
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Add a comment..."
            className="w-full px-3 py-2 border rounded-md"
            rows={3}
          />
          <button
            type="submit"
            disabled={submitting || !newComment.trim()}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-blue-300"
          >
            {submitting ? 'Posting...' : 'Post Comment'}
          </button>
        </form>
      ) : (
        <p className="text-gray-600">Please sign in to comment</p>
      )}

      <div className="space-y-4">
        {comments.map((comment) => (
          <div key={comment.id} className="bg-white p-4 rounded-lg shadow">
            <div className="flex justify-between items-start">
              <div>
                <p className="font-medium">{comment.userName}</p>
                <p className="text-sm text-gray-500">
                  {comment.createdAt.toLocaleDateString()}
                </p>
              </div>
            </div>
            <p className="mt-2">{comment.content}</p>
          </div>
        ))}
      </div>
    </div>
  )
} 