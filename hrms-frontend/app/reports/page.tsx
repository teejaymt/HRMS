'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import {
  ChartBarIcon,
  UserGroupIcon,
  BriefcaseIcon,
  CurrencyDollarIcon,
  CalendarIcon,
  ClockIcon,
} from '@heroicons/react/24/outline';

export default function ReportsPage() {
  const [stats, setStats] = useState<any>(null);
  const [employees, setEmployees] = useState<any[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [statsData, employeesData, departmentsData] = await Promise.all([
        api.getEmployeeStats(),
        api.getEmployees({}),
        api.getDepartments(),
      ]);
      setStats(statsData as any);
      setEmployees(employeesData as any);
      setDepartments(departmentsData as any);
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateNitaqatCompliance = () => {
    const totalEmployees = employees.length;
    const saudiEmployees = employees.filter(emp => emp.isSaudi).length;
    return totalEmployees > 0 ? ((saudiEmployees / totalEmployees) * 100).toFixed(1) : 0;
  };

  const calculateAverageSalary = () => {
    if (employees.length === 0) return 0;
    const total = employees.reduce((sum, emp) => sum + (emp.totalSalary || 0), 0);
    return (total / employees.length).toFixed(2);
  };

  const getDepartmentStats = () => {
    return departments.map(dept => {
      const deptEmployees = employees.filter(emp => emp.departmentId === dept.id);
      const totalSalary = deptEmployees.reduce((sum, emp) => sum + (emp.totalSalary || 0), 0);
      return {
        name: dept.name,
        nameArabic: dept.nameArabic,
        employeeCount: deptEmployees.length,
        saudiCount: deptEmployees.filter(emp => emp.isSaudi).length,
        totalSalary: totalSalary,
        avgSalary: deptEmployees.length > 0 ? (totalSalary / deptEmployees.length).toFixed(2) : 0,
      };
    });
  };

  const getContractTypeDistribution = () => {
    const distribution: Record<string, number> = {};
    employees.forEach(emp => {
      distribution[emp.contractType] = (distribution[emp.contractType] || 0) + 1;
    });
    return distribution;
  };

  if (loading) {
    return <div className="text-gray-600">Loading reports...</div>;
  }

  const nitaqatPercentage = calculateNitaqatCompliance();
  const avgSalary = calculateAverageSalary();
  const departmentStats = getDepartmentStats();
  const contractDistribution = getContractTypeDistribution();

  return (
    <div>
      <h1 className="mb-8 text-3xl font-bold text-gray-900">Reports & Analytics</h1>

      {/* Key Metrics */}
      <div className="mb-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 p-6 text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-90">Total Employees</p>
              <p className="mt-2 text-3xl font-bold">{employees.length}</p>
            </div>
            <UserGroupIcon className="h-12 w-12 opacity-80" />
          </div>
        </div>

        <div className="rounded-lg bg-gradient-to-br from-green-500 to-green-600 p-6 text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-90">Saudization %</p>
              <p className="mt-2 text-3xl font-bold">{nitaqatPercentage}%</p>
            </div>
            <ChartBarIcon className="h-12 w-12 opacity-80" />
          </div>
        </div>

        <div className="rounded-lg bg-gradient-to-br from-purple-500 to-purple-600 p-6 text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-90">Departments</p>
              <p className="mt-2 text-3xl font-bold">{departments.length}</p>
            </div>
            <BriefcaseIcon className="h-12 w-12 opacity-80" />
          </div>
        </div>

        <div className="rounded-lg bg-gradient-to-br from-orange-500 to-orange-600 p-6 text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-90">Avg Salary (SAR)</p>
              <p className="mt-2 text-3xl font-bold">{Number(avgSalary).toLocaleString()}</p>
            </div>
            <CurrencyDollarIcon className="h-12 w-12 opacity-80" />
          </div>
        </div>
      </div>

      {/* Department Statistics */}
      <div className="mb-8 rounded-lg bg-white p-6 shadow">
        <h2 className="mb-4 text-xl font-semibold text-gray-900">Department Analysis</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Department
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Employees
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Saudi
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Saudization %
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Total Salary
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Avg Salary
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {departmentStats.map((dept, index) => {
                const saudiPercent = dept.employeeCount > 0 
                  ? ((dept.saudiCount / dept.employeeCount) * 100).toFixed(1) 
                  : 0;
                return (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900">
                      <div>{dept.name}</div>
                      {dept.nameArabic && (
                        <div className="text-xs text-gray-500 font-arabic" dir="rtl">
                          {dept.nameArabic}
                        </div>
                      )}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">
                      {dept.employeeCount}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-green-600">
                      {dept.saudiCount}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm">
                      <span className={`font-semibold ${
                        Number(saudiPercent) >= 50 ? 'text-green-600' : 
                        Number(saudiPercent) >= 30 ? 'text-yellow-600' : 'text-red-600'
                      }`}>
                        {saudiPercent}%
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">
                      {Number(dept.totalSalary).toLocaleString()} SAR
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">
                      {Number(dept.avgSalary).toLocaleString()} SAR
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Contract Type Distribution */}
      <div className="mb-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-lg bg-white p-6 shadow">
          <h2 className="mb-4 text-xl font-semibold text-gray-900">Contract Type Distribution</h2>
          <div className="space-y-4">
            {Object.entries(contractDistribution).map(([type, count]: [string, any]) => {
              const percentage = ((count / employees.length) * 100).toFixed(1);
              return (
                <div key={type}>
                  <div className="mb-1 flex justify-between text-sm">
                    <span className="font-medium text-gray-700">{type}</span>
                    <span className="text-gray-900">{count} ({percentage}%)</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-gray-200">
                    <div
                      className="h-full rounded-full bg-blue-500"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="rounded-lg bg-white p-6 shadow">
          <h2 className="mb-4 text-xl font-semibold text-gray-900">Nationality Distribution</h2>
          <div className="space-y-4">
            <div>
              <div className="mb-1 flex justify-between text-sm">
                <span className="font-medium text-gray-700">
                  Saudi <span className="font-arabic">(سعودي)</span>
                </span>
                <span className="text-gray-900">
                  {employees.filter(e => e.isSaudi).length} ({nitaqatPercentage}%)
                </span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-gray-200">
                <div
                  className="h-full rounded-full bg-green-500"
                  style={{ width: `${nitaqatPercentage}%` }}
                />
              </div>
            </div>
            <div>
              <div className="mb-1 flex justify-between text-sm">
                <span className="font-medium text-gray-700">Non-Saudi</span>
                <span className="text-gray-900">
                  {employees.filter(e => !e.isSaudi).length} ({(100 - Number(nitaqatPercentage)).toFixed(1)}%)
                </span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-gray-200">
                <div
                  className="h-full rounded-full bg-blue-500"
                  style={{ width: `${100 - Number(nitaqatPercentage)}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Salary Statistics */}
      <div className="rounded-lg bg-white p-6 shadow">
        <h2 className="mb-4 text-xl font-semibold text-gray-900">Salary Statistics</h2>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          <div className="rounded-lg border border-gray-200 p-4">
            <p className="text-sm text-gray-500">Total Payroll</p>
            <p className="mt-2 text-2xl font-bold text-gray-900">
              {employees.reduce((sum, emp) => sum + (emp.totalSalary || 0), 0).toLocaleString()} SAR
            </p>
          </div>
          <div className="rounded-lg border border-gray-200 p-4">
            <p className="text-sm text-gray-500">Average Salary</p>
            <p className="mt-2 text-2xl font-bold text-gray-900">
              {Number(avgSalary).toLocaleString()} SAR
            </p>
          </div>
          <div className="rounded-lg border border-gray-200 p-4">
            <p className="text-sm text-gray-500">Highest Salary</p>
            <p className="mt-2 text-2xl font-bold text-gray-900">
              {Math.max(...employees.map(e => e.totalSalary || 0)).toLocaleString()} SAR
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
