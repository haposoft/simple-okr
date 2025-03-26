'use client';

import { useSession, SessionProvider } from 'next-auth/react';
import { useState, useEffect } from 'react';
import { getDictionary } from '@/lib/dictionary';

function ProfileContent() {
  const { data: session, status } = useSession();
  const [isLoading, setIsLoading] = useState(true);
  const [dictionary, setDictionary] = useState<any>({
    profile: {
      title: 'Profile',
      personalInfo: 'Personal Information',
      email: 'Email',
      name: 'Name',
      role: 'Role',
      noSession: 'Please login to view your profile'
    }
  });

  // Get language from URL
  const lang = window.location.pathname.split('/')[1] || 'en';

  useEffect(() => {
    const loadDictionary = async () => {
      try {
        const dict = await getDictionary(lang);
        setDictionary(dict);
        setIsLoading(false);
      } catch (error) {
        console.error('Failed to load dictionary:', error);
        setIsLoading(false);
      }
    };

    loadDictionary();
  }, [lang]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64" suppressHydrationWarning>
        <div className="text-center" suppressHydrationWarning>
          <div className="spinner-border text-primary" role="status" suppressHydrationWarning>
            <span className="sr-only" suppressHydrationWarning>Loading...</span>
          </div>
        </div>
      </div>
    );
  }

  if (status === 'loading') {
    return (
      <div className="flex justify-center items-center h-64" suppressHydrationWarning>
        <div className="text-center" suppressHydrationWarning>
          <div className="spinner-border text-primary" role="status" suppressHydrationWarning>
            <span className="sr-only" suppressHydrationWarning>Loading...</span>
          </div>
        </div>
      </div>
    );
  }

  if (status === 'unauthenticated') {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10" suppressHydrationWarning>
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4" suppressHydrationWarning>
          <div className="flex" suppressHydrationWarning>
            <div className="flex-shrink-0" suppressHydrationWarning>
              <svg className="h-5 w-5 text-yellow-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true" suppressHydrationWarning>
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3" suppressHydrationWarning>
              <p className="text-sm text-yellow-700" suppressHydrationWarning>
                {dictionary.profile.noSession}
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10" suppressHydrationWarning>
      <div className="mb-8" suppressHydrationWarning>
        <h1 className="text-3xl font-bold text-gray-900" suppressHydrationWarning>
          {dictionary.profile.title}
        </h1>
      </div>

      <div className="bg-white shadow overflow-hidden sm:rounded-lg" suppressHydrationWarning>
        <div className="flex flex-col md:flex-row" suppressHydrationWarning>
          {/* Avatar Section */}
          <div className="p-6 flex items-center justify-center md:w-1/3 border-b md:border-b-0 md:border-r border-gray-200" suppressHydrationWarning>
            {session?.user?.image ? (
              <div className="flex flex-col items-center" suppressHydrationWarning>
                <img 
                  src={session.user.image} 
                  alt={session.user.name || "User"} 
                  className="w-40 h-40 rounded-full object-cover border border-gray-200"
                  suppressHydrationWarning
                />
                <h2 className="mt-4 text-xl font-semibold text-gray-900" suppressHydrationWarning>
                  {session.user.name}
                </h2>
              </div>
            ) : (
              <div className="flex flex-col items-center" suppressHydrationWarning>
                <div className="w-40 h-40 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-5xl font-semibold" suppressHydrationWarning>
                  {session?.user?.name?.charAt(0).toUpperCase() || "U"}
                </div>
                <h2 className="mt-4 text-xl font-semibold text-gray-900" suppressHydrationWarning>
                  {session?.user?.name}
                </h2>
              </div>
            )}
          </div>

          {/* Personal Information Section */}
          <div className="md:w-2/3" suppressHydrationWarning>
            <div className="px-4 py-5 sm:px-6" suppressHydrationWarning>
              <h3 className="text-lg leading-6 font-medium text-gray-900" suppressHydrationWarning>
                {dictionary.profile.personalInfo}
              </h3>
            </div>
            <div className="border-t border-gray-200" suppressHydrationWarning>
              <dl>
                <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6" suppressHydrationWarning>
                  <dt className="text-sm font-medium text-gray-500" suppressHydrationWarning>
                    {dictionary.profile.name}
                  </dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2" suppressHydrationWarning>
                    {session?.user?.name || 'N/A'}
                  </dd>
                </div>
                <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6" suppressHydrationWarning>
                  <dt className="text-sm font-medium text-gray-500" suppressHydrationWarning>
                    {dictionary.profile.email}
                  </dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2" suppressHydrationWarning>
                    {session?.user?.email || 'N/A'}
                  </dd>
                </div>
                <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6" suppressHydrationWarning>
                  <dt className="text-sm font-medium text-gray-500" suppressHydrationWarning>
                    {dictionary.profile.role}
                  </dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2" suppressHydrationWarning>
                    {(session as any)?.user?.role || 'User'}
                  </dd>
                </div>
              </dl>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ProfilePage() {
  return (
    <SessionProvider>
      <ProfileContent />
    </SessionProvider>
  );
} 