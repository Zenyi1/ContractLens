'use client'

import { useState } from 'react'
import { MainLayout } from '@/components/layout/MainLayout'
import Image from 'next/image'
import { Button } from '@/components/shared/Button'
import { Search } from 'lucide-react'

const departments = [
  'All Departments',
  'Engineering',
  'Product',
  'Design',
  'Marketing',
  'Sales',
]

const jobs = [
  {
    id: 1,
    title: 'Senior Full Stack Engineer',
    department: 'Engineering',
    location: 'San Francisco, CA',
    type: 'Full-time',
    description:
      'We are looking for a Senior Full Stack Engineer to help build our next-generation analytics platform.',
  },
  {
    id: 2,
    title: 'Product Manager',
    department: 'Product',
    location: 'Remote',
    type: 'Full-time',
    description:
      'Join our product team to help shape the future of data analytics and AI.',
  },
  {
    id: 3,
    title: 'UI/UX Designer',
    department: 'Design',
    location: 'New York, NY',
    type: 'Full-time',
    description:
      'Create beautiful and intuitive interfaces for our analytics platform.',
  },
  {
    id: 4,
    title: 'Growth Marketing Manager',
    department: 'Marketing',
    location: 'Remote',
    type: 'Full-time',
    description:
      'Drive our marketing strategy and help us reach more data-driven teams.',
  },
]

const values = [
  {
    title: 'Innovation First',
    description:
      'We push the boundaries of what is possible with data and AI.',
    image: 'https://picsum.photos/400/300?random=1',
  },
  {
    title: 'Customer Obsessed',
    description:
      'Our customers&apos; success is our success. We go above and beyond.',
    image: 'https://picsum.photos/400/300?random=2',
  },
  {
    title: 'One Team',
    description:
      'We work together, support each other, and celebrate our wins as one.',
    image: 'https://picsum.photos/400/300?random=3',
  },
]

export default function CareersPage() {
  const [selectedDepartment, setSelectedDepartment] = useState('All Departments')
  const [searchQuery, setSearchQuery] = useState('')

  const filteredJobs = jobs.filter((job) => {
    const matchesSearch = job.title
      .toLowerCase()
      .includes(searchQuery.toLowerCase())
    const matchesDepartment =
      selectedDepartment === 'All Departments' ||
      job.department === selectedDepartment
    return matchesSearch && matchesDepartment
  })

  return (
    <MainLayout>
      {/* Hero section */}
      <div className="relative isolate overflow-hidden bg-gradient-to-b from-[#FF6B4A]/10">
        <div className="mx-auto max-w-7xl px-6 py-24 sm:py-32 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h1 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              Join Our Team
            </h1>
            <p className="mt-6 text-lg leading-8 text-gray-600">
              Help us build the future of data analytics. We&apos;re looking for
              passionate people to join our growing team.
            </p>
          </div>
        </div>
      </div>

      {/* Values section */}
      <div className="py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              Our Values
            </h2>
            <p className="mt-4 text-lg text-gray-600">
              These are the principles that guide everything we do.
            </p>
          </div>
          <div className="mx-auto mt-16 grid max-w-2xl grid-cols-1 gap-8 sm:mt-20 lg:max-w-none lg:grid-cols-3">
            {values.map((value) => (
              <div
                key={value.title}
                className="flex flex-col overflow-hidden rounded-lg"
              >
                <div className="aspect-[4/3] relative">
                  <Image
                    src={value.image}
                    alt={value.title}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="flex flex-1 flex-col justify-between bg-white p-6">
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-gray-900">
                      {value.title}
                    </h3>
                    <p className="mt-3 text-base text-gray-600">
                      {value.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Jobs section */}
      <div className="py-24 sm:py-32 bg-gray-50">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl lg:max-w-4xl">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900">
              Open Positions
            </h2>

            {/* Search and filters */}
            <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search positions..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full rounded-md border pl-10 pr-4 py-2 text-sm"
                />
              </div>
              <div className="flex gap-2 overflow-x-auto">
                {departments.map((department) => (
                  <button
                    key={department}
                    onClick={() => setSelectedDepartment(department)}
                    className={`rounded-full px-4 py-1 text-sm whitespace-nowrap ${
                      selectedDepartment === department
                        ? 'bg-[#FF6B4A] text-white'
                        : 'bg-white text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    {department}
                  </button>
                ))}
              </div>
            </div>

            {/* Job listings */}
            <div className="mt-12 space-y-8">
              {filteredJobs.map((job) => (
                <div
                  key={job.id}
                  className="rounded-lg bg-white p-6 shadow-sm ring-1 ring-gray-900/5"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        {job.title}
                      </h3>
                      <div className="mt-1 flex items-center gap-x-4">
                        <span className="text-sm text-gray-600">
                          {job.department}
                        </span>
                        <span className="text-sm text-gray-600">
                          {job.location}
                        </span>
                        <span className="text-sm text-gray-600">{job.type}</span>
                      </div>
                    </div>
                    <Button href={`/careers/${job.id}`}>Apply Now</Button>
                  </div>
                  <p className="mt-4 text-sm text-gray-600">
                    {job.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  )
} 