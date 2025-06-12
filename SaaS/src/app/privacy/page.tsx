'use client';

import { MainLayout } from '@/components/layout/MainLayout';

export default function PrivacyPage() {
  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold mb-8">Privacy Policy</h1>
        <div className="prose">
          <p className="mb-4">
            This privacy policy explains how we collect, use, and protect your personal information.
            We are committed to ensuring that your privacy is protected.
          </p>
          
          <h2 className="text-2xl font-semibold mt-8 mb-4">Information We Collect</h2>
          <p className="mb-4">
            We collect information that you provide directly to us, including:
          </p>
          <ul className="list-disc pl-6 mb-4">
            <li>Name and contact information</li>
            <li>Company details</li>
            <li>Contract documents you upload</li>
            <li>Usage data and preferences</li>
          </ul>

          <h2 className="text-2xl font-semibold mt-8 mb-4">How We Use Your Information</h2>
          <p className="mb-4">
            We use the information we collect to:
          </p>
          <ul className="list-disc pl-6 mb-4">
            <li>Provide and improve our services</li>
            <li>Analyze and compare contracts</li>
            <li>Communicate with you about our services</li>
            <li>Ensure the security of your data</li>
          </ul>

          <h2 className="text-2xl font-semibold mt-8 mb-4">Data Security</h2>
          <p className="mb-4">
            We implement appropriate security measures to protect your personal information.
            All data is encrypted both in transit and at rest.
          </p>

          <h2 className="text-2xl font-semibold mt-8 mb-4">Contact Us</h2>
          <p className="mb-4">
            If you have any questions about our privacy policy, please contact us at{' '}
            <a href="mailto:privacy@contractlens.ai" className="text-blue-600 hover:underline">
              privacy@contractlens.ai
            </a>
          </p>
        </div>
      </div>
    </MainLayout>
  );
} 