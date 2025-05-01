'use client'

import { useState } from 'react'
import { MainLayout } from '@/components/layout/MainLayout'
import { Button } from '@/components/shared/Button'
import Image from 'next/image'
import { Calendar, Check } from 'lucide-react'

const features = [
  'Interactive product walkthrough',
  'Live data visualization demo',
  'Custom dashboard creation',
  'AI-powered insights preview',
  'Team collaboration features',
]

export default function DemoPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    teamSize: '',
    message: '',
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Handle form submission
    console.log('Form submitted:', formData)
  }

  return (
    <MainLayout>
      <div className="min-h-screen">
        <div className="lg:flex">
          {/* Left side - Demo preview */}
          <div className="relative flex-1 bg-gradient-to-b from-[#FF6B4A]/10">
            <div className="p-8">
              <div className="mx-auto max-w-2xl lg:mx-0">
                <h1 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
                  Experience IndexAI in Action
                </h1>
                <p className="mt-6 text-lg text-gray-600">
                  See how our AI-powered analytics platform can transform your data
                  into actionable insights.
                </p>

                {/* Feature list */}
                <div className="mt-10">
                  <h2 className="text-lg font-semibold text-gray-900">
                    What you&apos;ll see in the demo
                  </h2>
                  <ul className="mt-4 space-y-4">
                    {features.map((feature) => (
                      <li key={feature} className="flex items-center gap-3">
                        <Check className="h-5 w-5 flex-none text-[#20B15A]" />
                        <span className="text-gray-600">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Demo preview */}
                <div className="mt-10 rounded-lg border bg-white p-4">
                  <div className="aspect-[16/9] overflow-hidden rounded-lg">
                    <Image
                      src="https://picsum.photos/800/450?random=1"
                      alt="Product demo preview"
                      width={800}
                      height={450}
                      className="h-full w-full object-cover"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right side - Request form */}
          <div className="flex-1 border-l">
            <div className="p-8">
              <div className="mx-auto max-w-lg">
                <h2 className="text-2xl font-bold text-gray-900">
                  Schedule a Demo
                </h2>
                <p className="mt-4 text-gray-600">
                  Fill out the form below and our team will get in touch to
                  schedule a personalized demo.
                </p>

                <form onSubmit={handleSubmit} className="mt-8 space-y-6">
                  <div>
                    <label
                      htmlFor="name"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Name
                    </label>
                    <input
                      type="text"
                      id="name"
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                      className="mt-1 block w-full rounded-md border px-3 py-2"
                      required
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="email"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Work Email
                    </label>
                    <input
                      type="email"
                      id="email"
                      value={formData.email}
                      onChange={(e) =>
                        setFormData({ ...formData, email: e.target.value })
                      }
                      className="mt-1 block w-full rounded-md border px-3 py-2"
                      required
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="company"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Company
                    </label>
                    <input
                      type="text"
                      id="company"
                      value={formData.company}
                      onChange={(e) =>
                        setFormData({ ...formData, company: e.target.value })
                      }
                      className="mt-1 block w-full rounded-md border px-3 py-2"
                      required
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="teamSize"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Team Size
                    </label>
                    <select
                      id="teamSize"
                      value={formData.teamSize}
                      onChange={(e) =>
                        setFormData({ ...formData, teamSize: e.target.value })
                      }
                      className="mt-1 block w-full rounded-md border px-3 py-2"
                      required
                    >
                      <option value="">Select team size</option>
                      <option value="1-10">1-10 employees</option>
                      <option value="11-50">11-50 employees</option>
                      <option value="51-200">51-200 employees</option>
                      <option value="201+">201+ employees</option>
                    </select>
                  </div>

                  <div>
                    <label
                      htmlFor="message"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Additional Information
                    </label>
                    <textarea
                      id="message"
                      value={formData.message}
                      onChange={(e) =>
                        setFormData({ ...formData, message: e.target.value })
                      }
                      rows={4}
                      className="mt-1 block w-full rounded-md border px-3 py-2"
                    />
                  </div>

                  <Button type="submit" className="w-full">
                    <Calendar className="mr-2 h-4 w-4" />
                    Schedule Demo
                  </Button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  )
} 