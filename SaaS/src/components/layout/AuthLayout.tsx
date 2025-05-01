'use client'

import Link from 'next/link'

export function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col">
      <div className="h-16 flex items-center px-4">
        <Link href="/" className="text-xl font-bold text-[#FF6B4A]">
          ContractLens
        </Link>
      </div>
      <main className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          {children}
        </div>
      </main>
    </div>
  )
} 