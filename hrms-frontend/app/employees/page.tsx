'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { EyeIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';

interface Department {
  id: number;
  name: string;
  code?: string;
}

interface Employee {
  id: number;
  employeeCode: string;
  firstName: string;
  lastName: string;
  firstNameArabic?: string;
  lastNameArabic?: string;
  email: string;
  phone: string;
  position: string;
  positionArabic?: string;
  departmentId?: number;
  department?: Department;
  dateOfBirth?: string;
  joinDate?: string;
  basicSalary?: number;
  salary?: number;
  totalSalary?: number;
  isSaudi: boolean;
  saudiId?: string;
  iqamaNumber?: string;
  iqamaExpiryDate?: string;
  gosiNumber?: string;
  contractType: string;
  housingAllowance?: number;
  transportAllowance?: number;
  foodAllowance?: number;
  status: string;
}

interface EmployeePayload {
  firstName: string;
  lastName: string;
  firstNameArabic?: string;
  lastNameArabic?: string;
  email: string;
  phone: string;
  position: string;
  positionArabic?: string;
  departmentId?: number;
  dateOfBirth: string;
  joinDate: string;
  basicSalary: number;
  totalSalary: number;
  isSaudi: boolean;
  saudiId?: string;
  iqamaNumber?: string;
  iqamaExpiryDate?: string;
  gosiNumber?: string;
  contractType: string;
  housingAllowance: number;
  transportAllowance: number;
  foodAllowance: number;
}

export default function EmployeesPage() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editEmployee, setEditEmployee] = useState<Employee | null>(null);
  const [viewEmployee, setViewEmployee] = useState<Employee | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    firstNameArabic: '',
    lastNameArabic: '',
    email: '',
    phone: '',
    position: '',
    positionArabic: '',
    departmentId: '',
    dateOfBirth: '',
    hireDate: '',
    salary: '',
    isSaudi: false,
    saudiId: '',
    iqamaNumber: '',
    iqamaExpiryDate: '',
    gosiNumber: '',
    contractType: 'LIMITED',
    housingAllowance: '',
    transportAllowance: '',
    foodAllowance: '',
  });

  useEffect(() => {
    fetchEmployees();
    fetchDepartments();
  }, [search]);

  const fetchEmployees = async () => {
    try {
      const data = await api.getEmployees({ search });
      setEmployees(data as Employee[]);
    } catch (error) {
      console.error('Failed to fetch employees:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchDepartments = async () => {
    try {
      const data = await api.getDepartments();
      setDepartments(data as Department[]);
    } catch (error) {
      console.error('Failed to fetch departments:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload: EmployeePayload = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        firstNameArabic: formData.firstNameArabic || undefined,
        lastNameArabic: formData.lastNameArabic || undefined,
        email: formData.email,
        phone: formData.phone,
        position: formData.position,
        positionArabic: formData.positionArabic || undefined,
        departmentId: formData.departmentId ? Number(formData.departmentId) : undefined,
        dateOfBirth: new Date(formData.dateOfBirth).toISOString(),
        joinDate: new Date(formData.hireDate).toISOString(),
        basicSalary: Number(formData.salary),
        totalSalary: Number(formData.salary) + 
          (formData.housingAllowance ? Number(formData.housingAllowance) : 0) +
          (formData.transportAllowance ? Number(formData.transportAllowance) : 0) +
          (formData.foodAllowance ? Number(formData.foodAllowance) : 0),
        isSaudi: formData.isSaudi,
        contractType: formData.contractType,
        housingAllowance: formData.housingAllowance ? Number(formData.housingAllowance) : 0,
        transportAllowance: formData.transportAllowance ? Number(formData.transportAllowance) : 0,
        foodAllowance: formData.foodAllowance ? Number(formData.foodAllowance) : 0,
      };

      if (formData.isSaudi && formData.saudiId) {
        payload.saudiId = formData.saudiId;
      }

      if (!formData.isSaudi) {
        if (formData.iqamaNumber) payload.iqamaNumber = formData.iqamaNumber;
        if (formData.iqamaExpiryDate) payload.iqamaExpiryDate = new Date(formData.iqamaExpiryDate).toISOString();
      }

      if (formData.gosiNumber) {
        payload.gosiNumber = formData.gosiNumber;
      }

      if (editEmployee) {
        await api.updateEmployee(editEmployee.id, payload);
      } else {
        await api.createEmployee(payload);
      }

      setShowForm(false);
      setEditEmployee(null);
      setFormData({
        firstName: '',
        lastName: '',
        firstNameArabic: '',
        lastNameArabic: '',
        email: '',
        phone: '',
        position: '',
        positionArabic: '',
        departmentId: '',
        dateOfBirth: '',
        hireDate: '',
        salary: '',
        isSaudi: false,
        saudiId: '',
        iqamaNumber: '',
        iqamaExpiryDate: '',
        gosiNumber: '',
        contractType: 'LIMITED',
        housingAllowance: '',
        transportAllowance: '',
        foodAllowance: '',
      });
      fetchEmployees();
    } catch (error) {
      console.error('Failed to save employee:', error);
      alert('Failed to save employee. Please try again.');
    }
  };

  const handleEdit = async (employee: Employee) => {
    try {
      // Fetch full employee details to ensure we have all fields including salary
      const fullEmployee = await api.getEmployeeById(employee.id) as Employee;
      console.log('Full employee data:', fullEmployee);
      console.log('Salary value:', fullEmployee.salary);
      
      setEditEmployee(fullEmployee);
      
      const formattedData = {
        firstName: fullEmployee.firstName || '',
        lastName: fullEmployee.lastName || '',
        firstNameArabic: fullEmployee.firstNameArabic || '',
        lastNameArabic: fullEmployee.lastNameArabic || '',
        email: fullEmployee.email || '',
        phone: fullEmployee.phone || '',
        position: fullEmployee.position || '',
        positionArabic: fullEmployee.positionArabic || '',
        departmentId: fullEmployee.departmentId ? String(fullEmployee.departmentId) : '',
        dateOfBirth: fullEmployee.dateOfBirth ? new Date(fullEmployee.dateOfBirth).toISOString().split('T')[0] : '',
        hireDate: fullEmployee.joinDate ? new Date(fullEmployee.joinDate).toISOString().split('T')[0] : '',
        salary: fullEmployee.basicSalary !== null && fullEmployee.basicSalary !== undefined ? String(fullEmployee.basicSalary) : '',
        isSaudi: fullEmployee.isSaudi || false,
        saudiId: fullEmployee.saudiId || '',
        iqamaNumber: fullEmployee.iqamaNumber || '',
        iqamaExpiryDate: fullEmployee.iqamaExpiryDate ? new Date(fullEmployee.iqamaExpiryDate).toISOString().split('T')[0] : '',
        gosiNumber: fullEmployee.gosiNumber || '',
        contractType: fullEmployee.contractType || 'LIMITED',
        housingAllowance: fullEmployee.housingAllowance !== null && fullEmployee.housingAllowance !== undefined ? String(fullEmployee.housingAllowance) : '',
        transportAllowance: fullEmployee.transportAllowance !== null && fullEmployee.transportAllowance !== undefined ? String(fullEmployee.transportAllowance) : '',
        foodAllowance: fullEmployee.foodAllowance !== null && fullEmployee.foodAllowance !== undefined ? String(fullEmployee.foodAllowance) : '',
      };
      
      console.log('Formatted form data:', formattedData);
      console.log('Formatted salary:', formattedData.salary);
      
      setFormData(formattedData);
      setShowForm(true);
    } catch (error) {
      console.error('Failed to fetch employee details:', error);
      alert('Failed to load employee data. Please try again.');
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await api.deleteEmployee(id);
      setDeleteId(null);
      fetchEmployees();
    } catch (error) {
      console.error('Failed to delete employee:', error);
      alert('Failed to delete employee. Please try again.');
    }
  };

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Employees</h1>
          <p className="mt-1 text-sm text-gray-500">Manage employees with Saudi compliance</p>
        </div>
        <div className="flex gap-3">
          <Link
            href="/employees/bulk-upload"
            className="rounded-md bg-green-600 px-4 py-2 text-white hover:bg-green-700"
          >
            📥 Bulk Upload
          </Link>
          <button
            onClick={() => {
              setShowForm(true);
              setEditEmployee(null);
              setFormData({
                firstName: '',
                lastName: '',
                firstNameArabic: '',
                lastNameArabic: '',
                email: '',
                phone: '',
                position: '',
                positionArabic: '',
                departmentId: '',
                dateOfBirth: '',
                hireDate: '',
                salary: '',
                isSaudi: false,
                saudiId: '',
                iqamaNumber: '',
                iqamaExpiryDate: '',
                gosiNumber: '',
                contractType: 'LIMITED',
                housingAllowance: '',
                transportAllowance: '',
                foodAllowance: '',
              });
            }}
            className="rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
          >
            Add Employee
          </button>
        </div>
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-lg bg-white p-6">
            <h2 className="mb-6 border-b border-gray-200 pb-4 text-2xl font-bold text-gray-900">{editEmployee ? 'Edit' : 'New'} Employee</h2>
          <form key={editEmployee?.id || 'new'} onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
            
            {/* Basic Information */}
            <div className="col-span-2">
              <h3 className="text-md font-semibold text-gray-800 border-b pb-2 mb-3">Basic Information</h3>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700">First Name (English)*</label>
              <input
                type="text"
                required
                value={formData.firstName}
                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Last Name (English)*</label>
              <input
                type="text"
                required
                value={formData.lastName}
                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">First Name (Arabic)</label>
              <input
                type="text"
                dir="rtl"
                value={formData.firstNameArabic}
                onChange={(e) => setFormData({ ...formData, firstNameArabic: e.target.value })}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Last Name (Arabic)</label>
              <input
                type="text"
                dir="rtl"
                value={formData.lastNameArabic}
                onChange={(e) => setFormData({ ...formData, lastNameArabic: e.target.value })}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900"
              />
            </div>

            {/* Contact Information */}
            <div>
              <label className="block text-sm font-medium text-gray-700">Email*</label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Phone*</label>
              <input
                type="text"
                required
                placeholder="+966..."
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900"
              />
            </div>

            {/* Employment Details */}
            <div className="col-span-2">
              <h3 className="text-md font-semibold text-gray-800 border-b pb-2 mb-3 mt-4">Employment Details</h3>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Position (English)*</label>
              <input
                type="text"
                required
                value={formData.position}
                onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Position (Arabic)</label>
              <input
                type="text"
                dir="rtl"
                value={formData.positionArabic}
                onChange={(e) => setFormData({ ...formData, positionArabic: e.target.value })}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Department</label>
              <select
                value={formData.departmentId}
                onChange={(e) => setFormData({ ...formData, departmentId: e.target.value })}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900"
              >
                <option value="">Select Department</option>
                {departments.map((dept) => (
                  <option key={dept.id} value={dept.id}>
                    {dept.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Contract Type*</label>
              <select
                value={formData.contractType}
                onChange={(e) => setFormData({ ...formData, contractType: e.target.value })}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900"
              >
                <option value="LIMITED">Limited (محدد المدة)</option>
                <option value="UNLIMITED">Unlimited (غير محدد المدة)</option>
                <option value="SEASONAL">Seasonal (موسمي)</option>
                <option value="TASK_BASED">Task Based (عمل محدد)</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Date of Birth*</label>
              <input
                type="date"
                required
                value={formData.dateOfBirth}
                onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Hire Date*</label>
              <input
                type="date"
                required
                value={formData.hireDate}
                onChange={(e) => setFormData({ ...formData, hireDate: e.target.value })}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900"
              />
            </div>

            {/* Saudi/Expat Information */}
            <div className="col-span-2">
              <h3 className="text-md font-semibold text-gray-800 border-b pb-2 mb-3 mt-4">Saudi/Expat Information</h3>
            </div>

            <div className="col-span-2">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.isSaudi}
                  onChange={(e) => setFormData({ ...formData, isSaudi: e.target.checked })}
                  className="h-4 w-4 rounded border-gray-300 text-blue-600"
                />
                <span className="ml-2 text-sm font-medium text-gray-700">Saudi National (سعودي)</span>
              </label>
            </div>

            {formData.isSaudi ? (
              <div>
                <label className="block text-sm font-medium text-gray-700">Saudi ID Number</label>
                <input
                  type="text"
                  placeholder="1234567890"
                  value={formData.saudiId}
                  onChange={(e) => setFormData({ ...formData, saudiId: e.target.value })}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900"
                />
              </div>
            ) : (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Iqama Number</label>
                  <input
                    type="text"
                    placeholder="2345678901"
                    value={formData.iqamaNumber}
                    onChange={(e) => setFormData({ ...formData, iqamaNumber: e.target.value })}
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Iqama Expiry Date</label>
                  <input
                    type="date"
                    value={formData.iqamaExpiryDate}
                    onChange={(e) => setFormData({ ...formData, iqamaExpiryDate: e.target.value })}
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900"
                  />
                </div>
              </>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700">GOSI Number</label>
              <input
                type="text"
                value={formData.gosiNumber}
                onChange={(e) => setFormData({ ...formData, gosiNumber: e.target.value })}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900"
              />
            </div>

            {/* Compensation */}
            <div className="col-span-2">
              <h3 className="text-md font-semibold text-gray-800 border-b pb-2 mb-3 mt-4">Compensation (SAR)</h3>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Basic Salary*</label>
              <input
                type="number"
                required
                min="0"
                step="0.01"
                value={formData.salary}
                onChange={(e) => setFormData({ ...formData, salary: e.target.value })}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900"
                placeholder="Enter basic salary"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Housing Allowance</label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={formData.housingAllowance}
                onChange={(e) => setFormData({ ...formData, housingAllowance: e.target.value })}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Transport Allowance</label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={formData.transportAllowance}
                onChange={(e) => setFormData({ ...formData, transportAllowance: e.target.value })}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Food Allowance</label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={formData.foodAllowance}
                onChange={(e) => setFormData({ ...formData, foodAllowance: e.target.value })}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900"
              />
            </div>

            <div className="col-span-2 flex gap-2 justify-end mt-4">
              <button
                type="submit"
                className="rounded-md bg-blue-600 px-6 py-2 text-white hover:bg-blue-700"
              >
                {editEmployee ? 'Update' : 'Create'} Employee
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowForm(false);
                  setEditEmployee(null);
                }}
                className="rounded-md bg-gray-600 px-6 py-2 text-white hover:bg-gray-700"
              >
                Cancel
              </button>
            </div>
          </form>
          </div>
        </div>
      )}

      {/* View Modal */}
      {viewEmployee && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-lg bg-white p-6">
            <h2 className="mb-6 border-b border-gray-200 pb-4 text-2xl font-bold text-gray-900">Employee Details</h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2 border-b pb-2">
                <h3 className="font-semibold text-gray-800">Basic Information</h3>
              </div>
              <div><strong>Employee Code:</strong> {viewEmployee.employeeCode}</div>
              <div><strong>Full Name:</strong> {viewEmployee.firstName} {viewEmployee.lastName}</div>
              {(viewEmployee.firstNameArabic || viewEmployee.lastNameArabic) && (
                <div className="col-span-2" dir="rtl">
                  <strong>الاسم بالعربي:</strong> {viewEmployee.firstNameArabic} {viewEmployee.lastNameArabic}
                </div>
              )}
              <div><strong>Email:</strong> {viewEmployee.email}</div>
              <div><strong>Phone:</strong> {viewEmployee.phone}</div>
              <div><strong>Position:</strong> {viewEmployee.position}</div>
              {viewEmployee.positionArabic && (
                <div dir="rtl"><strong>المنصب:</strong> {viewEmployee.positionArabic}</div>
              )}
              <div><strong>Department:</strong> {viewEmployee.department?.name || 'N/A'}</div>
              <div><strong>Contract Type:</strong> {viewEmployee.contractType}</div>
              <div><strong>Status:</strong> <span className={`inline-flex rounded-full px-2 text-xs font-semibold ${
                viewEmployee.status === 'ACTIVE' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
              }`}>{viewEmployee.status}</span></div>
              
              <div className="col-span-2 border-b pb-2 mt-3">
                <h3 className="font-semibold text-gray-800">Saudi/Expat Information</h3>
              </div>
              <div><strong>Nationality:</strong> {viewEmployee.isSaudi ? 'Saudi 🇸🇦' : 'Expat'}</div>
              {viewEmployee.isSaudi && viewEmployee.saudiId && (
                <div><strong>Saudi ID:</strong> {viewEmployee.saudiId}</div>
              )}
              {!viewEmployee.isSaudi && viewEmployee.iqamaNumber && (
                <>
                  <div><strong>Iqama Number:</strong> {viewEmployee.iqamaNumber}</div>
                  {viewEmployee.iqamaExpiryDate && (
                    <div><strong>Iqama Expiry:</strong> {new Date(viewEmployee.iqamaExpiryDate).toLocaleDateString()}</div>
                  )}
                </>
              )}
              {viewEmployee.gosiNumber && (
                <div><strong>GOSI Number:</strong> {viewEmployee.gosiNumber}</div>
              )}
              
              <div className="col-span-2 border-b pb-2 mt-3">
                <h3 className="font-semibold text-gray-800">Dates</h3>
              </div>
              <div><strong>Date of Birth:</strong> {viewEmployee.dateOfBirth ? new Date(viewEmployee.dateOfBirth).toLocaleDateString() : 'N/A'}</div>
              <div><strong>Hire Date:</strong> {viewEmployee.joinDate ? new Date(viewEmployee.joinDate).toLocaleDateString() : 'N/A'}</div>
              
              <div className="col-span-2 border-b pb-2 mt-3">
                <h3 className="font-semibold text-gray-800">Compensation (SAR)</h3>
              </div>
              <div><strong>Basic Salary:</strong> {viewEmployee.salary?.toLocaleString()}</div>
              <div><strong>Housing Allowance:</strong> {viewEmployee.housingAllowance?.toLocaleString() || 0}</div>
              <div><strong>Transport Allowance:</strong> {viewEmployee.transportAllowance?.toLocaleString() || 0}</div>
              <div><strong>Food Allowance:</strong> {viewEmployee.foodAllowance?.toLocaleString() || 0}</div>
              <div className="col-span-2">
                <strong>Total Compensation:</strong> {(
                  (viewEmployee.salary || 0) + 
                  (viewEmployee.housingAllowance || 0) + 
                  (viewEmployee.transportAllowance || 0) + 
                  (viewEmployee.foodAllowance || 0)
                ).toLocaleString()} SAR
              </div>
            </div>
            <button
              onClick={() => setViewEmployee(null)}
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
            <p className="mb-6 text-gray-600">Are you sure you want to delete this employee?</p>
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

      <div className="mb-6">
        <input
          type="text"
          placeholder="Search employees..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full max-w-md rounded-md border border-gray-300 px-4 py-2 text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-blue-500"
        />
      </div>

      {loading ? (
        <div className="text-gray-600">Loading...</div>
      ) : (
        <div className="overflow-hidden rounded-lg bg-white shadow">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Employee Code
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Position
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Department
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
              {employees.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-4 text-center text-gray-500">
                    No employees found
                  </td>
                </tr>
              ) : (
                employees.map((employee) => (
                  <tr key={employee.id} className="hover:bg-gray-50">
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">
                      {employee.employeeCode}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900">
                      <div>
                        {employee.firstName} {employee.lastName}
                        {employee.isSaudi && (
                          <span className="ml-2 text-xs text-green-600 font-arabic">سعودي</span>
                        )}
                      </div>
                      {(employee.firstNameArabic || employee.lastNameArabic) && (
                        <div className="text-xs text-gray-500 font-arabic" dir="rtl">
                          {employee.firstNameArabic} {employee.lastNameArabic}
                        </div>
                      )}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                      {employee.email}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                      {employee.position}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                      <span className={`inline-flex rounded-full px-2 text-xs font-semibold ${
                        employee.contractType === 'UNLIMITED' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'
                      }`}>
                        {employee.contractType}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                      {employee.department?.name || 'N/A'}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm">
                      <span
                        className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${
                          employee.status === 'ACTIVE'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {employee.status}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm font-medium">
                      <div className="flex gap-2">
                        <button
                          onClick={() => setViewEmployee(employee)}
                          className="text-blue-600 hover:text-blue-900"
                          title="View"
                        >
                          <EyeIcon className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => handleEdit(employee)}
                          className="text-indigo-600 hover:text-indigo-900"
                          title="Edit"
                        >
                          <PencilIcon className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => setDeleteId(employee.id)}
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
      )}
    </div>
  );
}
