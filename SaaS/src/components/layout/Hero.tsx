'use client'

import Image from 'next/image'
import { Button } from '@/components/shared/Button'

export function Hero() {
  return (
    <div className="relative isolate overflow-hidden">
      <div className="mx-auto max-w-7xl px-6 pb-24 pt-10 sm:pb-32 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <div className="mb-8 inline-flex items-center rounded-full bg-[#4A7CFF]/10 px-3 py-1 text-sm text-[#4A7CFF]">
            <span className="flex items-center gap-x-1.5">
              ContractLens AI - Early Access
            </span>
          </div>
          
          <h1 className="text-4xl font-bold tracking-tight text-[#333333] sm:text-6xl">
            AI-Powered Contract
            <br />
            <span className="text-[#4A7CFF]">Analysis</span>
          </h1>
          <p className="mt-6 text-lg leading-8 text-gray-600">
            Empower your sales team with intelligent contract analysis.
            <br />
            Identify risks, compare terms, and close deals faster.
          </p>
          <div className="mt-10 flex justify-center">
            <Button href="/log-in">
              Analyze Your Contracts
            </Button>
          </div>
        </div>

        <div className="mt-16">
          <div className="relative">
            <Image
              src="https://images.unsplash.com/photo-1589829545856-d10d557cf95f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1200&h=600&q=80"
              alt="Contract analysis dashboard"
              width={1200}
              height={600}
              className="w-full rounded-xl shadow-2xl ring-1 ring-gray-900/10"
            />
          </div>
        </div>
      </div>
    </div>
  )
} 