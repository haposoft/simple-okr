'use client';

import { useState, useEffect, FormEvent } from 'react';
import { useSession, SessionProvider } from 'next-auth/react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { getDictionary } from '@/lib/dictionary';

type Objective = {
  id: string;
  title: string;
  description: string;
  type: string;
  status: string;
  startDate: string;
  endDate: string;
  departmentId?: string;
};

type NewObjective = {
  title: string;
  description: string;
  type: string;
  status: string;
  startDate: string;
  endDate: string;
  departmentId?: string;
};

type Department = {
  id: string;
  name: string;
  description: string;
  parentId: string | null;
};

function ObjectivesContent() {
  const { data: session } = useSession();
  const params = useParams();
  const [objectives, setObjectives] = useState<Objective[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('ALL');
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [dictionary, setDictionary] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState('');
  const [departments, setDepartments] = useState<Department[]>([]);
  
  // Form state
  const [newObjective, setNewObjective] = useState<NewObjective>({
    title: '',
    description: '',
    type: 'PERSONAL',
    status: 'DRAFT',
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    departmentId: undefined
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
      fetchObjectives();
      fetchDepartments();
    }
  }, [isLoading]);

  const fetchObjectives = async () => {
    try {
      // Gọi API thực tế
      const response = await fetch('/api/objectives');
      
      if (!response.ok) {
        throw new Error('Failed to fetch objectives');
      }
      
      const data = await response.json();
      setObjectives(data);
    } catch (error) {
      console.error('Error fetching objectives:', error);
    }
  };

  const fetchDepartments = async () => {
    try {
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
    
    // Nếu thay đổi type thành COMPANY, xóa departmentId
    if (name === 'type' && value === 'COMPANY') {
      setNewObjective({
        ...newObjective,
        [name]: value,
        departmentId: undefined
      });
    } else {
      setNewObjective({
        ...newObjective,
        [name]: value,
      });
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setFormError('');
    
    try {
      // Validation
      if (!newObjective.title.trim()) {
        setFormError('Title is required');
        setIsSubmitting(false);
        return;
      }
      
      const response = await fetch('/api/objectives', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newObjective),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to create objective');
      }

      const createdObjective = await response.json();
      
      // Update local state with the newly created objective
      setObjectives(prevObjectives => [...prevObjectives, createdObjective]);
      
      // Reset form and close
      setNewObjective({
        title: '',
        description: '',
        type: 'PERSONAL',
        status: 'DRAFT',
        startDate: new Date().toISOString().split('T')[0],
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        departmentId: undefined
      });
      setShowAddForm(false);
    } catch (error) {
      console.error('Error creating objective:', error);
      setFormError(error instanceof Error ? error.message : 'Failed to create objective. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredObjectives = objectives.filter(objective => {
    const matchesSearch = objective.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        objective.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'ALL' || objective.type === filterType;
    const matchesStatus = filterStatus === 'ALL' || objective.status === filterStatus;
    return matchesSearch && matchesType && matchesStatus;
  });

  const getDepartmentName = (departmentId: string | undefined | null) => {
    if (!departmentId) return dictionary?.objectives.noDepartment || "No Department";
    
    const department = departments.find(dept => dept.id === departmentId);
    return department ? department.name : dictionary?.objectives.unknownDepartment || "Unknown Department";
  };

  if (isLoading) {
    return <div className="text-center p-4" suppressHydrationWarning>Loading...</div>;
  }

  if (!session) {
    return (
      <div className="text-center" suppressHydrationWarning>
        <h2 className="text-2xl font-bold" suppressHydrationWarning>{dictionary.auth.loginRequired}</h2>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto" suppressHydrationWarning>
      <div className="flex justify-between items-center mb-8" suppressHydrationWarning>
        <h1 className="text-2xl font-bold text-gray-900" suppressHydrationWarning>{dictionary.objectives.title}</h1>
        <button
          onClick={() => setShowAddForm(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
          suppressHydrationWarning
        >
          {dictionary.objectives.addNew}
        </button>
      </div>

      {/* Search and Filter Section */}
      <div className="bg-white p-4 rounded-lg shadow mb-8" suppressHydrationWarning>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4" suppressHydrationWarning>
          <div className="col-span-1 md:col-span-2">
            <input
              type="text"
              placeholder={dictionary.objectives.searchPlaceholder}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div>
            <select
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
            >
              <option value="ALL">{dictionary.objectives.filterAllTypes}</option>
              <option value="COMPANY">{dictionary.objectives.typeCompany}</option>
              <option value="DEPARTMENT">{dictionary.objectives.typeDepartment}</option>
              <option value="PERSONAL">{dictionary.objectives.typePersonal}</option>
            </select>
          </div>
          <div>
            <select
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="ALL">{dictionary.objectives.filterAllStatuses}</option>
              <option value="DRAFT">{dictionary.objectives.statusDraft}</option>
              <option value="ACTIVE">{dictionary.objectives.statusActive}</option>
              <option value="COMPLETED">{dictionary.objectives.statusCompleted}</option>
            </select>
          </div>
        </div>
      </div>

      {/* Add Objective Form */}
      {showAddForm && (
        <div className="bg-white p-6 rounded-lg shadow mb-8" suppressHydrationWarning>
          <h2 className="text-xl font-semibold mb-4" suppressHydrationWarning>{dictionary.objectives.addFormTitle}</h2>
          {formError && (
            <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-4" suppressHydrationWarning>
              <p className="text-red-700" suppressHydrationWarning>{formError}</p>
            </div>
          )}
          <form className="space-y-4" suppressHydrationWarning onSubmit={handleSubmit}>
            <div suppressHydrationWarning>
              <label className="block text-sm font-medium text-gray-700" suppressHydrationWarning>{dictionary.objectives.formTitle}</label>
              <input
                type="text"
                name="title"
                value={newObjective.title}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
            <div suppressHydrationWarning>
              <label className="block text-sm font-medium text-gray-700" suppressHydrationWarning>{dictionary.objectives.formDescription}</label>
              <textarea
                name="description"
                value={newObjective.description}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                rows={3}
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4" suppressHydrationWarning>
              <div suppressHydrationWarning>
                <label className="block text-sm font-medium text-gray-700" suppressHydrationWarning>{dictionary.objectives.formType}</label>
                <select
                  name="type"
                  value={newObjective.type}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                >
                  <option value="COMPANY">{dictionary.objectives.typeCompany}</option>
                  <option value="DEPARTMENT">{dictionary.objectives.typeDepartment}</option>
                  <option value="PERSONAL">{dictionary.objectives.typePersonal}</option>
                </select>
              </div>
              <div suppressHydrationWarning>
                <label className="block text-sm font-medium text-gray-700" suppressHydrationWarning>{dictionary.objectives.formStatus}</label>
                <select
                  name="status"
                  value={newObjective.status}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                >
                  <option value="DRAFT">{dictionary.objectives.statusDraft}</option>
                  <option value="ACTIVE">{dictionary.objectives.statusActive}</option>
                  <option value="COMPLETED">{dictionary.objectives.statusCompleted}</option>
                </select>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4" suppressHydrationWarning>
              <div suppressHydrationWarning>
                <label className="block text-sm font-medium text-gray-700" suppressHydrationWarning>{dictionary.objectives.formStartDate}</label>
                <input
                  type="date"
                  name="startDate"
                  value={newObjective.startDate}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
              <div suppressHydrationWarning>
                <label className="block text-sm font-medium text-gray-700" suppressHydrationWarning>{dictionary.objectives.formEndDate}</label>
                <input
                  type="date"
                  name="endDate"
                  value={newObjective.endDate}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
            </div>
            {/* Department Field */}
            {newObjective.type !== 'COMPANY' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4" suppressHydrationWarning>
                <div suppressHydrationWarning>
                  <label className="block text-sm font-medium text-gray-700" suppressHydrationWarning>{dictionary.objectives.formDepartment || "Department"}</label>
                  <select
                    name="departmentId"
                    value={newObjective.departmentId || ''}
                    onChange={handleInputChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  >
                    <option value="">{dictionary.objectives.selectDepartment || "Select Department"}</option>
                    {departments.map((dept) => (
                      <option key={dept.id} value={dept.id}>
                        {dept.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            )}
            <div className="flex justify-end space-x-3" suppressHydrationWarning>
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                suppressHydrationWarning
              >
                {dictionary.common.cancel}
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-blue-400"
                suppressHydrationWarning
              >
                {isSubmitting ? dictionary.common.loading : dictionary.common.save}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Objectives List */}
      <div className="bg-white shadow overflow-hidden sm:rounded-md" suppressHydrationWarning>
        {filteredObjectives.length === 0 ? (
          <div className="p-6 text-center text-gray-500" suppressHydrationWarning>
            {dictionary.objectives.noObjectives}
          </div>
        ) : (
          <ul className="divide-y divide-gray-200" suppressHydrationWarning>
            {filteredObjectives.map((objective) => (
              <li key={objective.id} className="px-4 py-4 sm:px-6" suppressHydrationWarning>
                <Link href={`/${params.lang}/objectives/${objective.id}`} className="block hover:bg-gray-50" suppressHydrationWarning>
                  <div className="flex items-center justify-between" suppressHydrationWarning>
                    <div className="flex-1" suppressHydrationWarning>
                      <h3 className="text-base font-medium text-blue-600 hover:text-blue-800 hover:underline transition-colors" suppressHydrationWarning>{objective.title}</h3>
                      <p className="text-sm text-gray-500" suppressHydrationWarning>{objective.description}</p>
                      <div className="mt-2 flex items-center text-xs text-gray-500" suppressHydrationWarning>
                        <span className="mr-3" suppressHydrationWarning>
                          {objective.type === 'COMPANY' ? dictionary.objectives.typeCompany :
                          objective.type === 'DEPARTMENT' ? dictionary.objectives.typeDepartment :
                          dictionary.objectives.typePersonal}
                        </span>
                        <span className="mr-3" suppressHydrationWarning>
                          {objective.status === 'DRAFT' ? dictionary.objectives.statusDraft :
                          objective.status === 'ACTIVE' ? dictionary.objectives.statusActive :
                          dictionary.objectives.statusCompleted}
                        </span>
                        <span className="mr-3" suppressHydrationWarning>
                          {dictionary.objectives.form.department}: {getDepartmentName(objective.departmentId)}
                        </span>
                      </div>
                    </div>
                    <div className="ml-4 flex-shrink-0 flex space-x-2" suppressHydrationWarning>
                      <Link href={`/${params.lang}/objectives/${objective.id}/edit`} className="text-blue-600 hover:text-blue-900" suppressHydrationWarning>
                        {dictionary.common.edit}
                      </Link>
                      <button
                        className="text-red-600 hover:text-red-900"
                        suppressHydrationWarning
                      >
                        {dictionary.common.delete}
                      </button>
                    </div>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

export default function ObjectivesPage() {
  return (
    <SessionProvider>
      <ObjectivesContent />
    </SessionProvider>
  );
} 