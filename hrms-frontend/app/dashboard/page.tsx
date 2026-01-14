'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';
import Link from 'next/link';

interface EmployeeStats {
  total: number;
  active: number;
  saudi: number;
  expat: number;
  onLeave?: number;
  departments?: number;
}

export default function DashboardPage() {
  const [stats, setStats] = useState<EmployeeStats | null>(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await api.getEmployeeStats();
        setStats(data as EmployeeStats);
      } catch (error) {
        console.error('Failed to fetch stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const getRoleWelcomeMessage = () => {
    switch (user?.role) {
      case 'ADMIN':
        return 'Administrator Dashboard';
      case 'HR':
        return 'HR Manager Dashboard';
      case 'MANAGER':
        return 'Manager Dashboard';
      default:
        return 'Employee Dashboard';
    }
  };

  const getRoleBadgeColor = () => {
    switch (user?.role) {
      case 'ADMIN':
        return 'bg-purple-100 text-purple-800';
      case 'HR':
        return 'bg-blue-100 text-blue-800';
      case 'MANAGER':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{getRoleWelcomeMessage()}</h1>
          <p className="mt-2 text-gray-600">Welcome back, {user?.email}</p>
        </div>
        <span className={`rounded-full px-4 py-2 text-sm font-semibold ${getRoleBadgeColor()}`}>
          {user?.role}
        </span>
      </div>

      {loading ? (
        <div className="text-gray-600">Loading...</div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <div className="rounded-lg bg-white p-6 shadow">
            <div className="flex items-center">
              <div className="flex-shrink-0 rounded-md bg-blue-500 p-3">
                <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <div className="ml-5">
                <p className="text-sm font-medium text-gray-500">Total Employees</p>
                <p className="text-2xl font-semibold text-gray-900">{stats?.total || 0}</p>
              </div>
            </div>
            <div className="mt-4">
              <Link href="/employees" className="text-sm text-blue-600 hover:text-blue-500">
                View all →
              </Link>
            </div>
          </div>

          <div className="rounded-lg bg-white p-6 shadow">
            <div className="flex items-center">
              <div className="flex-shrink-0 rounded-md bg-green-500 p-3">
                <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-5">
                <p className="text-sm font-medium text-gray-500">Active Employees</p>
                <p className="text-2xl font-semibold text-gray-900">{stats?.active || 0}</p>
              </div>
            </div>
            <div className="mt-4">
              <Link href="/employees?status=ACTIVE" className="text-sm text-green-600 hover:text-green-500">
                View active →
              </Link>
            </div>
          </div>

          <div className="rounded-lg bg-white p-6 shadow">
            <div className="flex items-center">
              <div className="flex-shrink-0 rounded-md bg-yellow-500 p-3">
                <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <div className="ml-5">
                <p className="text-sm font-medium text-gray-500">On Leave</p>
                <p className="text-2xl font-semibold text-gray-900">{stats?.onLeave || 0}</p>
              </div>
            </div>
            <div className="mt-4">
              <Link href="/leaves" className="text-sm text-yellow-600 hover:text-yellow-500">
                View leaves →
              </Link>
            </div>
          </div>
        </div>
      )}

      <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-lg bg-white p-6 shadow">
          <h2 className="mb-4 text-lg font-semibold text-gray-900">Quick Actions</h2>
          <div className="space-y-3">
            <Link
              href="/employees"
              className="block rounded-md bg-blue-50 p-3 text-blue-700 hover:bg-blue-100"
            >
              Manage Employees
            </Link>
            <Link
              href="/leaves"
              className="block rounded-md bg-green-50 p-3 text-green-700 hover:bg-green-100"
            >
              Leave Requests
            </Link>
            <Link
              href="/attendance"
              className="block rounded-md bg-purple-50 p-3 text-purple-700 hover:bg-purple-100"
            >
              Mark Attendance
            </Link>
            <Link
              href="/payroll"
              className="block rounded-md bg-indigo-50 p-3 text-indigo-700 hover:bg-indigo-100"
            >
              Process Payroll
            </Link>
          </div>
        </div>

        <div className="rounded-lg bg-white p-6 shadow">
          <h2 className="mb-4 text-lg font-semibold text-gray-900">Recent Activity</h2>
          <div className="space-y-3 text-sm text-gray-600">
            <p>No recent activity</p>
          </div>
        </div>
      </div>
    </div>
  );
}
