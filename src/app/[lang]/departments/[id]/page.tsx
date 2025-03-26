'use client';

import { useState, useEffect } from 'react';
import { useSession, SessionProvider } from 'next-auth/react';
import { useParams } from 'next/navigation';
import { getDictionary } from '@/lib/dictionary';
import Link from 'next/link';

type Department = {
  id: string;
  name: string;
  description: string;
  parentId?: string | null;
  parent?: Department | null;
};

type User = {
  id: string;
  name: string;
  email: string;
  image: string;
  role: string;
  departments?: UserDepartment[];
};

type UserDepartment = {
  id: string;
  userId: string;
  departmentId: string;
  isPrimary: boolean;
  role: string;
  user: User;
};

type Objective = {
  id: string;
  title: string;
  description: string;
  type: string;
  status: string;
  startDate: string;
  endDate: string;
  departmentId?: string;
  progress?: number;
};

function DepartmentDetailContent() {
  const { data: session } = useSession();
  const [department, setDepartment] = useState<Department | null>(null);
  const [members, setMembers] = useState<UserDepartment[]>([]);
  const [objectives, setObjectives] = useState<Objective[]>([]);
  const [parentDepartment, setParentDepartment] = useState<Department | null>(null);
  const [childrenDepartments, setChildrenDepartments] = useState<Department[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [dictionary, setDictionary] = useState<any>(null);
  const params = useParams();

  useEffect(() => {
    const loadDictionary = async () => {
      try {
        const dict = await getDictionary(params.lang as string);
        setDictionary(dict);
        setIsLoading(false);
      } catch (error) {
        console.error('Failed to load dictionary:', error);
        setIsLoading(false);
      }
    };

    loadDictionary();
  }, [params.lang]);

  useEffect(() => {
    if (!isLoading) {
      fetchDepartmentDetails();
      fetchDepartmentMembers();
      fetchDepartmentObjectives();
    }
  }, [isLoading, params.id]);

  const fetchDepartmentDetails = async () => {
    try {
      const response = await fetch(`/api/departments/${params.id}`);
      if (!response.ok) throw new Error('Failed to fetch department');
      
      const data = await response.json();
      setDepartment(data);
      
      // Fetch parent department if exists
      if (data.parentId) {
        const parentResponse = await fetch(`/api/departments/${data.parentId}`);
        if (parentResponse.ok) {
          const parentData = await parentResponse.json();
          setParentDepartment(parentData);
        }
      }
      
      // Fetch children departments
      const childrenResponse = await fetch(`/api/departments?parentId=${params.id}`);
      if (childrenResponse.ok) {
        const childrenData = await childrenResponse.json();
        setChildrenDepartments(childrenData);
      }
    } catch (error) {
      console.error('Error fetching department details:', error);
    }
  };

  const fetchDepartmentMembers = async () => {
    try {
      const response = await fetch(`/api/users?departmentId=${params.id}`);
      if (!response.ok) throw new Error('Failed to fetch department members');
      
      const data = await response.json();
      
      // Transform users to UserDepartment format
      const userDepartments = data.flatMap((user: User) => {
        const deptMembers = user.departments?.filter((d: any) => 
          d.departmentId === params.id
        );
        
        return deptMembers?.map((dept: any) => ({
          ...dept,
          user
        })) || [];
      });
      
      setMembers(userDepartments);
    } catch (error) {
      console.error('Error fetching department members:', error);
    }
  };

  const fetchDepartmentObjectives = async () => {
    try {
      const response = await fetch(`/api/objectives?departmentId=${params.id}`);
      if (!response.ok) throw new Error('Failed to fetch department objectives');
      
      const data = await response.json();
      setObjectives(data);
    } catch (error) {
      console.error('Error fetching department objectives:', error);
    }
  };

  // Calculate simple progress
  const calculateProgress = (obj: Objective) => {
    return obj.progress || Math.floor(Math.random() * 100);
  };

  // Get role label from dictionary
  const getRoleLabel = (role: string) => {
    if (!dictionary?.users?.departmentRoles) return role;
    return dictionary.users.departmentRoles[role as keyof typeof dictionary.users.departmentRoles] || role;
  };

  if (isLoading) {
    return <div className="text-center p-4" suppressHydrationWarning>Loading...</div>;
  }

  if (!session) {
    return (
      <div className="text-center" suppressHydrationWarning>
        <h2 className="text-2xl font-bold" suppressHydrationWarning>{dictionary?.auth.loginRequired}</h2>
      </div>
    );
  }

  if (!department) {
    return (
      <div className="text-center p-4" suppressHydrationWarning>
        <div className="text-xl text-gray-600" suppressHydrationWarning>
          {dictionary?.departments.notFound || "Department not found"}
        </div>
        <Link
          href={`/${params.lang}/departments`}
          className="mt-4 inline-block text-blue-600 hover:text-blue-800"
          suppressHydrationWarning
        >
          {dictionary?.departments.back || "Back to Departments"}
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto" suppressHydrationWarning>
      <div className="mb-6" suppressHydrationWarning>
        <Link
          href={`/${params.lang}/departments`}
          className="text-blue-600 hover:text-blue-800 flex items-center"
          suppressHydrationWarning
        >
          <svg className="w-4 h-4 mr-1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" suppressHydrationWarning>
            <path fillRule="evenodd" d="M9.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L7.414 9H15a1 1 0 110 2H7.414l2.293 2.293a1 1 0 010 1.414z" clipRule="evenodd" />
          </svg>
          {dictionary?.departments.back || "Back to Departments"}
        </Link>
      </div>

      {/* Department Header */}
      <div className="bg-white shadow overflow-hidden sm:rounded-lg mb-8" suppressHydrationWarning>
        <div className="px-4 py-5 sm:px-6 flex justify-between items-center" suppressHydrationWarning>
          <div suppressHydrationWarning>
            <h3 className="text-2xl font-bold text-gray-900" suppressHydrationWarning>
              {department.name}
            </h3>
            <p className="mt-1 max-w-2xl text-sm text-gray-500" suppressHydrationWarning>
              {department.description}
            </p>
          </div>
          <Link
            href={`/${params.lang}/departments/${params.id}/edit`}
            className="ml-3 inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none"
            suppressHydrationWarning
          >
            {dictionary?.common.edit || "Edit"}
          </Link>
        </div>
        <div className="border-t border-gray-200 p-0" suppressHydrationWarning>
          <dl className="divide-y divide-gray-200" suppressHydrationWarning>
            {parentDepartment && (
              <div className="px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6" suppressHydrationWarning>
                <dt className="text-sm font-medium text-gray-500" suppressHydrationWarning>
                  {dictionary?.departments.parent || "Parent Department"}
                </dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2" suppressHydrationWarning>
                  <Link 
                    href={`/${params.lang}/departments/${parentDepartment.id}`}
                    className="text-blue-600 hover:text-blue-800"
                    suppressHydrationWarning
                  >
                    {parentDepartment.name}
                  </Link>
                </dd>
              </div>
            )}
          </dl>
        </div>
      </div>

      {/* Sub-departments Section */}
      {childrenDepartments.length > 0 && (
        <div className="bg-white shadow overflow-hidden sm:rounded-lg mb-8" suppressHydrationWarning>
          <div className="px-4 py-5 sm:px-6" suppressHydrationWarning>
            <h3 className="text-lg leading-6 font-medium text-gray-900" suppressHydrationWarning>
              {dictionary?.departments.subDepartments || "Sub-departments"}
            </h3>
          </div>
          <div className="border-t border-gray-200" suppressHydrationWarning>
            <ul className="divide-y divide-gray-200" suppressHydrationWarning>
              {childrenDepartments.map((dept) => (
                <li key={dept.id} className="px-4 py-4 sm:px-6" suppressHydrationWarning>
                  <Link 
                    href={`/${params.lang}/departments/${dept.id}`}
                    className="block hover:bg-gray-50"
                    suppressHydrationWarning
                  >
                    <div className="flex items-center justify-between" suppressHydrationWarning>
                      <p className="text-base font-medium text-blue-600 hover:text-blue-800" suppressHydrationWarning>
                        {dept.name}
                      </p>
                    </div>
                    <p className="mt-1 text-sm text-gray-500" suppressHydrationWarning>
                      {dept.description}
                    </p>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* Department Members Section */}
      <div className="bg-white shadow overflow-hidden sm:rounded-lg mb-8" suppressHydrationWarning>
        <div className="px-4 py-5 sm:px-6 flex justify-between items-center" suppressHydrationWarning>
          <h3 className="text-lg leading-6 font-medium text-gray-900" suppressHydrationWarning>
            {dictionary?.departments.members || "Department Members"}
          </h3>
          <button
            className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            suppressHydrationWarning
          >
            {dictionary?.departments.addMember || "Add Member"}
          </button>
        </div>
        <div className="border-t border-gray-200" suppressHydrationWarning>
          {members.length === 0 ? (
            <div className="px-4 py-5 text-center text-gray-500" suppressHydrationWarning>
              {dictionary?.departments.noMembers || "No members in this department"}
            </div>
          ) : (
            <ul className="divide-y divide-gray-200" suppressHydrationWarning>
              {members.map((member) => (
                <li key={member.id} className="px-4 py-4 sm:px-6" suppressHydrationWarning>
                  <div className="flex items-center justify-between" suppressHydrationWarning>
                    <div className="flex items-center" suppressHydrationWarning>
                      {member.user.image && (
                        <div className="flex-shrink-0 h-10 w-10 mr-3" suppressHydrationWarning>
                          <img className="h-10 w-10 rounded-full" src={member.user.image} alt="" suppressHydrationWarning />
                        </div>
                      )}
                      <div suppressHydrationWarning>
                        <p className="text-sm font-medium text-gray-900" suppressHydrationWarning>
                          {member.user.name}
                          {member.isPrimary && (
                            <span className="ml-2 px-2 py-0.5 text-xs rounded-full bg-green-100 text-green-800" suppressHydrationWarning>
                              {dictionary?.users.primaryDepartment || "Primary"}
                            </span>
                          )}
                        </p>
                        <p className="text-sm text-gray-500" suppressHydrationWarning>
                          {member.user.email}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center" suppressHydrationWarning>
                      <span className="px-2 py-1 text-xs rounded-md bg-gray-100 text-gray-800" suppressHydrationWarning>
                        {getRoleLabel(member.role)}
                      </span>
                      <div className="ml-4 flex-shrink-0 flex" suppressHydrationWarning>
                        <button className="mr-2 text-blue-600 hover:text-blue-800" suppressHydrationWarning>
                          {dictionary?.common.edit || "Edit"}
                        </button>
                        <button className="text-red-600 hover:text-red-800" suppressHydrationWarning>
                          {dictionary?.common.delete || "Remove"}
                        </button>
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* Department Objectives Section */}
      <div className="bg-white shadow overflow-hidden sm:rounded-lg" suppressHydrationWarning>
        <div className="px-4 py-5 sm:px-6 flex justify-between items-center" suppressHydrationWarning>
          <h3 className="text-lg leading-6 font-medium text-gray-900" suppressHydrationWarning>
            {dictionary?.departments.objectives || "Department Objectives"}
          </h3>
          <Link
            href={`/${params.lang}/objectives/new?departmentId=${params.id}&type=DEPARTMENT`}
            className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            suppressHydrationWarning
          >
            {dictionary?.objectives.addNew || "Add Objective"}
          </Link>
        </div>
        <div className="border-t border-gray-200" suppressHydrationWarning>
          {objectives.length === 0 ? (
            <div className="px-4 py-5 text-center text-gray-500" suppressHydrationWarning>
              {dictionary?.departments.noObjectives || "No objectives for this department"}
            </div>
          ) : (
            <ul className="divide-y divide-gray-200" suppressHydrationWarning>
              {objectives.map((objective) => (
                <li key={objective.id} className="px-4 py-4 sm:px-6" suppressHydrationWarning>
                  <Link 
                    href={`/${params.lang}/objectives/${objective.id}`}
                    className="block hover:bg-gray-50"
                    suppressHydrationWarning
                  >
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center" suppressHydrationWarning>
                      <div className="mb-2 sm:mb-0" suppressHydrationWarning>
                        <h3 className="text-base font-medium text-blue-600 hover:text-blue-800 hover:underline transition-colors" suppressHydrationWarning>
                          {objective.title}
                        </h3>
                        <p className="text-sm text-gray-500" suppressHydrationWarning>
                          {objective.description}
                        </p>
                        <div className="mt-1 flex items-center text-xs text-gray-500" suppressHydrationWarning>
                          <span className="mr-3" suppressHydrationWarning>
                            {objective.status === 'DRAFT' 
                              ? dictionary?.objectives.statusDraft || 'Draft' 
                              : objective.status === 'ACTIVE' 
                                ? dictionary?.objectives.statusActive || 'Active' 
                                : dictionary?.objectives.statusCompleted || 'Completed'}
                          </span>
                          <span suppressHydrationWarning>
                            {new Date(objective.startDate).toLocaleDateString()} - {new Date(objective.endDate).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                      <div className="flex flex-col items-end" suppressHydrationWarning>
                        <div className="flex items-center" suppressHydrationWarning>
                          <span className="text-sm font-medium mr-2" suppressHydrationWarning>
                            {calculateProgress(objective)}%
                          </span>
                          <div className="w-32 bg-gray-200 rounded-full h-2.5" suppressHydrationWarning>
                            <div
                              className="bg-blue-600 h-2.5 rounded-full"
                              style={{ width: `${calculateProgress(objective)}%` }}
                              suppressHydrationWarning
                            ></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}

export default function DepartmentDetailPage() {
  return (
    <SessionProvider>
      <DepartmentDetailContent />
    </SessionProvider>
  );
} 