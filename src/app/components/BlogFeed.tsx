'use client'

import { useState } from 'react'
import BlogPost from './BlogPost'

export default function BlogFeed() {
  const [posts, setPosts] = useState([])
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {posts.map((post) => (
        <BlogPost key={post.id} post={post} />
      ))}
    </div>
  )
} 