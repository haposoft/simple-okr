'use client';
import { useState } from 'react';
import { useSession } from 'next-auth/react';

type KeyResult = {
  id: string;
  title: string;
  description: string;
  target: number;
  current: number;
  unit: string;
};

type Objective = {
  id: string;
  title: string;
  description: string;
  type: string;
  status: string;
  startDate: string;
  endDate: string;
  keyResults: KeyResult[];
};

export default function ObjectiveDetailPage({ params }: { params: { id: string } }) {
  const { data: session } = useSession();
  const [objective, setObjective] = useState<Objective | null>(null);
  const [showUpdateForm, setShowUpdateForm] = useState(false);

  if (!session) {
    return (
      <div className="text-center">
        <h2 className="text-2xl font-bold">Vui lòng đăng nhập để xem chi tiết mục tiêu</h2>
      </div>
    );
  }

  if (!objective) {
    return (
      <div className="text-center">
        <h2 className="text-2xl font-bold">Đang tải thông tin mục tiêu...</h2>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <div className="px-4 py-5 sm:px-6">
          <div className="flex justify-between items-center">
            <h3 className="text-lg leading-6 font-medium text-gray-900">{objective.title}</h3>
            <button
              onClick={() => setShowUpdateForm(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
            >
              Cập nhật Tiến độ
            </button>
          </div>
          <p className="mt-1 max-w-2xl text-sm text-gray-500">{objective.description}</p>
          <div className="mt-4 flex items-center space-x-4">
            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
              objective.status === 'ACTIVE' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
            }`}>
              {objective.status}
            </span>
            <span className="text-sm text-gray-500">
              {new Date(objective.startDate).toLocaleDateString()} - {new Date(objective.endDate).toLocaleDateString()}
            </span>
          </div>
        </div>

        <div className="border-t border-gray-200">
          <div className="px-4 py-5 sm:px-6">
            <h4 className="text-md font-medium text-gray-900">Kết quả then chốt</h4>
          </div>
          <div className="border-t border-gray-200">
            <ul className="divide-y divide-gray-200">
              {objective.keyResults.map((kr) => (
                <li key={kr.id} className="px-4 py-4 sm:px-6">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">{kr.title}</p>
                      <p className="text-sm text-gray-500">{kr.description}</p>
                    </div>
                    <div className="ml-4 flex-shrink-0">
                      <div className="flex items-center">
                        <div className="w-32 bg-gray-200 rounded-full h-2.5">
                          <div
                            className="bg-blue-600 h-2.5 rounded-full"
                            style={{ width: `${(kr.current / kr.target) * 100}%` }}
                          ></div>
                        </div>
                        <span className="ml-2 text-sm text-gray-500">
                          {kr.current} / {kr.target} {kr.unit}
                        </span>
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {showUpdateForm && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Cập nhật Tiến độ</h3>
            <form className="space-y-4">
              {objective.keyResults.map((kr) => (
                <div key={kr.id}>
                  <label className="block text-sm font-medium text-gray-700">{kr.title}</label>
                  <div className="mt-1 flex rounded-md shadow-sm">
                    <input
                      type="number"
                      className="flex-1 block w-full rounded-md border-gray-300 focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                      placeholder={`Nhập tiến độ hiện tại (${kr.unit})`}
                    />
                  </div>
                </div>
              ))}
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowUpdateForm(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Lưu
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
} 