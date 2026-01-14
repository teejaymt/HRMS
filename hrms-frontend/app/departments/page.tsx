'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { PencilIcon, TrashIcon, EyeIcon } from '@heroicons/react/24/outline';

interface Department {
  id: number;
  code: string;
  name: string;
  nameArabic?: string;
  description?: string;
  saudiCount: number;
  nonSaudiCount: number;
  createdAt: string;
}

export default function DepartmentsPage() {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editDepartment, setEditDepartment] = useState<Department | null>(null);
  const [viewDepartment, setViewDepartment] = useState<Department | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [formData, setFormData] = useState({ 
    name: '', 
    nameArabic: '',
    description: '',
    saudiCount: '0',
    nonSaudiCount: '0',
  });

  useEffect(() => {
    fetchDepartments();
  }, []);

  const fetchDepartments = async () => {
    try {
      const data = await api.getDepartments();
      setDepartments(data as any[]);
    } catch (error) {
      console.error('Failed to fetch departments:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editDepartment) {
        await api.updateDepartment(editDepartment.id, {
          name: formData.name,
          nameArabic: formData.nameArabic || undefined,
          description: formData.description || undefined,
          saudiCount: Number(formData.saudiCount),
          nonSaudiCount: Number(formData.nonSaudiCount),
        });
      } else {
        await api.createDepartment({
          name: formData.name,
          nameArabic: formData.nameArabic || undefined,
          description: formData.description || undefined,
          saudiCount: Number(formData.saudiCount),
          nonSaudiCount: Number(formData.nonSaudiCount),
        });
      }
      setShowForm(false);
      setEditDepartment(null);
      setFormData({ 
        name: '', 
        nameArabic: '',
        description: '',
        saudiCount: '0',
        nonSaudiCount: '0',
      });
      fetchDepartments();
    } catch (error) {
      console.error('Failed to save department:', error);
      alert('Failed to save department. Please try again.');
    }
  };

  const handleEdit = (dept: Department) => {
    setEditDepartment(dept);
    setFormData({
      name: dept.name,
      nameArabic: dept.nameArabic || '',
      description: dept.description || '',
      saudiCount: String(dept.saudiCount || 0),
      nonSaudiCount: String(dept.nonSaudiCount || 0),
    });
    setShowForm(true);
  };

  const handleDelete = async (id: number) => {
    try {
      await api.deleteDepartment(id);
      setDeleteId(null);
      fetchDepartments();
    } catch (error) {
      console.error('Failed to delete department:', error);
      alert('Failed to delete department.');
    }
  };

  const calculateNitaqatPercentage = (saudiCount: number, totalCount: number) => {
    if (totalCount === 0) return 0;
    return ((saudiCount / totalCount) * 100).toFixed(1);
  };

  const getNitaqatColor = (percentage: number) => {
    if (percentage >= 50) return 'text-green-600';
    if (percentage >= 30) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Departments</h1>
          <p className="mt-1 text-sm text-gray-500">Manage departments with Nitaqat compliance tracking</p>
        </div>
        <button
          onClick={() => {
            setShowForm(true);
            setEditDepartment(null);
            setFormData({ 
              name: '', 
              nameArabic: '',
              description: '',
              saudiCount: '0',
              nonSaudiCount: '0',
            });
          }}
          className="rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
        >
          Add Department
        </button>
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-lg bg-white p-6">
            <h2 className="mb-6 border-b border-gray-200 pb-4 text-2xl font-bold text-gray-900">{editDepartment ? 'Edit' : 'New'} Department</h2>
          <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Name (English)*</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Name (Arabic)</label>
              <input
                type="text"
                dir="rtl"
                value={formData.nameArabic}
                onChange={(e) => setFormData({ ...formData, nameArabic: e.target.value })}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900"
              />
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900"
                rows={3}
              />
            </div>
            <div className="col-span-2 border-t pt-4">
              <h3 className="text-md font-semibold text-gray-800 mb-3">Nitaqat/Saudization Tracking</h3>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Saudi Employees Count</label>
              <input
                type="number"
                min="0"
                value={formData.saudiCount}
                onChange={(e) => setFormData({ ...formData, saudiCount: e.target.value })}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Non-Saudi Employees Count</label>
              <input
                type="number"
                min="0"
                value={formData.nonSaudiCount}
                onChange={(e) => setFormData({ ...formData, nonSaudiCount: e.target.value })}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900"
              />
            </div>
            <div className="col-span-2 flex gap-2 justify-end">
              <button
                type="submit"
                className="rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
              >
                {editDepartment ? 'Update' : 'Create'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowForm(false);
                  setEditDepartment(null);
                }}
                className="rounded-md bg-gray-600 px-4 py-2 text-white hover:bg-gray-700"
              >
                Cancel
              </button>
            </div>
          </form>
          </div>
        </div>
      )}

      {/* Department List */}
      <div className="overflow-hidden rounded-lg bg-white shadow">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Department
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Description
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Total
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Saudi
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Non-Saudi
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Nitaqat %
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {departments.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-4 text-center text-gray-500">
                    No departments found
                  </td>
                </tr>
              ) : (
                departments.map((dept) => {
                  const totalCount = (dept.saudiCount || 0) + (dept.nonSaudiCount || 0);
                  const saudiPercentage = calculateNitaqatPercentage(dept.saudiCount || 0, totalCount);
                  return (
                    <tr key={dept.id} className="hover:bg-gray-50">
                      <td className="whitespace-nowrap px-6 py-4">
                        <div className="text-sm font-medium text-gray-900">{dept.name}</div>
                        {dept.nameArabic && (
                          <div className="text-xs text-gray-500" dir="rtl">{dept.nameArabic}</div>
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {dept.description || '-'}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm font-semibold text-gray-900">
                        {totalCount}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm font-semibold text-green-600">
                        {dept.saudiCount || 0}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm font-semibold text-blue-600">
                        {dept.nonSaudiCount || 0}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm">
                        <span className={`font-bold ${getNitaqatColor(Number(saudiPercentage))}`}>
                          {saudiPercentage}%
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm font-medium">
                        <div className="flex gap-2">
                          <button
                            onClick={() => setViewDepartment(dept)}
                            className="text-blue-600 hover:text-blue-900"
                            title="View"
                          >
                            <EyeIcon className="h-5 w-5" />
                          </button>
                          <button
                            onClick={() => handleEdit(dept)}
                            className="text-indigo-600 hover:text-indigo-900"
                            title="Edit"
                          >
                            <PencilIcon className="h-5 w-5" />
                          </button>
                          <button
                            onClick={() => setDeleteId(dept.id)}
                            className="text-red-600 hover:text-red-900"
                            title="Delete"
                          >
                            <TrashIcon className="h-5 w-5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

      {/* View Modal */}
      {viewDepartment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-lg bg-white p-6">
            <h2 className="mb-6 border-b border-gray-200 pb-4 text-2xl font-bold text-gray-900">Department Details</h2>
            <div className="space-y-3">
              <div><strong>Name (English):</strong> {viewDepartment.name}</div>
              {viewDepartment.nameArabic && (
                <div><strong>Name (Arabic):</strong> <span dir="rtl">{viewDepartment.nameArabic}</span></div>
              )}
              <div><strong>Description:</strong> {viewDepartment.description || 'N/A'}</div>
              <div className="border-t pt-3 mt-3">
                <h3 className="font-semibold mb-2">Nitaqat/Saudization Information</h3>
                <div><strong>Total Employees:</strong> {(viewDepartment.saudiCount || 0) + (viewDepartment.nonSaudiCount || 0)}</div>
                <div><strong>Saudi Employees:</strong> {viewDepartment.saudiCount || 0}</div>
                <div><strong>Non-Saudi Employees:</strong> {viewDepartment.nonSaudiCount || 0}</div>
                <div>
                  <strong>Saudization Percentage:</strong>{' '}
                  <span className={getNitaqatColor(Number(calculateNitaqatPercentage(viewDepartment.saudiCount || 0, (viewDepartment.saudiCount || 0) + (viewDepartment.nonSaudiCount || 0))))}>
                    {calculateNitaqatPercentage(viewDepartment.saudiCount || 0, (viewDepartment.saudiCount || 0) + (viewDepartment.nonSaudiCount || 0))}%
                  </span>
                </div>
              </div>
            </div>
            <button
              onClick={() => setViewDepartment(null)}
              className="mt-6 rounded-md bg-gray-600 px-4 py-2 text-white hover:bg-gray-700"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="rounded-lg bg-white p-6 shadow-xl">
            <h2 className="mb-4 text-xl font-bold text-gray-900">Confirm Delete</h2>
            <p className="mb-6 text-gray-600">Are you sure you want to delete this department?</p>
            <div className="flex gap-4">
              <button
                onClick={() => handleDelete(deleteId)}
                className="rounded-md bg-red-600 px-4 py-2 text-white hover:bg-red-700"
              >
                Delete
              </button>
              <button
                onClick={() => setDeleteId(null)}
                className="rounded-md bg-gray-600 px-4 py-2 text-white hover:bg-gray-700"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
