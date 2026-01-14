'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { PencilIcon, TrashIcon, EyeIcon, CheckIcon, XMarkIcon } from '@heroicons/react/24/outline';

interface Leave {
  id: number;
  employeeId: number;
  employee?: {
    firstName: string;
    lastName: string;
    employeeCode: string;
  };
  leaveType: string;
  startDate: string;
  endDate: string;
  days: number;
  status: string;
  reason?: string;
  approvedBy?: string;
  approvedAt?: string;
  rejectedBy?: string;
  rejectedAt?: string;
  comments?: string;
  createdAt: string;
}

const SAUDI_LEAVE_TYPES = [
  { value: 'ANNUAL', label: 'Annual Leave (إجازة سنوية)', days: '21 days/year minimum' },
  { value: 'SICK', label: 'Sick Leave (إجازة مرضية)', days: '30 full pay + 60 at 75%' },
  { value: 'HAJJ', label: 'Hajj Leave (إجازة حج)', days: 'One time 10 days' },
  { value: 'MATERNITY', label: 'Maternity Leave (إجازة أمومة)', days: '70 days full pay' },
  { value: 'PATERNITY', label: 'Paternity Leave (إجازة أبوة)', days: '3 days' },
  { value: 'MARRIAGE', label: 'Marriage Leave (إجازة زواج)', days: '5 days' },
  { value: 'DEATH', label: 'Death/Bereavement (إجازة وفاة)', days: '5 days' },
  { value: 'UNPAID', label: 'Unpaid Leave (إجازة بدون راتب)', days: 'As approved' },
  { value: 'STUDY', label: 'Study Leave (إجازة دراسية)', days: 'As approved' },
];

interface Employee {
  id: number;
  firstName: string;
  lastName: string;
  employeeCode: string;
}

export default function LeavesPage() {
  const [leaves, setLeaves] = useState<Leave[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editLeave, setEditLeave] = useState<Leave | null>(null);
  const [viewLeave, setViewLeave] = useState<Leave | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    employeeId: '',
    leaveType: 'ANNUAL',
    startDate: '',
    endDate: '',
    reason: '',
  });

  useEffect(() => {
    fetchLeaves();
    fetchEmployees();
  }, []);

  const fetchLeaves = async () => {
    try {
      const data = await api.getLeaves();
      setLeaves(data as any[]);
    } catch (error) {
      console.error('Failed to fetch leaves:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchEmployees = async () => {
    try {
      const data = await api.getEmployees({});
      setEmployees(data as any[]);
    } catch (error) {
      console.error('Failed to fetch employees:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editLeave) {
        await api.updateLeave(editLeave.id, {
          leaveType: formData.leaveType,
          startDate: new Date(formData.startDate).toISOString(),
          endDate: new Date(formData.endDate).toISOString(),
          reason: formData.reason,
        });
      } else {
        await api.createLeave({
          employeeId: Number(formData.employeeId),
          leaveType: formData.leaveType,
          startDate: new Date(formData.startDate).toISOString(),
          endDate: new Date(formData.endDate).toISOString(),
          reason: formData.reason,
        });
      }
      setShowForm(false);
      setEditLeave(null);
      setFormData({
        employeeId: '',
        leaveType: 'ANNUAL',
        startDate: '',
        endDate: '',
        reason: '',
      });
      fetchLeaves();
    } catch (error) {
      console.error('Failed to save leave:', error);
      alert('Failed to save leave request. Please try again.');
    }
  };

  const handleEdit = (leave: Leave) => {
    setEditLeave(leave);
    setFormData({
      employeeId: leave.employeeId.toString(),
      leaveType: leave.leaveType,
      startDate: new Date(leave.startDate).toISOString().split('T')[0],
      endDate: new Date(leave.endDate).toISOString().split('T')[0],
      reason: leave.reason || '',
    });
    setShowForm(true);
  };

  const handleDelete = async (id: number) => {
    try {
      await api.deleteLeave(id);
      setDeleteId(null);
      fetchLeaves();
    } catch (error) {
      console.error('Failed to delete leave:', error);
      alert('Failed to delete leave request.');
    }
  };

  const handleApprove = async (id: number) => {
    try {
      await api.approveLeave(id, 'Admin');
      fetchLeaves();
    } catch (error) {
      console.error('Failed to approve leave:', error);
    }
  };

  const handleReject = async (id: number) => {
    try {
      await api.rejectLeave(id, 'Admin');
      fetchLeaves();
    } catch (error) {
      console.error('Failed to reject leave:', error);
    }
  };

  const getLeaveTypeInfo = (type: string) => {
    const leaveType = SAUDI_LEAVE_TYPES.find(lt => lt.value === type);
    return leaveType || { label: type, days: '' };
  };

  const getLeaveTypeBadgeColor = (type: string) => {
    const colors: Record<string, string> = {
      ANNUAL: 'bg-blue-100 text-blue-800',
      SICK: 'bg-red-100 text-red-800',
      HAJJ: 'bg-green-100 text-green-800',
      MATERNITY: 'bg-pink-100 text-pink-800',
      PATERNITY: 'bg-indigo-100 text-indigo-800',
      MARRIAGE: 'bg-purple-100 text-purple-800',
      DEATH: 'bg-gray-100 text-gray-800',
      UNPAID: 'bg-yellow-100 text-yellow-800',
      STUDY: 'bg-cyan-100 text-cyan-800',
    };
    return colors[type] || 'bg-gray-100 text-gray-800';
  };

  const getStatusBadgeColor = (status: string) => {
    const colors: Record<string, string> = {
      PENDING: 'bg-yellow-100 text-yellow-800',
      APPROVED: 'bg-green-100 text-green-800',
      REJECTED: 'bg-red-100 text-red-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Leave Management</h1>
          <p className="mt-1 text-sm text-gray-500">Saudi Arabia labor law compliant leave types</p>
        </div>
        <button 
          onClick={() => {
            setShowForm(true);
            setEditLeave(null);
            setFormData({
              employeeId: '',
              leaveType: 'ANNUAL',
              startDate: '',
              endDate: '',
              reason: '',
            });
          }}
          className="rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
        >
          Apply for Leave
        </button>
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-lg bg-white p-6">
            <h2 className="mb-6 border-b border-gray-200 pb-4 text-2xl font-bold text-gray-900">{editLeave ? 'Edit' : 'New'} Leave Request</h2>
          <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Employee*</label>
              <select
                required
                value={formData.employeeId}
                onChange={(e) => setFormData({ ...formData, employeeId: e.target.value })}
                disabled={!!editLeave}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900"
              >
                <option value="">Select Employee</option>
                {employees.map((emp) => (
                  <option key={emp.id} value={emp.id}>
                    {emp.firstName} {emp.lastName} ({emp.employeeCode})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Leave Type*</label>
              <select
                required
                value={formData.leaveType}
                onChange={(e) => setFormData({ ...formData, leaveType: e.target.value })}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900"
              >
                {SAUDI_LEAVE_TYPES.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>
            {formData.leaveType && (
              <div className="col-span-2 rounded border border-blue-200 bg-blue-50 p-3">
                <p className="text-sm text-blue-800">
                  <strong>Entitlement:</strong> {getLeaveTypeInfo(formData.leaveType).days}
                </p>
              </div>
            )}
            <div>
              <label className="block text-sm font-medium text-gray-700">Start Date*</label>
              <input
                type="date"
                required
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">End Date*</label>
              <input
                type="date"
                required
                value={formData.endDate}
                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900"
              />
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700">Reason*</label>
              <textarea
                required
                value={formData.reason}
                onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900"
                rows={3}
              />
            </div>
            <div className="col-span-2 flex gap-4">
              <button
                type="submit"
                className="rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
              >
                {editLeave ? 'Update' : 'Submit'} Request
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowForm(false);
                  setEditLeave(null);
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

      {/* Leave Requests Table */}
      <div className="rounded-lg bg-white shadow">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Employee
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Leave Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Duration
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Days
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-4 text-center text-sm text-gray-500">
                    Loading...
                  </td>
                </tr>
              ) : leaves.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-4 text-center text-sm text-gray-500">
                    No leave requests found
                  </td>
                </tr>
              ) : (
                leaves.map((leave) => (
                  <tr key={leave.id}>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">
                      {leave.employee?.firstName} {leave.employee?.lastName}
                      <div className="text-xs text-gray-500">{leave.employee?.employeeCode}</div>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm">
                      <span className={`rounded-full px-2 py-1 text-xs font-semibold ${getLeaveTypeBadgeColor(leave.leaveType)}`}>
                        {getLeaveTypeInfo(leave.leaveType).label.split('(')[0].trim()}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">
                      {new Date(leave.startDate).toLocaleDateString()} - {new Date(leave.endDate).toLocaleDateString()}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">
                      {leave.days} days
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm">
                      <span className={`rounded-full px-2 py-1 text-xs font-semibold ${getStatusBadgeColor(leave.status)}`}>
                        {leave.status}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm font-medium">
                      <div className="flex gap-2">
                        <button
                          onClick={() => setViewLeave(leave)}
                          className="text-blue-600 hover:text-blue-900"
                          title="View"
                        >
                          <EyeIcon className="h-5 w-5" />
                        </button>
                        {leave.status === 'PENDING' && (
                          <>
                            <button
                              onClick={() => handleEdit(leave)}
                              className="text-indigo-600 hover:text-indigo-900"
                              title="Edit"
                            >
                              <PencilIcon className="h-5 w-5" />
                            </button>
                            <button
                              onClick={() => handleApprove(leave.id)}
                              className="text-green-600 hover:text-green-900"
                              title="Approve"
                            >
                              <CheckIcon className="h-5 w-5" />
                            </button>
                            <button
                              onClick={() => handleReject(leave.id)}
                              className="text-orange-600 hover:text-orange-900"
                              title="Reject"
                            >
                              <XMarkIcon className="h-5 w-5" />
                            </button>
                          </>
                        )}
                        <button
                          onClick={() => setDeleteId(leave.id)}
                          className="text-red-600 hover:text-red-900"
                          title="Delete"
                        >
                          <TrashIcon className="h-5 w-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* View Modal */}
      {viewLeave && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-lg bg-white p-6 shadow-xl">
            <h2 className="mb-6 border-b border-gray-200 pb-4 text-2xl font-bold text-gray-900">Leave Request Details</h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2 border-b pb-3">
                <h3 className="mb-2 font-semibold text-gray-800">Employee Information</h3>
              </div>
              <div>
                <span className="text-sm text-gray-500">Employee Name:</span>
                <p className="font-medium text-gray-900">{viewLeave.employee?.firstName} {viewLeave.employee?.lastName}</p>
              </div>
              <div>
                <span className="text-sm text-gray-500">Employee Code:</span>
                <p className="font-medium text-gray-900">{viewLeave.employee?.employeeCode}</p>
              </div>
              
              <div className="col-span-2 border-b pb-3 mt-3">
                <h3 className="mb-2 font-semibold text-gray-800">Leave Information</h3>
              </div>
              <div>
                <span className="text-sm text-gray-500">Leave Type:</span>
                <p className="font-medium">
                  <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${getLeaveTypeBadgeColor(viewLeave.leaveType)}`}>
                    {getLeaveTypeInfo(viewLeave.leaveType).label}
                  </span>
                </p>
              </div>
              <div>
                <span className="text-sm text-gray-500">Duration:</span>
                <p className="font-medium text-gray-900">{viewLeave.days} days</p>
              </div>
              <div>
                <span className="text-sm text-gray-500">Start Date:</span>
                <p className="font-medium text-gray-900">{new Date(viewLeave.startDate).toLocaleDateString()}</p>
              </div>
              <div>
                <span className="text-sm text-gray-500">End Date:</span>
                <p className="font-medium text-gray-900">{new Date(viewLeave.endDate).toLocaleDateString()}</p>
              </div>
              <div className="col-span-2">
                <span className="text-sm text-gray-500">Reason:</span>
                <p className="mt-1 font-medium text-gray-900">{viewLeave.reason}</p>
              </div>
              
              <div className="col-span-2 border-b pb-3 mt-3">
                <h3 className="mb-2 font-semibold text-gray-800">Status Information</h3>
              </div>
              <div className="col-span-2">
                <span className="text-sm text-gray-500">Status:</span>
                <p className="mt-1">
                  <span className={`inline-flex rounded-full px-3 py-1 text-sm font-semibold ${getStatusBadgeColor(viewLeave.status)}`}>
                    {viewLeave.status}
                  </span>
                </p>
              </div>
              {viewLeave.approvedBy && (
                <>
                  <div>
                    <span className="text-sm text-gray-500">Approved By:</span>
                    <p className="font-medium text-gray-900">{viewLeave.approvedBy}</p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-500">Approved At:</span>
                    <p className="font-medium text-gray-900">{viewLeave.approvedAt ? new Date(viewLeave.approvedAt).toLocaleString() : 'N/A'}</p>
                  </div>
                </>
              )}
              {viewLeave.rejectedBy && (
                <>
                  <div>
                    <span className="text-sm text-gray-500">Rejected By:</span>
                    <p className="font-medium text-gray-900">{viewLeave.rejectedBy}</p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-500">Rejected At:</span>
                    <p className="font-medium text-gray-900">{viewLeave.rejectedAt ? new Date(viewLeave.rejectedAt).toLocaleString() : 'N/A'}</p>
                  </div>
                  {viewLeave.comments && (
                    <div className="col-span-2">
                      <span className="text-sm text-gray-500">Comments:</span>
                      <p className="mt-1 font-medium text-gray-900">{viewLeave.comments}</p>
                    </div>
                  )}
                </>
              )}
            </div>
            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setViewLeave(null)}
                className="rounded-md bg-gray-600 px-6 py-2 text-white hover:bg-gray-700"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="rounded-lg bg-white p-6 shadow-xl">
            <h2 className="mb-4 text-xl font-bold text-gray-900">Confirm Delete</h2>
            <p className="mb-6 text-gray-600">Are you sure you want to delete this leave request?</p>
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
