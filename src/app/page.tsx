import BlogFeed from './components/BlogFeed'
import FilterBar from './components/FilterBar'

export default function Home() {
  return (
    <div className="space-y-6">
      <FilterBar />
      <BlogFeed />
    </div>
  )
}
