import { MainLayout } from '@/components/layout/MainLayout'
import { BarChart3, Brain, Gauge, LineChart, Users2, Zap } from 'lucide-react'

const features = [
  {
    name: 'AI-Powered Analytics',
    description: 'Leverage advanced machine learning algorithms to uncover hidden patterns and insights between two contracts and ensure compliance.',
    icon: Brain,
  },
  {
    name: 'Real-time Modifications',
    description: 'Get automatic suggestions for modifications to the contract to ensure compliance and speed up the contract review process.',
    icon: Gauge,
  },
  {
    name: 'Custom Dashboards',
    description: 'Create personalized dashboards and input important rules and instructions for the AI to follow.',
    icon: BarChart3,
  },
  {
    name: 'Accelerate Sales',
    description: 'Build a library of contracts and use them as a reference to speed up the contract review process.',
    icon: LineChart,
  },
  {
    name: 'Team Collaboration',
    description: 'Work seamlessly with your team through shared dashboards, comments, and annotations.',
    icon: Users2,
  },
  {
    name: 'Automated Insights',
    description: 'Get automated insights and recommendations powered by our advanced AI engine.',
    icon: Zap,
  },
]

export default function FeaturesPage() {
  return (
    <MainLayout>
      <div className="py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h1 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              Powerful Features for Data-Driven Teams
            </h1>
            <p className="mt-6 text-lg leading-8 text-gray-600">
              Everything you need to analyze, visualize, and interact with the legal realm with confidence.
            </p>
          </div>
          <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-none">
            <dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-16 lg:max-w-none lg:grid-cols-3">
              {features.map((feature) => (
                <div key={feature.name} className="flex flex-col">
                  <dt className="flex items-center gap-x-3 text-base font-semibold leading-7 text-gray-900">
                    <feature.icon
                      className="h-5 w-5 flex-none text-[#FF6B4A]"
                      aria-hidden="true"
                    />
                    {feature.name}
                  </dt>
                  <dd className="mt-4 flex flex-auto flex-col text-base leading-7 text-gray-600">
                    <p className="flex-auto">{feature.description}</p>
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </div>
    </MainLayout>
  )
} 