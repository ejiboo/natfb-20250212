'use client'

export default function FilterBar() {
  return (
    <div className="bg-white p-4 rounded-lg shadow">
      <div className="flex flex-wrap gap-4">
        <select className="px-4 py-2 border rounded-md">
          <option value="">Rating</option>
          <option value="90">90+</option>
          <option value="80">80+</option>
          <option value="70">70+</option>
        </select>

        <select className="px-4 py-2 border rounded-md">
          <option value="">Cuisine</option>
          <option value="italian">Italian</option>
          <option value="japanese">Japanese</option>
          <option value="american">American</option>
        </select>

        <select className="px-4 py-2 border rounded-md">
          <option value="">Location</option>
          <option value="dc">Washington DC</option>
          <option value="arlington">Arlington</option>
          <option value="alexandria">Alexandria</option>
        </select>

        <input
          type="text"
          placeholder="Search restaurants..."
          className="px-4 py-2 border rounded-md flex-grow"
        />
      </div>
    </div>
  )
} 