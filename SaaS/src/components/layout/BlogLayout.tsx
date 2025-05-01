'use client'

import { useState } from 'react'
import { Button } from '@/components/shared/Button'

const categories = [
  'All Posts',
  'Product Updates',
  'Tutorials',
  'Company News',
  'Industry Insights',
  'Case Studies',
]

export function BlogLayout({ children }: { children: React.ReactNode }) {
  const [email, setEmail] = useState('')

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
      <div className="lg:flex lg:gap-8">
        {/* Main content */}
        <div className="lg:flex-1">
          {children}
        </div>

        {/* Sidebar */}
        <div className="mt-12 lg:mt-0 lg:w-80 space-y-8">
          {/* Categories */}
          <div className="rounded-lg border p-6">
            <h3 className="text-lg font-semibold text-gray-900">Categories</h3>
            <nav className="mt-4">
              <ul className="space-y-4">
                {categories.map((category) => (
                  <li key={category}>
                    <a
                      href="#"
                      className="text-sm text-gray-600 hover:text-[#FF6B4A]"
                    >
                      {category}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          </div>

          {/* Newsletter signup */}
          <div className="rounded-lg border p-6">
            <h3 className="text-lg font-semibold text-gray-900">
              Subscribe to our newsletter
            </h3>
            <p className="mt-2 text-sm text-gray-600">
              Get the latest updates and insights delivered to your inbox
            </p>
            <form
              className="mt-4"
              onSubmit={(e) => {
                e.preventDefault()
                // Handle newsletter signup
              }}
            >
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                className="w-full rounded-md border px-3 py-2 text-sm"
                required
              />
              <Button className="mt-3 w-full">
                Subscribe
              </Button>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
} 