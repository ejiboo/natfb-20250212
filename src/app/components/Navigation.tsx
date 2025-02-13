'use client'

import { useAuth } from '@/lib/hooks/useAuth'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

export default function Navigation() {
  const { user } = useAuth()
  const pathname = usePathname()
  
  const navItems = [
    { label: 'Home', path: '/' },
    { label: 'Find Restaurant', path: '/find' },
    { label: 'Profile', path: '/profile' },
  ]

  return (
    <nav className="bg-white shadow-lg">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <Link href="/" className="text-xl font-bold text-gray-800">
            DC Food Blog
          </Link>
          
          <div className="flex space-x-4">
            {navItems.map((item) => (
              <Link
                key={item.path}
                href={item.path}
                className={`px-3 py-2 rounded-md text-sm font-medium ${
                  pathname === item.path
                    ? 'bg-gray-900 text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                {item.label}
              </Link>
            ))}
            {!user ? (
              <Link
                href="/auth"
                className="px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-100"
              >
                Sign In
              </Link>
            ) : null}
          </div>
        </div>
      </div>
    </nav>
  )
} 