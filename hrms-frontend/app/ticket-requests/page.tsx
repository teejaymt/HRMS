'use client';

import { useState, useEffect } from 'react';

export default function TicketRequestsPage() {
  const [requests, setRequests] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    employeeId: 1,
    ticketType: 'ANNUAL_LEAVE',
    destination: '',
    departureDate: '',
    returnDate: '',
    travelClass: 'ECONOMY',
    employeeTicketCost: 0,
    familyMembers: [] as any[],
  });

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      const response = await fetch('http://localhost:3000/ticket-request');
      const data = await response.json();
      
      // Ensure data is an array
      if (Array.isArray(data)) {
        setRequests(data as any[]);
      } else {
        console.warn('Ticket requests response is not an array:', data);
        setRequests([]);
      }
      setLoading(false);
    } catch (error) {
      console.error('Error fetching ticket requests:', error);
      setRequests([]);
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await fetch('http://localhost:3000/ticket-request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      setShowForm(false);
      fetchRequests();
      // Reset form
      setFormData({
        employeeId: 1,
        ticketType: 'ANNUAL_LEAVE',
        destination: '',
        departureDate: '',
        returnDate: '',
        travelClass: 'ECONOMY',
        employeeTicketCost: 0,
        familyMembers: [],
      });
    } catch (error) {
      console.error('Error creating ticket request:', error);
      alert('Error creating request');
    }
  };

  const addFamilyMember = () => {
    setFormData({
      ...formData,
      familyMembers: [
        ...formData.familyMembers,
        { name: '', relation: 'SPOUSE', age: 0, ticketCost: 0 }
      ]
    });
  };

  const removeFamilyMember = (index: number) => {
    const newMembers = formData.familyMembers.filter((_, i) => i !== index);
    setFormData({ ...formData, familyMembers: newMembers });
  };

  const updateFamilyMember = (index: number, field: string, value: string | number) => {
    const newMembers = [...formData.familyMembers];
    newMembers[index] = { ...newMembers[index], [field]: value };
    setFormData({ ...formData, familyMembers: newMembers });
  };

  const handleApprove = async (id: number) => {
    try {
      await fetch(`http://localhost:3000/ticket-request/${id}/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ approvedBy: 'admin@company.sa' }),
      });
      fetchRequests();
    } catch (error) {
      console.error('Error approving request:', error);
    }
  };

  if (loading) {
    return <div className="p-8">Loading...</div>;
  }

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Air Ticket Requests</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          {showForm ? 'Cancel' : 'New Request'}
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-xl font-bold mb-4">Create Ticket Request</h2>
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium mb-2">Employee ID</label>
                <input
                  type="number"
                  value={formData.employeeId}
                  onChange={(e) => setFormData({ ...formData, employeeId: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 border rounded-lg"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Ticket Type</label>
                <select
                  value={formData.ticketType}
                  onChange={(e) => setFormData({ ...formData, ticketType: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                >
                  <option value="ANNUAL_LEAVE">Annual Leave</option>
                  <option value="HAJJ">Hajj</option>
                  <option value="UMRAH">Umrah</option>
                  <option value="EMERGENCY">Emergency</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Destination</label>
                <input
                  type="text"
                  value={formData.destination}
                  onChange={(e) => setFormData({ ...formData, destination: e.target.value })}
                  placeholder="e.g., India, Pakistan, Egypt"
                  className="w-full px-3 py-2 border rounded-lg"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Travel Class</label>
                <select
                  value={formData.travelClass}
                  onChange={(e) => setFormData({ ...formData, travelClass: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                >
                  <option value="ECONOMY">Economy</option>
                  <option value="BUSINESS">Business</option>
                  <option value="FIRST">First Class</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Departure Date</label>
                <input
                  type="date"
                  value={formData.departureDate}
                  onChange={(e) => setFormData({ ...formData, departureDate: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Return Date</label>
                <input
                  type="date"
                  value={formData.returnDate}
                  onChange={(e) => setFormData({ ...formData, returnDate: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Employee Ticket Cost (SAR)</label>
                <input
                  type="number"
                  value={formData.employeeTicketCost}
                  onChange={(e) => setFormData({ ...formData, employeeTicketCost: parseFloat(e.target.value) })}
                  className="w-full px-3 py-2 border rounded-lg"
                  required
                />
              </div>
            </div>

            <div className="mb-4">
              <div className="flex justify-between items-center mb-2">
                <label className="block text-sm font-medium">Family Members</label>
                <button
                  type="button"
                  onClick={addFamilyMember}
                  className="text-blue-600 hover:text-blue-800 text-sm"
                >
                  + Add Family Member
                </button>
              </div>

              {formData.familyMembers.map((member, index) => (
                <div key={index} className="grid grid-cols-1 md:grid-cols-5 gap-2 mb-2 p-3 bg-gray-50 rounded">
                  <input
                    type="text"
                    placeholder="Name"
                    value={member.name}
                    onChange={(e) => updateFamilyMember(index, 'name', e.target.value)}
                    className="px-3 py-2 border rounded"
                  />
                  <select
                    value={member.relation}
                    onChange={(e) => updateFamilyMember(index, 'relation', e.target.value)}
                    className="px-3 py-2 border rounded"
                  >
                    <option value="SPOUSE">Spouse</option>
                    <option value="CHILD">Child</option>
                    <option value="PARENT">Parent</option>
                  </select>
                  <input
                    type="number"
                    placeholder="Age"
                    value={member.age}
                    onChange={(e) => updateFamilyMember(index, 'age', parseInt(e.target.value))}
                    className="px-3 py-2 border rounded"
                  />
                  <input
                    type="number"
                    placeholder="Ticket Cost"
                    value={member.ticketCost}
                    onChange={(e) => updateFamilyMember(index, 'ticketCost', parseFloat(e.target.value))}
                    className="px-3 py-2 border rounded"
                  />
                  <button
                    type="button"
                    onClick={() => removeFamilyMember(index)}
                    className="text-red-600 hover:text-red-800"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>

            <button
              type="submit"
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
            >
              Submit Request
            </button>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-500 mb-2">Total Requests</h3>
          <p className="text-3xl font-bold">{requests.length}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-500 mb-2">Pending</h3>
          <p className="text-3xl font-bold text-yellow-600">
            {requests.filter(r => r.status === 'PENDING').length}
          </p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-500 mb-2">Approved</h3>
          <p className="text-3xl font-bold text-green-600">
            {requests.filter(r => r.status === 'APPROVED').length}
          </p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Employee</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Destination</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Travel Dates</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Employee Cost</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Family Members</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {requests.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-6 py-8 text-center text-gray-500">
                  No ticket requests found. Click "New Request" to create one.
                </td>
              </tr>
            ) : (
              requests.map((request) => (
                <tr key={request.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">{request.id}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">{request.employeeId}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">{request.destination}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    {new Date(request.departureDate).toLocaleDateString()} - {new Date(request.returnDate).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">{request.employeeTicketCost?.toLocaleString() || 0} SAR</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">{request.totalFamilyMembers || 0}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      request.status === 'APPROVED' ? 'bg-green-100 text-green-800' :
                      request.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                      request.status === 'BOOKED' ? 'bg-blue-100 text-blue-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {request.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    {request.status === 'PENDING' && (
                      <button
                        onClick={() => handleApprove(request.id)}
                        className="text-green-600 hover:text-green-900"
                      >
                        Approve
                      </button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
