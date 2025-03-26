import Header from '@/components/Header';
import { getDictionary } from '@/lib/dictionary';
import { getServerSession } from 'next-auth';
import ClientProviders from '@/components/ClientProviders';

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
    <ClientProviders session={session}>
      <div className="min-h-screen bg-gray-100" suppressHydrationWarning>
        <Header />
        
        <main className="py-6" suppressHydrationWarning>
          <div className="max-w-7xl mx-auto sm:px-6 lg:px-8" suppressHydrationWarning>
            {children}
          </div>
        </main>
      </div>
    </ClientProviders>
  );
} 