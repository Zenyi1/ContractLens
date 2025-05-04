'use client';

import { MainLayout } from '@/components/layout/MainLayout';
import { Button } from '@/components/shared/Button';

const openPositions = [
  {
    id: 'fe-dev',
    title: 'Frontend Developer',
    department: 'Engineering',
    location: 'Remote',
    type: 'Full-time',
    description: 'Join our team to build the next generation of contract analysis tools using React and Next.js.'
  },
  {
    id: 'be-dev',
    title: 'Backend Developer',
    department: 'Engineering',
    location: 'Remote',
    type: 'Full-time',
    description: 'Help us scale our AI-powered contract analysis platform using Python and FastAPI.'
  },
  {
    id: 'pm',
    title: 'Product Manager',
    department: 'Product',
    location: 'Remote',
    type: 'Full-time',
    description: 'Drive the product vision and roadmap for our contract management platform.'
  }
];

export default function CareersPage() {
  return (
    <MainLayout>
      <div className="bg-white">
        <div className="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 sm:text-4xl">
              Join Our Team
            </h1>
            <p className="mt-3 max-w-2xl mx-auto text-xl text-gray-500 sm:mt-4">
              Help us revolutionize how businesses handle contracts with AI
            </p>
          </div>

          <div className="mt-12 max-w-lg mx-auto grid gap-8 lg:grid-cols-2 lg:max-w-none">
            {openPositions.map((position) => (
              <div
                key={position.id}
                className="flex flex-col rounded-lg shadow-lg overflow-hidden"
              >
                <div className="flex-1 bg-white p-6 flex flex-col justify-between">
                  <div className="flex-1">
                    <div className="flex justify-between items-center">
                      <p className="text-sm font-medium text-[#4A7CFF]">
                        {position.department}
                      </p>
                      <span className="inline-flex items-center px-3 py-0.5 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                        {position.type}
                      </span>
                    </div>
                    <a href={`/careers/${position.id}`} className="block mt-2">
                      <p className="text-xl font-semibold text-gray-900">
                        {position.title}
                      </p>
                      <p className="mt-3 text-base text-gray-500">
                        {position.description}
                      </p>
                    </a>
                  </div>
                  <div className="mt-6">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <span className="sr-only">{position.location}</span>
                        <svg
                          className="h-5 w-5 text-gray-400"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </div>
                      <div className="ml-2 text-sm text-gray-500">
                        {position.location}
                      </div>
                    </div>
                    <div className="mt-4">
                      <Button href={`/careers/${position.id}`}>
                        Apply Now
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-12 text-center">
            <h2 className="text-2xl font-bold text-gray-900">
              Why Join ContractLens?
            </h2>
            <div className="mt-8 grid gap-8 md:grid-cols-3">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Innovation
                </h3>
                <p className="mt-2 text-base text-gray-500">
                  Work with cutting-edge AI technology and help shape the future of contract management.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Remote-First
                </h3>
                <p className="mt-2 text-base text-gray-500">
                  Work from anywhere in the world with our distributed team.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Growth
                </h3>
                <p className="mt-2 text-base text-gray-500">
                  Join a rapidly growing startup with plenty of opportunities for career advancement.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
} 