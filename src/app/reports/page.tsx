'use client';
import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useTranslation } from 'react-i18next';

type ReportData = {
  totalObjectives: number;
  completedObjectives: number;
  activeObjectives: number;
  departmentProgress: {
    departmentName: string;
    progress: number;
  }[];
  monthlyProgress: {
    month: string;
    progress: number;
  }[];
};

type NewReport = {
  title: string;
  description: string;
  type: 'PERFORMANCE' | 'PROGRESS' | 'SUMMARY';
  departmentId?: string;
  startDate: string;
  endDate: string;
};

export default function ReportsPage() {
  const { data: session } = useSession();
  const { t } = useTranslation();
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [timeRange, setTimeRange] = useState('month'); // month, quarter, year
  const [showAddForm, setShowAddForm] = useState(false);
  const [departments, setDepartments] = useState<{ id: string; name: string }[]>([]);
  const [newReport, setNewReport] = useState<NewReport>({
    title: '',
    description: '',
    type: 'PERFORMANCE',
    startDate: '',
    endDate: '',
  });

  useEffect(() => {
    fetchReportData();
    fetchDepartments();
  }, [timeRange]);

  const fetchReportData = async () => {
    try {
      const response = await fetch(`/api/reports?timeRange=${timeRange}`);
      const data = await response.json();
      setReportData(data);
    } catch (error) {
      console.error('Error fetching report data:', error);
    }
  };

  const fetchDepartments = async () => {
    try {
      const response = await fetch('/api/departments');
      const data = await response.json();
      setDepartments(data);
    } catch (error) {
      console.error('Error fetching departments:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/reports', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newReport),
      });

      if (response.ok) {
        setShowAddForm(false);
        setNewReport({
          title: '',
          description: '',
          type: 'PERFORMANCE',
          startDate: '',
          endDate: '',
        });
        fetchReportData();
      }
    } catch (error) {
      console.error('Error creating report:', error);
    }
  };

  if (!session) {
    return (
      <div className="text-center">
        <h2 className="text-2xl font-bold">{t('auth.loginRequired')}</h2>
      </div>
    );
  }

  if (!reportData) {
    return (
      <div className="text-center">
        <h2 className="text-2xl font-bold">{t('common.loading')}</h2>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-gray-900">{t('reports.title')}</h1>
        <div className="flex space-x-4">
          <select
            className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
          >
            <option value="month">{t('reports.timeRange.month')}</option>
            <option value="quarter">{t('reports.timeRange.quarter')}</option>
            <option value="year">{t('reports.timeRange.year')}</option>
          </select>
          <button
            onClick={() => setShowAddForm(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
          >
            {t('reports.createNew')}
          </button>
        </div>
      </div>

      {/* Add Report Form */}
      {showAddForm && (
        <div className="bg-white p-6 rounded-lg shadow mb-8">
          <h2 className="text-xl font-semibold mb-4">{t('reports.createNew')}</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">{t('reports.form.title')}</label>
              <input
                type="text"
                value={newReport.title}
                onChange={(e) => setNewReport({ ...newReport, title: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">{t('reports.form.description')}</label>
              <textarea
                value={newReport.description}
                onChange={(e) => setNewReport({ ...newReport, description: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                rows={3}
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">{t('reports.form.type')}</label>
                <select
                  value={newReport.type}
                  onChange={(e) => setNewReport({ ...newReport, type: e.target.value as NewReport['type'] })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  required
                >
                  <option value="PERFORMANCE">{t('reports.type.performance')}</option>
                  <option value="PROGRESS">{t('reports.type.progress')}</option>
                  <option value="SUMMARY">{t('reports.type.summary')}</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">{t('reports.form.department')}</label>
                <select
                  value={newReport.departmentId}
                  onChange={(e) => setNewReport({ ...newReport, departmentId: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                >
                  <option value="">{t('departments.title')}</option>
                  {departments.map((dept) => (
                    <option key={dept.id} value={dept.id}>
                      {dept.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">{t('reports.form.startDate')}</label>
                <input
                  type="date"
                  value={newReport.startDate}
                  onChange={(e) => setNewReport({ ...newReport, startDate: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">{t('reports.form.endDate')}</label>
                <input
                  type="date"
                  value={newReport.endDate}
                  onChange={(e) => setNewReport({ ...newReport, endDate: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  required
                />
              </div>
            </div>
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                {t('common.cancel')}
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                {t('common.create')}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-medium text-gray-900">{t('reports.summary.totalObjectives')}</h3>
          <p className="mt-2 text-3xl font-bold text-blue-600">{reportData.totalObjectives}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-medium text-gray-900">{t('reports.summary.activeObjectives')}</h3>
          <p className="mt-2 text-3xl font-bold text-green-600">{reportData.activeObjectives}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-medium text-gray-900">{t('reports.summary.completedObjectives')}</h3>
          <p className="mt-2 text-3xl font-bold text-purple-600">{reportData.completedObjectives}</p>
        </div>
      </div>

      {/* Department Progress */}
      <div className="bg-white p-6 rounded-lg shadow mb-8">
        <h2 className="text-xl font-semibold mb-4">{t('reports.departmentProgress')}</h2>
        <div className="space-y-4">
          {reportData.departmentProgress.map((dept) => (
            <div key={dept.departmentName}>
              <div className="flex justify-between mb-1">
                <span className="text-sm font-medium text-gray-700">{dept.departmentName}</span>
                <span className="text-sm font-medium text-gray-700">{dept.progress}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div
                  className="bg-blue-600 h-2.5 rounded-full"
                  style={{ width: `${dept.progress}%` }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Monthly Progress Chart */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">{t('reports.monthlyProgress')}</h2>
        <div className="h-64 flex items-end justify-between">
          {reportData.monthlyProgress.map((month) => (
            <div key={month.month} className="flex flex-col items-center">
              <div
                className="w-8 bg-blue-600 rounded-t"
                style={{ height: `${month.progress}%` }}
              ></div>
              <span className="mt-2 text-sm text-gray-500">{month.month}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
} 