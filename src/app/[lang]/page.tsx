import { getDictionary } from '@/lib/dictionary';
import { getServerSession } from 'next-auth';
import Link from 'next/link';

export default async function Home({
  params,
}: {
  params: { lang: string };
}) {
  const dict = await getDictionary(params.lang);
  const session = await getServerSession();

  return (
    <div className="space-y-8" suppressHydrationWarning>
      <div className="text-center" suppressHydrationWarning>
        <h1 className="text-4xl font-bold text-gray-900 mb-4" suppressHydrationWarning>
          {dict.home.title}
        </h1>
        <p className="text-xl text-gray-600" suppressHydrationWarning>
          {dict.home.description}
        </p>
        
        {!session && (
          <div className="mt-5 max-w-md mx-auto sm:flex sm:justify-center md:mt-8" suppressHydrationWarning>
            <div className="rounded-md shadow" suppressHydrationWarning>
              <Link
                href={`/${params.lang}/auth/signin`}
                className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 md:py-4 md:text-lg md:px-10"
                suppressHydrationWarning
              >
                {dict.auth.login}
              </Link>
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6" suppressHydrationWarning>
        <div className="bg-white p-6 rounded-lg shadow" suppressHydrationWarning>
          <h2 className="text-2xl font-semibold mb-4" suppressHydrationWarning>{dict.home.features.objectives}</h2>
          <p className="text-gray-600" suppressHydrationWarning>{dict.home.features.objectivesDesc}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow" suppressHydrationWarning>
          <h2 className="text-2xl font-semibold mb-4" suppressHydrationWarning>{dict.home.features.departments}</h2>
          <p className="text-gray-600" suppressHydrationWarning>{dict.home.features.departmentsDesc}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow" suppressHydrationWarning>
          <h2 className="text-2xl font-semibold mb-4" suppressHydrationWarning>{dict.home.features.reports}</h2>
          <p className="text-gray-600" suppressHydrationWarning>{dict.home.features.reportsDesc}</p>
        </div>
      </div>
    </div>
  );
} 