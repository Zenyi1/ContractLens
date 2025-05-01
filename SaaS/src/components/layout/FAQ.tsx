'use client'

import { useState } from 'react'
import { ChevronDown } from 'lucide-react'

const faqs = [
  {
    question: 'How accurate is the AI contract analysis?',
    answer: 'Our AI has been trained on millions of legal documents and achieves over 95% accuracy in identifying key terms, risks, and discrepancies. However, we always recommend final human review for critical contracts.',
  },
  {
    question: 'Can I upload any type of contract?',
    answer: 'Yes, our system supports most standard contract formats including PDF, Word, and plain text. Our AI is trained to analyze various contract types including sales agreements, NDAs, service agreements, and more.',
  },
  {
    question: 'How secure is my contract data?',
    answer: 'We employ bank-grade encryption, SOC 2 compliance, and strict access controls. Your documents are encrypted both in transit and at rest. We never share or sell your data, and you can request deletion at any time.',
  },
  {
    question: 'Do I need legal expertise to use this platform?',
    answer: 'No, our platform is specifically designed for sales teams without legal backgrounds. The AI provides clear explanations in plain language and highlights risks in a way that\'s easy to understand.',
  },
  {
    question: 'How long does it take to analyze a contract?',
    answer: 'Most standard contracts are analyzed within 1-2 minutes. More complex or lengthy documents might take up to 5 minutes to process fully.',
  },
  {
    question: "Can I customize the analysis based on my company's preferences?",
    answer: "Yes, you can upload your company's preferred templates and standard terms. The AI will then flag any deviations from your approved language during comparison.",
  },
]

export function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  return (
    <section className="py-24 sm:py-32 bg-gray-50">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-[#333333] sm:text-4xl">
            Frequently asked questions
          </h2>
          <p className="mt-6 text-lg text-gray-600">
            Have more questions? Contact our team at <span className="text-[#4A7CFF]">support@contractlens.ai</span>
          </p>
        </div>
        <div className="mx-auto mt-16 max-w-3xl">
          <dl className="space-y-8">
            {faqs.map((faq, index) => (
              <div
                key={faq.question}
                className="rounded-2xl bg-white p-6"
              >
                <dt>
                  <button
                    className="flex w-full items-start justify-between text-left"
                    onClick={() => setOpenIndex(openIndex === index ? null : index)}
                  >
                    <span className="text-base font-semibold text-[#333333]">
                      {faq.question}
                    </span>
                    <span className="ml-6 flex h-7 items-center">
                      <ChevronDown
                        className={`h-6 w-6 transform text-gray-700 transition-transform duration-200 ${
                          openIndex === index ? 'rotate-180' : ''
                        }`}
                      />
                    </span>
                  </button>
                </dt>
                {openIndex === index && (
                  <dd className="mt-4 text-base text-gray-600">
                    {faq.answer}
                  </dd>
                )}
              </div>
            ))}
          </dl>
        </div>
      </div>
    </section>
  )
} 