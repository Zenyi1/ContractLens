'use client'

import { useState } from 'react'
import { MainLayout } from '@/components/layout/MainLayout'
import { Button } from '@/components/shared/Button'
import { Check, ChevronDown } from 'lucide-react'

const plans = [
  {
    name: 'Starter',
    price: { monthly: 49, annual: 39 },
    description: 'Perfect for small teams getting started with data analytics.',
    features: [
      'Up to 5 team members',
      'Basic analytics dashboard',
      'Real-time monitoring',
      'Email support',
      '5GB storage',
    ],
  },
  {
    name: 'Professional',
    price: { monthly: 99, annual: 89 },
    description: 'Advanced features for growing businesses.',
    features: [
      'Up to 20 team members',
      'Advanced analytics',
      'Custom dashboards',
      'Priority support',
      '50GB storage',
      'API access',
    ],
  },
  {
    name: 'Enterprise',
    price: { monthly: 199, annual: 179 },
    description: 'Complete solution for large organizations.',
    features: [
      'Unlimited team members',
      'AI-powered insights',
      'Custom integrations',
      '24/7 phone support',
      'Unlimited storage',
      'Advanced security',
      'Custom training',
    ],
  },
]

const faqs = [
  {
    question: 'How does the 14-day trial work?',
    answer: 'You can try any plan free for 14 days. No credit card required. Cancel anytime.',
  },
  {
    question: 'Can I change plans later?',
    answer: 'Yes, you can upgrade or downgrade your plan at any time. Changes take effect immediately.',
  },
  {
    question: 'What payment methods do you accept?',
    answer: 'We accept all major credit cards, PayPal, and wire transfers for enterprise customers.',
  },
  {
    question: 'Is there a setup fee?',
    answer: 'No, there are no setup fees. You only pay the monthly or annual subscription fee.',
  },
]

export default function PricingPage() {
  const [annual, setAnnual] = useState(false)
  const [openFaq, setOpenFaq] = useState<number | null>(null)

  return (
    <MainLayout>
      <div className="py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h1 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              Simple, transparent pricing
            </h1>
            <p className="mt-6 text-lg leading-8 text-gray-600">
              Choose the plan that&apos;s right for your team
            </p>
          </div>

          {/* Billing toggle */}
          <div className="mt-16 flex justify-center">
            <div className="relative flex rounded-full bg-gray-100 p-1">
              <button
                className={`flex items-center rounded-full px-4 py-2 text-sm font-semibold ${
                  !annual ? 'bg-white shadow text-[#333333]' : 'text-gray-700'
                }`}
                onClick={() => setAnnual(false)}
              >
                Monthly
              </button>
              <button
                className={`flex items-center rounded-full px-4 py-2 text-sm font-semibold ${
                  annual ? 'bg-white shadow text-[#333333]' : 'text-gray-700'
                }`}
                onClick={() => setAnnual(true)}
              >
                Annual
                <span className="ml-1 text-[#FF6B4A] font-medium">Save 20%</span>
              </button>
            </div>
          </div>

          {/* Pricing cards */}
          <div className="mx-auto mt-16 grid max-w-lg grid-cols-1 gap-8 lg:max-w-none lg:grid-cols-3">
            {plans.map((plan) => (
              <div
                key={plan.name}
                className="flex flex-col rounded-3xl bg-white p-8 ring-1 ring-gray-200"
              >
                <h3 className="text-xl font-semibold text-[#333333]">{plan.name}</h3>
                <p className="mt-4 text-base text-gray-700">{plan.description}</p>
                <p className="mt-6 flex items-baseline gap-x-1">
                  <span className="text-4xl font-bold tracking-tight text-[#333333]">
                    ${annual ? plan.price.annual : plan.price.monthly}
                  </span>
                  <span className="text-base font-medium text-gray-700">/month</span>
                </p>
                <Button href="/signup" className="mt-6">
                  Get started
                </Button>
                <ul className="mt-8 space-y-3">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-3">
                      <Check className="h-5 w-5 flex-none text-[#20B15A]" />
                      <span className="text-sm font-medium text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* FAQ */}
          <div className="mx-auto mt-24 max-w-2xl">
            <h2 className="text-2xl font-bold text-gray-900">
              Frequently asked questions
            </h2>
            <dl className="mt-8 space-y-6">
              {faqs.map((faq, index) => (
                <div key={faq.question} className="border-b pb-6">
                  <dt>
                    <button
                      className="flex w-full items-start justify-between text-left"
                      onClick={() => setOpenFaq(openFaq === index ? null : index)}
                    >
                      <span className="text-base font-semibold text-gray-900">
                        {faq.question}
                      </span>
                      <span className="ml-6 flex h-7 items-center">
                        <ChevronDown
                          className={`h-6 w-6 transform text-gray-700 ${
                            openFaq === index ? 'rotate-180' : ''
                          }`}
                        />
                      </span>
                    </button>
                  </dt>
                  {openFaq === index && (
                    <dd className="mt-4 text-base text-gray-600">{faq.answer}</dd>
                  )}
                </div>
              ))}
            </dl>
          </div>
        </div>
      </div>
    </MainLayout>
  )
} 