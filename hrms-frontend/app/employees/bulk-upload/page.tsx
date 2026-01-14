'use client';

import { useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import Link from 'next/link';

interface EmployeeRecord {
  firstName: string;
  lastName: string;
  firstNameArabic?: string;
  lastNameArabic?: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  gender?: string;
  nationality?: string;
  nationalId?: string;
  iqamaNumber?: string;
  iqamaExpiry?: string;
  passportNumber?: string;
  passportExpiry?: string;
  position: string;
  positionArabic?: string;
  departmentId?: string;
  joiningDate: string;
  employmentType?: string;
  basicSalary: string;
  housingAllowance?: string;
  transportAllowance?: string;
  bankName?: string;
  bankAccountNumber?: string;
  iban?: string;
  status?: string;
  password?: string;
  [key: string]: string | undefined;
}

interface SuccessfulEmployee {
  employeeCode: string;
  firstName: string;
  lastName: string;
  email: string;
}

interface EmployeeError {
  row: number;
  error: string;
  employee: EmployeeRecord;
}

interface UploadResults {
  total: number;
  successCount: number;
  errorCount: number;
  success: SuccessfulEmployee[];
  errors: EmployeeError[];
}

export default function BulkEmployeeUpload() {
  const { user } = useAuth();
  const [uploading, setUploading] = useState(false);
  const [results, setResults] = useState<UploadResults | null>(null);
  const [employees, setEmployees] = useState<EmployeeRecord[]>([]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      const lines = text.split('\n');
      const headers = lines[0].split(',').map((h) => h.trim());

      const parsedEmployees = lines
        .slice(1)
        .filter((line) => line.trim())
        .map((line) => {
          const values = line.split(',');
          const employee: EmployeeRecord = {} as EmployeeRecord;
          headers.forEach((header, index) => {
            employee[header] = values[index]?.trim() || '';
          });
          return employee;
        });

      setEmployees(parsedEmployees);
    };
    reader.readAsText(file);
  };

  const handleSubmit = async () => {
    if (employees.length === 0) {
      alert('Please upload a file first');
      return;
    }

    setUploading(true);
    try {
      const response = await fetch('http://localhost:3000/employees/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          employees,
          createdBy: user?.email || 'admin',
        }),
      });

      const data = await response.json();
      setResults(data);
      alert(
        `Upload complete!\nSuccess: ${data.successCount}\nErrors: ${data.errorCount}`
      );
    } catch (error: unknown) {
      alert(`Upload failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setUploading(false);
    }
  };

  const downloadTemplate = () => {
    const headers = [
      'firstName',
      'lastName',
      'firstNameArabic',
      'lastNameArabic',
      'email',
      'phone',
      'dateOfBirth',
      'gender',
      'nationality',
      'nationalId',
      'iqamaNumber',
      'iqamaExpiry',
      'passportNumber',
      'passportExpiry',
      'position',
      'positionArabic',
      'departmentId',
      'joiningDate',
      'employmentType',
      'basicSalary',
      'housingAllowance',
      'transportAllowance',
      'bankName',
      'bankAccountNumber',
      'iban',
      'status',
      'password',
    ];

    const sampleData = [
      'Ahmad',
      'Al-Mutairi',
      'أحمد',
      'المطيري',
      'ahmad@company.sa',
      '+966501234567',
      '1990-01-15',
      'MALE',
      'Saudi',
      '1234567890',
      '',
      '',
      '',
      '',
      'Software Engineer',
      'مهندس برمجيات',
      '1',
      '2024-01-01',
      'FULL_TIME',
      '15000',
      '5000',
      '2000',
      'Al Rajhi Bank',
      '123456789',
      'SA1234567890',
      'ACTIVE',
      'Password123',
    ];

    const csv = headers.join(',') + '\n' + sampleData.join(',');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'employee_template.csv';
    a.click();
  };

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          Bulk Employee Upload
        </h1>
        <p className="mt-2 text-gray-600">
          Upload multiple employees at once using CSV file
        </p>
      </div>

      <div className="mb-6 rounded-lg bg-white p-6 shadow">
        <div className="space-y-4">
          <div>
            <button
              onClick={downloadTemplate}
              className="rounded-lg bg-green-600 px-4 py-2 text-white hover:bg-green-700"
            >
              📥 Download CSV Template
            </button>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Upload CSV File
            </label>
            <input
              type="file"
              accept=".csv"
              onChange={handleFileUpload}
              className="block w-full cursor-pointer rounded-lg border border-gray-300 bg-gray-50 text-sm text-gray-900"
            />
            <p className="mt-1 text-xs text-gray-500">
              File should be in CSV format with comma-separated values
            </p>
          </div>

          {employees.length > 0 && (
            <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
              <p className="mb-2 text-sm font-medium text-blue-900">
                ✓ {employees.length} employees ready to upload
              </p>
              <div className="mb-3 max-h-48 overflow-auto rounded bg-white p-3">
                <table className="min-w-full text-xs">
                  <thead>
                    <tr className="border-b">
                      <th className="px-2 py-1 text-left">#</th>
                      <th className="px-2 py-1 text-left">Name</th>
                      <th className="px-2 py-1 text-left">Email</th>
                      <th className="px-2 py-1 text-left">Position</th>
                    </tr>
                  </thead>
                  <tbody>
                    {employees.slice(0, 10).map((emp, idx) => (
                      <tr key={idx} className="border-b">
                        <td className="px-2 py-1">{idx + 1}</td>
                        <td className="px-2 py-1">
                          {emp.firstName} {emp.lastName}
                        </td>
                        <td className="px-2 py-1">{emp.email}</td>
                        <td className="px-2 py-1">{emp.position}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {employees.length > 10 && (
                  <p className="mt-2 text-center text-xs text-gray-500">
                    ... and {employees.length - 10} more
                  </p>
                )}
              </div>
              <button
                onClick={handleSubmit}
                disabled={uploading}
                className="rounded-lg bg-blue-600 px-6 py-2 text-white hover:bg-blue-700 disabled:bg-gray-400"
              >
                {uploading ? 'Uploading...' : '📤 Upload Employees'}
              </button>
            </div>
          )}
        </div>
      </div>

      {results && (
        <div className="rounded-lg bg-white p-6 shadow">
          <h2 className="mb-4 text-xl font-bold">Upload Results</h2>
          <div className="mb-6 grid grid-cols-3 gap-4">
            <div className="rounded bg-blue-50 p-4">
              <p className="text-sm text-gray-600">Total</p>
              <p className="text-2xl font-bold text-blue-600">
                {results.total}
              </p>
            </div>
            <div className="rounded bg-green-50 p-4">
              <p className="text-sm text-gray-600">Success</p>
              <p className="text-2xl font-bold text-green-600">
                {results.successCount}
              </p>
            </div>
            <div className="rounded bg-red-50 p-4">
              <p className="text-sm text-gray-600">Errors</p>
              <p className="text-2xl font-bold text-red-600">
                {results.errorCount}
              </p>
            </div>
          </div>

          {results.success.length > 0 && (
            <div className="mb-6">
              <h3 className="mb-2 font-semibold text-green-600">
                ✓ Successfully Created ({results.success.length}):
              </h3>
              <div className="max-h-60 space-y-2 overflow-auto">
                {results.success.map((emp: SuccessfulEmployee, idx: number) => (
                  <div
                    key={idx}
                    className="rounded bg-green-50 p-3 text-sm"
                  >
                    <p className="font-medium">
                      {emp.employeeCode} - {emp.firstName} {emp.lastName}
                    </p>
                    <p className="text-gray-600">{emp.email}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {results.errors.length > 0 && (
            <div>
              <h3 className="mb-2 font-semibold text-red-600">
                ✗ Errors ({results.errorCount}):
              </h3>
              <div className="max-h-60 space-y-2 overflow-auto">
                {results.errors.map((err: EmployeeError, idx: number) => (
                  <div key={idx} className="rounded bg-red-50 p-3 text-sm">
                    <p className="font-medium">
                      Row {err.row}: {err.error}
                    </p>
                    <p className="text-gray-600">
                      {err.employee.firstName} {err.employee.lastName} -{' '}
                      {err.employee.email}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="mt-6 flex gap-3">
            <button
              onClick={() => {
                setResults(null);
                setEmployees([]);
              }}
              className="rounded-lg bg-gray-600 px-4 py-2 text-white hover:bg-gray-700"
            >
              Upload Another File
            </button>
            <Link
              href="/employees"
              className="rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
            >
              View All Employees
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
