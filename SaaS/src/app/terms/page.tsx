'use client';

import { MainLayout } from '@/components/layout/MainLayout';

export default function TermsPage() {
  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold mb-8">Terms of Service</h1>
        <div className="prose">
          <p className="mb-4">
            By using ContractLens, you agree to these terms of service. Please read them carefully.
          </p>
          
          <h2 className="text-2xl font-semibold mt-8 mb-4">1. Service Description</h2>
          <p className="mb-4">
            ContractLens provides AI-powered contract analysis and comparison services.
            We help businesses understand and negotiate contracts more effectively.
          </p>

          <h2 className="text-2xl font-semibold mt-8 mb-4">2. User Responsibilities</h2>
          <p className="mb-4">
            You are responsible for:
          </p>
          <ul className="list-disc pl-6 mb-4">
            <li>Maintaining the confidentiality of your account</li>
            <li>All activities that occur under your account</li>
            <li>Ensuring your use complies with applicable laws</li>
            <li>The accuracy of information you provide</li>
          </ul>

          <h2 className="text-2xl font-semibold mt-8 mb-4">3. Intellectual Property</h2>
          <p className="mb-4">
            All content and functionality on ContractLens is the exclusive property of
            ContractLens and its licensors. You may not copy, modify, or distribute our
            content without permission.
          </p>

          <h2 className="text-2xl font-semibold mt-8 mb-4">4. Limitation of Liability</h2>
          <p className="mb-4">
            ContractLens provides analysis tools but does not provide legal advice.
            We are not responsible for decisions made based on our analysis.
            Always consult with legal professionals for important decisions.
          </p>

          <h2 className="text-2xl font-semibold mt-8 mb-4">5. Changes to Terms</h2>
          <p className="mb-4">
            We may modify these terms at any time. Your continued use of ContractLens
            after changes constitutes acceptance of the modified terms.
          </p>

          <h2 className="text-2xl font-semibold mt-8 mb-4">Contact Us</h2>
          <p className="mb-4">
            If you have any questions about our terms of service, please contact us at{' '}
            <a href="mailto:legal@contractlens.ai" className="text-blue-600 hover:underline">
              legal@contractlens.ai
            </a>
          </p>
        </div>
      </div>
    </MainLayout>
  );
} 