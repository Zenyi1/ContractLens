'use client';

import { AuthenticatedLayout } from '@/components/layout/AuthenticatedLayout';
import { ProfileNav } from '@/components/profile/ProfileNav';

export default function ProfileLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthenticatedLayout>
      <div className="bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Company Profile</h1>
            <p className="text-lg text-gray-600">
              Manage your company details and contract priorities
            </p>
          </div>

          <ProfileNav />

          {children}
        </div>
      </div>
    </AuthenticatedLayout>
  );
} 