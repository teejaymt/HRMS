'use client';

import { useState, useEffect } from 'react';

interface AdvanceRequest {
  id: number;
  employeeId: number;
  employee?: {
    firstName: string;
    lastName: string;
  };
  amount: number;
  advanceType: string;
  installments: number;
  status: string;
}

export default function AdvanceRequestsPage() {
  const [requests, setRequests] = useState<AdvanceRequest[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    employeeId: 1,
    amount: '',
    advanceType: 'SALARY',
    installments: 6,
    reason: '',
  });

  const fetchRequests = async () => {
    try {
      const response = await fetch('http://localhost:3000/advance-request');
      const data = await response.json();
      setRequests(data as AdvanceRequest[]);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching advance requests:', error);
      setLoading(false);
    }
  };

  useEffect(() => {
    const loadRequests = async () => {
      try {
        const response = await fetch('http://localhost:3000/advance-request');
        const data = await response.json();
        setRequests(data as AdvanceRequest[]);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching advance requests:', error);
        setLoading(false);
      }
    };
    
    void loadRequests();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await fetch('http://localhost:3000/advance-request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          amount: parseFloat(formData.amount),
        }),
      });
      setShowForm(false);
      fetchRequests();
      setFormData({ employeeId: 1, amount: '', advanceType: 'SALARY', installments: 6, reason: '' });
    } catch (error) {
      console.error('Error creating advance request:', error);
    }
  };

  const handleApprove = async (id: number) => {
    try {
      await fetch(`http://localhost:3000/advance-request/${id}/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ approvedBy: 'admin@company.sa' }),
      });
      fetchRequests();
    } catch (error) {
      console.error('Error approving request:', error);
    }
  };

  const handleDisburse = async (id: number) => {
    try {
      await fetch(`http://localhost:3000/advance-request/${id}/disburse`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ disbursedBy: 'admin@company.sa' }),
      });
      fetchRequests();
    } catch (error) {
      console.error('Error disbursing request:', error);
    }
  };

  if (loading) {
    return <div className="p-8">Loading...</div>;
  }

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Advance Requests</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          {showForm ? 'Cancel' : 'New Request'}
        </button>
      </div>

      {showForm && (
        <div className="bg-white p-6 rounded-lg shadow mb-8">
          <h2 className="text-xl font-semibold mb-4">New Advance Request</h2>
          <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Employee ID</label>
              <input
                type="number"
                value={formData.employeeId}
                onChange={(e) => setFormData({ ...formData, employeeId: parseInt(e.target.value) })}
                className="w-full border rounded-lg px-3 py-2"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Amount (SAR)</label>
              <input
                type="number"
                step="0.01"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                className="w-full border rounded-lg px-3 py-2"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Type</label>
              <select
                value={formData.advanceType}
                onChange={(e) => setFormData({ ...formData, advanceType: e.target.value })}
                className="w-full border rounded-lg px-3 py-2"
              >
                <option value="SALARY">Salary Advance</option>
                <option value="EMERGENCY">Emergency</option>
                <option value="EDUCATION">Education</option>
                <option value="MEDICAL">Medical</option>
                <option value="HOUSING">Housing</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Installments</label>
              <input
                type="number"
                value={formData.installments}
                onChange={(e) => setFormData({ ...formData, installments: parseInt(e.target.value) })}
                className="w-full border rounded-lg px-3 py-2"
                required
              />
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium mb-2">Reason</label>
              <textarea
                value={formData.reason}
                onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                className="w-full border rounded-lg px-3 py-2"
                rows={3}
                required
              />
            </div>
            <div className="col-span-2">
              <button type="submit" className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700">
                Submit Request
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Employee ID</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Employee Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Installments</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {requests.map((request) => (
              <tr key={request.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm">{request.id}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">{request.employeeId}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  {request.employee ? `${request.employee.firstName} ${request.employee.lastName}` : 'N/A'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">{request.amount.toLocaleString()} SAR</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">{request.advanceType}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">{request.installments}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    request.status === 'APPROVED' ? 'bg-green-100 text-green-800' :
                    request.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                    request.status === 'DISBURSED' ? 'bg-blue-100 text-blue-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {request.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  {request.status === 'PENDING' && (
                    <button
                      onClick={() => handleApprove(request.id)}
                      className="text-green-600 hover:text-green-900 mr-3"
                    >
                      Approve
                    </button>
                  )}
                  {request.status === 'APPROVED' && (
                    <button
                      onClick={() => handleDisburse(request.id)}
                      className="text-blue-600 hover:text-blue-900"
                    >
                      Disburse
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
