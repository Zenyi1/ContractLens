'use client'

import { Search, Shield, Brain, MessageSquare, Clock, FileText } from 'lucide-react'

const features = [
  {
    name: 'AI Contract Comparison',
    description: 'Compare contract terms with your preferred templates and automatically identify discrepancies.',
    icon: FileText,
  },
  {
    name: 'Risk Analysis',
    description: 'Instantly identify legal risks and unfavorable terms with our advanced AI analysis.',
    icon: Shield,
  },
  {
    name: 'Intelligent Q&A',
    description: 'Ask questions about your contracts in plain English and get instant, accurate answers.',
    icon: MessageSquare,
  },
  {
    name: 'Deep Term Search',
    description: 'Quickly locate specific clauses and terms across all your contract documents.',
    icon: Search,
  },
  {
    name: 'Negotiation Insights',
    description: 'Get AI-powered recommendations to strengthen your negotiation position.',
    icon: Brain,
  },
  {
    name: 'Faster Deal Closure',
    description: 'Reduce contract review time by up to 80% and close deals faster.',
    icon: Clock,
  },
]

export function Features() {
  return (
    <section className="py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-[#333333] sm:text-4xl">
            Legal AI built for sales teams
          </h2>
          <p className="mt-6 text-lg text-gray-600">
            Our platform empowers your sales team to handle contracts confidently without constant legal department bottlenecks.
          </p>
        </div>
        <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-none">
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feature) => (
              <div
                key={feature.name}
                className="flex flex-col rounded-3xl bg-gray-50 p-8"
              >
                <div className="mb-6">
                  <div className="rounded-full bg-[#4A7CFF]/10 p-3 w-fit">
                    <feature.icon className="h-6 w-6 text-[#4A7CFF]" />
                  </div>
                </div>
                <h3 className="text-lg font-semibold text-[#333333]">
                  {feature.name}
                </h3>
                <p className="mt-2 text-gray-600">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
} 