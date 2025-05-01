'use client'

import Link from 'next/link'
import { Button } from '@/components/shared/Button'

const navItems = [
  { label: 'Features', href: '/features' },
  { label: 'Pricing', href: '/pricing' },
  { label: 'Blog', href: '/blog' },
  { label: 'Changelog', href: '/changelog' },
  { label: 'Careers', href: '/careers' },
  { label: 'Demo', href: '/demo' },
]

export function Header() {
  return (
    <header className="w-full">
      <div className="border-b">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center">
            <Link href="/" className="text-xl font-bold text-[#FF6B4A]">
              IndexAI
            </Link>
          </div>
          
          <nav className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="text-sm font-medium text-gray-700 hover:text-[#FF6B4A]"
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center space-x-4">
            <Button href="/log-in" variant="primary">
              Log in
            </Button>
          </div>
        </div>
      </div>
    </header>
  )
} 