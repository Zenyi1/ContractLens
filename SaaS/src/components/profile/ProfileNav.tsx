'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

const navItems = [
  {
    name: 'Company Details',
    href: '/profile',
  },
  {
    name: 'Contract Priorities',
    href: '/profile/priorities',
  },
];

export function ProfileNav() {
  const pathname = usePathname();

  return (
    <nav className="flex space-x-4 mb-8">
      {navItems.map((item) => {
        const isActive = pathname === item.href;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              'px-4 py-2 rounded-md text-sm font-medium transition-colors',
              isActive
                ? 'bg-[#4A7CFF] text-white'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
            )}
          >
            {item.name}
          </Link>
        );
      })}
    </nav>
  );
} 