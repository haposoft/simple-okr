'use client';

import LanguageSelector from './LanguageSelector';
import Link from 'next/link';

export default function Header() {
  return (
    <nav className="bg-white shadow-sm" suppressHydrationWarning>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8" suppressHydrationWarning>
        <div className="flex justify-between h-16" suppressHydrationWarning>
          <div className="flex" suppressHydrationWarning>
            <div className="flex-shrink-0 flex items-center" suppressHydrationWarning>
              <Link href="/en" className="text-xl font-bold text-gray-900" suppressHydrationWarning>
                HAPO SIMPLE OKR
              </Link>
            </div>
          </div>
          <div className="flex items-center" suppressHydrationWarning>
            <LanguageSelector />
          </div>
        </div>
      </div>
    </nav>
  );
} 