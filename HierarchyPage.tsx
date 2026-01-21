'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import Link from 'next/link';
import {
  UserGroupIcon,
  ChevronRightIcon,
  ChevronDownIcon,
  UserIcon,
  BriefcaseIcon,
} from '@heroicons/react/24/outline';

interface Employee {
  id: number;
  firstName: string;
  lastName: string;
  employeeCode: string;
  position: string;
  jobLevel: string;
  email?: string;
  subordinates?: Employee[];
}

interface HierarchyData {
  employee: Employee;
  ancestors: Employee[];
  descendants: Employee[];
}

export default function HierarchyPage() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [selectedEmployee, setSelectedEmployee] = useState<number | null>(null);
  const [hierarchyData, setHierarchyData] = useState<HierarchyData | null>(null);
  const [loading, setLoading] = useState(true);
  const [expandedNodes, setExpandedNodes] = useState<Set<number>>(new Set());

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    try {
      const response = await api.get('/employees');
      setEmployees(response.data);
    } catch (error) {
      console.error('Error fetching employees:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchHierarchy = async (employeeId: number) => {
    try {
      setLoading(true);
      const response = await api.get(`/employees/${employeeId}/hierarchy`);
      setHierarchyData(response.data);
      setSelectedEmployee(employeeId);
    } catch (error) {
      console.error('Error fetching hierarchy:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleNode = (employeeId: number) => {
    const newExpanded = new Set(expandedNodes);
    if (newExpanded.has(employeeId)) {
      newExpanded.delete(employeeId);
    } else {
      newExpanded.add(employeeId);
    }
    setExpandedNodes(newExpanded);
  };

  const renderEmployeeNode = (employee: Employee, level: number = 0) => {
    const isExpanded = expandedNodes.has(employee.id);
    const hasSubordinates = employee.subordinates && employee.subordinates.length > 0;

    return (
      <div key={employee.id} className="mb-2">
        <div
          className={`flex items-center p-3 rounded-lg border hover:bg-gray-50 cursor-pointer ${
            selectedEmployee === employee.id ? 'bg-blue-50 border-blue-300' : 'border-gray-200'
          }`}
          style={{ marginLeft: `${level * 24}px` }}
          onClick={() => fetchHierarchy(employee.id)}
        >
          {hasSubordinates && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                toggleNode(employee.id);
              }}
              className="mr-2 text-gray-500 hover:text-gray-700"
            >
              {isExpanded ? (
                <ChevronDownIcon className="h-5 w-5" />
              ) : (
                <ChevronRightIcon className="h-5 w-5" />
              )}
            </button>
          )}
          {!hasSubordinates && <div className="w-5 mr-2" />}
          
          <UserIcon className="h-8 w-8 text-gray-400 mr-3" />
          
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-gray-900">
                {employee.firstName} {employee.lastName}
              </h3>
              <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                {employee.employeeCode}
              </span>
              <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                {employee.jobLevel || 'EMPLOYEE'}
              </span>
            </div>
            <p className="text-sm text-gray-600">{employee.position}</p>
          </div>
        </div>

        {isExpanded && hasSubordinates && (
          <div className="mt-1">
            {employee.subordinates!.map((sub) => renderEmployeeNode(sub, level + 1))}
          </div>
        )}
      </div>
    );
  };

  const renderHierarchyTree = () => {
    if (!hierarchyData) return null;

    return (
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-bold mb-4 flex items-center">
          <UserGroupIcon className="h-6 w-6 mr-2" />
          Organizational Hierarchy
        </h2>

        {/* Ancestors (Managers Above) */}
        {hierarchyData.ancestors.length > 0 && (
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-gray-500 mb-2 uppercase">
              Reports To
            </h3>
            <div className="space-y-2">
              {hierarchyData.ancestors.reverse().map((ancestor, index) => (
                <div
                  key={ancestor.id}
                  className="flex items-center p-3 bg-blue-50 rounded-lg border border-blue-200 cursor-pointer hover:bg-blue-100"
                  onClick={() => fetchHierarchy(ancestor.id)}
                  style={{ marginLeft: `${index * 16}px` }}
                >
                  <BriefcaseIcon className="h-6 w-6 text-blue-600 mr-3" />
                  <div>
                    <div className="font-semibold text-blue-900">
                      {ancestor.firstName} {ancestor.lastName}
                    </div>
                    <div className="text-sm text-blue-700">
                      {ancestor.position} • {ancestor.jobLevel}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Current Employee */}
        <div className="mb-6">
          <h3 className="text-sm font-semibold text-gray-500 mb-2 uppercase">
            Selected Employee
          </h3>
          <div className="p-4 bg-green-50 rounded-lg border-2 border-green-300">
            <div className="flex items-center">
              <UserIcon className="h-10 w-10 text-green-600 mr-4" />
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-bold text-green-900">
                    {hierarchyData.employee.firstName} {hierarchyData.employee.lastName}
                  </h3>
                  <span className="text-xs bg-green-200 text-green-800 px-2 py-1 rounded">
                    {hierarchyData.employee.employeeCode}
                  </span>
                </div>
                <div className="text-sm text-green-700">
                  {hierarchyData.employee.position} • {hierarchyData.employee.jobLevel}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Descendants (Direct Reports) */}
        {hierarchyData.descendants.length > 0 && (
          <div>
            <h3 className="text-sm font-semibold text-gray-500 mb-2 uppercase">
              Direct Reports ({hierarchyData.descendants.length})
            </h3>
            <div className="space-y-2">
              {hierarchyData.descendants.map((descendant) =>
                renderEmployeeNode(descendant, 0)
              )}
            </div>
          </div>
        )}

        {hierarchyData.descendants.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <UserIcon className="h-12 w-12 mx-auto mb-2 text-gray-300" />
            <p>No direct reports</p>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-800">
            Employee Hierarchy
          </h1>
          <Link
            href="/employees"
            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
          >
            Back to Employees
          </Link>
        </div>
        <p className="text-gray-600 mt-2">
          View and navigate the organizational structure
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Employee List */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold mb-4">All Employees</h2>
            <input
              type="text"
              placeholder="Search employees..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
              onChange={(e) => {
                // Filter logic here
              }}
            />
            
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                <p className="text-gray-500 mt-2">Loading...</p>
              </div>
            ) : (
              <div className="max-h-[600px] overflow-y-auto">
                {employees
                  .filter((emp) => !emp.subordinates)
                  .map((employee) => (
                    <div
                      key={employee.id}
                      className={`p-3 mb-2 rounded-lg border cursor-pointer hover:bg-gray-50 ${
                        selectedEmployee === employee.id
                          ? 'bg-blue-50 border-blue-300'
                          : 'border-gray-200'
                      }`}
                      onClick={() => fetchHierarchy(employee.id)}
                    >
                      <div className="font-semibold text-gray-900">
                        {employee.firstName} {employee.lastName}
                      </div>
                      <div className="text-sm text-gray-600">
                        {employee.position}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        {employee.employeeCode} • {employee.jobLevel || 'EMPLOYEE'}
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </div>
        </div>

        {/* Hierarchy View */}
        <div className="lg:col-span-2">
          {hierarchyData ? (
            renderHierarchyTree()
          ) : (
            <div className="bg-white rounded-lg shadow p-12 text-center">
              <UserGroupIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-700 mb-2">
                Select an Employee
              </h3>
              <p className="text-gray-500">
                Click on an employee from the list to view their organizational hierarchy
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
