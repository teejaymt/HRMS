'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';

interface AuditLog {
  id: number;
  processType: string;
  processedBy: string;
  month: number;
  year: number;
  totalEmployees: number;
  totalAmount: number;
  status: string;
  processedAt: string;
  notes?: string;
  employeeDetails?: string;
  errorDetails?: string;
  createdAt?: string;
  employeeCount?: number;
  successCount?: number;
  errorCount?: number;
}

interface AuditLogFilters {
  month?: number;
  year?: number;
  processType?: string;
}

export default function AuditLogsPage() {
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    month: '',
    year: '',
    processType: '',
  });

  useEffect(() => {
    fetchAuditLogs();
  }, []);

  const fetchAuditLogs = async () => {
    try {
      const params: AuditLogFilters = {};
      if (filters.month) params.month = Number(filters.month);
      if (filters.year) params.year = Number(filters.year);
      if (filters.processType) params.processType = filters.processType;

      const data = await api.getPayrollAuditLogs(params);
      setAuditLogs(data as AuditLog[]);
    } catch (error) {
      console.error('Failed to fetch audit logs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilter = () => {
    setLoading(true);
    fetchAuditLogs();
  };

  const handleReset = () => {
    setFilters({ month: '', year: '', processType: '' });
    setLoading(true);
    setTimeout(() => fetchAuditLogs(), 100);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const parseEmployeeDetails = (details: string | null) => {
    if (!details) return [];
    try {
      return JSON.parse(details);
    } catch {
      return [];
    }
  };

  const parseErrorDetails = (details: string | null) => {
    if (!details) return [];
    try {
      return JSON.parse(details);
    } catch {
      return [];
    }
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Payroll Audit Logs</h1>
        <p className="mt-1 text-sm text-gray-500">
          Complete audit trail of all payroll processing activities
        </p>
      </div>

      {/* Filters */}
      <div className="mb-6 rounded-lg bg-white p-6 shadow">
        <h2 className="mb-4 text-lg font-semibold text-gray-900">Filters</h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Month</label>
            <select
              value={filters.month}
              onChange={(e) => setFilters({ ...filters, month: e.target.value })}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900"
            >
              <option value="">All Months</option>
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Year</label>
            <input
              type="number"
              value={filters.year}
              onChange={(e) => setFilters({ ...filters, year: e.target.value })}
              placeholder="e.g., 2026"
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Process Type</label>
            <select
              value={filters.processType}
              onChange={(e) => setFilters({ ...filters, processType: e.target.value })}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900"
            >
              <option value="">All Types</option>
              <option value="BULK">Bulk Payroll</option>
              <option value="INDIVIDUAL">Individual Payroll</option>
            </select>
          </div>
          <div className="flex items-end gap-2">
            <button
              onClick={handleFilter}
              className="rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
            >
              Apply Filters
            </button>
            <button
              onClick={handleReset}
              className="rounded-md bg-gray-300 px-4 py-2 text-gray-700 hover:bg-gray-400"
            >
              Reset
            </button>
          </div>
        </div>
      </div>

      {/* Audit Logs Table */}
      {loading ? (
        <div className="text-gray-600">Loading audit logs...</div>
      ) : (
        <div className="overflow-hidden rounded-lg bg-white shadow">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Date & Time
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Process Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Period
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Employees
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Success
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Errors
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Processed By
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Details
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {auditLogs.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-4 text-center text-gray-500">
                    No audit logs found
                  </td>
                </tr>
              ) : (
                auditLogs.map((log) => {
                  const employeeDetails = parseEmployeeDetails(log.employeeDetails || null);
                  const errorDetails = parseErrorDetails(log.errorDetails || null);

                  return (
                    <tr key={log.id} className="hover:bg-gray-50">
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">
                        {formatDate(log.createdAt || log.processedAt)}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm">
                        <span
                          className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${
                            log.processType === 'BULK'
                              ? 'bg-purple-100 text-purple-800'
                              : 'bg-blue-100 text-blue-800'
                          }`}
                        >
                          {log.processType}
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">
                        {log.month}/{log.year}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">
                        {log.employeeCount}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-green-600">
                        {log.successCount}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-red-600">
                        {log.errorCount}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">
                        {log.processedBy}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        <details className="cursor-pointer">
                          <summary className="text-blue-600 hover:text-blue-800">
                            View Details
                          </summary>
                          <div className="mt-2 space-y-2 rounded-md bg-gray-50 p-3 text-xs">
                            {log.notes && (
                              <div>
                                <strong>Notes:</strong> {log.notes}
                              </div>
                            )}
                            {employeeDetails.length > 0 && (
                              <div>
                                <strong>Employee IDs:</strong>{' '}
                                {employeeDetails.join(', ')}
                              </div>
                            )}
                            {errorDetails.length > 0 && (
                              <div className="text-red-600">
                                <strong>Errors:</strong>
                                <ul className="ml-4 mt-1 list-disc">
                                  {errorDetails.map((err: string, idx: number) => (
                                    <li key={idx}>{err}</li>
                                  ))}
                                </ul>
                              </div>
                            )}
                          </div>
                        </details>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Summary Stats */}
      {auditLogs.length > 0 && (
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-4">
          <div className="rounded-lg bg-white p-4 shadow">
            <p className="text-sm text-gray-500">Total Processes</p>
            <p className="mt-1 text-2xl font-bold text-gray-900">{auditLogs.length}</p>
          </div>
          <div className="rounded-lg bg-white p-4 shadow">
            <p className="text-sm text-gray-500">Total Employees Processed</p>
            <p className="mt-1 text-2xl font-bold text-gray-900">
              {auditLogs.reduce((sum, log) => sum + (log.employeeCount || 0), 0)}
            </p>
          </div>
          <div className="rounded-lg bg-white p-4 shadow">
            <p className="text-sm text-gray-500">Total Successes</p>
            <p className="mt-1 text-2xl font-bold text-green-600">
              {auditLogs.reduce((sum, log) => sum + (log.successCount || 0), 0)}
            </p>
          </div>
          <div className="rounded-lg bg-white p-4 shadow">
            <p className="text-sm text-gray-500">Total Errors</p>
            <p className="mt-1 text-2xl font-bold text-red-600">
              {auditLogs.reduce((sum, log) => sum + (log.errorCount || 0), 0)}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
