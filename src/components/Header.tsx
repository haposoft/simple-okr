'use client';

import LanguageSelector from './LanguageSelector';
import Link from 'next/link';
import { useParams, usePathname } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import { useEffect, useState, useRef } from 'react';
import { getDictionary } from '@/lib/dictionary';

export default function Header() {
  const params = useParams();
  const { data: session } = useSession();
  const pathname = usePathname();
  const lang = params?.lang || 'en';
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [dictionary, setDictionary] = useState<any>({
    nav: {
      home: 'Home',
      objectives: 'Objectives',
      departments: 'Departments',
      reports: 'Reports',
      users: 'Users'
    },
    auth: {
      logout: 'Logout'
    }
  });
  
  useEffect(() => {
    const loadDictionary = async () => {
      try {
        const dict = await getDictionary(lang as string);
        setDictionary(dict);
      } catch (error) {
        console.error('Failed to load dictionary:', error);
      }
    };
    
    if (lang) {
      loadDictionary();
    }
  }, [lang]);
  
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  
  const isActive = (path: string) => {
    return pathname === `/${lang}${path === 'home' ? '' : `/${path}`}`;
  };
  
  const handleLogout = () => {
    setDropdownOpen(false);
    signOut({ callbackUrl: `/${lang}` });
  };
  
  const toggleDropdown = () => {
    setDropdownOpen(!dropdownOpen);
  };
  
  return (
    <nav className="bg-white shadow-sm sticky top-0 z-10" suppressHydrationWarning>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8" suppressHydrationWarning>
        <div className="flex justify-between h-16" suppressHydrationWarning>
          <div className="flex items-center" suppressHydrationWarning>
            <div className="flex-shrink-0 flex items-center" suppressHydrationWarning>
              <Link href={session ? `/${lang}/reports` : `/${lang}`} className="text-xl font-bold text-blue-600" suppressHydrationWarning>
                HAPO SIMPLE OKR
              </Link>
            </div>
            
            {session && (
              <div className="ml-10 flex items-center space-x-1" suppressHydrationWarning>
                <Link 
                  href={`/${lang}/reports`} 
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive('reports') 
                      ? 'bg-blue-100 text-blue-700' 
                      : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                  }`} 
                  suppressHydrationWarning
                >
                  {dictionary.nav.reports}
                </Link>
                <Link 
                  href={`/${lang}/objectives`} 
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive('objectives') 
                      ? 'bg-blue-100 text-blue-700' 
                      : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                  }`} 
                  suppressHydrationWarning
                >
                  {dictionary.nav.objectives}
                </Link>
                <Link 
                  href={`/${lang}/departments`} 
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive('departments') 
                      ? 'bg-blue-100 text-blue-700' 
                      : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                  }`} 
                  suppressHydrationWarning
                >
                  {dictionary.nav.departments}
                </Link>
                <Link 
                  href={`/${lang}/users`} 
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive('users') 
                      ? 'bg-blue-100 text-blue-700' 
                      : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                  }`} 
                  suppressHydrationWarning
                >
                  {dictionary.nav.users}
                </Link>
              </div>
            )}
          </div>
          <div className="flex items-center space-x-4" suppressHydrationWarning>
            <LanguageSelector />
            {session && (
              <div className="relative" ref={dropdownRef} suppressHydrationWarning>
                <div 
                  className="flex items-center space-x-2 cursor-pointer hover:bg-gray-100 rounded-md px-2 py-1"
                  onClick={toggleDropdown}
                  suppressHydrationWarning
                >
                  {session.user?.image ? (
                    <img 
                      src={session.user.image} 
                      alt={session.user?.name || "User"} 
                      className="w-8 h-8 rounded-full object-cover border border-gray-200"
                      suppressHydrationWarning
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-semibold text-sm" suppressHydrationWarning>
                      {session.user?.name?.charAt(0) || "U"}
                    </div>
                  )}
                  <span className="text-sm font-medium text-gray-700 hidden md:inline" suppressHydrationWarning>
                    {session.user?.name || session.user?.email}
                  </span>
                  <svg 
                    className={`h-4 w-4 text-gray-500 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} 
                    xmlns="http://www.w3.org/2000/svg" 
                    viewBox="0 0 20 20" 
                    fill="currentColor"
                    suppressHydrationWarning
                  >
                    <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </div>
                
                {dropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10" suppressHydrationWarning>
                    <Link 
                      href={`/${lang}/profile`} 
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      suppressHydrationWarning
                    >
                      Profile
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                      suppressHydrationWarning
                    >
                      {dictionary.auth.logout}
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
} 