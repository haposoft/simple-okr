'use client';

import { useState, useEffect } from 'react';
import { useSession, SessionProvider } from 'next-auth/react';
import { useParams } from 'next/navigation';
import { getDictionary } from '@/lib/dictionary';

type User = {
  id: string;
  name: string;
  email: string;
  image: string;
  role: string;
  departments: UserDepartment[];
};

type UserDepartment = {
  id: string;
  userId: string;
  departmentId: string;
  isPrimary: boolean;
  role: string;
  department: Department;
};

type Department = {
  id: string;
  name: string;
  description: string;
};

function UsersContent() {
  const { data: session } = useSession();
  const [users, setUsers] = useState<User[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('ALL');
  const [filterDepartment, setFilterDepartment] = useState('ALL');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showDepartmentForm, setShowDepartmentForm] = useState(false);
  const [formError, setFormError] = useState('');
  const params = useParams();
  const [dictionary, setDictionary] = useState<any>(null);
  
  // Form state cho việc thêm người dùng vào phòng ban
  const [userDepartmentForm, setUserDepartmentForm] = useState({
    departmentId: '',
    role: 'MEMBER',
    isPrimary: false
  });

  // Hàm trả về tên department từ danh sách departments dựa vào ID
  const getDepartmentNameById = (departmentId: string): string => {
    const department = departments.find(dept => dept.id === departmentId);
    return department?.name || 'Unknown Department';
  };

  useEffect(() => {
    const loadDictionary = async () => {
      try {
        const dict = await getDictionary(params.lang as string);
        setDictionary(dict);
      } catch (error) {
        console.error('Failed to load dictionary:', error);
      } finally {
        setLoading(false);
      }
    };

    loadDictionary();
  }, [params.lang]);

  useEffect(() => {
    if (!loading) {
      fetchUsers();
      fetchDepartments();
    }
  }, [loading]);

  const fetchUsers = async () => {
    try {
      const response = await fetch('/api/users');
      if (!response.ok) {
        throw new Error('Failed to fetch users');
      }
      const data = await response.json();
      setUsers(data);
    } catch (error) {
      console.error('Error fetching users:', error);
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
  
  const handleAddToDepartment = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    
    if (!selectedUser) {
      setFormError('No user selected');
      return;
    }
    
    if (!userDepartmentForm.departmentId) {
      setFormError('Please select a department');
      return;
    }
    
    try {
      const response = await fetch('/api/user-departments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: selectedUser.id,
          departmentId: userDepartmentForm.departmentId,
          role: userDepartmentForm.role,
          isPrimary: userDepartmentForm.isPrimary
        }),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to add user to department');
      }
      
      // Refresh user data
      fetchUsers();
      
      // Reset form
      setUserDepartmentForm({
        departmentId: '',
        role: 'MEMBER',
        isPrimary: false
      });
      setShowDepartmentForm(false);
    } catch (error: any) {
      setFormError(error.message);
    }
  };
  
  const handleRemoveFromDepartment = async (userId: string, departmentId: string) => {
    if (!confirm(dictionary?.users.confirmRemove || 'Are you sure?')) {
      return;
    }
    
    try {
      const response = await fetch(`/api/user-departments?userId=${userId}&departmentId=${departmentId}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('Failed to remove user from department');
      }
      
      // Refresh user data
      fetchUsers();
    } catch (error) {
      console.error('Error removing user from department:', error);
    }
  };
  
  const handleMakePrimary = async (userId: string, departmentId: string) => {
    try {
      const response = await fetch('/api/user-departments', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          departmentId,
          isPrimary: true
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to update department');
      }
      
      // Refresh user data
      fetchUsers();
    } catch (error) {
      console.error('Error updating department:', error);
    }
  };
  
  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesRole = filterRole === 'ALL' || user.role === filterRole;
    
    const matchesDepartment = filterDepartment === 'ALL' || 
      (user.departments && user.departments.some(ud => ud.departmentId === filterDepartment));
    
    return matchesSearch && matchesRole && matchesDepartment;
  });

  if (loading) {
    return <div className="text-center p-4" suppressHydrationWarning>Loading...</div>;
  }

  if (!session) {
    return (
      <div className="text-center" suppressHydrationWarning>
        <h2 className="text-2xl font-bold" suppressHydrationWarning>{dictionary?.auth.loginRequired}</h2>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto" suppressHydrationWarning>
      <div className="flex justify-between items-center mb-8" suppressHydrationWarning>
        <h1 className="text-2xl font-bold text-gray-900" suppressHydrationWarning>{dictionary?.users.title}</h1>
      </div>

      {/* Search and Filter Section */}
      <div className="bg-white p-4 rounded-lg shadow mb-8" suppressHydrationWarning>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4" suppressHydrationWarning>
          <div className="col-span-1 md:col-span-2">
            <input
              type="text"
              placeholder={dictionary?.users.searchPlaceholder}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div>
            <select
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value)}
            >
              <option value="ALL">{dictionary?.users.filterAllRoles}</option>
              <option value="USER">{dictionary?.users.roles.USER}</option>
              <option value="MANAGER">{dictionary?.users.roles.MANAGER}</option>
              <option value="ADMIN">{dictionary?.users.roles.ADMIN}</option>
            </select>
          </div>
          <div>
            <select
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={filterDepartment}
              onChange={(e) => setFilterDepartment(e.target.value)}
            >
              <option value="ALL">{dictionary?.users.filterAllDepartments}</option>
              {departments.map(dept => (
                <option key={dept.id} value={dept.id}>{dept.name}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white shadow overflow-hidden rounded-lg" suppressHydrationWarning>
        <table className="min-w-full divide-y divide-gray-200" suppressHydrationWarning>
          <thead className="bg-gray-50" suppressHydrationWarning>
            <tr suppressHydrationWarning>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider" suppressHydrationWarning>
                {dictionary?.users.name}
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider" suppressHydrationWarning>
                {dictionary?.users.email}
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider" suppressHydrationWarning>
                {dictionary?.users.role}
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider" suppressHydrationWarning>
                {dictionary?.users.departments}
              </th>
              <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider" suppressHydrationWarning>
                {dictionary?.users.actions}
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200" suppressHydrationWarning>
            {filteredUsers.length === 0 ? (
              <tr suppressHydrationWarning>
                <td colSpan={5} className="px-6 py-4 text-center text-sm text-gray-500" suppressHydrationWarning>
                  {dictionary?.users.noUsers}
                </td>
              </tr>
            ) : (
              filteredUsers.map((user) => (
                <tr key={user.id} suppressHydrationWarning>
                  <td className="px-6 py-4 whitespace-nowrap" suppressHydrationWarning>
                    <div className="flex items-center" suppressHydrationWarning>
                      {user.image && (
                        <div className="flex-shrink-0 h-10 w-10 mr-3" suppressHydrationWarning>
                          <img className="h-10 w-10 rounded-full" src={user.image} alt="" suppressHydrationWarning />
                        </div>
                      )}
                      <div className={`${session?.user?.email === user.email ? 'text-sm font-bold text-blue-600 flex items-center' : 'text-sm font-medium text-gray-900'}`} suppressHydrationWarning>
                        {user.name}
                        {session?.user?.email === user.email && (
                          <span className="ml-2 px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800" suppressHydrationWarning>
                            {dictionary?.users.currentUser || "Current User"}
                          </span>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500" suppressHydrationWarning>
                    {user.email}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500" suppressHydrationWarning>
                    {user.role && dictionary?.users.roles[user.role as keyof typeof dictionary.users.roles]}
                  </td>
                  <td className="px-6 py-4" suppressHydrationWarning>
                    {user.departments && user.departments.length > 0 ? (
                      <div className="text-sm text-gray-900 space-y-1" suppressHydrationWarning>
                        {user.departments.map((ud) => (
                          <div key={ud.id} className="flex items-center justify-between" suppressHydrationWarning>
                            <div suppressHydrationWarning>
                              <span className="mr-2" suppressHydrationWarning>
                                {ud.department?.name || getDepartmentNameById(ud.departmentId)}
                              </span>
                              {ud.isPrimary && (
                                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800" suppressHydrationWarning>
                                  {dictionary?.users.primaryDepartment}
                                </span>
                              )}
                              <span className="text-xs text-gray-500 ml-2" suppressHydrationWarning>
                                ({dictionary?.users.departmentRoles[ud.role as keyof typeof dictionary.users.departmentRoles]})
                              </span>
                            </div>
                            <div className="flex space-x-2" suppressHydrationWarning>
                              {!ud.isPrimary && (
                                <button
                                  onClick={() => handleMakePrimary(user.id, ud.departmentId)}
                                  className="text-xs text-blue-600 hover:text-blue-900"
                                  suppressHydrationWarning
                                >
                                  {dictionary?.users.makePrimary}
                                </button>
                              )}
                              <button
                                onClick={() => handleRemoveFromDepartment(user.id, ud.departmentId)}
                                className="text-xs text-red-600 hover:text-red-900"
                                suppressHydrationWarning
                              >
                                {dictionary?.common.delete}
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <span className="text-sm text-gray-500" suppressHydrationWarning>{dictionary?.users.noDepartments}</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium" suppressHydrationWarning>
                    <button
                      onClick={() => {
                        setSelectedUser(user);
                        setShowDepartmentForm(true);
                      }}
                      className="text-blue-600 hover:text-blue-900 mr-4"
                      suppressHydrationWarning
                    >
                      {dictionary?.users.addDepartment}
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Add Department Form Modal */}
      {showDepartmentForm && selectedUser && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center z-50" suppressHydrationWarning>
          <div className="bg-white rounded-lg p-6 max-w-md w-full" suppressHydrationWarning>
            <h2 className="text-xl font-semibold mb-4" suppressHydrationWarning>
              {dictionary?.users.assignToDepartment}: {selectedUser.name}
            </h2>
            
            {formError && (
              <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-4" suppressHydrationWarning>
                <p className="text-red-700" suppressHydrationWarning>{formError}</p>
              </div>
            )}
            
            <form onSubmit={handleAddToDepartment} suppressHydrationWarning>
              <div className="mb-4" suppressHydrationWarning>
                <label className="block text-sm font-medium text-gray-700 mb-2" suppressHydrationWarning>
                  {dictionary?.users.form.department}
                </label>
                <select
                  value={userDepartmentForm.departmentId}
                  onChange={(e) => setUserDepartmentForm({...userDepartmentForm, departmentId: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  suppressHydrationWarning
                >
                  <option value="">{dictionary?.objectives.selectDepartment}</option>
                  {departments
                    .filter(dept => !selectedUser.departments.some(ud => ud.departmentId === dept.id))
                    .map(dept => (
                      <option key={dept.id} value={dept.id}>{dept.name}</option>
                    ))
                  }
                </select>
              </div>
              
              <div className="mb-4" suppressHydrationWarning>
                <label className="block text-sm font-medium text-gray-700 mb-2" suppressHydrationWarning>
                  {dictionary?.users.form.departmentRole}
                </label>
                <select
                  value={userDepartmentForm.role}
                  onChange={(e) => setUserDepartmentForm({...userDepartmentForm, role: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  suppressHydrationWarning
                >
                  <option value="MEMBER">{dictionary?.users.departmentRoles.MEMBER}</option>
                  <option value="LEADER">{dictionary?.users.departmentRoles.LEADER}</option>
                  <option value="MANAGER">{dictionary?.users.departmentRoles.MANAGER}</option>
                </select>
              </div>
              
              <div className="mb-6" suppressHydrationWarning>
                <label className="flex items-center" suppressHydrationWarning>
                  <input
                    type="checkbox"
                    checked={userDepartmentForm.isPrimary}
                    onChange={(e) => setUserDepartmentForm({...userDepartmentForm, isPrimary: e.target.checked})}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    suppressHydrationWarning
                  />
                  <span className="ml-2 text-sm text-gray-700" suppressHydrationWarning>
                    {dictionary?.users.form.isPrimary}
                  </span>
                </label>
              </div>
              
              <div className="flex justify-end space-x-3" suppressHydrationWarning>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedUser(null);
                    setShowDepartmentForm(false);
                    setUserDepartmentForm({
                      departmentId: '',
                      role: 'MEMBER',
                      isPrimary: false
                    });
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                  suppressHydrationWarning
                >
                  {dictionary?.common.cancel}
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  suppressHydrationWarning
                >
                  {dictionary?.common.save}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default function UsersPage() {
  return (
    <SessionProvider>
      <UsersContent />
    </SessionProvider>
  );
} 