'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import { useCompany } from '@/context/CompanyContext'
import { LogOut, User } from 'lucide-react'

const navItems = [
  { label: 'Compare', href: '/compare' },
  { label: 'Company Profile', href: '/profile' },
]

export function AuthHeader() {
  const router = useRouter()
  const { signOut } = useAuth()
  const { company } = useCompany()

  const handleSignOut = async () => {
    await signOut()
    router.push('/')
  }

  return (
    <header className="w-full">
      <div className="border-b">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center">
            <Link href="/" className="text-xl font-bold text-[#FF6B4A]">
              {company?.name ? company.name : 'ContractLens'}
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
            <Link href="/profile" className="flex items-center text-sm font-medium text-gray-700 hover:text-[#FF6B4A]">
              <User className="h-4 w-4 mr-1" />
              Profile
            </Link>
            <button
              onClick={handleSignOut}
              className="flex items-center text-sm font-medium text-gray-700 hover:text-[#FF6B4A]"
            >
              <LogOut className="h-4 w-4 mr-1" />
              Sign out
            </button>
          </div>
        </div>
      </div>
    </header>
  )
} 