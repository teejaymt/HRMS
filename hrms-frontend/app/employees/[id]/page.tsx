'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import Link from 'next/link';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';

export default function EmployeeDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [employee, setEmployee] = useState<any>(null);
  const [department, setDepartment] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEmployee();
  }, [params.id]);

  const fetchEmployee = async () => {
    try {
      const data = await api.getEmployeeById(Number(params.id)) as any;
      setEmployee(data);
      
      if (data.departmentId) {
        const deptData = await api.getDepartmentById(data.departmentId);
        setDepartment(deptData as any);
      }
    } catch (error) {
      console.error('Failed to fetch employee:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-gray-600">Loading employee details...</div>;
  }

  if (!employee) {
    return (
      <div className="text-center">
        <p className="text-gray-600">Employee not found</p>
        <Link href="/employees" className="text-blue-600 hover:text-blue-800">
          Back to Employees
        </Link>
      </div>
    );
  }

  const formatDate = (date: string | null) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <Link
          href="/employees"
          className="mb-4 inline-flex items-center text-sm text-blue-600 hover:text-blue-800"
        >
          <ArrowLeftIcon className="mr-2 h-4 w-4" />
          Back to Employees
        </Link>
        <h1 className="text-3xl font-bold text-gray-900">Employee Details</h1>
      </div>

      {/* Employee Card */}
      <div className="mb-6 rounded-lg bg-white p-6 shadow">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-semibold text-gray-900">
              {employee.firstName} {employee.lastName}
            </h2>
            {(employee.firstNameArabic || employee.lastNameArabic) && (
              <p className="font-arabic text-lg text-gray-600" dir="rtl">
                {employee.firstNameArabic} {employee.lastNameArabic}
              </p>
            )}
            <p className="text-sm text-gray-500">{employee.employeeCode}</p>
          </div>
          <div>
            <span
              className={`inline-flex rounded-full px-3 py-1 text-sm font-semibold ${
                employee.status === 'ACTIVE'
                  ? 'bg-green-100 text-green-800'
                  : 'bg-red-100 text-red-800'
              }`}
            >
              {employee.status}
            </span>
            {employee.isSaudi && (
              <span className="ml-2 inline-flex rounded-full bg-blue-100 px-3 py-1 text-sm font-semibold text-blue-800">
                Saudi <span className="font-arabic ml-1">(سعودي)</span>
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Details Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Personal Information */}
        <div className="rounded-lg bg-white p-6 shadow">
          <h3 className="mb-4 text-lg font-semibold text-gray-900">Personal Information</h3>
          <dl className="space-y-3">
            <div>
              <dt className="text-sm font-medium text-gray-500">Email</dt>
              <dd className="mt-1 text-sm text-gray-900">{employee.email}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Phone</dt>
              <dd className="mt-1 text-sm text-gray-900">{employee.phone || 'N/A'}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Date of Birth</dt>
              <dd className="mt-1 text-sm text-gray-900">{formatDate(employee.dateOfBirth)}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Gender</dt>
              <dd className="mt-1 text-sm text-gray-900">{employee.gender || 'N/A'}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Nationality</dt>
              <dd className="mt-1 text-sm text-gray-900">{employee.nationality || 'N/A'}</dd>
            </div>
          </dl>
        </div>

        {/* Employment Information */}
        <div className="rounded-lg bg-white p-6 shadow">
          <h3 className="mb-4 text-lg font-semibold text-gray-900">Employment Information</h3>
          <dl className="space-y-3">
            <div>
              <dt className="text-sm font-medium text-gray-500">Position</dt>
              <dd className="mt-1 text-sm text-gray-900">
                {employee.position}
                {employee.positionArabic && (
                  <span className="font-arabic ml-2 text-gray-600" dir="rtl">
                    ({employee.positionArabic})
                  </span>
                )}
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Department</dt>
              <dd className="mt-1 text-sm text-gray-900">
                {department?.name || 'N/A'}
                {department?.nameArabic && (
                  <span className="font-arabic ml-2 text-gray-600" dir="rtl">
                    ({department.nameArabic})
                  </span>
                )}
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Join Date</dt>
              <dd className="mt-1 text-sm text-gray-900">{formatDate(employee.joinDate)}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Employment Type</dt>
              <dd className="mt-1 text-sm text-gray-900">{employee.employmentType}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Contract Type</dt>
              <dd className="mt-1 text-sm text-gray-900">{employee.contractType}</dd>
            </div>
          </dl>
        </div>

        {/* ID & Legal Documents */}
        <div className="rounded-lg bg-white p-6 shadow">
          <h3 className="mb-4 text-lg font-semibold text-gray-900">ID & Legal Information</h3>
          <dl className="space-y-3">
            {employee.isSaudi ? (
              <div>
                <dt className="text-sm font-medium text-gray-500">Saudi ID</dt>
                <dd className="mt-1 text-sm text-gray-900">{employee.saudiId || 'N/A'}</dd>
              </div>
            ) : (
              <>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Iqama Number</dt>
                  <dd className="mt-1 text-sm text-gray-900">{employee.iqamaNumber || 'N/A'}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Iqama Expiry Date</dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {formatDate(employee.iqamaExpiryDate)}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Passport Number</dt>
                  <dd className="mt-1 text-sm text-gray-900">{employee.passportNumber || 'N/A'}</dd>
                </div>
              </>
            )}
            <div>
              <dt className="text-sm font-medium text-gray-500">GOSI Number</dt>
              <dd className="mt-1 text-sm text-gray-900">{employee.gosiNumber || 'N/A'}</dd>
            </div>
          </dl>
        </div>

        {/* Salary Information */}
        <div className="rounded-lg bg-white p-6 shadow">
          <h3 className="mb-4 text-lg font-semibold text-gray-900">Salary Information</h3>
          <dl className="space-y-3">
            <div>
              <dt className="text-sm font-medium text-gray-500">Basic Salary</dt>
              <dd className="mt-1 text-sm font-semibold text-gray-900">
                {employee.basicSalary?.toLocaleString()} SAR
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Housing Allowance</dt>
              <dd className="mt-1 text-sm text-gray-900">
                {employee.housingAllowance?.toLocaleString() || 0} SAR
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Transport Allowance</dt>
              <dd className="mt-1 text-sm text-gray-900">
                {employee.transportAllowance?.toLocaleString() || 0} SAR
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Food Allowance</dt>
              <dd className="mt-1 text-sm text-gray-900">
                {employee.foodAllowance?.toLocaleString() || 0} SAR
              </dd>
            </div>
            <div className="border-t pt-3">
              <dt className="text-sm font-medium text-gray-500">Total Salary</dt>
              <dd className="mt-1 text-lg font-bold text-gray-900">
                {employee.totalSalary?.toLocaleString()} SAR
              </dd>
            </div>
          </dl>
        </div>

        {/* Leave Entitlements */}
        <div className="rounded-lg bg-white p-6 shadow">
          <h3 className="mb-4 text-lg font-semibold text-gray-900">Leave Entitlements</h3>
          <dl className="space-y-3">
            <div>
              <dt className="text-sm font-medium text-gray-500">Annual Leave Days</dt>
              <dd className="mt-1 text-sm text-gray-900">{employee.annualLeaveDays || 21} days</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Sick Leave Days</dt>
              <dd className="mt-1 text-sm text-gray-900">{employee.sickLeaveDays || 30} days</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Hajj Leave Used</dt>
              <dd className="mt-1 text-sm text-gray-900">
                {employee.hajjLeaveUsed ? 'Yes' : 'No'}
              </dd>
            </div>
          </dl>
        </div>

        {/* Work Schedule */}
        <div className="rounded-lg bg-white p-6 shadow">
          <h3 className="mb-4 text-lg font-semibold text-gray-900">Work Schedule</h3>
          <dl className="space-y-3">
            <div>
              <dt className="text-sm font-medium text-gray-500">Working Hours Per Day</dt>
              <dd className="mt-1 text-sm text-gray-900">{employee.workingHoursPerDay || 8} hours</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Working Days Per Week</dt>
              <dd className="mt-1 text-sm text-gray-900">{employee.workingDaysPerWeek || 5} days</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Weekend Days</dt>
              <dd className="mt-1 text-sm text-gray-900">{employee.weekendDays || 'Friday, Saturday'}</dd>
            </div>
          </dl>
        </div>
      </div>

      {/* Emergency Contact */}
      {(employee.emergencyContact || employee.emergencyPhone) && (
        <div className="mt-6 rounded-lg bg-white p-6 shadow">
          <h3 className="mb-4 text-lg font-semibold text-gray-900">Emergency Contact</h3>
          <dl className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div>
              <dt className="text-sm font-medium text-gray-500">Contact Name</dt>
              <dd className="mt-1 text-sm text-gray-900">{employee.emergencyContact || 'N/A'}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Phone</dt>
              <dd className="mt-1 text-sm text-gray-900">{employee.emergencyPhone || 'N/A'}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Relationship</dt>
              <dd className="mt-1 text-sm text-gray-900">{employee.emergencyRelation || 'N/A'}</dd>
            </div>
          </dl>
        </div>
      )}
    </div>
  );
}
