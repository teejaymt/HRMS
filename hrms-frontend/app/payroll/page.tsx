'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';

export default function PayrollPage() {
  const [payrolls, setPayrolls] = useState<any[]>([]);
  const [employees, setEmployees] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    employeeId: '',
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
    basicSalary: '',
    housingAllowance: '',
    transportAllowance: '',
    foodAllowance: '',
    otherAllowances: '',
    bonuses: '',
    gosiEmployeeShare: '',
    gosiEmployerShare: '',
    otherDeductions: '',
    tax: '',
  });

  useEffect(() => {
    fetchPayrolls();
    fetchEmployees();
  }, []);

  const fetchPayrolls = async () => {
    try {
      const data = await api.getPayroll();
      setPayrolls(data as any[]);
    } catch (error) {
      console.error('Failed to fetch payrolls:', error);
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

  const handleEmployeeChange = (employeeId: string) => {
    const employee = employees.find(e => e.id === Number(employeeId));
    if (employee) {
      setFormData({
        ...formData,
        employeeId,
        basicSalary: employee.basicSalary?.toString() || '',
        housingAllowance: employee.housingAllowance?.toString() || '0',
        transportAllowance: employee.transportAllowance?.toString() || '0',
        foodAllowance: employee.foodAllowance?.toString() || '0',
      });
    } else {
      setFormData({ ...formData, employeeId });
    }
  };

  const calculateGrossSalary = () => {
    const basic = Number(formData.basicSalary) || 0;
    const housing = Number(formData.housingAllowance) || 0;
    const transport = Number(formData.transportAllowance) || 0;
    const food = Number(formData.foodAllowance) || 0;
    const other = Number(formData.otherAllowances) || 0;
    const bonuses = Number(formData.bonuses) || 0;
    return basic + housing + transport + food + other + bonuses;
  };

  const calculateTotalDeductions = () => {
    const gosiEmployee = Number(formData.gosiEmployeeShare) || 0;
    const other = Number(formData.otherDeductions) || 0;
    const tax = Number(formData.tax) || 0;
    return gosiEmployee + other + tax;
  };

  const calculateNetSalary = () => {
    return calculateGrossSalary() - calculateTotalDeductions();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.createPayroll({
        employeeId: Number(formData.employeeId),
        month: Number(formData.month),
        year: Number(formData.year),
        basicSalary: Number(formData.basicSalary),
        allowances: Number(formData.housingAllowance || 0) + Number(formData.transportAllowance || 0) + Number(formData.foodAllowance || 0) + Number(formData.otherAllowances || 0),
        bonuses: Number(formData.bonuses) || 0,
        deductions: Number(formData.otherDeductions) || 0,
        processedBy: user?.email || 'unknown',
        tax: Number(formData.tax) || 0,
      });
      setShowForm(false);
      setFormData({
        employeeId: '',
        month: new Date().getMonth() + 1,
        year: new Date().getFullYear(),
        basicSalary: '',
        housingAllowance: '',
        transportAllowance: '',
        foodAllowance: '',
        otherAllowances: '',
        bonuses: '',
        gosiEmployeeShare: '',
        gosiEmployerShare: '',
        otherDeductions: '',
        tax: '',
      });
      fetchPayrolls();
    } catch (error) {
      console.error('Failed to create payroll:', error);
      alert('Failed to process payroll. Please try again.');
    }
  };

  const handleMarkAsPaid = async (id: number) => {
    try {
      await api.markPayrollAsPaid(id, 'Bank Transfer');
      fetchPayrolls();
    } catch (error) {
      console.error('Failed to mark as paid:', error);
    }
  };

  const handleRunPayrollForAll = async () => {
    const month = prompt('Enter month (1-12):', String(new Date().getMonth() + 1));
    const year = prompt('Enter year (e.g., 2026):', String(new Date().getFullYear()));

    if (!month || !year) return;

    const selectedMonth = Number(month);
    const selectedYear = Number(year);

    if (!confirm(`Run payroll for all employees for ${month}/${year}?`)) {
      return;
    }

    setLoading(true);

    const payrolls = employees.map(employee => ({
      employeeId: employee.id,
      month: selectedMonth,
      year: selectedYear,
      basicSalary: employee.basicSalary || 0,
      allowances: (employee.housingAllowance || 0) + (employee.transportAllowance || 0) + (employee.foodAllowance || 0),
      bonuses: 0,
      deductions: 0,
      tax: 0,
    }));

    try {
      const result = await api.createBulkPayroll({
        payrolls,
        processedBy: user?.email || 'unknown',
        month: selectedMonth,
        year: selectedYear,
      }) as any;

      setLoading(false);
      alert(`Payroll processed for ${month}/${year}!\nSuccess: ${result.success}\nErrors: ${result.errors}`);
      fetchPayrolls();
    } catch (error: unknown) {
      setLoading(false);
      console.error('Failed to process bulk payroll:', error);
      alert(`Failed to process bulk payroll: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const handleClearPayrollForMonth = async () => {
    const month = prompt('Enter month (1-12):');
    const year = prompt('Enter year (e.g., 2026):');

    if (!month || !year) return;

    if (!confirm(`Delete all payroll records for ${month}/${year}? This cannot be undone!`)) {
      return;
    }

    setLoading(true);
    try {
      console.log(`Deleting payroll for ${year}/${month}`);
      const result = await api.deletePayrollByMonthYear(Number(year), Number(month)) as any;
      console.log('Delete result:', result);
      alert(`Payroll records deleted successfully! Deleted: ${result.count || 0} records`);
      fetchPayrolls();
    } catch (error: unknown) {
      console.error('Failed to delete payroll records:', error);
      alert(`Failed to delete payroll records: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteIndividualPayroll = async (id: number) => {
    if (!confirm('Delete this payroll record? This cannot be undone!')) {
      return;
    }

    try {
      await api.deletePayroll(id);
      alert('Payroll record deleted successfully!');
      fetchPayrolls();
    } catch (error: unknown) {
      console.error('Failed to delete payroll record:', error);
      alert(`Failed to delete payroll record: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Payroll Management</h1>
          <p className="mt-1 text-sm text-gray-500">Process payroll with GOSI and Saudi allowances</p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={handleClearPayrollForMonth}
            className="rounded-md bg-red-600 px-4 py-2 text-white hover:bg-red-700"
          >
            Clear Payroll
          </button>
          <button 
            onClick={handleRunPayrollForAll}
            disabled={loading}
            className="rounded-md bg-green-600 px-4 py-2 text-white hover:bg-green-700 disabled:bg-gray-400"
          >
            Run Payroll for All
          </button>
          <button 
            onClick={() => setShowForm(true)}
            className="rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
          >
            Process Individual Payroll
          </button>
        </div>
      </div>

      {showForm && (
        <div className="mb-6 rounded-lg bg-white p-6 shadow max-h-[80vh] overflow-y-auto">
          <h2 className="mb-4 text-lg font-semibold">Process Payroll - Saudi Compliant</h2>
          <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
            
            {/* Period & Employee */}
            <div>
              <label className="block text-sm font-medium text-gray-700">Employee*</label>
              <select
                required
                value={formData.employeeId}
                onChange={(e) => handleEmployeeChange(e.target.value)}
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
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-sm font-medium text-gray-700">Month*</label>
                <select
                  required
                  value={formData.month}
                  onChange={(e) => setFormData({ ...formData, month: Number(e.target.value) })}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900"
                >
                  {[1,2,3,4,5,6,7,8,9,10,11,12].map(m => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Year*</label>
                <input
                  type="number"
                  required
                  value={formData.year}
                  onChange={(e) => setFormData({ ...formData, year: Number(e.target.value) })}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900"
                />
              </div>
            </div>

            {/* Salary Components */}
            <div className="col-span-2 border-t pt-4">
              <h3 className="text-md font-semibold text-gray-800 mb-3">Salary Components (SAR)</h3>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Basic Salary*</label>
              <input
                type="number"
                required
                value={formData.basicSalary}
                onChange={(e) => setFormData({ ...formData, basicSalary: e.target.value })}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Housing Allowance</label>
              <input
                type="number"
                value={formData.housingAllowance}
                onChange={(e) => setFormData({ ...formData, housingAllowance: e.target.value })}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Transport Allowance</label>
              <input
                type="number"
                value={formData.transportAllowance}
                onChange={(e) => setFormData({ ...formData, transportAllowance: e.target.value })}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Food Allowance</label>
              <input
                type="number"
                value={formData.foodAllowance}
                onChange={(e) => setFormData({ ...formData, foodAllowance: e.target.value })}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900"
              />
            </div>

            {/* One-Time Allowances & Bonuses */}
            <div className="col-span-2 border-t pt-4">
              <h3 className="text-md font-semibold text-gray-800 mb-3">
                One-Time Allowances & Bonuses (SAR)
                <span className="ml-2 text-xs font-normal text-gray-500">
                  (These amounts apply only to this month and will not carry forward)
                </span>
              </h3>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Other Allowances (One-Time)
                <span className="ml-1 text-xs text-gray-500">(Performance, Project, etc.)</span>
              </label>
              <input
                type="number"
                value={formData.otherAllowances}
                onChange={(e) => setFormData({ ...formData, otherAllowances: e.target.value })}
                placeholder="0.00"
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Bonuses (One-Time)
                <span className="ml-1 text-xs text-gray-500">(Annual, Holiday, Achievement, etc.)</span>
              </label>
              <input
                type="number"
                value={formData.bonuses}
                onChange={(e) => setFormData({ ...formData, bonuses: e.target.value })}
                placeholder="0.00"
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900"
              />
            </div>

            {/* GOSI & Deductions */}
            <div className="col-span-2 border-t pt-4">
              <h3 className="text-md font-semibold text-gray-800 mb-3">GOSI & Deductions (SAR)</h3>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">GOSI Employee Share (9.75%)</label>
              <input
                type="number"
                value={formData.gosiEmployeeShare}
                onChange={(e) => setFormData({ ...formData, gosiEmployeeShare: e.target.value })}
                placeholder="Auto-calculated"
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">GOSI Employer Share (12.5%)</label>
              <input
                type="number"
                value={formData.gosiEmployerShare}
                onChange={(e) => setFormData({ ...formData, gosiEmployerShare: e.target.value })}
                placeholder="For reference only"
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-500"
                disabled
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Other Deductions</label>
              <input
                type="number"
                value={formData.otherDeductions}
                onChange={(e) => setFormData({ ...formData, otherDeductions: e.target.value })}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Tax</label>
              <input
                type="number"
                value={formData.tax}
                onChange={(e) => setFormData({ ...formData, tax: e.target.value })}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900"
              />
            </div>

            {/* Summary */}
            <div className="col-span-2 border-t pt-4 bg-gray-50 p-4 rounded">
              <h3 className="text-md font-semibold text-gray-800 mb-3">Payroll Summary</h3>
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div>
                  <p className="text-gray-600">Gross Salary:</p>
                  <p className="text-lg font-bold text-gray-900">{calculateGrossSalary().toFixed(2)} SAR</p>
                </div>
                <div>
                  <p className="text-gray-600">Total Deductions:</p>
                  <p className="text-lg font-bold text-red-600">{calculateTotalDeductions().toFixed(2)} SAR</p>
                </div>
                <div>
                  <p className="text-gray-600">Net Salary:</p>
                  <p className="text-lg font-bold text-green-600">{calculateNetSalary().toFixed(2)} SAR</p>
                </div>
              </div>
            </div>

            <div className="col-span-2 flex gap-2">
              <button
                type="submit"
                className="rounded-md bg-blue-600 px-6 py-2 text-white hover:bg-blue-700"
              >
                Process Payroll
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="rounded-md bg-gray-300 px-6 py-2 text-gray-700 hover:bg-gray-400"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {loading ? (
        <div className="text-gray-600">Loading...</div>
      ) : (
        <div className="overflow-hidden rounded-lg bg-white shadow">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Employee
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Period
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Basic Salary
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Gross Salary
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Deductions
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Net Salary
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
              {payrolls.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-4 text-center text-gray-500">
                    No payroll records
                  </td>
                </tr>
              ) : (
                payrolls.map((payroll) => (
                  <tr key={payroll.id} className="hover:bg-gray-50">
                    <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900">
                      {payroll.employee?.firstName} {payroll.employee?.lastName}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                      {payroll.month}/{payroll.year}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                      {payroll.basicSalary?.toFixed(2)} SAR
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900">
                      {payroll.grossSalary?.toFixed(2)} SAR
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-red-600">
                      {payroll.totalDeductions?.toFixed(2)} SAR
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm font-bold text-green-600">
                      {payroll.netSalary?.toFixed(2)} SAR
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm">
                      <span
                        className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${
                          payroll.status === 'PAID'
                            ? 'bg-green-100 text-green-800'
                            : payroll.status === 'PROCESSED'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}
                      >
                        {payroll.status}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm">
                      <div className="flex gap-2">
                        {(payroll.status === 'PROCESSED' || payroll.status === 'PENDING') && (
                          <button
                            onClick={() => handleMarkAsPaid(payroll.id)}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            Mark as Paid
                          </button>
                        )}
                        <button
                          onClick={() => handleDeleteIndividualPayroll(payroll.id)}
                          disabled={payroll.status === 'PAID'}
                          className={`${
                            payroll.status === 'PAID'
                              ? 'text-gray-400 cursor-not-allowed'
                              : 'text-red-600 hover:text-red-900'
                          }`}
                          title={payroll.status === 'PAID' ? 'Cannot delete paid payroll' : 'Delete payroll'}
                        >
                          Delete
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
