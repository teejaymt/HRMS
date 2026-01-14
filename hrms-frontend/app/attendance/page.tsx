'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { PencilIcon, TrashIcon, EyeIcon } from '@heroicons/react/24/outline';

interface Attendance {
  id: number;
  employeeId: number;
  date: string;
  checkIn: string;
  checkOut: string | null;
  workHours: number | null;
  status: string;
  employee: {
    firstName: string;
    lastName: string;
    employeeCode: string;
  };
}

export default function AttendancePage() {
  const [employeeId, setEmployeeId] = useState('');
  const [message, setMessage] = useState('');
  const [attendances, setAttendances] = useState<Attendance[]>([]);
  const [loading, setLoading] = useState(false);
  const [viewRecord, setViewRecord] = useState<Attendance | null>(null);
  const [editRecord, setEditRecord] = useState<Attendance | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  useEffect(() => {
    fetchAttendances();
  }, []);

  const fetchAttendances = async () => {
    setLoading(true);
    try {
      const data = await api.getAttendances();
      setAttendances(data as Attendance[]);
    } catch (error) {
      console.error('Failed to fetch attendances', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCheckIn = async () => {
    try {
      await api.checkIn(Number(employeeId));
      setMessage('Checked in successfully!');
      setTimeout(() => setMessage(''), 3000);
      fetchAttendances();
    } catch (error: unknown) {
      setMessage(error instanceof Error ? error.message : 'Check-in failed');
    }
  };

  const handleCheckOut = async () => {
    try {
      await api.checkOut(Number(employeeId));
      setMessage('Checked out successfully!');
      setTimeout(() => setMessage(''), 3000);
      fetchAttendances();
    } catch (error: unknown) {
      setMessage(error instanceof Error ? error.message : 'Check-out failed');
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editRecord) return;

    try {
      await fetch(`http://localhost:3000/attendance/${editRecord.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          checkIn: editRecord.checkIn,
          checkOut: editRecord.checkOut,
          status: editRecord.status,
        }),
      });
      setMessage('Attendance updated successfully!');
      setEditRecord(null);
      fetchAttendances();
      setTimeout(() => setMessage(''), 3000);
    } catch {
      setMessage('Failed to update attendance');
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await fetch(`http://localhost:3000/attendance/${id}`, {
        method: 'DELETE',
      });
      setMessage('Attendance deleted successfully!');
      setDeleteId(null);
      fetchAttendances();
      setTimeout(() => setMessage(''), 3000);
    } catch {
      setMessage('Failed to delete attendance');
    }
  };

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Attendance</h1>
          <p className="mt-1 text-sm text-gray-500">Track employee check-in and check-out times</p>
        </div>
      </div>

      <div className="mb-8 rounded-lg bg-white p-6 shadow">
        <h2 className="mb-6 border-b border-gray-200 pb-3 text-xl font-bold text-gray-900">Mark Attendance</h2>
        
        {message && (
          <div className="mb-4 rounded-md bg-blue-50 p-4 text-sm text-blue-800">
            {message}
          </div>
        )}

        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">Employee ID*</label>
          <input
            type="number"
            value={employeeId}
            onChange={(e) => setEmployeeId(e.target.value)}
            className="mt-1 block w-full max-w-md rounded-md border border-gray-300 px-4 py-3 text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter employee ID"
          />
        </div>

        <div className="flex gap-3">
          <button
            onClick={handleCheckIn}
            disabled={!employeeId}
            className="flex items-center gap-2 rounded-md bg-green-600 px-6 py-3 font-medium text-white shadow-sm hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
            </svg>
            Check In
          </button>
          <button
            onClick={handleCheckOut}
            disabled={!employeeId}
            className="flex items-center gap-2 rounded-md bg-red-600 px-6 py-3 font-medium text-white shadow-sm hover:bg-red-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Check Out
          </button>
        </div>
      </div>

      <div className="rounded-lg bg-white p-6 shadow">
        <h2 className="mb-6 border-b border-gray-200 pb-3 text-xl font-bold text-gray-900">Attendance Records</h2>
        
        {loading ? (
          <p className="text-gray-600">Loading...</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Employee
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Check In
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Check Out
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Work Hours
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
                {attendances.map((record) => (
                  <tr key={record.id}>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">
                      {record.employee.firstName} {record.employee.lastName}
                      <div className="text-xs text-gray-500">{record.employee.employeeCode}</div>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">
                      {new Date(record.date).toLocaleDateString()}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">
                      {new Date(record.checkIn).toLocaleTimeString()}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">
                      {record.checkOut ? new Date(record.checkOut).toLocaleTimeString() : '-'}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">
                      {record.workHours ? `${record.workHours.toFixed(2)}h` : '-'}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm">
                      <span className={`rounded-full px-2 py-1 text-xs font-semibold ${
                        record.status === 'PRESENT' ? 'bg-green-100 text-green-800' :
                        record.status === 'ABSENT' ? 'bg-red-100 text-red-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {record.status}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm font-medium">
                      <div className="flex gap-2">
                        <button
                          onClick={() => setViewRecord(record)}
                          className="text-blue-600 hover:text-blue-900"
                          title="View"
                        >
                          <EyeIcon className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => setEditRecord(record)}
                          className="text-indigo-600 hover:text-indigo-900"
                          title="Edit"
                        >
                          <PencilIcon className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => setDeleteId(record.id)}
                          className="text-red-600 hover:text-red-900"
                          title="Delete"
                        >
                          <TrashIcon className="h-5 w-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* View Modal */}
      {viewRecord && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-lg bg-white p-6">
            <h2 className="mb-6 border-b border-gray-200 pb-4 text-2xl font-bold text-gray-900">Attendance Details</h2>
            <div className="space-y-3">
              <div><strong>Employee:</strong> {viewRecord.employee.firstName} {viewRecord.employee.lastName}</div>
              <div><strong>Employee Code:</strong> {viewRecord.employee.employeeCode}</div>
              <div><strong>Date:</strong> {new Date(viewRecord.date).toLocaleDateString()}</div>
              <div><strong>Check In:</strong> {new Date(viewRecord.checkIn).toLocaleString()}</div>
              <div><strong>Check Out:</strong> {viewRecord.checkOut ? new Date(viewRecord.checkOut).toLocaleString() : 'Not checked out'}</div>
              <div><strong>Work Hours:</strong> {viewRecord.workHours ? `${viewRecord.workHours.toFixed(2)} hours` : '-'}</div>
              <div><strong>Status:</strong> {viewRecord.status}</div>
            </div>
            <button
              onClick={() => setViewRecord(null)}
              className="mt-6 rounded-md bg-gray-600 px-4 py-2 text-white hover:bg-gray-700"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editRecord && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-lg bg-white p-6">
            <h2 className="mb-6 border-b border-gray-200 pb-4 text-2xl font-bold text-gray-900">Edit Attendance</h2>
            <form onSubmit={handleUpdate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Check In Time</label>
                <input
                  type="datetime-local"
                  value={new Date(editRecord.checkIn).toISOString().slice(0, 16)}
                  onChange={(e) => setEditRecord({ ...editRecord, checkIn: new Date(e.target.value).toISOString() })}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Check Out Time</label>
                <input
                  type="datetime-local"
                  value={editRecord.checkOut ? new Date(editRecord.checkOut).toISOString().slice(0, 16) : ''}
                  onChange={(e) => setEditRecord({ ...editRecord, checkOut: e.target.value ? new Date(e.target.value).toISOString() : null })}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Status</label>
                <select
                  value={editRecord.status}
                  onChange={(e) => setEditRecord({ ...editRecord, status: e.target.value })}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900"
                >
                  <option value="PRESENT">PRESENT</option>
                  <option value="ABSENT">ABSENT</option>
                  <option value="LATE">LATE</option>
                  <option value="HALF_DAY">HALF DAY</option>
                </select>
              </div>
              <div className="flex gap-4">
                <button
                  type="submit"
                  className="rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
                >
                  Update
                </button>
                <button
                  type="button"
                  onClick={() => setEditRecord(null)}
                  className="rounded-md bg-gray-600 px-4 py-2 text-white hover:bg-gray-700"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="rounded-lg bg-white p-6 shadow-xl">
            <h2 className="mb-4 text-xl font-bold text-gray-900">Confirm Delete</h2>
            <p className="mb-6 text-gray-600">Are you sure you want to delete this attendance record?</p>
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
