'use client'

import { useState } from 'react'
import { useAuth } from '@/lib/hooks/useAuth'

interface List {
  id: string
  name: string
  posts: string[]
}

export default function UserLists() {
  const { user } = useAuth()
  const [lists, setLists] = useState<List[]>([])
  const [newListName, setNewListName] = useState('')

  const createList = async () => {
    if (!newListName.trim() || !user) return

    // TODO: Implement list creation in Firebase
    const newList = {
      id: Date.now().toString(),
      name: newListName,
      posts: []
    }

    setLists([...lists, newList])
    setNewListName('')
  }

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <input
          type="text"
          value={newListName}
          onChange={(e) => setNewListName(e.target.value)}
          placeholder="New list name"
          className="px-3 py-2 border rounded-md flex-grow"
        />
        <button
          onClick={createList}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Create List
        </button>
      </div>

      <div className="space-y-2">
        {lists.map((list) => (
          <div
            key={list.id}
            className="p-4 border rounded-md hover:bg-gray-50"
          >
            <h3 className="font-semibold">{list.name}</h3>
            <p className="text-sm text-gray-500">
              {list.posts.length} posts
            </p>
          </div>
        ))}
      </div>
    </div>
  )
} 