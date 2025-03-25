import Header from '@/components/Header';
import { getDictionary } from '@/lib/dictionary';
import Link from 'next/link';
import { getServerSession } from 'next-auth';

export default async function Layout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { lang: string };
}) {
  const dict = await getDictionary(params.lang);
  const session = await getServerSession();
  
  return (
    <div className="min-h-screen bg-gray-100" suppressHydrationWarning>
      <Header />
      
      {session && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4" suppressHydrationWarning>
          <nav className="flex space-x-6" suppressHydrationWarning>
            <Link href={`/${params.lang}`} className="text-gray-600 hover:text-gray-900" suppressHydrationWarning>
              {dict.nav.home}
            </Link>
            <Link href={`/${params.lang}/objectives`} className="text-gray-600 hover:text-gray-900" suppressHydrationWarning>
              {dict.nav.objectives}
            </Link>
            <Link href={`/${params.lang}/departments`} className="text-gray-600 hover:text-gray-900" suppressHydrationWarning>
              {dict.nav.departments}
            </Link>
            <Link href={`/${params.lang}/reports`} className="text-gray-600 hover:text-gray-900" suppressHydrationWarning>
              {dict.nav.reports}
            </Link>
          </nav>
        </div>
      )}

      <main className="py-6" suppressHydrationWarning>
        <div className="max-w-7xl mx-auto sm:px-6 lg:px-8" suppressHydrationWarning>
          {children}
        </div>
      </main>
    </div>
  );
} 