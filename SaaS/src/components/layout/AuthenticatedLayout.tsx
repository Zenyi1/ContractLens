'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useSupabase } from '@/context/SupabaseProvider'
import { AuthHeader } from './AuthHeader'

interface AuthenticatedLayoutProps {
  children: React.ReactNode
}

export function AuthenticatedLayout({ children }: AuthenticatedLayoutProps) {
  const router = useRouter()
  const { session } = useSupabase()

  useEffect(() => {
    if (!session) {
      router.push('/log-in')
    }
  }, [session, router])

  if (!session) {
    return null // Will redirect in useEffect
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <AuthHeader />
      <main>{children}</main>
    </div>
  )
} 