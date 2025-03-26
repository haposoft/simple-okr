'use client';

import { useState, useEffect } from 'react';
import { useSession, SessionProvider } from 'next-auth/react';
import { useParams } from 'next/navigation';
import { getDictionary } from '@/lib/dictionary';
import Link from 'next/link';

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

type NewKeyResult = {
  title: string;
  description: string;
  target: number;
  current: number;
  unit: string;
};

function ObjectiveDetailContent() {
  const { data: session } = useSession();
  const [objective, setObjective] = useState<Objective | null>(null);
  const [showUpdateForm, setShowUpdateForm] = useState(false);
  const [showAddKRForm, setShowAddKRForm] = useState(false);
  const [showEditKRForm, setShowEditKRForm] = useState(false);
  const [showEditObjectiveForm, setShowEditObjectiveForm] = useState(false);
  const [editingKR, setEditingKR] = useState<KeyResult | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [dictionary, setDictionary] = useState<any>(null);
  const params = useParams();
  const [keyResultUpdates, setKeyResultUpdates] = useState<{[key: string]: number}>({});
  const [newKeyResult, setNewKeyResult] = useState<NewKeyResult>({
    title: '',
    description: '',
    target: 100,
    current: 0,
    unit: '%'
  });
  const [editingObjective, setEditingObjective] = useState<Objective | null>(null);

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
      fetchObjectiveDetails();
    }
  }, [isLoading, params.id]);

  const fetchObjectiveDetails = async () => {
    // For demonstration, we'll create mock data based on the ID
    // In a real app, this would be an API call:
    // const response = await fetch(`/api/objectives/${params.id}`);
    // const data = await response.json();

    // Sample data for demonstration
    const mockObjective: Objective = {
      id: params.id as string,
      title: `Objective ${params.id}`,
      description: "This is a detailed description of the objective",
      type: parseInt(params.id as string) % 3 === 0 ? "COMPANY" : parseInt(params.id as string) % 2 === 0 ? "DEPARTMENT" : "PERSONAL",
      status: parseInt(params.id as string) % 3 === 0 ? "COMPLETED" : parseInt(params.id as string) % 2 === 0 ? "ACTIVE" : "DRAFT",
      startDate: "2023-01-01",
      endDate: "2023-12-31",
      keyResults: [
        {
          id: `kr1-${params.id}`,
          title: "Key Result 1",
          description: "Description of key result 1",
          target: 100,
          current: 65,
          unit: "%"
        },
        {
          id: `kr2-${params.id}`,
          title: "Key Result 2",
          description: "Description of key result 2",
          target: 10,
          current: 4,
          unit: "tasks"
        }
      ]
    };

    setObjective(mockObjective);
    
    // Initialize key result updates
    const updates: {[key: string]: number} = {};
    mockObjective.keyResults.forEach(kr => {
      updates[kr.id] = kr.current;
    });
    setKeyResultUpdates(updates);
  };

  const handleUpdateChange = (krId: string, value: number) => {
    setKeyResultUpdates({
      ...keyResultUpdates,
      [krId]: value
    });
  };

  const handleUpdateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Update local state for demo purposes
    if (objective) {
      const updatedKeyResults = objective.keyResults.map(kr => ({
        ...kr,
        current: keyResultUpdates[kr.id] || kr.current
      }));
      
      setObjective({
        ...objective,
        keyResults: updatedKeyResults
      });
      
      setShowUpdateForm(false);
    }
    
    // In a real app, you would make an API call here:
    // await fetch(`/api/objectives/${params.id}/keyResults`, {
    //   method: 'PUT',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify({ updates: keyResultUpdates })
    // });
  };

  const handleNewKRInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setNewKeyResult({
      ...newKeyResult,
      [name]: name === 'target' || name === 'current' ? Number(value) : value
    });
  };

  const handleAddKR = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (objective) {
      // Generate a unique ID for the new key result
      const newId = `kr${objective.keyResults.length + 1}-${params.id}`;
      
      const newKR: KeyResult = {
        id: newId,
        ...newKeyResult
      };
      
      setObjective({
        ...objective,
        keyResults: [...objective.keyResults, newKR]
      });
      
      // Reset form and close
      setNewKeyResult({
        title: '',
        description: '',
        target: 100,
        current: 0,
        unit: '%'
      });
      setShowAddKRForm(false);
    }
    
    // In a real app, you would make an API call here:
    // await fetch(`/api/objectives/${params.id}/keyResults`, {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify(newKeyResult)
    // });
  };

  const handleEditKRSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (objective && editingKR) {
      const updatedKeyResults = objective.keyResults.map(kr => 
        kr.id === editingKR.id ? editingKR : kr
      );
      
      setObjective({
        ...objective,
        keyResults: updatedKeyResults
      });
      
      setEditingKR(null);
      setShowEditKRForm(false);
    }
    
    // In a real app, you would make an API call here:
    // await fetch(`/api/objectives/${params.id}/keyResults/${editingKR.id}`, {
    //   method: 'PUT',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify(editingKR)
    // });
  };

  const handleEditKRChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    if (!editingKR) return;
    
    const { name, value } = e.target;
    setEditingKR({
      ...editingKR,
      [name]: name === 'target' || name === 'current' ? Number(value) : value
    });
  };

  const startEditingKR = (kr: KeyResult) => {
    setEditingKR(kr);
    setShowEditKRForm(true);
  };

  const deleteKeyResult = (krId: string) => {
    if (objective) {
      if (window.confirm(dictionary?.objectives.confirmDeleteKR || "Are you sure you want to delete this key result?")) {
        const updatedKeyResults = objective.keyResults.filter(kr => kr.id !== krId);
        
        setObjective({
          ...objective,
          keyResults: updatedKeyResults
        });
      }
    }
    
    // In a real app, you would make an API call here:
    // await fetch(`/api/objectives/${params.id}/keyResults/${krId}`, {
    //   method: 'DELETE'
    // });
  };

  const handleEditObjectiveClick = () => {
    setEditingObjective({...objective!});
    setShowEditObjectiveForm(true);
  };

  const handleEditObjectiveChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setEditingObjective({
      ...editingObjective!,
      [name]: value
    });
  };

  const handleEditObjectiveSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingObjective) {
      setObjective(editingObjective);
      setShowEditObjectiveForm(false);
      setEditingObjective(null);
    }
    
    // In a real app, you would make an API call here:
    // await fetch(`/api/objectives/${params.id}`, {
    //   method: 'PUT',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify(editingObjective)
    // });
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

  if (!objective) {
    return (
      <div className="text-center" suppressHydrationWarning>
        <h2 className="text-2xl font-bold" suppressHydrationWarning>
          {dictionary?.objectives.notFound || "Objective not found"}
        </h2>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto" suppressHydrationWarning>
      <div className="mb-4" suppressHydrationWarning>
        <Link 
          href={`/${params.lang}/objectives`} 
          className="text-blue-600 hover:text-blue-800 flex items-center"
          suppressHydrationWarning
        >
          ← {dictionary?.objectives.back || "Back to Objectives"}
        </Link>
      </div>
      
      <div className="bg-white shadow overflow-hidden sm:rounded-lg" suppressHydrationWarning>
        <div className="px-4 py-5 sm:px-6" suppressHydrationWarning>
          <div className="flex justify-between items-center" suppressHydrationWarning>
            <h3 className="text-lg leading-6 font-medium text-gray-900" suppressHydrationWarning>{objective.title}</h3>
            <div className="flex space-x-2" suppressHydrationWarning>
              <button
                onClick={handleEditObjectiveClick}
                className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700"
                suppressHydrationWarning
              >
                {dictionary?.common.edit || "Edit"}
              </button>
              <button
                onClick={() => setShowUpdateForm(true)}
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
                suppressHydrationWarning
              >
                {dictionary?.objectives.updateProgress || "Update Progress"}
              </button>
            </div>
          </div>
          <p className="mt-1 max-w-2xl text-sm text-gray-500" suppressHydrationWarning>{objective.description}</p>
          <div className="mt-4 flex items-center space-x-4" suppressHydrationWarning>
            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
              objective.status === 'ACTIVE' ? 'bg-green-100 text-green-800' : 
              objective.status === 'COMPLETED' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'
            }`} suppressHydrationWarning>
              {objective.status}
            </span>
            <span className="text-sm text-gray-500" suppressHydrationWarning>
              {new Date(objective.startDate).toLocaleDateString()} - {new Date(objective.endDate).toLocaleDateString()}
            </span>
          </div>
        </div>

        <div className="border-t border-gray-200" suppressHydrationWarning>
          <div className="px-4 py-5 sm:px-6 flex justify-between items-center" suppressHydrationWarning>
            <h4 className="text-md font-medium text-gray-900" suppressHydrationWarning>
              {dictionary?.objectives.keyResults || "Key Results"}
            </h4>
            <button
              onClick={() => setShowAddKRForm(true)}
              className="text-sm px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700"
              suppressHydrationWarning
            >
              {dictionary?.objectives.addKeyResult || "Add Key Result"}
            </button>
          </div>
          <div className="border-t border-gray-200" suppressHydrationWarning>
            {objective.keyResults.length === 0 ? (
              <div className="p-6 text-center text-gray-500" suppressHydrationWarning>
                {dictionary?.objectives.noKeyResults || "No key results defined yet"}
              </div>
            ) : (
              <ul className="divide-y divide-gray-200" suppressHydrationWarning>
                {objective.keyResults.map((kr) => (
                  <li key={kr.id} className="px-4 py-4 sm:px-6" suppressHydrationWarning>
                    <div className="flex items-center justify-between" suppressHydrationWarning>
                      <div className="flex-1" suppressHydrationWarning>
                        <p className="text-sm font-medium text-gray-900" suppressHydrationWarning>{kr.title}</p>
                        <p className="text-sm text-gray-500" suppressHydrationWarning>{kr.description}</p>
                      </div>
                      <div className="ml-4 flex-shrink-0" suppressHydrationWarning>
                        <div className="flex items-center mb-2" suppressHydrationWarning>
                          <div className="w-32 bg-gray-200 rounded-full h-2.5 mr-2" suppressHydrationWarning>
                            <div
                              className="bg-blue-600 h-2.5 rounded-full"
                              style={{ width: `${Math.min(100, (kr.current / kr.target) * 100)}%` }}
                              suppressHydrationWarning
                            ></div>
                          </div>
                          <span className="text-sm text-gray-500" suppressHydrationWarning>
                            {kr.current} / {kr.target} {kr.unit}
                          </span>
                        </div>
                        <div className="flex justify-end space-x-2" suppressHydrationWarning>
                          <button 
                            onClick={() => startEditingKR(kr)}
                            className="text-xs px-2 py-1 text-blue-600 hover:text-blue-800"
                            suppressHydrationWarning
                          >
                            {dictionary?.common.edit || "Edit"}
                          </button>
                          <button 
                            onClick={() => deleteKeyResult(kr.id)}
                            className="text-xs px-2 py-1 text-red-600 hover:text-red-800"
                            suppressHydrationWarning
                          >
                            {dictionary?.common.delete || "Delete"}
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
      </div>

      {/* Update Progress Modal */}
      {showUpdateForm && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center" suppressHydrationWarning>
          <div className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full" suppressHydrationWarning>
            <h3 className="text-lg font-medium text-gray-900 mb-4" suppressHydrationWarning>
              {dictionary?.objectives.updateProgress || "Update Progress"}
            </h3>
            <form className="space-y-4" onSubmit={handleUpdateSubmit} suppressHydrationWarning>
              {objective.keyResults.map((kr) => (
                <div key={kr.id} suppressHydrationWarning>
                  <label className="block text-sm font-medium text-gray-700 mb-1" suppressHydrationWarning>{kr.title}</label>
                  <div className="flex items-center rounded-md shadow-sm" suppressHydrationWarning>
                    <input
                      type="number"
                      value={keyResultUpdates[kr.id] || kr.current}
                      onChange={(e) => handleUpdateChange(kr.id, Number(e.target.value))}
                      min="0"
                      max={kr.target}
                      className="block w-full px-3 py-2 border border-gray-300 rounded-l-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      placeholder={`Current progress (${kr.unit})`}
                      suppressHydrationWarning
                    />
                    <span className="inline-flex items-center px-3 py-2 rounded-r-md border border-l-0 border-gray-300 bg-gray-50 text-gray-500 sm:text-sm" suppressHydrationWarning>
                      {kr.unit}
                    </span>
                  </div>
                  <div className="mt-2" suppressHydrationWarning>
                    <div className="w-full bg-gray-200 rounded-full h-2.5" suppressHydrationWarning>
                      <div
                        className="bg-blue-600 h-2.5 rounded-full"
                        style={{ width: `${Math.min(100, (keyResultUpdates[kr.id] || kr.current) / kr.target * 100)}%` }}
                        suppressHydrationWarning
                      ></div>
                    </div>
                  </div>
                </div>
              ))}
              <div className="flex justify-end space-x-3" suppressHydrationWarning>
                <button
                  type="button"
                  onClick={() => setShowUpdateForm(false)}
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
                  {dictionary?.common.save || "Save"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Key Result Modal */}
      {showAddKRForm && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center" suppressHydrationWarning>
          <div className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full" suppressHydrationWarning>
            <h3 className="text-lg font-medium text-gray-900 mb-4" suppressHydrationWarning>
              {dictionary?.objectives.addKeyResult || "Add Key Result"}
            </h3>
            <form className="space-y-4" onSubmit={handleAddKR} suppressHydrationWarning>
              <div suppressHydrationWarning>
                <label className="block text-sm font-medium text-gray-700" suppressHydrationWarning>
                  {dictionary?.objectives.form.title || "Title"}
                </label>
                <input
                  type="text"
                  name="title"
                  value={newKeyResult.title}
                  onChange={handleNewKRInputChange}
                  required
                  className="mt-1 block w-full rounded-md border-gray-300 focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                />
              </div>
              <div suppressHydrationWarning>
                <label className="block text-sm font-medium text-gray-700" suppressHydrationWarning>
                  {dictionary?.objectives.form.description || "Description"}
                </label>
                <textarea
                  name="description"
                  value={newKeyResult.description}
                  onChange={handleNewKRInputChange}
                  rows={3}
                  className="mt-1 block w-full rounded-md border-gray-300 focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                />
              </div>
              <div className="grid grid-cols-2 gap-4" suppressHydrationWarning>
                <div suppressHydrationWarning>
                  <label className="block text-sm font-medium text-gray-700" suppressHydrationWarning>
                    {dictionary?.objectives.target || "Target"}
                  </label>
                  <input
                    type="number"
                    name="target"
                    value={newKeyResult.target}
                    onChange={handleNewKRInputChange}
                    min="1"
                    required
                    className="mt-1 block w-full rounded-md border-gray-300 focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  />
                </div>
                <div suppressHydrationWarning>
                  <label className="block text-sm font-medium text-gray-700" suppressHydrationWarning>
                    {dictionary?.objectives.current || "Current"}
                  </label>
                  <input
                    type="number"
                    name="current"
                    value={newKeyResult.current}
                    onChange={handleNewKRInputChange}
                    min="0"
                    className="mt-1 block w-full rounded-md border-gray-300 focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  />
                </div>
              </div>
              <div suppressHydrationWarning>
                <label className="block text-sm font-medium text-gray-700" suppressHydrationWarning>
                  {dictionary?.objectives.unit || "Unit"}
                </label>
                <select
                  name="unit"
                  value={newKeyResult.unit}
                  onChange={handleNewKRInputChange}
                  className="mt-1 block w-full rounded-md border-gray-300 focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                >
                  <option value="%">%</option>
                  <option value="tasks">tasks</option>
                  <option value="points">points</option>
                  <option value="items">items</option>
                  <option value="users">users</option>
                </select>
              </div>
              <div className="flex justify-end space-x-3" suppressHydrationWarning>
                <button
                  type="button"
                  onClick={() => setShowAddKRForm(false)}
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
                  {dictionary?.common.save || "Save"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Key Result Modal */}
      {showEditKRForm && editingKR && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center" suppressHydrationWarning>
          <div className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full" suppressHydrationWarning>
            <h3 className="text-lg font-medium text-gray-900 mb-4" suppressHydrationWarning>
              {dictionary?.objectives.editKeyResult || "Edit Key Result"}
            </h3>
            <form className="space-y-4" onSubmit={handleEditKRSubmit} suppressHydrationWarning>
              <div suppressHydrationWarning>
                <label className="block text-sm font-medium text-gray-700" suppressHydrationWarning>
                  {dictionary?.objectives.form.title || "Title"}
                </label>
                <input
                  type="text"
                  name="title"
                  value={editingKR.title}
                  onChange={handleEditKRChange}
                  required
                  className="mt-1 block w-full rounded-md border-gray-300 focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                />
              </div>
              <div suppressHydrationWarning>
                <label className="block text-sm font-medium text-gray-700" suppressHydrationWarning>
                  {dictionary?.objectives.form.description || "Description"}
                </label>
                <textarea
                  name="description"
                  value={editingKR.description}
                  onChange={handleEditKRChange}
                  rows={3}
                  className="mt-1 block w-full rounded-md border-gray-300 focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                />
              </div>
              <div className="grid grid-cols-2 gap-4" suppressHydrationWarning>
                <div suppressHydrationWarning>
                  <label className="block text-sm font-medium text-gray-700" suppressHydrationWarning>
                    {dictionary?.objectives.target || "Target"}
                  </label>
                  <input
                    type="number"
                    name="target"
                    value={editingKR.target}
                    onChange={handleEditKRChange}
                    min="1"
                    required
                    className="mt-1 block w-full rounded-md border-gray-300 focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  />
                </div>
                <div suppressHydrationWarning>
                  <label className="block text-sm font-medium text-gray-700" suppressHydrationWarning>
                    {dictionary?.objectives.current || "Current"}
                  </label>
                  <input
                    type="number"
                    name="current"
                    value={editingKR.current}
                    onChange={handleEditKRChange}
                    min="0"
                    className="mt-1 block w-full rounded-md border-gray-300 focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  />
                </div>
              </div>
              <div suppressHydrationWarning>
                <label className="block text-sm font-medium text-gray-700" suppressHydrationWarning>
                  {dictionary?.objectives.unit || "Unit"}
                </label>
                <select
                  name="unit"
                  value={editingKR.unit}
                  onChange={handleEditKRChange}
                  className="mt-1 block w-full rounded-md border-gray-300 focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                >
                  <option value="%">%</option>
                  <option value="tasks">tasks</option>
                  <option value="points">points</option>
                  <option value="items">items</option>
                  <option value="users">users</option>
                </select>
              </div>
              <div className="flex justify-end space-x-3" suppressHydrationWarning>
                <button
                  type="button"
                  onClick={() => {
                    setEditingKR(null);
                    setShowEditKRForm(false);
                  }}
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
                  {dictionary?.common.save || "Save"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Objective Modal */}
      {showEditObjectiveForm && editingObjective && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50" suppressHydrationWarning>
          <div className="bg-white p-8 rounded-lg shadow-xl max-w-xl w-full mx-4" suppressHydrationWarning>
            <h3 className="text-xl font-medium text-gray-900 mb-6" suppressHydrationWarning>
              {dictionary?.objectives.editObjective || "Edit Objective"}
            </h3>
            <form className="space-y-6" onSubmit={handleEditObjectiveSubmit} suppressHydrationWarning>
              <div suppressHydrationWarning>
                <label className="block text-sm font-medium text-gray-700 mb-1" suppressHydrationWarning>
                  {dictionary?.objectives.form.title || "Title"}
                </label>
                <input
                  type="text"
                  name="title"
                  value={editingObjective.title}
                  onChange={handleEditObjectiveChange}
                  required
                  className="mt-1 block w-full px-3 py-2 rounded-md border border-gray-300 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  suppressHydrationWarning
                />
              </div>
              <div suppressHydrationWarning>
                <label className="block text-sm font-medium text-gray-700 mb-1" suppressHydrationWarning>
                  {dictionary?.objectives.form.description || "Description"}
                </label>
                <textarea
                  name="description"
                  value={editingObjective.description}
                  onChange={handleEditObjectiveChange}
                  rows={4}
                  className="mt-1 block w-full px-3 py-2 rounded-md border border-gray-300 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  suppressHydrationWarning
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6" suppressHydrationWarning>
                <div suppressHydrationWarning>
                  <label className="block text-sm font-medium text-gray-700 mb-1" suppressHydrationWarning>
                    {dictionary?.objectives.form.type || "Type"}
                  </label>
                  <select
                    name="type"
                    value={editingObjective.type}
                    onChange={handleEditObjectiveChange}
                    className="mt-1 block w-full px-3 py-2 rounded-md border border-gray-300 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    suppressHydrationWarning
                  >
                    <option value="COMPANY">{dictionary?.objectives.type.company || "Company"}</option>
                    <option value="DEPARTMENT">{dictionary?.objectives.type.department || "Department"}</option>
                    <option value="PERSONAL">{dictionary?.objectives.type.individual || "Individual"}</option>
                  </select>
                </div>
                <div suppressHydrationWarning>
                  <label className="block text-sm font-medium text-gray-700 mb-1" suppressHydrationWarning>
                    {dictionary?.objectives.form.status || "Status"}
                  </label>
                  <select
                    name="status"
                    value={editingObjective.status}
                    onChange={handleEditObjectiveChange}
                    className="mt-1 block w-full px-3 py-2 rounded-md border border-gray-300 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    suppressHydrationWarning
                  >
                    <option value="DRAFT">{dictionary?.objectives.statusDraft || "Draft"}</option>
                    <option value="ACTIVE">{dictionary?.objectives.statusActive || "Active"}</option>
                    <option value="COMPLETED">{dictionary?.objectives.statusCompleted || "Completed"}</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6" suppressHydrationWarning>
                <div suppressHydrationWarning>
                  <label className="block text-sm font-medium text-gray-700 mb-1" suppressHydrationWarning>
                    {dictionary?.objectives.form.startDate || "Start Date"}
                  </label>
                  <input
                    type="date"
                    name="startDate"
                    value={editingObjective.startDate}
                    onChange={handleEditObjectiveChange}
                    className="mt-1 block w-full px-3 py-2 rounded-md border border-gray-300 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    suppressHydrationWarning
                  />
                </div>
                <div suppressHydrationWarning>
                  <label className="block text-sm font-medium text-gray-700 mb-1" suppressHydrationWarning>
                    {dictionary?.objectives.form.endDate || "End Date"}
                  </label>
                  <input
                    type="date"
                    name="endDate"
                    value={editingObjective.endDate}
                    onChange={handleEditObjectiveChange}
                    className="mt-1 block w-full px-3 py-2 rounded-md border border-gray-300 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    suppressHydrationWarning
                  />
                </div>
              </div>
              <div className="flex justify-end space-x-4 pt-4" suppressHydrationWarning>
                <button
                  type="button"
                  onClick={() => {
                    setEditingObjective(null);
                    setShowEditObjectiveForm(false);
                  }}
                  className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 transition-colors"
                  suppressHydrationWarning
                >
                  {dictionary?.common.cancel || "Cancel"}
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
                  suppressHydrationWarning
                >
                  {dictionary?.common.save || "Save"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default function ObjectiveDetailPage() {
  return (
    <SessionProvider>
      <ObjectiveDetailContent />
    </SessionProvider>
  );
} 