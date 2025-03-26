'use client';

import { useState, useEffect, useMemo } from 'react';
import { useSession, SessionProvider } from 'next-auth/react';
import { useParams } from 'next/navigation';
import { getDictionary } from '@/lib/dictionary';
import Link from 'next/link';

type Department = {
  id: string;
  name: string;
  description: string;
  parentId: string | null;
};

type NewDepartment = {
  name: string;
  description: string;
  parentId: string | null;
};

function DepartmentsContent() {
  const { data: session } = useSession();
  const params = useParams();
  const [dictionary, setDictionary] = useState<any>({});
  const [isLoading, setIsLoading] = useState(true);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<NewDepartment>({
    name: '',
    description: '',
    parentId: null
  });

  // Tạo departmentsMap để dễ dàng tìm kiếm department theo id
  const departmentsMap = useMemo(() => {
    const map: Record<string, Department> = {};
    departments.forEach(dept => {
      map[dept.id] = dept;
    });
    return map;
  }, [departments]);

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
    const fetchDepartments = async () => {
      try {
        const response = await fetch('/api/departments');
        if (response.ok) {
          const data = await response.json();
          setDepartments(data);
        }
      } catch (error) {
        console.error('Error fetching departments:', error);
      }
    };
    
    if (!isLoading) {
      fetchDepartments();
    }
  }, [isLoading]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm((prev: NewDepartment) => ({
      ...prev,
      [name]: value === '' ? (name === 'parentId' ? null : '') : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const response = await fetch('/api/departments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(form),
      });
      
      if (response.ok) {
        const newDepartment = await response.json();
        setDepartments(prev => [...prev, newDepartment]);
        setForm({
          name: '',
          description: '',
          parentId: null
        });
        setShowForm(false);
      }
    } catch (error) {
      console.error('Error creating department:', error);
    }
  };

  const handleDeleteDepartment = async (id: string) => {
    if (window.confirm(dictionary?.departments?.confirmDelete || 'Are you sure you want to delete this department?')) {
      try {
        const response = await fetch(`/api/departments/${id}`, {
          method: 'DELETE',
        });
        
        if (response.ok) {
          setDepartments(prev => prev.filter(dept => dept.id !== id));
        } else {
          const errorData = await response.json();
          alert(errorData.message || 'Failed to delete department');
        }
      } catch (error) {
        console.error('Error deleting department:', error);
      }
    }
  };

  if (isLoading) {
    return <div className="text-center p-4" suppressHydrationWarning>Loading...</div>;
  }

  if (!session) {
    return (
      <div className="text-center" suppressHydrationWarning>
        <h2 className="text-2xl font-bold" suppressHydrationWarning>
          {dictionary?.auth?.loginRequired || "Please login to continue"}
        </h2>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto" suppressHydrationWarning>
      <div className="flex justify-between items-center mb-8" suppressHydrationWarning>
        <h1 className="text-2xl font-bold text-gray-900" suppressHydrationWarning>
          {dictionary?.departments?.title || "Departments"}
        </h1>
        <button
          onClick={() => setShowForm(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
          suppressHydrationWarning
        >
          {dictionary?.departments?.addNew || "Add New Department"}
        </button>
      </div>

      {showForm && (
        <div className="bg-white p-6 rounded-lg shadow mb-8" suppressHydrationWarning>
          <h2 className="text-xl font-semibold mb-4" suppressHydrationWarning>
            {dictionary?.departments?.addNew || "Add New Department"}
          </h2>
          <form className="space-y-4" onSubmit={handleSubmit} suppressHydrationWarning>
            <div suppressHydrationWarning>
              <label className="block text-sm font-medium text-gray-700" suppressHydrationWarning>
                {dictionary?.departments?.form?.name || "Department Name"}
              </label>
              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleInputChange}
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
            <div suppressHydrationWarning>
              <label className="block text-sm font-medium text-gray-700" suppressHydrationWarning>
                {dictionary?.departments?.form?.description || "Description"}
              </label>
              <textarea
                name="description"
                value={form.description}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                rows={3}
              />
            </div>
            <div suppressHydrationWarning>
              <label className="block text-sm font-medium text-gray-700" suppressHydrationWarning>
                {dictionary?.departments?.form?.parent || "Parent Department"}
              </label>
              <select 
                name="parentId"
                value={form.parentId || ''}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              >
                <option value="">{dictionary?.departments?.noParent || "None"}</option>
                {departments.map((dept) => (
                  <option key={dept.id} value={dept.id}>
                    {dept.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex justify-end space-x-3" suppressHydrationWarning>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                suppressHydrationWarning
              >
                {dictionary?.common?.cancel || "Cancel"}
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                suppressHydrationWarning
              >
                {dictionary?.common?.save || "Save"}
              </button>
            </div>
          </form>
        </div>
      )}

      {departments.length === 0 ? (
        <div className="bg-white shadow overflow-hidden sm:rounded-lg p-6 text-center" suppressHydrationWarning>
          <p className="text-gray-500" suppressHydrationWarning>
            {dictionary?.departments?.noDepartments || "No departments found"}
          </p>
        </div>
      ) : (
        <div className="bg-white shadow overflow-hidden sm:rounded-lg" suppressHydrationWarning>
          <div className="divide-y divide-gray-200" suppressHydrationWarning>
            {departments.map((department) => (
              <div key={department.id} className="px-4 py-4 sm:px-6 border-b" suppressHydrationWarning>
                <div className="flex items-center justify-between" suppressHydrationWarning>
                  <div className="flex-1" suppressHydrationWarning>
                    <Link 
                      href={`/${params.lang}/departments/${department.id}`} 
                      className="text-lg font-medium text-gray-900 hover:text-blue-600"
                      suppressHydrationWarning
                    >
                      {department.name}
                    </Link>
                    <p className="text-sm text-gray-500" suppressHydrationWarning>{department.description}</p>
                    {department.parentId && (
                      <p className="text-xs text-gray-500 mt-1" suppressHydrationWarning>
                        {dictionary?.departments?.parent || 'Parent Department'}: {' '}
                        <Link
                          href={`/${params.lang}/departments/${department.parentId}`}
                          className="text-blue-600 hover:text-blue-800"
                          suppressHydrationWarning
                        >
                          {departmentsMap[department.parentId]?.name}
                        </Link>
                      </p>
                    )}
                  </div>
                  <div className="ml-4 flex-shrink-0 flex space-x-4" suppressHydrationWarning>
                    <Link
                      href={`/${params.lang}/departments/${department.id}/edit`}
                      className="text-blue-600 hover:text-blue-800"
                      suppressHydrationWarning
                    >
                      {dictionary?.common?.edit || 'Edit'}
                    </Link>
                    <button
                      onClick={() => handleDeleteDepartment(department.id)}
                      className="text-red-600 hover:text-red-800"
                      suppressHydrationWarning
                    >
                      {dictionary?.common?.delete || 'Delete'}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default function DepartmentsPage() {
  return (
    <SessionProvider>
      <DepartmentsContent />
    </SessionProvider>
  );
} 