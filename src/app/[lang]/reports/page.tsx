'use client';

import { useState, useEffect } from 'react';
import { useSession, SessionProvider } from 'next-auth/react';
import { useParams } from 'next/navigation';
import { getDictionary } from '@/lib/dictionary';
import Link from 'next/link';

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

type Department = {
  id: string;
  name: string;
};

function ReportsContent() {
  const { data: session } = useSession();
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [timeRange, setTimeRange] = useState('month'); // month, quarter, year
  const [showAddForm, setShowAddForm] = useState(false);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [dictionary, setDictionary] = useState<any>(null);
  const params = useParams();
  const [newReport, setNewReport] = useState<NewReport>({
    title: '',
    description: '',
    type: 'PERFORMANCE',
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
  });

  useEffect(() => {
    const loadDictionary = async () => {
      try {
        const dict = await getDictionary(params.lang as string);
        setDictionary(dict);
      } catch (error) {
        console.error('Failed to load dictionary:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadDictionary();
  }, [params.lang]);

  useEffect(() => {
    if (!isLoading) {
      fetchReportData();
      fetchDepartments();
    }
  }, [isLoading, timeRange]);

  const fetchReportData = async () => {
    try {
      // Gọi API thực tế
      const response = await fetch(`/api/reports?timeRange=${timeRange}${newReport.departmentId ? `&departmentId=${newReport.departmentId}` : ''}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch report data');
      }
      
      const data = await response.json();
      setReportData(data);
    } catch (error) {
      console.error('Error fetching report data:', error);
    }
  };

  const fetchDepartments = async () => {
    try {
      // Gọi API thực tế
      const response = await fetch('/api/departments');
      
      if (!response.ok) {
        throw new Error('Failed to fetch departments');
      }
      
      const data = await response.json();
      setDepartments(data);
    } catch (error) {
      console.error('Error fetching departments:', error);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setNewReport({
      ...newReport,
      [name]: value
    });
    
    // Nếu departmentId thay đổi, cập nhật lại dữ liệu báo cáo
    if (name === 'departmentId') {
      setTimeout(() => {
        fetchReportData();
      }, 100);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      // Gọi API thực tế
      const response = await fetch('/api/reports', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newReport),
      });
      
      if (!response.ok) {
        throw new Error('Failed to create report');
      }
      
      // Đặt lại form và đóng
      setNewReport({
        title: '',
        description: '',
        type: 'PERFORMANCE',
        startDate: new Date().toISOString().split('T')[0],
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      });
      setShowAddForm(false);
      
      // Tải lại dữ liệu báo cáo
      fetchReportData();
    } catch (error) {
      console.error('Error creating report:', error);
    }
  };

  if (isLoading) {
    return <div className="text-center p-4" suppressHydrationWarning>{dictionary?.common.loading || "Loading..."}</div>;
  }

  if (!session) {
    return (
      <div className="text-center" suppressHydrationWarning>
        <h2 className="text-2xl font-bold" suppressHydrationWarning>
          {dictionary?.auth.loginRequired || "Please login to continue"}
        </h2>
      </div>
    );
  }

  if (!reportData) {
    return (
      <div className="text-center" suppressHydrationWarning>
        <h2 className="text-2xl font-bold" suppressHydrationWarning>
          {dictionary?.common.loading || "Loading..."}
        </h2>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto" suppressHydrationWarning>
      <div className="flex justify-between items-center mb-8" suppressHydrationWarning>
        <h1 className="text-2xl font-bold text-gray-900" suppressHydrationWarning>{dictionary?.reports.title || "Reports & Statistics"}</h1>
        <div className="flex space-x-4" suppressHydrationWarning>
          <select
            className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            suppressHydrationWarning
          >
            <option value="month">{dictionary?.reports.timeRange.month || "Month"}</option>
            <option value="quarter">{dictionary?.reports.timeRange.quarter || "Quarter"}</option>
            <option value="year">{dictionary?.reports.timeRange.year || "Year"}</option>
          </select>
          <button
            onClick={() => setShowAddForm(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
            suppressHydrationWarning
          >
            {dictionary?.reports.createNew || "Create New Report"}
          </button>
        </div>
      </div>

      {/* Add Report Form */}
      {showAddForm && (
        <div className="bg-white p-6 rounded-lg shadow mb-8" suppressHydrationWarning>
          <h2 className="text-xl font-semibold mb-4" suppressHydrationWarning>{dictionary?.reports.createNew || "Create New Report"}</h2>
          <form onSubmit={handleSubmit} className="space-y-4" suppressHydrationWarning>
            <div suppressHydrationWarning>
              <label className="block text-sm font-medium text-gray-700" suppressHydrationWarning>{dictionary?.reports.form.title || "Title"}</label>
              <input
                type="text"
                name="title"
                value={newReport.title}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                required
              />
            </div>
            <div suppressHydrationWarning>
              <label className="block text-sm font-medium text-gray-700" suppressHydrationWarning>{dictionary?.reports.form.description || "Description"}</label>
              <textarea
                name="description"
                value={newReport.description}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                rows={3}
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4" suppressHydrationWarning>
              <div suppressHydrationWarning>
                <label className="block text-sm font-medium text-gray-700" suppressHydrationWarning>{dictionary?.reports.form.type || "Report Type"}</label>
                <select
                  name="type"
                  value={newReport.type}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  required
                  suppressHydrationWarning
                >
                  <option value="PERFORMANCE">{dictionary?.reports.type.performance || "Performance"}</option>
                  <option value="PROGRESS">{dictionary?.reports.type.progress || "Progress"}</option>
                  <option value="SUMMARY">{dictionary?.reports.type.summary || "Summary"}</option>
                </select>
              </div>
              <div suppressHydrationWarning>
                <label className="block text-sm font-medium text-gray-700" suppressHydrationWarning>{dictionary?.reports.form.department || "Department"}</label>
                <select
                  name="departmentId"
                  value={newReport.departmentId || ''}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  suppressHydrationWarning
                >
                  <option value="">{dictionary?.reports.allDepartments || "All Departments"}</option>
                  {departments.map((dept) => (
                    <option key={dept.id} value={dept.id} suppressHydrationWarning>
                      {dept.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4" suppressHydrationWarning>
              <div suppressHydrationWarning>
                <label className="block text-sm font-medium text-gray-700" suppressHydrationWarning>{dictionary?.reports.form.startDate || "Start Date"}</label>
                <input
                  type="date"
                  name="startDate"
                  value={newReport.startDate}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  required
                />
              </div>
              <div suppressHydrationWarning>
                <label className="block text-sm font-medium text-gray-700" suppressHydrationWarning>{dictionary?.reports.form.endDate || "End Date"}</label>
                <input
                  type="date"
                  name="endDate"
                  value={newReport.endDate}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  required
                />
              </div>
            </div>
            <div className="flex justify-end space-x-3" suppressHydrationWarning>
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                suppressHydrationWarning
              >
                {dictionary?.common.cancel || "Cancel"}
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                suppressHydrationWarning
              >
                {dictionary?.common.create || "Create"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8" suppressHydrationWarning>
        <div className="bg-white p-6 rounded-lg shadow" suppressHydrationWarning>
          <h3 className="text-lg font-medium text-gray-900" suppressHydrationWarning>{dictionary?.reports.summary.totalObjectives || "Total Objectives"}</h3>
          <p className="mt-2 text-3xl font-bold text-blue-600" suppressHydrationWarning>{reportData.totalObjectives}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow" suppressHydrationWarning>
          <h3 className="text-lg font-medium text-gray-900" suppressHydrationWarning>{dictionary?.reports.summary.activeObjectives || "Active Objectives"}</h3>
          <p className="mt-2 text-3xl font-bold text-green-600" suppressHydrationWarning>{reportData.activeObjectives}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow" suppressHydrationWarning>
          <h3 className="text-lg font-medium text-gray-900" suppressHydrationWarning>{dictionary?.reports.summary.completedObjectives || "Completed Objectives"}</h3>
          <p className="mt-2 text-3xl font-bold text-purple-600" suppressHydrationWarning>{reportData.completedObjectives}</p>
        </div>
      </div>

      {/* Department Progress */}
      <div className="bg-white p-6 rounded-lg shadow mb-8" suppressHydrationWarning>
        <h2 className="text-xl font-semibold mb-4" suppressHydrationWarning>{dictionary?.reports.departmentProgress || "Department Progress"}</h2>
        <div className="space-y-4" suppressHydrationWarning>
          {reportData.departmentProgress.map((dept) => (
            <div key={dept.departmentName} className="mb-4" suppressHydrationWarning>
              <div className="flex justify-between mb-1" suppressHydrationWarning>
                <span className="text-sm font-medium text-gray-700" suppressHydrationWarning>{dept.departmentName}</span>
                <span className="text-sm font-medium text-gray-700" suppressHydrationWarning>{dept.progress}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2.5" suppressHydrationWarning>
                <div 
                  className="bg-blue-600 h-2.5 rounded-full" 
                  style={{ width: `${dept.progress}%` }}
                  suppressHydrationWarning
                ></div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Monthly Progress */}
      <div className="bg-white p-6 rounded-lg shadow" suppressHydrationWarning>
        <h2 className="text-xl font-semibold mb-4" suppressHydrationWarning>{dictionary?.reports.monthlyProgress || "Monthly Progress"}</h2>
        <div className="h-64" suppressHydrationWarning>
          <div className="flex h-full items-end space-x-2" suppressHydrationWarning>
            {reportData.monthlyProgress.map((month) => (
              <div key={month.month} className="flex-1 flex flex-col items-center" suppressHydrationWarning>
                <div 
                  className="w-full bg-blue-600 rounded-t-sm" 
                  style={{ height: `${month.progress}%` }}
                  suppressHydrationWarning
                ></div>
                <span className="text-xs mt-1" suppressHydrationWarning>{month.month}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ReportsPage() {
  return (
    <SessionProvider>
      <ReportsContent />
    </SessionProvider>
  );
} 