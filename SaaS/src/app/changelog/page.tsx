'use client'

import { useState } from 'react'
import { MainLayout } from '@/components/layout/MainLayout'
import { Search } from 'lucide-react'

const updates = [
  {
    version: '2.0.0',
    date: 'Mar 15, 2024',
    type: 'Major Release',
    title: 'AI-Powered Analytics 2.0',
    description:
      'A complete overhaul of our analytics engine with improved AI capabilities.',
    changes: [
      'New machine learning models for better predictions',
      'Redesigned dashboard interface',
      'Advanced data visualization options',
      'Improved performance and scalability',
    ],
  },
  {
    version: '1.9.0',
    date: 'Mar 1, 2024',
    type: 'Feature',
    title: 'Enhanced Team Collaboration',
    description: 'New features to improve team productivity and communication.',
    changes: [
      'Real-time dashboard sharing',
      'Comment threads on reports',
      'Team activity timeline',
      'Improved notification system',
    ],
  },
  {
    version: '1.8.5',
    date: 'Feb 15, 2024',
    type: 'Bug Fix',
    title: 'Performance Improvements',
    description: 'Various bug fixes and performance enhancements.',
    changes: [
      'Fixed data loading issues',
      'Improved chart rendering speed',
      'Memory optimization',
      'Better error handling',
    ],
  },
]

const filterOptions = ['All', 'Major Release', 'Feature', 'Bug Fix']

export default function ChangelogPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedFilter, setSelectedFilter] = useState('All')

  const filteredUpdates = updates.filter((update) => {
    const matchesSearch = update.title
      .toLowerCase()
      .includes(searchQuery.toLowerCase())
    const matchesFilter =
      selectedFilter === 'All' || update.type === selectedFilter
    return matchesSearch && matchesFilter
  })

  return (
    <MainLayout>
      <div className="py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl lg:max-w-4xl">
            <h1 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              Product Updates
            </h1>
            <p className="mt-4 text-lg text-gray-600">
              Stay up to date with the latest features and improvements.
            </p>

            {/* Search and filters */}
            <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search updates..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full rounded-md border pl-10 pr-4 py-2 text-sm"
                />
              </div>
              <div className="flex gap-2">
                {filterOptions.map((filter) => (
                  <button
                    key={filter}
                    onClick={() => setSelectedFilter(filter)}
                    className={`rounded-full px-4 py-1 text-sm ${
                      selectedFilter === filter
                        ? 'bg-[#FF6B4A] text-white'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {filter}
                  </button>
                ))}
              </div>
            </div>

            {/* Timeline */}
            <div className="mt-12 space-y-16">
              {filteredUpdates.map((update, index) => (
                <article
                  key={update.version}
                  className={`relative pl-8 ${
                    index !== updates.length - 1
                      ? 'pb-16 before:absolute before:left-0 before:top-0 before:h-full before:w-px before:bg-gray-200'
                      : ''
                  }`}
                >
                  <div className="absolute left-0 top-0 -translate-x-1/2 rounded-full border-4 border-white bg-gray-200 p-1">
                    <div
                      className={`h-2 w-2 rounded-full ${
                        update.type === 'Major Release'
                          ? 'bg-[#FF6B4A]'
                          : update.type === 'Feature'
                          ? 'bg-[#20B15A]'
                          : 'bg-blue-500'
                      }`}
                    />
                  </div>
                  <div className="flex flex-col gap-y-3">
                    <div className="flex items-center gap-x-4">
                      <span className="text-sm font-semibold text-gray-900">
                        v{update.version}
                      </span>
                      <time className="text-sm text-gray-500">{update.date}</time>
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-medium ${
                          update.type === 'Major Release'
                            ? 'bg-[#FF6B4A]/10 text-[#FF6B4A]'
                            : update.type === 'Feature'
                            ? 'bg-[#20B15A]/10 text-[#20B15A]'
                            : 'bg-blue-100 text-blue-700'
                        }`}
                      >
                        {update.type}
                      </span>
                    </div>
                    <h2 className="text-lg font-semibold text-gray-900">
                      {update.title}
                    </h2>
                    <p className="text-gray-600">{update.description}</p>
                    <ul className="mt-4 list-disc space-y-2 pl-5 text-gray-600">
                      {update.changes.map((change) => (
                        <li key={change}>{change}</li>
                      ))}
                    </ul>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  )
} 