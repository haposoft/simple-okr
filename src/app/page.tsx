import { getServerSession } from 'next-auth';
import Link from 'next/link';

export default async function Home() {
  const session = await getServerSession();

  return (
    <div className="max-w-7xl mx-auto">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 sm:text-5xl md:text-6xl">
          <span className="block">Hệ thống Quản lý OKR</span>
        </h1>
        <p className="mt-3 max-w-md mx-auto text-base text-gray-500 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
          Quản lý mục tiêu và kết quả then chốt (OKR) từ cấp công ty đến cấp cá nhân một cách hiệu quả.
        </p>
        {!session && (
          <div className="mt-5 max-w-md mx-auto sm:flex sm:justify-center md:mt-8">
            <div className="rounded-md shadow">
              <Link
                href="/auth/signin"
                className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 md:py-4 md:text-lg md:px-10"
              >
                Bắt đầu ngay
              </Link>
            </div>
          </div>
        )}
      </div>

      <div className="mt-20">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg font-medium text-gray-900">Mục tiêu Công ty</h3>
              <p className="mt-2 text-sm text-gray-500">
                Thiết lập và theo dõi các mục tiêu chiến lược cấp công ty.
              </p>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg font-medium text-gray-900">Mục tiêu Phòng ban</h3>
              <p className="mt-2 text-sm text-gray-500">
                Quản lý và liên kết các mục tiêu giữa các phòng ban.
              </p>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg font-medium text-gray-900">Mục tiêu Cá nhân</h3>
              <p className="mt-2 text-sm text-gray-500">
                Theo dõi và cập nhật tiến độ mục tiêu cá nhân.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
